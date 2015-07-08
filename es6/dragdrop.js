"use strict";

// snapping
// layout

let context = null

document.addEventListener('mousedown', onPointerDown, false);

function _bindPointerEventsForDragging() {
  document.addEventListener('mousemove', onPointerMove, false);
  document.addEventListener('mouseup', onPointerUp, false);
}

function _unbindPointerEventsForDragging() {
  document.removeEventListener('mousemove', onPointerMove);
  document.removeEventListener('mouseup', onPointerUp);
}

let options = {
  // default selectors
  draggableSelector:   '[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *',
  handleSelector:      '[data-drag-handle]',
  sortableSelector:    '[data-drag-sortable]',
  canvasSelector:      '[data-drag-canvas]',
  droppableSelector:   '[data-drag-droppable]',
  dropZoneSelector:    '[data-drag-sortable],[data-drag-droppable],[data-drag-canvas]',
  disabledSelector:    '[data-drag-disabled]',

  // default classes
  placeholderClass:    'dd-drag-placeholder',
  ghostClass:          'dd-drag-ghost',
  overlayClass:        'dd-drag-overlay',
  dropZoneHoverClass:  'dd-drag-hover',

  // default animation options
  duration:            250,
  easing:              'ease-in-out',
  animateGhostSize:    true
}

