import * as helpers from "./helpers.js";
import * as dom from "./dom.js";

export class DragDrop {
  constructor() {
    this.context = null;
    this.options = {
      draggableSelector:    '[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *',
      handleSelector:       '[data-drag-handle]',
      sortableSelector:     '[data-drag-sortable]',
      canvasSelector:       '[data-drag-canvas]',
      droppableSelector:    '[data-drag-droppable]',
      dropZoneSelector:     '[data-drag-sortable],[data-drag-droppable],[data-drag-canvas]',
      disabledSelector:     '[data-drag-disabled]',
      placeholderClass:     'dd-drag-placeholder',
      ghostClass:           'dd-drag-ghost',
      overlayClass:         'dd-drag-overlay',
      dropZoneHoverClass:   'dd-drag-hover',
      duration:             150,
      easing:               'ease-in-out',
      animateGhostSize:     true,
      animatedElementLimit: 10
    }

    var onPointerDown = this.onPointerDown.bind(this);
    document.addEventListener('mousedown', onPointerDown, false);
  }


  onPointerDown(e) {
    // support left click only
    if (e.which !== 1) return;

    let handleEl = dom.closest(e.target, `${this.options.handleSelector},${this.options.draggableSelector}`);
    if (!handleEl) return;

    let dragEl = handleEl;
    if (handleEl.matches(this.options.handleSelector)) {
      // since the pointer is down on a handle element, walk up the DOM to find the associated item
      dragEl = dom.closest(handleEl, this.options.draggableSelector);
    } else {
      // if the item contains a handle (which was not the the pointer down spot) then ignore
      // TODO need to generate permutations of descendant item handle selector
      if (dragEl.querySelectorAll(this.options.handleSelector).length >
          dragEl.querySelectorAll(this.options.draggableSelector + ' ' + this.options.handleSelector).length) return;
    }
    if (!dragEl) return;

    dom.cancelEvent(e);

    // abort the drag if the element is marked as [data-drag-disabled]
    if (dragEl.matches(this.options.disabledSelector)) return;

    let parentEl = dragEl.parentElement;
    let parentIndex = Array.prototype.indexOf.call(parentEl.children, dragEl);

    let dragElClientRect = dragEl.getBoundingClientRect();
    let parentElClientRect = parentEl.getBoundingClientRect();
    let parentOffsetTop = dragElClientRect.top - parentElClientRect.top;
    let parentOffsetLeft = dragElClientRect.left - parentElClientRect.left;

    // record the offset of the grip point on the drag item
    let gripTop = e.clientY - dragElClientRect.top;
    let gripLeft = e.clientX - dragElClientRect.left;

    parentEl.removeChild(dragEl);

    // create the overlay (which contains the ghost)
    let overlayEl = document.createElement('div');
    overlayEl.classList.add(this.options.overlayClass);
    document.body.appendChild(overlayEl);

    // create the ghost (the copy of the item that follows the pointer)
    let ghostEl = dragEl.cloneNode(true);
    ghostEl.removeAttribute('id');
    ghostEl.classList.add(this.options.ghostClass);
    ghostEl.style.width = dragElClientRect.width + 'px';
    ghostEl.style.height = dragElClientRect.height + 'px';
    Velocity(ghostEl, { translateX: e.clientX - gripLeft, translateY: e.clientY - gripTop, boxShadowBlur: 0 }, { duration: 0 });
    overlayEl.appendChild(ghostEl);

    // animate the ghost 'lifting up' from the original position
    Velocity(ghostEl, { rotateZ: -1, boxShadowBlur: 10 }, { duration: this.options.duration, easing: this.options.easing });

    // apply focus to the ghost to clear any in-progress selections
    ghostEl.focus()

    // create the placeholder element
    let placeholderEl = dragEl.cloneNode(true);
    placeholderEl.removeAttribute('id');
    placeholderEl.classList.add(this.options.placeholderClass);
    parentEl.insertBefore(placeholderEl, dragEl.nextSibling);

    let orientation = dragEl.getAttribute('data-drag-orientation') || "both";

    this._buildDropZoneCache(parentEl);

    this.context = {
      dragEl: dragEl,
      overlayEl: overlayEl,
      ghostEl: ghostEl,
      ghostWidth: dragElClientRect.width,
      ghostHeight: dragElClientRect.height,
      placeholderEl: placeholderEl,
      placeholderDropZoneEl: null,
      placeholderDropZoneIndex: null,
      placeholderDropZoneOffsetTop: null,
      placeholderDropZoneOffsetLeft: null,
      gripTop: gripTop,
      gripLeft: gripLeft,
      parentEl: document.body,
      parentIndex: parentIndex,
      parentOffsetTop: parentOffsetTop,
      parentOffsetLeft: parentOffsetLeft,
      originalParentEl: parentEl,
      originalParentIndex: parentIndex,
      originalParentOffsetTop: parentOffsetTop,
      originalParentOffsetLeft: parentOffsetLeft,
      orientation: orientation
    };

    this._findDropZone(e.clientX, e.clientY);

    this._updatePlaceholder(false);

    dom.raiseEvent(dragEl, 'dragstart', {})

    this._bindPointerEventsForDragging()
  }


