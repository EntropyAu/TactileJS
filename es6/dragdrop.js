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
      valueSelector:        '[data-drag-value]',
      droppableSelector:    '[data-drag-droppable]',
      dropZoneSelector:     '[data-drag-sortable],[data-drag-droppable],[data-drag-canvas]',
      disabledSelector:     '[data-drag-disabled]',
      scrollableSelector:   '[data-drag-scrollable]',
      placeholderClass:     'dd-drag-placeholder',
      ghostClass:           'dd-drag-ghost',
      overlayClass:         'dd-drag-overlay',
      dropZoneHoverClass:   'dd-drag-hover',
      duration:             150,
      easing:               'ease-in-out',
      animateGhostSize:     true,
      animatedElementLimit: 10,
      scrollDelay:          1000,
      scrollDistance:       40,
      scrollSpeed:          5
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
    let offsetTop = dragElClientRect.top - parentElClientRect.top;
    let offsetLeft = dragElClientRect.left - parentElClientRect.left;

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
    ghostEl.style.transform = '';
    ghostEl.style.msTransform = '';
    ghostEl.style.mozTransform = '';
    ghostEl.style.webkitTransform = '';
    ghostEl.style.top = '';
    ghostEl.style.left = '';
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
    placeholderEl.style.transform = '';
    placeholderEl.style.msTransform = '';
    placeholderEl.style.mozTransform = '';
    placeholderEl.style.webkitTransform = '';
    placeholderEl.style.top = '';
    placeholderEl.style.left = '';
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
      placeholderParentEl: null,
      placeholderIndex: null,
      placeholderOffsetTop: null,
      placeholderOffsetLeft: null,
      placeholderWidth: null,
      placeholderHeight: null,
      gripTop: gripTop,
      gripLeft: gripLeft,
      parentEl: parentEl,
      parentIndex: parentIndex,
      offsetTop: offsetTop,
      offsetLeft: offsetLeft,
      originalParentEl: parentEl,
      originalParentIndex: parentIndex,
      originalParentOffsetTop: offsetTop,
      originalParentOffsetLeft: offsetLeft,
      orientation: orientation,
      pointerClientX: e.clientX,
      pointerClientY: e.clientY,
      scrollInterval: null
    };

    this._updatePlaceholder(false);

    this._findDropZone(e.clientX, e.clientY);

    dom.raiseEvent(dragEl, 'dragstart', {})

    this._bindPointerEventsForDragging()
  }


  onPointerMove(e) {
    // suppress default event handling, prevents the drag from being interpreted as a selection
    dom.cancelEvent(e);

    this.context.pointerClientX = e.clientX;
    this.context.pointerClientY = e.clientY;

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
    this._autoScroll(e.clientX, e.clientY);
  }

  _autoScroll(clientLeft, clientTop) {
    if (!this.context.parentEl) return;
    if (dom.canScrollVertical(this.context.parentEl)) {
      let containerRect = this.context.parentEl.getBoundingClientRect();
      if (clientTop > containerRect.bottom - 20) {
        this.context.parentEl.scrollTop += 5;
      }
      if (clientTop < containerRect.top + 20) {
        this.context.parentEl.scrollTop += -5;
      }
    }
  }

  _onScrollInterval() {
    this.context.scrollInterval = setInterval(this._onScrollInterval.bind(this), 16);

  }


  _findDropZone(clientLeft, clientTop) {
    // walk up the drop zone tree until we find the closest drop zone that includes the dragged item
    while (!this._positionIsInDropZone(this.context.parentEl, clientLeft, clientTop)) {
      let parentDropZoneEl = dom.closest(this.context.parentEl.parentElement, 'body,' + this.options.dropZoneSelector);
      if (!parentDropZoneEl) break;
      this.context.parentEl.classList.remove(this.options.dropZoneHoverClass);
      dom.raiseEvent(this.context.parentEl, 'dragleave', {});
      this.context.parentEl = parentDropZoneEl;
    }

    // walk down the drop zone tree to the lowest level dropZone
    this._buildDropZoneCacheIfRequired(this.context.parentEl);
    let offsetLeft = clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft,
        offsetTop  = clientTop  - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop;
    let childDropZoneEl = this._getChildDropZoneAtOffset(this.context.parentEl, offsetTop, offsetLeft);
    while (childDropZoneEl) {
      this.context.parentEl = childDropZoneEl;
      this._buildDropZoneCacheIfRequired(this.context.parentEl);
      offsetLeft = clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft,
      offsetTop  = clientTop  - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop;

      this.context.parentEl.classList.add(this.options.dropZoneHoverClass);
      dom.raiseEvent(this.context.parentEl, 'dragenter', {});
      childDropZoneEl = this._getChildDropZoneAtOffset(this.context.parentEl, offsetTop, offsetLeft);
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
          clientLeft,
          function(el) { return helpers.midpointLeft(el.getBoundingClientRect()); });
        break;
      case 'vertical':
        newIndex = helpers.fuzzyBinarySearch(
          this.context.parentEl.children,
          clientTop,
          function(el) { return helpers.midpointTop(el.getBoundingClientRect()); });
        break;
      case 'wrap':
        throw new Error("Not implemented");
    }
    // the parent index will be based on the set of children INCLUDING the placeholder element we need to compensate
    if (this.context.placeholderIndex
      && newIndex > this.context.placeholderIndex)
      newIndex++;

    this.context.parentIndex = newIndex;
  }



  _updateCanvasOffsets(clientLeft, clientTop) {
    let offsetLeft = clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft,
        offsetTop  = clientTop  - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop;

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
    this.context.offsetLeft = offsetLeft;
    this.context.offsetTop = offsetTop;
  }


  _updateGhost(clientLeft, clientTop) {
    Velocity(this.context.ghostEl, {
      translateX: clientLeft,
      translateY: clientTop
    }, { duration: 0 });
    if (this.options.animateGhostSize && this.context.placeholderParentEl) {
      Velocity(this.context.ghostEl, {
        width: this.context.placeholderWidth,
        height: this.context.placeholderHeight
      }, {
        duration: this.options.duration,
        easing: 'linear',
        queue: false });
    }
  }


  _updatePlaceholder(animate = true) {
    // check if we have any work to do...
    if (this.context.parentIndex === this.context.placeholderIndex
     && this.context.parentEl === this.context.placeholderParentEl
     && this.context.offsetTop === this.context.placeholderOffsetTop
     && this.context.offsetLeft === this.context.placeholderOffsetLeft)
      return;

    // TODO: optimisation, update both old and new before triggering animation avoid two layout passes
    // TODO: optimisation, recycle old positions
    animate = animate && this.options.duration > 0;

    let newPhParentEl = this.context.parentEl.matches(this.options.dropZoneSelector)
                      ? this.context.parentEl
                      : null;

    // first, remove the old placeholder
    if (this.context.placeholderParentEl
      && (this.context.parentEl === null || this.context.parentEl !== newPhParentEl)) {
      if (animate) this._cacheChildOffsets(this.context.placeholderParentEl, '_old');
      this.context.placeholderEl.remove();
      if (animate) this._cacheChildOffsets(this.context.placeholderParentEl, '_new');
      if (animate) this._animateElementsBetweenSavedOffsets(this.context.placeholderParentEl);
      this.context.placeholderWidth = null;
      this.context.placeholderHeight = null;
      this.context.placeholderParentEl = null;
    }

    // insert the new placeholder
    if (this._isSortable(newPhParentEl)
      && (this.context.placeholderParentEl !== this.context.parentEl
        || this.context.placeholderIndex !== this.context.parentIndex)) {
      if (animate) this._cacheChildOffsets(this.context.parentEl, '_old');
      this.context.parentEl.insertBefore(this.context.placeholderEl, this.context.parentEl.children[this.context.parentIndex]);
      if (animate) this._cacheChildOffsets(this.context.parentEl, '_new');
      if (animate) this._animateElementsBetweenSavedOffsets(this.context.parentEl);
      this.context.placeholderParentEl = this.context.parentEl;
    }

    if (this._isCanvas(newPhParentEl)) {
      if (this.context.placeholderParentEl !== this.context.parentEl) {
        this.context.parentEl.appendChild(this.context.placeholderEl);
        this.context.placeholderParentEl = this.context.parentEl;
      }
      dom.translate(this.context.placeholderEl,
                    this.context.offsetLeft,
                    this.context.offsetTop);
      this.context.placeholderOffsetLeft = this.context.offsetLeft;
      this.context.placeholderOffsetTop = this.context.offsetTop;
    } else {
      dom.translate(this.context.placeholderEl, 0, 0);
    }

    this.context.placeholderIndex = this.context.parentIndex;

    // measure the width and height of the item for use later
    if (this.context.placeholderParentEl) {
      this.context.placeholderWidth = this.context.placeholderEl.getBoundingClientRect().width;
      this.context.placeholderHeight = this.context.placeholderEl.getBoundingClientRect().height;
    }
  }



  onPointerUp(e) {
    this._unbindPointerEventsForDragging()
    dom.raiseEvent(this.context.dragEl, 'dragend', {})
    dom.raiseEvent(this.context.dragEl, 'drop', {})

    if (this.context.placeholderParentEl) {
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
        complete: this._placeDragElInFinalPosition.bind(this)
      });
    } else {
      this._placeDragElInFinalPosition()
    }
  }

  _placeDragElInFinalPosition() {
    this.context.placeholderEl.remove();

    if (this._isSortable(this.context.parentEl)) {
      this.context.parentEl.insertBefore(this.context.dragEl, this.context.parentEl.children[this.context.parentIndex]);
    }
    if (this._isCanvas(this.context.parentEl)) {
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


  _isSortable(el) {
    return el && el.matches(this.options.sortableSelector);
  }

  _isCanvas(el) {
    return el && el.matches(this.options.canvasSelector);
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