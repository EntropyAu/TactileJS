import * as animation from "./animation.js";
import * as canvas from "./canvas.js";
import * as constants from "./constants.js";
import * as dom from "./dom.js";
import * as helpers from "./helpers.js";
import * as sortable from "./sortable.js";


// conventions
// all client positions are expressed as x,y
// all offset positions are expressed as l,t

export default class DragDrop {
  constructor() {
    this.context = null;
    this.plugins = [];
    this.options = {
      placeholderClass:     'dd-drag-placeholder',
      ghostClass:           'dd-drag-ghost',
      overlayClass:         'dd-drag-overlay',
      dropZoneHoverClass:   'dd-drag-hover',
      duration:             150,
      easing:               'ease-in-out',
      ghostResize:          true,
      ghostResizeAnimated:  true,
      ghostShadowSize:      20,
      animatedElementLimit: 10
    }
    var onPointerDown = this.onPointerDown.bind(this);
    document.addEventListener('mousedown', onPointerDown, false);
  }


  registerPlugin(plugin) {
    this.plugins.push(plugin);
  }


  onPointerDown(e) {
    if (e.which !== 1) return;

    let dragEl = null;
    let handleOrDragEl = dom.closest(e.target, `${constants.handleSelector},${constants.draggableSelector}`);
    if (!handleOrDragEl) return;

    if (handleOrDragEl.hasAttribute(constants.handleAttribute)) {
      // the pointer is over a handle element,
      // ascend the DOM to find the associated draggable item
      dragEl = dom.closest(handleOrDragEl, constants.draggableSelector);
      if (dragEl === null) return;
    } else {
      // if the item contains a handle (which was not the the pointer down spot) then ignore
      // TODO need to generate permutations of descendant item handle selector
      if (handleOrDragEl.querySelectorAll(constants.handleSelector).length >
          handleOrDragEl.querySelectorAll(`${constants.draggableSelector} ${constants.handleSelector}`).length)
        return;
      dragEl = handleOrDragEl;
    }

    this.dragStart(dragEl, e.clientX, e.clientY);
    dom.cancelEvent(e);
  }


  onPointerMove(e) {
    this.dragMove(this.context, e.clientX, e.clientY);
    dom.cancelEvent(e);
  }


  onPointerUp(e) {
    this.unbindPointerEventsForDragging();
    this.dragEnd(this.context);
  }


