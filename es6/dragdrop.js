import * as constants from "./constants.js";
import * as helpers from "./helpers.js";
import * as dom from "./dom.js";
import * as scrolling from "./scrolling.js"

// conventions
// all client positions are expressed as x,y
// all offset positions are expressed as l,t

export class DragDrop {
  constructor() {
    this.context = null;
    this.options = {
      placeholderClass:     'dd-drag-placeholder',
      ghostClass:           'dd-drag-ghost',
      overlayClass:         'dd-drag-overlay',
      dropZoneHoverClass:   'dd-drag-hover',
      duration:             150,
      easing:               'ease-in-out',
      ghostResize:          true,
      ghostResizeAnimated:  true,
      animatedElementLimit: 10,
      scrollDelay:          1000,
      scrollDistance:       40,
      scrollSpeed:          3
    }
    var onPointerDown = this.onPointerDown.bind(this);
    document.addEventListener('mousedown', onPointerDown, false);
  }


  onPointerDown(e) {
    // support left click only
    if (e.which !== 1) return;

    let handleEl = dom.closest(e.target, `${constants.handleSelector},${constants.draggableSelector}`);
    if (!handleEl) return;

    let dragEl = handleEl;
    if (handleEl.matches(constants.handleSelector)) {
      // since the pointer is down on a handle element, walk up the DOM to find the associated item
      dragEl = dom.closest(handleEl, constants.draggableSelector);
    } else {
      // if the item contains a handle (which was not the the pointer down spot) then ignore
      // TODO need to generate permutations of descendant item handle selector
      if (dragEl.querySelectorAll(constants.handleSelector).length >
          dragEl.querySelectorAll(`${constants.draggableSelector} ${constants.handleSelector}`).length)
        return;
    }
    if (!dragEl) return;

    dom.cancelEvent(e);

    // abort the drag if the element is marked as [data-drag-disabled]
    if (dragEl.matches(constants.disabledSelector)) return;

    let parentEl = dragEl.parentElement;
    let parentIndex = Array.prototype.indexOf.call(parentEl.children, dragEl);

    let dragElRect = dragEl.getBoundingClientRect();
    let parentElRect = parentEl.getBoundingClientRect();
    let offsetTop = dragElRect.top - parentElRect.top;
    let offsetLeft = dragElRect.left - parentElRect.left;
    let pointerX = e.clientX;
    let pointerY = e.clientY;

    // record the offset of the grip point on the drag item
    let gripTop = e.clientY - dragElRect.top;
    let gripLeft = e.clientX - dragElRect.left;
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
    Velocity(ghostEl, { rotateZ: -1, boxShadowBlur: 10 }, { duration: this.options.duration, easing: this.options.easing });

    // apply focus to the ghost to clear any in-progress selections
    ghostEl.focus()

    // create the placeholder element
    let placeholderEl = dragEl.cloneNode(true);
    placeholderEl.removeAttribute('id');
    dom.translate(placeholderEl,0,0);
    dom.topLeft(placeholderEl,0,0);
    placeholderEl.classList.add(this.options.placeholderClass);
    parentEl.insertBefore(placeholderEl, dragEl.nextSibling);

    let orientation = dragEl.getAttribute('data-drag-orientation') || "both";

    this.buildDropZoneCache(parentEl);

    this.context = {
      dragEl: dragEl,
      overlayEl: overlayEl,
      ghostEl: ghostEl,
      ghostWidth: dragElRect.width,
      ghostHeight: dragElRect.height,
      placeholderEl: placeholderEl,
      placeholderParentEl: null,
      placeholderIndex: null,
      placeholderOffsetTop: null,
      placeholderOffsetLeft: null,
      placeholderWidth: null,
      placeholderHeight: null,
      gripTop: gripTop,
      gripLeft: gripLeft,
      gripTopPercent: gripTopPercent,
      gripLeftPercent: gripLeftPercent,
      parentEl: parentEl,
      parentIndex: parentIndex,
      offsetTop: offsetTop,
      offsetLeft: offsetLeft,
      originalParentEl: parentEl,
      originalParentIndex: parentIndex,
      originalParentOffsetTop: offsetTop,
      originalParentOffsetLeft: offsetLeft,
      orientation: orientation,
      pointerX: e.clientX,
      pointerY: e.clientY,
      scrollAnimationFrame: null,
      scrollEl: null,
      scrollDx: null,
      scrollDy: null
    };

    this.updatePlaceholder(this.context, false);
    this.findDropZone(this.context);
    dom.raiseEvent(dragEl, 'dragstart', {})
    this.bindPointerEventsForDragging()
  }