function onPointerDown(e) {
  if (e.which !== 1) return;

  let handleEl = _closest(e.target, [options.handleSelector, options.draggableSelector].join(','));
  if (!handleEl) return;

  let dragEl = handleEl;
  if (handleEl.matches(options.handleSelector)) {
    // since the pointer is down on a handle element, walk up the DOM to find the associated item
    dragEl = _closest(handleEl, options.draggableSelector);
  } else {
    // if the item contains a handle (which was not the the pointer down spot) then ignore
    // TODO need to generate permutations of descendant item handle selector
    if (dragEl.querySelectorAll(options.handleSelector).length >
        dragEl.querySelectorAll(options.draggableSelector + ' ' + options.handleSelector).length) return;
  }
  if (!dragEl) return;

  // abort the drag if the element is marked as [data-drag-disabled]
  if (dragEl.matches(options.disabledSelector)) return;

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
  overlayEl.classList.add(options.overlayClass);
  document.body.appendChild(overlayEl);

  // create the ghost (the copy of the item that follows the pointer)
  let ghostEl = dragEl.cloneNode(true);
  ghostEl.removeAttribute('id');
  ghostEl.classList.add(options.ghostClass);
  ghostEl.style.width = dragElClientRect.width + 'px';
  ghostEl.style.height = dragElClientRect.height + 'px';
  Velocity(ghostEl, { translateX: e.clientX - gripLeft, translateY: e.clientY - gripTop, boxShadowBlur: 0 }, { duration: 0 });
  overlayEl.appendChild(ghostEl);

  // animate the ghost 'lifting up' from the original position
  Velocity(ghostEl, { rotateZ: -1, boxShadowBlur: 10 }, { duration: options.duration, easing: options.easing });

  // apply focus to the ghost to clear any in-progress selections
  ghostEl.focus()

  // create the placeholder element
  let placeholderEl = dragEl.cloneNode(true);
  placeholderEl.removeAttribute('id');
  placeholderEl.classList.add(options.placeholderClass);
  parentEl.insertBefore(placeholderEl, dragEl.nextSibling);

  let orientation = dragEl.getAttribute('data-drag-orientation') || "both";

  _buildDropZoneCache(parentEl);

  context = {
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

  _findDropZone(e.clientX, e.clientY);

  _updatePlaceholder(false);

  _raiseEvent(dragEl, 'dragstart', {})

  _bindPointerEventsForDragging()
}


function onPointerMove(e) {
  // suppress default event handling, prevents the drag from being interpreted as a selection
  _cancelEvent(e);

  let newClientTop = e.clientY - context.gripTop;
  let newClientLeft = e.clientX - context.gripLeft;
  switch (context.orientation) {
    case "vertical": newClientLeft = context.originalOffsetLeft; break;
    case "horizontal": newClientTop = context.originalOffsetTop; break;
    case "both": break;
  }

  _raiseEvent(context.dragEl, 'drag', {});

  _findDropZone(e.clientX, e.clientY);
  if (context.parentEl.matches(options.sortableSelector)) _updateSortableIndex(e.clientX, e.clientY);
  if (context.parentEl.matches(options.canvasSelector)) _updateCanvasOffsets(e.clientX, e.clientY);
  _updatePlaceholder();
  _updateGhost(newClientLeft, newClientTop);
  return false;
}


function _findDropZone(clientLeft, clientTop) {
  // walk up the drop zone tree until we find the closest drop zone that includes the dragged item
  while (!_positionIsInDropZone(context.parentEl, clientLeft, clientTop)) {
    let parentDropZoneEl = _closest(context.parentEl.parentElement, 'body,' + options.dropZoneSelector);
    if (!parentDropZoneEl) break;
    _raiseEvent(context.parentEl, 'dragleave', {});
    context.parentEl = parentDropZoneEl;
  }

  // walk down the drop zone tree to the lowest level dropZone
  _buildDropZoneCacheIfRequired(context.parentEl);
  let parentOffsetLeft = clientLeft - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
      parentOffsetTop  = clientTop  - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;
  let childDropZoneEl = _getChildDropZoneAtOffset(context.parentEl, parentOffsetTop, parentOffsetLeft);
  while (childDropZoneEl) {
    context.parentEl = childDropZoneEl;
    _buildDropZoneCacheIfRequired(context.parentEl);
    parentOffsetLeft = clientLeft - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
    parentOffsetTop  = clientTop  - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;

    _raiseEvent(context.parentEl, 'dragenter', {});
    childDropZoneEl = _getChildDropZoneAtOffset(context.parentEl, parentOffsetTop, parentOffsetLeft);
  }
}


// TODO: optimisation, cache layout offsets
function _updateSortableIndex(clientLeft, clientTop) {
  let direction = context.parentEl.getAttribute('data-drag-sortable') || 'vertical';
  let newIndex = null;
  switch (direction) {
    case 'horizontal':
      newIndex = _fuzzyBinarySearch(
        context.parentEl.children,
        clientLeft - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
        function(el) { return el.offsetLeft - el.offsetWidth / 2; });
      break;
    case 'vertical':
      newIndex = _fuzzyBinarySearch(
        context.parentEl.children,
        clientTop  - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop,
        function(el) { return el.offsetTop + el.offsetHeight / 2; });
      break;
    case 'wrap':
      throw new Error("Not implemented");
  }
  // the parent index will be based on the set of children INCLUDING the placeholder element we need to compensate
  if (context.placeholderDropZoneIndex && newIndex > context.placeholderDropZoneIndex) newIndex--;
  context.parentIndex = newIndex;
}


function _updateCanvasOffsets(clientLeft, clientTop) {
  let parentOffsetLeft = clientLeft - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
      parentOffsetTop  = clientTop  - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;

  // snap to drop zone bounds
  let snapToBounds = context.parentEl.getAttribute('data-drag-snap-to-bounds')
  if (snapToBounds) {
    let dropZoneOffsets = context.parentEl.getBoundingClientRect();
    if (newLeft < dropZoneOffsets.left) newLeft = dropZoneOffsets.left;
    if (newTop < dropZoneOffsets.top) newTop = dropZoneOffsets.top;
    if (newLeft < dropZoneOffsets.right - context.ghostWidth) newLeft = dropZoneOffsets.right - context.ghostWidth;
    if (newTop > dropZoneOffsets.bottom - context.ghostHeight) newTop = dropZoneOffsets.bottom - context.ghostHeight;
  }

  // snap to dropZone grid
  let snapToGrid = context.parentEl.getAttribute('data-drag-snap-to-grid');
  if (snapToGrid) {
    let cellSizeTokens = snapToGrid.split(',');
    let cellW = parseInt(cellSizeTokens[0], 10);
    let cellH = parseInt(cellSizeTokens[1], 10) || cellW;
    let dropZoneOffsets = context.parentEl.getBoundingClientRect();
    newTop =  Math.round((newTop - dropZoneOffsets.top) / cellH) * cellH + dropZoneOffsets.top;
    newLeft = Math.round((newLeft - dropZoneOffsets.left) / cellW) * cellW + dropZoneOffsets.left;
  }
  context.parentOffsetLeft = null;
  context.parentOffsetTop = null;
}


function _updateGhost(clientLeft, clientTop) {
  Velocity(context.ghostEl, {
    translateX: clientLeft,
    translateY: clientTop
  }, { duration: 0 });
}


function _updatePlaceholder(animate = true) {
  // check if we have any work to do...
  if (context.parentIndex === context.placeholderDropZoneIndex
   && context.parentEl === context.placeholderDropZoneEl)
    return;

  // TODO: optimisation, update both old and new before triggering animation avoid two layout passes
  // TODO: optimisation, recycle old positions
  animate = animate && options.duration > 0;

  let newPhParentEl = context.parentEl.matches(options.dropZoneSelector)
                    ? context.parentEl
                    : null;

  // first, remove the old placeholder
  if (context.placeholderDropZoneEl && (context.parentEl === null || context.parentEl !== newPhParentEl)) {
    if (animate) _cacheParentOffsets(context.placeholderDropZoneEl, '_old');
    context.placeholderEl.remove();
    if (animate) _cacheParentOffsets(context.placeholderDropZoneEl, '_new');
    if (animate) _animateElementsFromSavedPosition(context.placeholderDropZoneEl);
  }

  // insert the new placeholder
  if (newPhParentEl) {
    if (animate) _cacheParentOffsets(context.parentEl, '_old');
    context.parentEl.insertBefore(context.placeholderEl, context.parentEl.children[context.parentIndex]);
    if (animate) _cacheParentOffsets(context.parentEl, '_new');
    if (animate) _animateElementsFromSavedPosition(context.parentEl);
  }

  context.placeholderDropZoneIndex = context.parentIndex;
  context.placeholderDropZoneEl = newPhParentEl;
}



function onPointerUp(e) {
  _unbindPointerEventsForDragging()
  _raiseEvent(context.dragEl, 'dragend', {})
  _raiseEvent(context.dragEl, 'drop', {})

  if (context.placeholderDropZoneEl) {
    let placeholderRect = context.placeholderEl.getBoundingClientRect();
    let targetProps = {
      translateX: [placeholderRect.left, 'ease-out'],
      translateY: [placeholderRect.top, 'ease-out'],
      rotateZ: 0,
      boxShadowBlur: 0
    };
    if (options.animateGhostSize) {
      targetProps.width = [placeholderRect.width, 'ease-out'];
      targetProps.height = [placeholderRect.height, 'ease-out'];
    }
    Velocity(context.ghostEl, targetProps, {
      duration: options.duration,
      easing: options.easing,
      complete: _cleanUp
    });
  } else {
    _cleanUp()
  }

}

function _cleanUp() {
  context.placeholderEl.remove();
  context.overlayEl.remove();
  if (context.parentEl) {
    context.parentEl.insertBefore(context.dragEl, context.parentEl.children[context.parentIndex]);
  } else {
    context.originalDropZone.insertBefore(context.dragEl, context.originalAfterEl);
  }
  context = null;
}


function _buildDropZoneCache(parentEl) {
  let parentRect = parentEl.getBoundingClientRect();
  let [parentScrollTop, parentScrollLeft] = [parentEl.scrollTop, parentEl.scrollLeft];
  parentEl.__dd_clientRect = parentRect;
  parentEl.__dd_scrollTop = parentScrollTop;
  parentEl.__dd_scrollLeft = parentScrollLeft;

  let childDropZoneEls = parentEl.querySelectorAll(options.dropZoneSelector);
  parentEl.__dd_childDropZones = [];
  if (childDropZoneEls.length === 0) return;

  for (let i = 0; i < childDropZoneEls.length; i++) {
    let childDropZoneEl = childDropZoneEls[i];

    // if the descendant dropZone is embedded within another descendant dropZone let's ignore it.
    let intermediateDropZoneEl = _closest(childDropZoneEl.parentElement, options.dropZoneSelector + ',body');
    if (intermediateDropZoneEl !== parentEl && intermediateDropZoneEl !== null) continue;

    // if this drop zone is contained within a placeholder, ignore it
    if (_closest(childDropZoneEl, '.' + options.placeholderClass)) continue;

    let childRect = childDropZoneEl.getBoundingClientRect();
    parentEl.__dd_childDropZones.push({
      el: childDropZoneEl,
      top: childRect.top - parentRect.top + parentScrollTop,
      left: childRect.left - parentRect.left + parentScrollLeft,
      width: childDropZoneEl.offsetWidth,
      height: childDropZoneEl.offsetHeight
    });
  }
}

function _buildDropZoneCacheIfRequired(parentEl) {
  if (!parentEl.__dd_clientRect)
    _buildDropZoneCache(parentEl);
}

function _clearDropZoneCache(parentEl) {
  delete parentEl.__dd_clientRect;
  delete parentEl.__dd_scrollTop;
  delete parentEl.__dd_scrollLeft;
  delete parentEl.__dd_childDropZones;
}

function _getChildDropZoneAtOffset(parentEl, offsetTop, offsetLeft) {
  for (let i = 0; i < parentEl.__dd_childDropZones.length; i++) {
    let childDropZone = parentEl.__dd_childDropZones[i];
    if (offsetTop  >= childDropZone.top
     && offsetTop  <= childDropZone.top + childDropZone.height
     && offsetLeft >= childDropZone.left
     && offsetLeft <= childDropZone.left + childDropZone.width)
      return childDropZone.el;
  }
  return null;
}


function _positionIsInDropZone(parentEl, clientLeft, clientTop) {
  _buildDropZoneCacheIfRequired(parentEl);
  let offsetLeft = clientLeft - parentEl.__dd_clientRect.left,
      offsetTop  = clientTop - parentEl.__dd_clientRect.top;
  return (offsetTop  >= 0 && offsetTop  <= parentEl.__dd_clientRect.height
       && offsetLeft >= 0 && offsetLeft <= parentEl.__dd_clientRect.width);
}


function _checkScrollProximity(parentEl, offsetTop, offsetLeft) {
  // iterate up the tree until we find a scrollable element
  //
}





function _dragenter(parentEl, event) {
  parentEl.classList.add(options.dropZoneHoverClass);
}

function _dragleave(parentEl, event) {
  parentEl.classList.remove(options.dropZoneHoverClass);
}


// WARNING: function may trigger layout refresh
function _cacheParentOffsets(parentEl, propertyName) {
  for (let i = 0; i < parentEl.children.length; i++) {
    let childEl = parentEl.children[i];
    childEl[propertyName] = { top: childEl.offsetTop, left: childEl.offsetLeft };
  }
}


function _animateElementsFromSavedPosition(parentEl) {
  let dropZoneRect = parentEl.getBoundingClientRect();
  let animatedItemCount = 0;
  for (let i = 0; i < parentEl.children.length; i++) {
    let childEl = parentEl.children[i];
    let oldOffset = childEl._old;
    let newOffset = childEl._new;

    if (childEl.matches('.' + options.placeholderClass)) continue;

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
    }, { duration: options.duration, easing: options.easing, queue: false });
    animatedItemCount++;
    if (animatedItemCount > 5) break;
  }
}

function _raiseEvent(source, eventName, eventData) {
  let event = new CustomEvent(eventName, eventData);
  if (window['_' + eventName]) window['_' + eventName](source, event);
  source.dispatchEvent(event);
  //console.log(eventName, eventData, source);
}

function _cancelEvent(e) {
  e.stopPropagation();
  e.preventDefault();
  e.cancelBubble = true;
  e.returnValue = false;
}

function _closest(el, selector) {
  if (el === null) return;
  do { if (el.matches && el.matches(selector)) return el; }
  while (el = el.parentNode)
  return null;
}


function _fuzzyBinarySearch(elements, value, accessor) {
  let lo = 0,
      hi = elements.length - 1,
      best = null,
      bestValue = null;

  while (lo <= hi) {
    let mid = (lo + hi) >>> 1;
    let midValue = accessor(elements[mid]);
    if (bestValue === null || Math.abs(midValue - value) < Math.abs(bestValue - value)) {
      best = mid;
      bestValue = midValue;
    }
    if (midValue < value) { lo = mid + 1; continue; }
    if (midValue > value) { hi = mid - 1; continue; }
    break;
  }
  return best;
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