  dragStart(dragEl, x, y) {
    // abort the drag if the element or it's parent element is marked as [data-drag-disabled]
    if (dragEl.hasAttribute(constants.disabledAttribute) ||
       (dragEl.parentElement && dragEl.parentElement.hasAttribute(constants.disabledAttribute)))
      return;

    let dragStartEvent = dom.raiseEvent(dragEl, constants.dragStartEvent, {});
    if (dragStartEvent.returnValue === false) return;

    let parentEl = dragEl.parentElement;
    let parentIndex = Array.prototype.indexOf.call(parentEl.children, dragEl);

    let dragElRect = dragEl.getBoundingClientRect();
    let parentElRect = parentEl.getBoundingClientRect();
    let offsetTop = dragElRect.top - parentElRect.top;
    let offsetLeft = dragElRect.left - parentElRect.left;
    let pointerX = x;
    let pointerY = y;

    // record the offset of the grip point on the drag item
    let gripTop = y - dragElRect.top;
    let gripLeft = x - dragElRect.left;
    let gripTopPercent = gripTop / dragElRect.height;
    let gripLeftPercent = gripLeft / dragElRect.width;

    parentEl.removeChild(dragEl);

    // create the overlay (which contains the ghost)
    let overlayEl = document.createElement('div');
    overlayEl.classList.add(this.options.overlayClass);
    document.body.appendChild(overlayEl);

    // create the ghost (the copy of the item that follows the pointer)
    let ghostEl = dragEl.cloneNode(true);
    ghostEl.removeAttribute('id');
    dom.topLeft(ghostEl,-gripTop,-gripLeft);
    ghostEl.classList.add(this.options.ghostClass);
    ghostEl.style.width = dragElRect.width + 'px';
    ghostEl.style.height = dragElRect.height + 'px';
    Velocity(ghostEl, { translateX: pointerX, translateY: pointerY, boxShadowBlur: 0 }, { duration: 0 });
    overlayEl.appendChild(ghostEl);

    // animate the ghost 'lifting up' from the original position
    Velocity(ghostEl, {
      rotateZ: -1,
      boxShadowBlur: this.options.ghostShadowSize
    }, {
      duration: this.options.duration,
      easing: this.options.easing
    });

    // apply focus to the ghost to clear any in-progress selections
    ghostEl.focus()

    // create the placeholder element
    let placeholderEl = dragEl.cloneNode(true);
    placeholderEl.removeAttribute('id');
    dom.translate(placeholderEl,0,0);
    dom.topLeft(placeholderEl,0,0);
    placeholderEl.classList.add(this.options.placeholderClass);
    placeholderEl.setAttribute(constants.placeholderAttribute, true);
    parentEl.insertBefore(placeholderEl, dragEl.nextSibling);

    let orientation = dragEl.getAttribute('data-drag-orientation') || "both";

    this.buildDropZoneCache(parentEl);

    this.context = {
      options: this.options,
      dragEl: dragEl,
      overlayEl: overlayEl,

      ghostEl: ghostEl,
      ghostWidth: dragElRect.width,
      ghostHeight: dragElRect.height,
      constrainedX: x,
      constrainedY: y,

      placeholderEl: placeholderEl,
      placeholderParentEl: null,
      placeholderIndex: null,
      placeholderOffsetTop: null,
      placeholderOffsetLeft: null,
      placeholderWidth: null,
      placeholderHeight: null,

      gripTopPercent: gripTopPercent,
      gripLeftPercent: gripLeftPercent,

      parentEl: null,
      parentIndex: parentIndex,
      offsetTop: offsetTop,
      offsetLeft: offsetLeft,

      originalParentEl: parentEl,
      originalParentIndex: parentIndex,
      originalOffsetTop: offsetTop,
      originalOffsetLeft: offsetLeft,

      orientation: orientation,
      pointerX: x,
      pointerY: y
    };

    this.setDropZone(this.context, parentEl);
    this.updatePlaceholder(this.context, false);
    this.findDropZone(this.context);
    this.bindPointerEventsForDragging()

    // notify plugins
    for (let i = 0; i < this.plugins.length; i++)
      if (this.plugins[i].dragStart) this.plugins[i].dragStart(this.context);
  }



  dragMove(context, x, y) {
    context.pointerX = x;
    context.pointerY = y;

    dom.raiseEvent(context.dragEl, constants.dragEvent, {});

    this.findDropZone(context);

    if (sortable.isSortable(context.parentEl)) sortable.updateIndex(context);
    if (canvas.isCanvas(context.parentEl)) canvas.updateOffsets(context);
    this.updatePlaceholder(context);
    if (this.options.ghostResize) this.updateGhostSize(context);
    this.constrainGhostPosition(context);
    this.updateGhostPosition(context);

    // notify plugins
    for (let i = 0; i < this.plugins.length; i++)
      if (this.plugins[i].dragMove) this.plugins[i].dragMove(this.context);
  }



  applyDirectionConstraint(context) {
    switch (context.orientation) {
      case "vertical": adjustedX = context.originalOffsetLeft; break;
      case "horizontal": adjustedY = context.originalOffsetTop; break;
      case "both": break;
    }
  }



  constrainGhostPosition(context) {
    let adjustedX = context.pointerX - context.gripLeftPercent * context.ghostWidth;
    let adjustedY = context.pointerY - context.gripTopPercent * context.ghostHeight;
    if (this.parentIsContainmentFor(context.parentEl, context.dragEl)) {
      let containmentRect = context.parentEl.getBoundingClientRect();
      adjustedX = helpers.coerce(adjustedX,
                                 containmentRect.left,
                                 containmentRect.right - context.ghostWidth);
      adjustedY = helpers.coerce(adjustedY,
                                 containmentRect.top,
                                 containmentRect.bottom - context.ghostHeight);
    }
    context.constrainedX = adjustedX;
    context.constrainedY = adjustedY;
  }