  onPointerMove(e) {
    // suppress default event handling, prevents the drag from being interpreted as a selection
    dom.cancelEvent(e);

    let newClientTop = e.clientY - this.context.gripTop;
    let newClientLeft = e.clientX - this.context.gripLeft;
    switch (this.context.orientation) {
      case "vertical": newClientLeft = this.context.originalOffsetLeft; break;
      case "horizontal": newClientTop = this.context.originalOffsetTop; break;
      case "both": break;
    }

    dom.raiseEvent(this.context.dragEl, 'drag', {});

    this._findDropZone(e.clientX, e.clientY);
    if (this.context.parentEl.matches(this.options.sortableSelector)) this._updateSortableIndex(e.clientX, e.clientY);
    if (this.context.parentEl.matches(this.options.canvasSelector)) this._updateCanvasOffsets(e.clientX, e.clientY);
    this._updatePlaceholder();
    this._updateGhost(newClientLeft, newClientTop);
    return false;
  }


  _findDropZone(clientLeft, clientTop) {
    // walk up the drop zone tree until we find the closest drop zone that includes the dragged item
    while (!this._positionIsInDropZone(this.context.parentEl, clientLeft, clientTop)) {
      let parentDropZoneEl = dom.closest(this.context.parentEl.parentElement, 'body,' + this.options.dropZoneSelector);
      if (!parentDropZoneEl) break;
      dom.raiseEvent(this.context.parentEl, 'dragleave', {});
      this.context.parentEl = parentDropZoneEl;
    }

    // walk down the drop zone tree to the lowest level dropZone
    this._buildDropZoneCacheIfRequired(this.context.parentEl);
    let parentOffsetLeft = clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft,
        parentOffsetTop  = clientTop  - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop;
    let childDropZoneEl = this._getChildDropZoneAtOffset(this.context.parentEl, parentOffsetTop, parentOffsetLeft);
    while (childDropZoneEl) {
      this.context.parentEl = childDropZoneEl;
      this._buildDropZoneCacheIfRequired(this.context.parentEl);
      parentOffsetLeft = clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft,
      parentOffsetTop  = clientTop  - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop;

      dom.raiseEvent(this.context.parentEl, 'dragenter', {});
      childDropZoneEl = this._getChildDropZoneAtOffset(this.context.parentEl, parentOffsetTop, parentOffsetLeft);
    }
  }


  // TODO: optimisation, cache layout offsets
  _updateSortableIndex(clientLeft, clientTop) {
    let direction = this.context.parentEl.getAttribute('data-drag-sortable') || 'vertical';
    let newIndex = null;
    switch (direction) {
      case 'horizontal':
        newIndex = helpers.fuzzyBinarySearch(
          this.context.parentEl.children,
          clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft,
          function(el) { return el.offsetLeft - el.offsetWidth / 2; });
        break;
      case 'vertical':
        newIndex = helpers.fuzzyBinarySearch(
          this.context.parentEl.children,
          clientTop  - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop,
          function(el) { return el.offsetTop + el.offsetHeight / 2; });
        break;
      case 'wrap':
        throw new Error("Not implemented");
    }
    // the parent index will be based on the set of children INCLUDING the placeholder element we need to compensate
    if (this.context.placeholderDropZoneIndex && newIndex > this.context.placeholderDropZoneIndex) newIndex--;
    this.context.parentIndex = newIndex;
  }


  _updateCanvasOffsets(clientLeft, clientTop) {
    let parentOffsetLeft = clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft,
        parentOffsetTop  = clientTop  - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop;

    // snap to drop zone bounds
    let snapToBounds = this.context.parentEl.getAttribute('data-drag-snap-to-bounds')
    if (snapToBounds) {
      let dropZoneOffsets = this.context.parentEl.getBoundingClientRect();
      if (newLeft < dropZoneOffsets.left) newLeft = dropZoneOffsets.left;
      if (newTop < dropZoneOffsets.top) newTop = dropZoneOffsets.top;
      if (newLeft < dropZoneOffsets.right - this.context.ghostWidth) newLeft = dropZoneOffsets.right - this.context.ghostWidth;
      if (newTop > dropZoneOffsets.bottom - this.context.ghostHeight) newTop = dropZoneOffsets.bottom - this.context.ghostHeight;
    }

    // snap to dropZone grid
    let snapToGrid = this.context.parentEl.getAttribute('data-drag-snap-to-grid');
    if (snapToGrid) {
      let cellSizeTokens = snapToGrid.split(',');
      let cellW = parseInt(cellSizeTokens[0], 10);
      let cellH = parseInt(cellSizeTokens[1], 10) || cellW;
      let dropZoneOffsets = this.context.parentEl.getBoundingClientRect();
      newTop =  Math.round((newTop - dropZoneOffsets.top) / cellH) * cellH + dropZoneOffsets.top;
      newLeft = Math.round((newLeft - dropZoneOffsets.left) / cellW) * cellW + dropZoneOffsets.left;
    }
    this.context.parentOffsetLeft = null;
    this.context.parentOffsetTop = null;
  }