  dragStart(dragEl) {

  }



  onPointerMove(e) {
    // suppress default event handling, prevents the drag from being interpreted as a selection
    dom.cancelEvent(e);
    this.dragMove(this.context, e.clientX, e.clientY);
  }


  dragMove(context, x, y) {
    context.pointerX = x;
    context.pointerY = y;

    /*
    let newClientTop = x - context.gripTop;
    let newClientLeft = y - context.gripLeft;
    switch (context.orientation) {
      case "vertical": newClientLeft = context.originalOffsetLeft; break;
      case "horizontal": newClientTop = context.originalOffsetTop; break;
      case "both": break;
    }
    */

    dom.raiseEvent(context.dragEl, 'drag', {});

    this.findDropZone(context);
    if (this.isSortable(context.parentEl)) this.updateSortableIndex(context);
    if (this.isCanvas(context.parentEl)) this.updateCanvasOffsets(context);
    this.updatePlaceholder(context);
    this.updateGhost(context);
    this.updateAutoScroll(context);
  }



  onScrollAnimationFrame() {
    this.continueAutoScroll(this.context);
  }

  updateAutoScroll(context) {
    [context.scrollEl, context.scrollDx, context.scrollDy] = this.getScrollZoneUnderPointer(context);
    if (context.scrollEl) this.startAutoScroll(context);
    if (!context.scrollEl) this.stopAutoScroll(context);
  }

  startAutoScroll(context) {
    context.scrollAnimationFrame = requestAnimationFrame(this.onScrollAnimationFrame.bind(this));
  }

  stopAutoScroll(context) {
    if (context.scrollAnimationFrame) {
      cancelAnimationFrame(context.scrollAnimationFrame);
      context.scrollAnimationFrame = null;
    }
  }

  continueAutoScroll(context) {
    if (context && context.scrollEl) {
      context.scrollEl.scrollTop += context.scrollDy;
      context.scrollEl.scrollLeft += context.scrollDx;
      this.updateAutoScroll(context);
    }
  }



  getScrollZoneUnderPointer(context) {
    var scrollableAncestorEls = dom.ancestors(context.parentEl, constants.scrollableSelector);

    for (let i = 0; i < scrollableAncestorEls.length; i++) {
      let scrollEl = scrollableAncestorEls[i];
      let scrollableRect = scrollEl.getBoundingClientRect();  // cache this
      let sx = 0;
      let sy = 0;

      if (scrollEl.getAttribute(constants.scrollAttribute) !== 'vertical') {
        let hScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.width / 3);
        if (context.pointerX > scrollableRect.right  - hScrollDistance && dom.canScrollRight(scrollEl)) sx = +this.options.scrollSpeed;
        if (context.pointerX < scrollableRect.left   + hScrollDistance && dom.canScrollLeft(scrollEl)) sx = -this.options.scrollSpeed;
      }

      if (scrollEl.getAttribute(constants.scrollAttribute) !== 'horizontal') {
        let vScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.height / 3);
        if (context.pointerY < scrollableRect.top    + vScrollDistance && dom.canScrollUp(scrollEl)) sy = -this.options.scrollSpeed;
        if (context.pointerY > scrollableRect.bottom - vScrollDistance && dom.canScrollDown(scrollEl)) sy = +this.options.scrollSpeed;
      }