  dragEnd(context) {

    if (context.parentEl) context.parentEl.classList.remove(this.options.dropZoneHoverClass);

    // notify plugins
    for (let i = 0; i < this.plugins.length; i++)
      if (this.plugins[i].dragEnd) this.plugins[i].dragEnd(this.context);

    if (context.placeholderParentEl) {
      dom.raiseEvent(context.dragEl, constants.dropEvent, {})
      let placeholderRect = context.placeholderEl.getBoundingClientRect();
      let targetProps = {
        translateX: [placeholderRect.left, 'ease-out'],
        translateY: [placeholderRect.top, 'ease-out'],
        top: [0, 'ease-out'],
        left: [0, 'ease-out'],
        rotateZ: 0,
        boxShadowBlur: 0
      };
      if (this.options.animateGhostSize) {
        targetProps.width = [placeholderRect.width, 'ease-out'];
        targetProps.height = [placeholderRect.height, 'ease-out'];
      }
      Velocity(context.ghostEl, targetProps, {
        duration: this.options.duration,
        easing: this.options.easing,
        complete: this.placeDragElInFinalPosition.bind(this)
      });
    } else {
      this.placeDragElInFinalPosition();
    }
    dom.raiseEvent(context.dragEl, constants.dragEndEvent, {})
  }



  findDropZone(context) {
    // walk up the drop zone tree until we find the closest drop zone that includes the dragged item
    while (!this.parentIsContainmentFor(context.parentEl, context.dragEl)
        && !this.positionIsInDropZone(context.parentEl, context.pointerX, context.pointerY)) {
      let parentDropZoneEl = dom.closest(context.parentEl.parentElement, `body,${constants.dropZoneSelector}`);
      if (!parentDropZoneEl) break;
      this.setDropZone(context, parentDropZoneEl);
    }

    // walk down the drop zone tree to the lowest level dropZone
    this.buildDropZoneCacheIfRequired(context.parentEl);
    let offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
        offsetTop  = context.pointerY  - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;
    let childDropZoneEl = this.getChildDropZoneAtOffset(context.parentEl, offsetTop, offsetLeft);
    while (childDropZoneEl) {
      this.setDropZone(context, childDropZoneEl);
      this.buildDropZoneCacheIfRequired(context.parentEl);
      offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
      offsetTop  = context.pointerY  - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;
      childDropZoneEl = this.getChildDropZoneAtOffset(context.parentEl, offsetTop, offsetLeft);
    }
  }



  setDropZone(context, newDropZoneEl) {
    if (context.parentEl) {
      context.parentEl.classList.remove(this.options.dropZoneHoverClass);
      dom.raiseEvent(context.parentEl, constants.dragLeaveEvent, {});
    }
    if (newDropZoneEl) {
      if (newDropZoneEl !== document.body) newDropZoneEl.classList.add(this.options.dropZoneHoverClass);
      dom.raiseEvent(newDropZoneEl, constants.dragEnterEvent, {});
    }
    context.parentEl = newDropZoneEl;
  }



  mayAccept(dragEl, dropZoneEl) {
    // check the drop zone is enabled
    if (dropZoneEl.hasAttribute(constants.disabledAttribute)) return false;

    // check the drop zone accepts the dragged element type
    let acceptsSelector = dropZoneEl.getAttribute(constants.acceptsAttribute);
    if (acceptsSelector !== null) return dragEl.matches(acceptsSelector);

    return true;
  }



  parentIsContainmentFor(parentEl, dragEl) {
    if (dragEl.hasAttribute(constants.containmentAttribute)) {
      let containmentSelector = dragEl.getAttribute(constants.containmentAttribute);
      return containmentSelector ? placeholderEl.matches(containmentSelector) : true;
    }
    if (parentEl.hasAttribute(constants.containmentAttribute)) {
      let containmentSelector = parentEl.getAttribute(constants.containmentAttribute);
      return containmentSelector ? dragEl.matches(containmentSelector) : true;
    }
    return false;
  };