  _updateGhost(clientLeft, clientTop) {
    Velocity(this.context.ghostEl, {
      translateX: clientLeft,
      translateY: clientTop
    }, { duration: 0 });
  }


  _updatePlaceholder(animate = true) {
    // check if we have any work to do...
    if (this.context.parentIndex === this.context.placeholderDropZoneIndex
     && this.context.parentEl === this.context.placeholderDropZoneEl)
      return;

    // TODO: optimisation, update both old and new before triggering animation avoid two layout passes
    // TODO: optimisation, recycle old positions
    animate = animate && this.options.duration > 0;

    let newPhParentEl = this.context.parentEl.matches(this.options.dropZoneSelector)
                      ? this.context.parentEl
                      : null;

    // first, remove the old placeholder
    if (this.context.placeholderDropZoneEl && (this.context.parentEl === null || this.context.parentEl !== newPhParentEl)) {
      if (animate) this._cacheChildOffsets(this.context.placeholderDropZoneEl, '_old');
      this.context.placeholderEl.remove();
      if (animate) this._cacheChildOffsets(this.context.placeholderDropZoneEl, '_new');
      if (animate) this._animateElementsBetweenSavedOffsets(this.context.placeholderDropZoneEl);
    }

    // insert the new placeholder
    if (newPhParentEl) {
      if (animate) this._cacheChildOffsets(this.context.parentEl, '_old');
      this.context.parentEl.insertBefore(this.context.placeholderEl, this.context.parentEl.children[this.context.parentIndex]);
      if (animate) this._cacheChildOffsets(this.context.parentEl, '_new');
      if (animate) this._animateElementsBetweenSavedOffsets(this.context.parentEl);
    }

    this.context.placeholderDropZoneIndex = this.context.parentIndex;
    this.context.placeholderDropZoneEl = newPhParentEl;
  }