      if (sx !== 0 || sy !== 0) {
        return [scrollEl, sx, sy];
      }
    }
    return [null, null, null];
  }




  findDropZone(context) {
    // walk up the drop zone tree until we find the closest drop zone that includes the dragged item
    while (!this.positionIsInDropZone(context.parentEl, context.pointerX, context.pointerY)) {
      let parentDropZoneEl = dom.closest(context.parentEl.parentElement, `body,${constants.dropZoneSelector}`);
      if (!parentDropZoneEl) break;
      context.parentEl.classList.remove(this.options.dropZoneHoverClass);
      dom.raiseEvent(context.parentEl, 'dragleave', {});
      context.parentEl = parentDropZoneEl;
    }

    // walk down the drop zone tree to the lowest level dropZone
    this.buildDropZoneCacheIfRequired(context.parentEl);
    let offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
        offsetTop  = context.pointerY  - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;
    let childDropZoneEl = this.getChildDropZoneAtOffset(context.parentEl, offsetTop, offsetLeft);
    while (childDropZoneEl) {
      context.parentEl = childDropZoneEl;
      this.buildDropZoneCacheIfRequired(context.parentEl);
      offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
      offsetTop  = context.pointerY  - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;

      context.parentEl.classList.add(this.options.dropZoneHoverClass);
      dom.raiseEvent(context.parentEl, 'dragenter', {});
      childDropZoneEl = this.getChildDropZoneAtOffset(context.parentEl, offsetTop, offsetLeft);
    }
  }


  // TODO: optimisation, cache layout offsets
  // TODO: optimisation, check immediate neighbours prior to binary search
  updateSortableIndex(context) {
    let direction = context.parentEl.getAttribute(constants.sortableAttribute) || 'vertical';


    let offsetParent = null
    for (let childEl of context.parentEl.children) {
      offsetParent = childEl.offsetParent;
      if (offsetParent !== null) break;
    }
    let offsetParentRect = offsetParent.getBoundingClientRect();
    let offsetPointerX = context.pointerX - offsetParentRect.left + offsetParent.scrollLeft;
    let offsetPointerY = context.pointerY - offsetParentRect.top + offsetParent.scrollTop;

    let newIndex = null;
    switch (direction) {
      case 'horizontal':
        newIndex = helpers.fuzzyBinarySearch(
          context.parentEl.children,
          offsetPointerX,
          el => el.offsetLeft + el.offsetWidth / 2);
        break;
      case 'vertical':
        newIndex = helpers.fuzzyBinarySearch(
          context.parentEl.children,
          offsetPointerY,
          el => el.offsetTop + el.offsetHeight / 2);
        break;
      case 'wrap':
        throw new Error("Not implemented");
    }
    // the parent index will be based on the set of children INCLUDING the placeholder element we need to compensate
    if (context.placeholderIndex && newIndex > context.placeholderIndex) newIndex++;
    context.parentIndex = newIndex;
  }



  updateCanvasOffsets(context) {
    let offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
        offsetTop  = context.pointerY - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;

    // snap to drop zone bounds
    let snapInBounds = context.parentEl.getAttribute(constants.snapInBoundsAttribute) !== null;
    if (snapInBounds) {
      let dropZoneOffsets = context.parentEl.getBoundingClientRect();
      if (newLeft < dropZoneOffsets.left) newLeft = dropZoneOffsets.left;
      if (newTop < dropZoneOffsets.top) newTop = dropZoneOffsets.top;
      if (newLeft < dropZoneOffsets.right - context.ghostWidth) newLeft = dropZoneOffsets.right - context.ghostWidth;
      if (newTop > dropZoneOffsets.bottom - context.ghostHeight) newTop = dropZoneOffsets.bottom - context.ghostHeight;
    }

    // snap to dropZone grid
    let snapToGrid = context.parentEl.getAttribute(constants.snapToGridAttribute) !== null;
    if (snapToGrid) {
      let cellSizeTokens = snapToGrid.split(',');
      let cellW = parseInt(cellSizeTokens[0], 10);
      let cellH = parseInt(cellSizeTokens[1], 10) || cellW;
      let dropZoneOffsets = context.parentEl.getBoundingClientRect();
      newTop =  Math.round((newTop - dropZoneOffsets.top) / cellH) * cellH + dropZoneOffsets.top;
      newLeft = Math.round((newLeft - dropZoneOffsets.left) / cellW) * cellW + dropZoneOffsets.left;
    }
    context.offsetLeft = offsetLeft;
    context.offsetTop = offsetTop;
  }



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

    let newPhParentEl = context.parentEl.matches(constants.dropZoneSelector)
                      ? context.parentEl
                      : null;

    // first, remove the old placeholder
    if (context.placeholderParentEl
      && (context.parentEl === null || context.parentEl !== newPhParentEl)) {
      if (animate) this.cacheChildOffsets(context.placeholderParentEl, '_old');
      context.placeholderEl.remove();
      if (animate) this.cacheChildOffsets(context.placeholderParentEl, '_new');
      if (animate) this.animateElementsBetweenSavedOffsets(context.placeholderParentEl);
      context.placeholderWidth = null;
      context.placeholderHeight = null;
      context.placeholderParentEl = null;
    }

    // insert the new placeholder
    if (this.isSortable(newPhParentEl)
      && (context.placeholderParentEl !== context.parentEl
        || context.placeholderIndex !== context.parentIndex)) {
      if (animate) this.cacheChildOffsets(context.parentEl, '_old');
      context.parentEl.insertBefore(context.placeholderEl, context.parentEl.children[context.parentIndex]);
      if (animate) this.cacheChildOffsets(context.parentEl, '_new');
      if (animate) this.animateElementsBetweenSavedOffsets(context.parentEl);
      context.placeholderParentEl = context.parentEl;
    }

    if (this.isCanvas(newPhParentEl)) {
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



  updateGhost(context) {
    this.updateGhostPosition(context);
    if (this.options.ghostResize) this.updateGhostSize(context);
  }

  updateGhostPosition(context) {
    Velocity(context.ghostEl, {
      translateX: context.pointerX,
      translateY: context.pointerY
    }, { duration: 0 });
  }

  updateGhostSize(context) {
    // do nothing if the placeholder is not currently visible
    if (!context.placeholderParentEl) return;
    // do nothing if the ghost and placeholder are the same size
    if (context.ghostWidth === context.placeholderWidth && context.ghostHeight === context.placeholderHeight)
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



  onPointerUp(e) {
    this.unbindPointerEventsForDragging()
    dom.raiseEvent(this.context.dragEl, 'dragend', {})
    dom.raiseEvent(this.context.dragEl, 'drop', {})

    this.stopAutoScroll(this.context);

    if (this.context.placeholderParentEl) {
      let placeholderRect = this.context.placeholderEl.getBoundingClientRect();
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
      Velocity(this.context.ghostEl, targetProps, {
        duration: this.options.duration,
        easing: this.options.easing,
        complete: this.placeDragElInFinalPosition.bind(this)
      });
    } else {
      this.placeDragElInFinalPosition()
    }
  }


  placeDragElInFinalPosition() {
    this.context.placeholderEl.remove();

    if (this.isSortable(this.context.parentEl)) {
      this.context.parentEl.insertBefore(this.context.dragEl, this.context.parentEl.children[this.context.parentIndex]);
    }
    if (this.isCanvas(this.context.parentEl)) {
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
      if (dom.closest(childDropZoneEl, `.${this.options.placeholderClass}`)) continue;

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


  isSortable(el) {
    return el && el.matches(constants.sortableSelector);
  }

  isCanvas(el) {
    return el && el.matches(constants.canvasSelector);
  }


  positionIsInDropZone(el, clientLeft, clientTop) {
    this.buildDropZoneCacheIfRequired(el);
    let offsetLeft = clientLeft - el.__dd_clientRect.left,
        offsetTop  = clientTop - el.__dd_clientRect.top;
    return (offsetTop  >= 0 && offsetTop  <= el.__dd_clientRect.height
         && offsetLeft >= 0 && offsetLeft <= el.__dd_clientRect.width);
  }


  checkScrollProximity(el, offsetTop, offsetLeft) {
    // iterate up the tree until we find a scrollable element
    //
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


  animateElementsBetweenSavedOffsets(el) {
    let animatedItemCount = 0;
    for (let childEl of el.children) {
      if (childEl.matches(`.${this.options.placeholderClass}`)) continue;

      let [oldOffset, newOffset] = [childEl._old, childEl._new];
      if (!oldOffset || !newOffset || (oldOffset.top === newOffset.top && oldOffset.left === newOffset.left)) continue;

      if (++animatedItemCount > this.options.animatedElementLimit) break;

      // the following line makes the animations smoother in safari
      //childEl.style.webkitTransform = 'translate3d(0,' + (oldOffset.top - newOffset.top) + 'px,0)';

      Velocity(childEl, {
        translateX: '+=' + (oldOffset.left - newOffset.left) + 'px',
        translateY: '+=' + (oldOffset.top - newOffset.top) + 'px'
      }, { duration: 0 });

      Velocity(childEl, {
        translateX: 0,
        translateY: 0
      }, {
        duration: this.options.duration,
        easing: this.options.easing,
        queue: false
      });
    }
  }
}

window.dragDrop = new DragDrop();