  updatePlaceholder(context, animate = true) {
    // check if we have any work to do...
    if (context.parentIndex === context.placeholderIndex
     && context.parentEl === context.placeholderParentEl
     && context.offsetTop === context.placeholderOffsetTop
     && context.offsetLeft === context.placeholderOffsetLeft)
      return;

    // TODO: optimisation, update both old and new before triggering animation avoid two layout passes
    // TODO: optimisation, recycle old positions
    animate = animate && this.options.duration > 0;

    const oldParentEl = context.placeholderParentEl;
    const newParentEl = context.parentEl.matches(constants.dropZoneSelector)
                      ? context.parentEl
                      : null;

    // first, remove the old placeholder
    if (oldParentEl
      && (context.parentEl === null || context.parentEl !== newParentEl)) {
      if (animate) this.cacheChildOffsets(oldParentEl, '_old');
      context.placeholderEl.remove();
      if (animate) this.cacheChildOffsets(oldParentEl, '_new');
      if (animate) animation.animateElementsBetweenSavedOffsets(
        context,
        oldParentEl,
        { animatedElementLimit: this.options.animatedElementLimit }
      );
      context.placeholderWidth = null;
      context.placeholderHeight = null;
      context.placeholderParentEl = null;
    }

    // insert the new placeholder
    if (sortable.isSortable(newParentEl) && (oldParentEl !== newParentEl || context.placeholderIndex !== context.parentIndex)) {
      if (animate) this.cacheChildOffsets(context.parentEl, '_old');
      let oldScrollOffset = [newParentEl.scrollLeft, newParentEl.scrollTop];
      context.parentEl.insertBefore(context.placeholderEl, newParentEl.children[context.parentIndex]);
      if (animate) this.cacheChildOffsets(context.parentEl, '_new');
      // restore the old scroll position
      [newParentEl.scrollLeft, newParentEl.scrollTop] = oldScrollOffset;
      if (animate) animation.animateElementsBetweenSavedOffsets(
        context,
        newParentEl,
        { animatedElementLimit: this.options.animatedElementLimit }
      );
      context.placeholderParentEl = context.parentEl;
    }



    if (canvas.isCanvas(newParentEl)) {
      if (context.placeholderParentEl !== context.parentEl) {
        context.parentEl.appendChild(context.placeholderEl);
        context.placeholderParentEl = context.parentEl;
      }
      dom.translate(context.placeholderEl,
                    context.offsetLeft,
                    context.offsetTop);
      context.placeholderOffsetLeft = context.offsetLeft;
      context.placeholderOffsetTop = context.offsetTop;
    } else {
      dom.translate(context.placeholderEl, 0, 0);
    }

    context.placeholderIndex = context.parentIndex;

    // measure the width and height of the item for use later
    if (context.placeholderParentEl) {
      context.placeholderWidth = context.placeholderEl.offsetWidth;
      context.placeholderHeight = context.placeholderEl.offsetHeight;
    }
  }



  updateGhostPosition(context) {
    Velocity(context.ghostEl, {
      translateX: context.constrainedX + context.gripLeftPercent * context.ghostWidth,
      translateY: context.constrainedY + context.gripTopPercent * context.ghostHeight,
      translateZ: 1
    }, { duration: 0 });
  }



  updateGhostSize(context) {
    // do nothing if the placeholder is not currently visible
    if (!context.placeholderParentEl) return;
    // do nothing if the ghost and placeholder are the same size
    if (context.ghostWidth === context.placeholderWidth
     && context.ghostHeight === context.placeholderHeight)
      return;

    const velocityOptions = this.options.ghostResizeAnimated
                          ? {
                              duration: this.options.duration,
                              easing: 'linear',
                              queue: false
                            }
                          : {
                              duration: 0,
                              queue: false
                            };

    Velocity(context.ghostEl, {
      width: context.placeholderWidth,
      height: context.placeholderHeight,
      top: -context.gripTopPercent * context.placeholderHeight,
      left: -context.gripLeftPercent * context.placeholderWidth
    }, velocityOptions);

    context.ghostWidth = context.placeholderWidth;
    context.ghostHeight = context.placeholderHeight;
  }