  onPointerUp(e) {
    this._unbindPointerEventsForDragging()
    dom.raiseEvent(this.context.dragEl, 'dragend', {})
    dom.raiseEvent(this.context.dragEl, 'drop', {})

    if (this.context.placeholderDropZoneEl) {
      let placeholderRect = this.context.placeholderEl.getBoundingClientRect();
      let targetProps = {
        translateX: [placeholderRect.left, 'ease-out'],
        translateY: [placeholderRect.top, 'ease-out'],
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
        complete: this._cleanUp.bind(this)
      });
    } else {
      _cleanUp()
    }
  }

  _cleanUp() {
    this.context.placeholderEl.remove();
    // restore the original dragEl to its (new/old) position
    if (this.context.parentEl) {
      this.context.parentEl.insertBefore(this.context.dragEl, this.context.parentEl.children[this.context.parentIndex]);
    } else {
      this.context.originalDropZone.insertBefore(this.context.dragEl, this.context.originalAfterEl);
    }
    this.context.overlayEl.remove();
    this.context = null;
  }


  _buildDropZoneCache(parentEl) {
    parentEl.__dd_clientRect = parentEl.getBoundingClientRect();;
    parentEl.__dd_scrollTop = parentEl.scrollTop;
    parentEl.__dd_scrollLeft = parentEl.scrollLeft;
    parentEl.__dd_childDropZones = [];

    for (let childDropZoneEl of parentEl.querySelectorAll(this.options.dropZoneSelector)) {

      // if the descendant dropZone is embedded within another descendant dropZone let's ignore it.
      let intermediateDropZoneEl = dom.closest(childDropZoneEl.parentElement, `${this.options.dropZoneSelector},body`);
      if (intermediateDropZoneEl !== null && intermediateDropZoneEl !== parentEl) continue;

      // if this drop zone is contained within a placeholder, ignore it
      if (dom.closest(childDropZoneEl, `.${this.options.placeholderClass}`)) continue;

      let childRect = childDropZoneEl.getBoundingClientRect();
      parentEl.__dd_childDropZones.push({
        el: childDropZoneEl,
        top: childRect.top - parentEl.__dd_clientRect.top + parentEl.__dd_scrollTop,
        left: childRect.left - parentEl.__dd_clientRect.left + parentEl.__dd_scrollLeft,
        width: childRect.width,
        height: childRect.height
      });
    }
  }

  _buildDropZoneCacheIfRequired(parentEl) {
    if (!parentEl.__dd_clientRect)
      this._buildDropZoneCache(parentEl);
  }

  _clearDropZoneCache(parentEl) {
    delete parentEl.__dd_clientRect;
    delete parentEl.__dd_scrollTop;
    delete parentEl.__dd_scrollLeft;
    delete parentEl.__dd_childDropZones;
  }

  _getChildDropZoneAtOffset(parentEl, offsetTop, offsetLeft) {
    for (let childDropZone of parentEl.__dd_childDropZones) {
      if (offsetTop  >= childDropZone.top
       && offsetTop  <= childDropZone.top + childDropZone.height
       && offsetLeft >= childDropZone.left
       && offsetLeft <= childDropZone.left + childDropZone.width)
        return childDropZone.el;
    }
    return null;
  }


  _positionIsInDropZone(parentEl, clientLeft, clientTop) {
    this._buildDropZoneCacheIfRequired(parentEl);
    let offsetLeft = clientLeft - parentEl.__dd_clientRect.left,
        offsetTop  = clientTop - parentEl.__dd_clientRect.top;
    return (offsetTop  >= 0 && offsetTop  <= parentEl.__dd_clientRect.height
         && offsetLeft >= 0 && offsetLeft <= parentEl.__dd_clientRect.width);
  }


  _checkScrollProximity(parentEl, offsetTop, offsetLeft) {
    // iterate up the tree until we find a scrollable element
    //
  }


  _bindPointerEventsForDragging() {
    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerUpBound = this.onPointerUp.bind(this);
    document.addEventListener('mousemove', this.onPointerMoveBound, false);
    document.addEventListener('mouseup', this.onPointerUpBound, false);
  }

  _unbindPointerEventsForDragging() {
    document.removeEventListener('mousemove', this.onPointerMoveBound);
    document.removeEventListener('mouseup', this.onPointerUpBound);
  }


  _dragenter(dropZoneEl, event) {
    dropZoneEl.classList.add(this.options.dropZoneHoverClass);
  }

  _dragleave(dropZoneEl, event) {
    dropZoneEl.classList.remove(this.options.dropZoneHoverClass);
  }


  // WARNING: function may trigger layout refresh
  _cacheChildOffsets(el, propertyName) {
    for (let childEl of el.children) {
      childEl[propertyName] = { top: childEl.offsetTop, left: childEl.offsetLeft };
    }
  }


  _animateElementsBetweenSavedOffsets(el) {
    let animatedItemCount = 0;
    for (let childEl of el.children) {
      if (++animatedItemCount > this.options.animatedElementLimit) break;
      if (childEl.matches(`.${this.options.placeholderClass}`)) continue;

      let [oldOffset, newOffset] = [childEl._old, childEl._new];
      if (!oldOffset || !newOffset || (oldOffset.top === newOffset.top && oldOffset.left === newOffset.left)) continue;

      // the following line makes the animations smoother in safari
      //childEl.style.webkitTransform = 'translate3d(0,' + (oldOffset.top - newOffset.top) + 'px,0)';

      Velocity(childEl, {
        translateX: '+=' + (oldOffset.left - newOffset.left) + 'px',
        translateY: '+=' + (oldOffset.top - newOffset.top) + 'px',
        translateZ: '1px'
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


  /*

  // TODO: explore replacing with simulated mousewheel event
  function _bubbleScroll(el, dx, dy) {
    while ((dx != 0 || dy != 0) && el != null) {
      let oldScrollLeft = el.scrollLeft;
      let oldScrollTop = el.scrollTop;
      let newScrollLeft = oldScrollLeft;
      let newScrollTop = oldScrollTop;
      if (dx > 0) { newScrollLeft = Math.min(el.scrollWidth - el.clientWidth, oldScrollLeft + dx); dx -= newScrollLeft - oldScrollLeft; };
      if (dx < 0) { newScrollLeft = Math.max(0, oldScrollLeft - dx); dx -= newScrollLeft - oldScrollLeft; };
      if (dy > 0) { newScrollTop = Math.min(el.scrollHeight - el.clientHeight, oldScrollTop + dy); dy -= newScrollTop - oldScrollTop; };
      if (dy < 0) { newScrollTop = Math.max(0, oldScrollTop - dy); dy -= newScrollTop - oldScrollTop; };
      if (newScrollLeft != oldScrollLeft) el.scrollLeft = newScrollLeft;
      if (newScrollTop != oldScrollTop) el.scrollTop = newScrollTop;
      el = el.parentElement;
    }
  }
  */
}

window.dragDrop = new DragDrop();