  placeDragElInFinalPosition() {
    this.context.placeholderEl.remove();

    if (sortable.isSortable(this.context.parentEl)) {
      this.context.parentEl.insertBefore(this.context.dragEl, this.context.parentEl.children[this.context.parentIndex]);
    }
    if (canvas.isCanvas(this.context.parentEl)) {
      dom.topLeft(this.context.dragEl, this.context.offsetTop, this.context.offsetLeft);
      this.context.parentEl.appendChild(this.context.dragEl);
    }
    if (!this.context.parentEl) {
      dom.topLeft(this.context.dragEl, this.context.originalOffsetTop, this.context.originalOffsetLeft);
      this.context.originalDropZone.insertBefore(this.context.dragEl, this.context.originalAfterEl);
    }
    this.context.overlayEl.remove();
    this.context = null;
  }



  buildDropZoneCache(el) {
    el.__dd_clientRect = el.getBoundingClientRect();;
    el.__dd_scrollTop = el.scrollTop;
    el.__dd_scrollLeft = el.scrollLeft;
    el.__dd_childDropZones = [];

    for (let childDropZoneEl of el.querySelectorAll(constants.dropZoneSelector)) {

      // if the descendant dropZone is embedded within another descendant dropZone let's ignore it.
      let intermediateDropZoneEl = dom.closest(childDropZoneEl.parentElement, `${constants.dropZoneSelector},body`);
      if (intermediateDropZoneEl !== null && intermediateDropZoneEl !== el) continue;

      // if this drop zone is contained within a placeholder, ignore it
      if (dom.closest(childDropZoneEl, constants.placeholderSelector)) continue;

      let childRect = childDropZoneEl.getBoundingClientRect();
      el.__dd_childDropZones.push({
        el: childDropZoneEl,
        top: childRect.top - el.__dd_clientRect.top + el.__dd_scrollTop,
        left: childRect.left - el.__dd_clientRect.left + el.__dd_scrollLeft,
        width: childRect.width,
        height: childRect.height
      });
    }
  }



  buildDropZoneCacheIfRequired(el) {
    if (!el.__dd_clientRect)
      this.buildDropZoneCache(el);
  }



  clearDropZoneCache(el) {
    delete el.__dd_clientRect;
    delete el.__dd_scrollTop;
    delete el.__dd_scrollLeft;
    delete el.__dd_childDropZones;
  }



  getChildDropZoneAtOffset(el, offsetTop, offsetLeft) {
    for (let childDropZone of el.__dd_childDropZones) {
      if (offsetTop  >= childDropZone.top
       && offsetTop  <= childDropZone.top + childDropZone.height
       && offsetLeft >= childDropZone.left
       && offsetLeft <= childDropZone.left + childDropZone.width)
        return childDropZone.el;
    }
    return null;
  }


  positionIsInDropZone(el, clientLeft, clientTop) {
    this.buildDropZoneCacheIfRequired(el);
    let offsetLeft = clientLeft - el.__dd_clientRect.left,
        offsetTop  = clientTop - el.__dd_clientRect.top;
    return (offsetTop  >= 0 && offsetTop  <= el.__dd_clientRect.height
         && offsetLeft >= 0 && offsetLeft <= el.__dd_clientRect.width);
  }


  bindPointerEventsForDragging() {
    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerUpBound = this.onPointerUp.bind(this);
    document.addEventListener('mousemove', this.onPointerMoveBound, false);
    document.addEventListener('mouseup', this.onPointerUpBound, false);
  }



  unbindPointerEventsForDragging() {
    document.removeEventListener('mousemove', this.onPointerMoveBound);
    document.removeEventListener('mouseup', this.onPointerUpBound);
  }



  // WARNING: function may trigger layout refresh
  // optimisation: don't need to cache all; only cache those likely impacted by offset
  cacheChildOffsets(el, propertyName) {
    // don't use babel.io for..of here, as it prevents optimisation
    for (let i = 0; i < el.children.length; i++) {
      let childEl = el.children[i];
      childEl[propertyName] = { top: childEl.offsetTop, left: childEl.offsetLeft };
    }
  }



}



window.dragDrop = new DragDrop();
import DragDropScroller from "./DragDropScroller.js"
dragDrop.registerPlugin(new DragDropScroller())
