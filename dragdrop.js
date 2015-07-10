/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _constantsJs = __webpack_require__(1);

	var constants = _interopRequireWildcard(_constantsJs);

	var _helpersJs = __webpack_require__(2);

	var helpers = _interopRequireWildcard(_helpersJs);

	var _domJs = __webpack_require__(3);

	var dom = _interopRequireWildcard(_domJs);

	var _DragDropScrollerJs = __webpack_require__(4);

	var _DragDropScrollerJs2 = _interopRequireDefault(_DragDropScrollerJs);

	// conventions
	// all client positions are expressed as x,y
	// all offset positions are expressed as l,t

	var DragDrop = (function () {
	  function DragDrop() {
	    _classCallCheck(this, DragDrop);

	    this.context = null;
	    this.plugins = [];
	    this.options = {
	      placeholderClass: "dd-drag-placeholder",
	      ghostClass: "dd-drag-ghost",
	      overlayClass: "dd-drag-overlay",
	      dropZoneHoverClass: "dd-drag-hover",
	      duration: 150,
	      easing: "ease-in-out",
	      ghostResize: true,
	      ghostResizeAnimated: true,
	      ghostShadowSize: 20,
	      animatedElementLimit: 10
	    };
	    var onPointerDown = this.onPointerDown.bind(this);
	    document.addEventListener("mousedown", onPointerDown, false);
	  }

	  DragDrop.prototype.registerPlugin = function registerPlugin(plugin) {
	    this.plugins.push(plugin);
	  };

	  DragDrop.prototype.onPointerDown = function onPointerDown(e) {
	    if (e.which !== 1) return;

	    var dragEl = null;
	    var handleOrDragEl = dom.closest(e.target, constants.handleSelector + "," + constants.draggableSelector);
	    if (!handleOrDragEl) return;

	    if (handleOrDragEl.hasAttribute(constants.handleAttribute)) {
	      // the pointer is over a handle element,
	      // ascend the DOM to find the associated draggable item
	      dragEl = dom.closest(handleOrDragEl, constants.draggableSelector);
	      if (dragEl === null) return;
	    } else {
	      // if the item contains a handle (which was not the the pointer down spot) then ignore
	      // TODO need to generate permutations of descendant item handle selector
	      if (handleOrDragEl.querySelectorAll(constants.handleSelector).length > handleOrDragEl.querySelectorAll(constants.draggableSelector + " " + constants.handleSelector).length) return;
	      dragEl = handleOrDragEl;
	    }

	    this.dragStart(dragEl, e.clientX, e.clientY);
	    dom.cancelEvent(e);
	  };

	  DragDrop.prototype.onPointerMove = function onPointerMove(e) {
	    this.dragMove(this.context, e.clientX, e.clientY);
	    dom.cancelEvent(e);
	  };

	  DragDrop.prototype.onPointerUp = function onPointerUp(e) {
	    this.unbindPointerEventsForDragging();
	    this.dragEnd(this.context);
	  };

	  DragDrop.prototype.dragStart = function dragStart(dragEl, x, y) {
	    // abort the drag if the element is marked as [data-drag-disabled]
	    if (dragEl.hasAttribute(constants.disabledAttribute)) return;

	    var parentEl = dragEl.parentElement;
	    var parentIndex = Array.prototype.indexOf.call(parentEl.children, dragEl);

	    var dragElRect = dragEl.getBoundingClientRect();
	    var parentElRect = parentEl.getBoundingClientRect();
	    var offsetTop = dragElRect.top - parentElRect.top;
	    var offsetLeft = dragElRect.left - parentElRect.left;
	    var pointerX = x;
	    var pointerY = y;

	    // record the offset of the grip point on the drag item
	    var gripTop = y - dragElRect.top;
	    var gripLeft = x - dragElRect.left;
	    var gripTopPercent = gripTop / dragElRect.height;
	    var gripLeftPercent = gripLeft / dragElRect.width;

	    parentEl.removeChild(dragEl);

	    // create the overlay (which contains the ghost)
	    var overlayEl = document.createElement("div");
	    overlayEl.classList.add(this.options.overlayClass);
	    document.body.appendChild(overlayEl);

	    // create the ghost (the copy of the item that follows the pointer)
	    var ghostEl = dragEl.cloneNode(true);
	    ghostEl.removeAttribute("id");
	    dom.topLeft(ghostEl, -gripTop, -gripLeft);
	    ghostEl.classList.add(this.options.ghostClass);
	    ghostEl.style.width = dragElRect.width + "px";
	    ghostEl.style.height = dragElRect.height + "px";
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
	    ghostEl.focus();

	    // create the placeholder element
	    var placeholderEl = dragEl.cloneNode(true);
	    placeholderEl.removeAttribute("id");
	    dom.translate(placeholderEl, 0, 0);
	    dom.topLeft(placeholderEl, 0, 0);
	    placeholderEl.classList.add(this.options.placeholderClass);
	    parentEl.insertBefore(placeholderEl, dragEl.nextSibling);

	    var orientation = dragEl.getAttribute("data-drag-orientation") || "both";

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
	      pointerY: y,
	      constrainedX: x,
	      constrainedY: y
	    };

	    this.setDropZone(this.context, parentEl);
	    this.updatePlaceholder(this.context, false);
	    this.findDropZone(this.context);
	    dom.raiseEvent(dragEl, constants.dragStartEvent, {});
	    this.bindPointerEventsForDragging();

	    // notify plugins
	    for (var i = 0; i < this.plugins.length; i++) {
	      if (this.plugins[i].dragStart) this.plugins[i].dragStart(this.context);
	    }
	  };

	  DragDrop.prototype.dragMove = function dragMove(context, x, y) {
	    context.pointerX = x;
	    context.pointerY = y;

	    dom.raiseEvent(context.dragEl, constants.dragEvent, {});

	    this.findDropZone(context);

	    this.applyContainmentContraint(context);

	    if (this.isSortable(context.parentEl)) this.updateSortableIndex(context);
	    if (this.isCanvas(context.parentEl)) this.updateCanvasOffsets(context);
	    this.updatePlaceholder(context);
	    this.updateGhost(context);

	    // notify plugins
	    for (var i = 0; i < this.plugins.length; i++) {
	      if (this.plugins[i].dragMove) this.plugins[i].dragMove(this.context);
	    }
	  };

	  DragDrop.prototype.applyDirectionConstraint = function applyDirectionConstraint(context) {
	    switch (context.orientation) {
	      case "vertical":
	        adjustedX = context.originalOffsetLeft;break;
	      case "horizontal":
	        adjustedY = context.originalOffsetTop;break;
	      case "both":
	        break;
	    }
	  };

	  DragDrop.prototype.applyContainmentContraint = function applyContainmentContraint(context) {
	    var adjustedX = context.pointerX - context.gripLeftPercent * context.placeholderWidth;
	    var adjustedY = context.pointerY - context.gripTopPercent * context.placeholderHeight;
	    if (this.parentIsContainmentFor(context.parentEl, context.dragEl)) {
	      var containmentRect = context.parentEl.getBoundingClientRect();
	      adjustedX = helpers.coerce(adjustedX, containmentRect.left, containmentRect.right - context.placeholderWidth);
	      adjustedY = helpers.coerce(adjustedY, containmentRect.top, containmentRect.bottom - context.placeholderHeight);
	    }
	    context.constrainedX = adjustedX;
	    context.constrainedY = adjustedY;
	  };

	  DragDrop.prototype.dragEnd = function dragEnd(context) {

	    if (context.parentEl) context.parentEl.classList.remove(this.options.dropZoneHoverClass);

	    // notify plugins
	    for (var i = 0; i < this.plugins.length; i++) {
	      if (this.plugins[i].dragEnd) this.plugins[i].dragEnd(this.context);
	    }if (context.placeholderParentEl) {
	      dom.raiseEvent(context.dragEl, constants.dropEvent, {});
	      var placeholderRect = context.placeholderEl.getBoundingClientRect();
	      var targetProps = {
	        translateX: [placeholderRect.left, "ease-out"],
	        translateY: [placeholderRect.top, "ease-out"],
	        top: [0, "ease-out"],
	        left: [0, "ease-out"],
	        rotateZ: 0,
	        boxShadowBlur: 0
	      };
	      if (this.options.animateGhostSize) {
	        targetProps.width = [placeholderRect.width, "ease-out"];
	        targetProps.height = [placeholderRect.height, "ease-out"];
	      }
	      Velocity(context.ghostEl, targetProps, {
	        duration: this.options.duration,
	        easing: this.options.easing,
	        complete: this.placeDragElInFinalPosition.bind(this)
	      });
	    } else {
	      this.placeDragElInFinalPosition();
	    }
	    dom.raiseEvent(context.dragEl, constants.dragEndEvent, {});
	  };

	  DragDrop.prototype.findDropZone = function findDropZone(context) {
	    // walk up the drop zone tree until we find the closest drop zone that includes the dragged item
	    while (!this.parentIsContainmentFor(context.parentEl, context.dragEl) && !this.positionIsInDropZone(context.parentEl, context.pointerX, context.pointerY)) {

	      var parentDropZoneEl = dom.closest(context.parentEl.parentElement, "body," + constants.dropZoneSelector);
	      if (!parentDropZoneEl) break;
	      this.setDropZone(context, parentDropZoneEl);
	    }

	    // walk down the drop zone tree to the lowest level dropZone
	    this.buildDropZoneCacheIfRequired(context.parentEl);
	    var offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
	        offsetTop = context.pointerY - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;
	    var childDropZoneEl = this.getChildDropZoneAtOffset(context.parentEl, offsetTop, offsetLeft);
	    while (childDropZoneEl) {
	      this.setDropZone(context, childDropZoneEl);

	      this.buildDropZoneCacheIfRequired(context.parentEl);
	      offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft, offsetTop = context.pointerY - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;
	      childDropZoneEl = this.getChildDropZoneAtOffset(context.parentEl, offsetTop, offsetLeft);
	    }
	  };

	  DragDrop.prototype.setDropZone = function setDropZone(context, newDropZoneEl) {
	    if (context.parentEl) {
	      context.parentEl.classList.remove(this.options.dropZoneHoverClass);
	      dom.raiseEvent(context.parentEl, constants.dragLeaveEvent, {});
	    }
	    if (newDropZoneEl) {
	      newDropZoneEl.classList.add(this.options.dropZoneHoverClass);
	      dom.raiseEvent(newDropZoneEl, constants.dragEnterEvent, {});
	    }
	    context.parentEl = newDropZoneEl;
	  };

	  DragDrop.prototype.parentIsContainmentFor = function parentIsContainmentFor(parentEl, dragEl) {
	    if (parentEl.hasAttribute(constants.containmentAttribute)) {
	      var containmentSelector = parentEl.getAttribute(constants.containmentAttribute);
	      return containmentSelector ? dragEl.matches(containmentSelector) : true;
	    }
	    if (dragEl.hasAttribute(constants.containmentAttribute)) {
	      var containmentSelector = dragEl.getAttribute(constants.containmentAttribute);
	      return containmentSelector ? placeholderEl.matches(containmentSelector) : true;
	    }
	    return false;
	  };

	  // TODO: optimisation, cache layout offsets
	  // TODO: optimisation, check immediate neighbours prior to binary search

	  DragDrop.prototype.updateSortableIndex = function updateSortableIndex(context) {
	    var direction = context.parentEl.getAttribute(constants.sortableAttribute) || "vertical";

	    if (context.parentEl.children.length === 0) {
	      context.parentIndex = 0;
	      return;
	    }

	    var offsetParent = null;
	    for (var i = 0; i < context.parentEl.children.length; i++) {
	      var childEl = context.parentEl.children[i];
	      offsetParent = childEl.offsetParent;
	      if (offsetParent !== null) break;
	    }
	    var offsetParentRect = offsetParent.getBoundingClientRect();
	    var offsetPointerX = context.constrainedX - offsetParentRect.left + offsetParent.scrollLeft;
	    var offsetPointerY = context.constrainedY - offsetParentRect.top + offsetParent.scrollTop;

	    var newIndex = null;
	    switch (direction) {
	      case "horizontal":
	        newIndex = helpers.fuzzyBinarySearch(context.parentEl.children, offsetPointerX, function (el) {
	          return el.offsetLeft + el.offsetWidth / 2;
	        });
	        break;
	      case "vertical":
	        newIndex = helpers.fuzzyBinarySearch(context.parentEl.children, offsetPointerY, function (el) {
	          return el.offsetTop + el.offsetHeight / 2;
	        });
	        break;
	      case "wrap":
	        throw new Error("Not implemented");
	    }
	    // the parent index will be based on the set of children INCLUDING the placeholder element we need to compensate
	    if (context.placeholderIndex && newIndex > context.placeholderIndex) newIndex++;
	    context.parentIndex = newIndex;
	  };

	  DragDrop.prototype.updateCanvasOffsets = function updateCanvasOffsets(context) {
	    var offsetLeft = context.constrainedX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
	        offsetTop = context.constrainedY - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;

	    // snap to drop zone bounds
	    var snapInBounds = context.parentEl.getAttribute(constants.snapInBoundsAttribute) !== null;
	    if (snapInBounds) {
	      var dropZoneOffsets = context.parentEl.getBoundingClientRect();
	      if (newLeft < dropZoneOffsets.left) newLeft = dropZoneOffsets.left;
	      if (newTop < dropZoneOffsets.top) newTop = dropZoneOffsets.top;
	      if (newLeft < dropZoneOffsets.right - context.ghostWidth) newLeft = dropZoneOffsets.right - context.ghostWidth;
	      if (newTop > dropZoneOffsets.bottom - context.ghostHeight) newTop = dropZoneOffsets.bottom - context.ghostHeight;
	    }

	    // snap to dropZone grid
	    var snapToGrid = context.parentEl.getAttribute(constants.snapToGridAttribute) !== null;
	    if (snapToGrid) {
	      var cellSizeTokens = snapToGrid.split(",");
	      var cellW = parseInt(cellSizeTokens[0], 10);
	      var cellH = parseInt(cellSizeTokens[1], 10) || cellW;
	      var dropZoneOffsets = context.parentEl.getBoundingClientRect();
	      newTop = Math.round((newTop - dropZoneOffsets.top) / cellH) * cellH + dropZoneOffsets.top;
	      newLeft = Math.round((newLeft - dropZoneOffsets.left) / cellW) * cellW + dropZoneOffsets.left;
	    }
	    context.offsetLeft = offsetLeft;
	    context.offsetTop = offsetTop;
	  };

	  DragDrop.prototype.updatePlaceholder = function updatePlaceholder(context) {
	    var animate = arguments[1] === undefined ? true : arguments[1];

	    // check if we have any work to do...
	    if (context.parentIndex === context.placeholderIndex && context.parentEl === context.placeholderParentEl && context.offsetTop === context.placeholderOffsetTop && context.offsetLeft === context.placeholderOffsetLeft) return;

	    // TODO: optimisation, update both old and new before triggering animation avoid two layout passes
	    // TODO: optimisation, recycle old positions
	    animate = animate && this.options.duration > 0;

	    var newPhParentEl = context.parentEl.matches(constants.dropZoneSelector) ? context.parentEl : null;

	    // first, remove the old placeholder
	    if (context.placeholderParentEl && (context.parentEl === null || context.parentEl !== newPhParentEl)) {
	      if (animate) this.cacheChildOffsets(context.placeholderParentEl, "_old");
	      context.placeholderEl.remove();
	      if (animate) this.cacheChildOffsets(context.placeholderParentEl, "_new");
	      if (animate) this.animateElementsBetweenSavedOffsets(context.placeholderParentEl);
	      context.placeholderWidth = null;
	      context.placeholderHeight = null;
	      context.placeholderParentEl = null;
	    }

	    // insert the new placeholder
	    if (this.isSortable(newPhParentEl) && (context.placeholderParentEl !== context.parentEl || context.placeholderIndex !== context.parentIndex)) {
	      if (animate) this.cacheChildOffsets(context.parentEl, "_old");
	      context.parentEl.insertBefore(context.placeholderEl, context.parentEl.children[context.parentIndex]);
	      if (animate) this.cacheChildOffsets(context.parentEl, "_new");
	      if (animate) this.animateElementsBetweenSavedOffsets(context.parentEl);
	      context.placeholderParentEl = context.parentEl;
	    }

	    if (this.isCanvas(newPhParentEl)) {
	      if (context.placeholderParentEl !== context.parentEl) {
	        context.parentEl.appendChild(context.placeholderEl);
	        context.placeholderParentEl = context.parentEl;
	      }
	      dom.translate(context.placeholderEl, context.offsetLeft, context.offsetTop);
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
	  };

	  DragDrop.prototype.updateGhost = function updateGhost(context) {
	    this.updateGhostPosition(context);
	    if (this.options.ghostResize) this.updateGhostSize(context);
	  };

	  DragDrop.prototype.updateGhostPosition = function updateGhostPosition(context) {
	    Velocity(context.ghostEl, {
	      translateX: context.constrainedX + context.gripLeftPercent * context.placeholderWidth,
	      translateY: context.constrainedY + context.gripTopPercent * context.placeholderHeight,
	      translateZ: 1
	    }, { duration: 0 });
	  };

	  DragDrop.prototype.updateGhostSize = function updateGhostSize(context) {
	    // do nothing if the placeholder is not currently visible
	    if (!context.placeholderParentEl) return;
	    // do nothing if the ghost and placeholder are the same size
	    if (context.ghostWidth === context.placeholderWidth && context.ghostHeight === context.placeholderHeight) return;

	    var velocityOptions = this.options.ghostResizeAnimated ? {
	      duration: this.options.duration,
	      easing: "linear",
	      queue: false
	    } : {
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
	  };

	  DragDrop.prototype.placeDragElInFinalPosition = function placeDragElInFinalPosition() {
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
	  };

	  DragDrop.prototype.buildDropZoneCache = function buildDropZoneCache(el) {
	    el.__dd_clientRect = el.getBoundingClientRect();;
	    el.__dd_scrollTop = el.scrollTop;
	    el.__dd_scrollLeft = el.scrollLeft;
	    el.__dd_childDropZones = [];

	    for (var _iterator = el.querySelectorAll(constants.dropZoneSelector), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	      var _ref;

	      if (_isArray) {
	        if (_i >= _iterator.length) break;
	        _ref = _iterator[_i++];
	      } else {
	        _i = _iterator.next();
	        if (_i.done) break;
	        _ref = _i.value;
	      }

	      var childDropZoneEl = _ref;

	      // if the descendant dropZone is embedded within another descendant dropZone let's ignore it.
	      var intermediateDropZoneEl = dom.closest(childDropZoneEl.parentElement, constants.dropZoneSelector + ",body");
	      if (intermediateDropZoneEl !== null && intermediateDropZoneEl !== el) continue;

	      // if this drop zone is contained within a placeholder, ignore it
	      if (dom.closest(childDropZoneEl, "." + this.options.placeholderClass)) continue;

	      var childRect = childDropZoneEl.getBoundingClientRect();
	      el.__dd_childDropZones.push({
	        el: childDropZoneEl,
	        top: childRect.top - el.__dd_clientRect.top + el.__dd_scrollTop,
	        left: childRect.left - el.__dd_clientRect.left + el.__dd_scrollLeft,
	        width: childRect.width,
	        height: childRect.height
	      });
	    }
	  };

	  DragDrop.prototype.buildDropZoneCacheIfRequired = function buildDropZoneCacheIfRequired(el) {
	    if (!el.__dd_clientRect) this.buildDropZoneCache(el);
	  };

	  DragDrop.prototype.clearDropZoneCache = function clearDropZoneCache(el) {
	    delete el.__dd_clientRect;
	    delete el.__dd_scrollTop;
	    delete el.__dd_scrollLeft;
	    delete el.__dd_childDropZones;
	  };

	  DragDrop.prototype.getChildDropZoneAtOffset = function getChildDropZoneAtOffset(el, offsetTop, offsetLeft) {
	    for (var _iterator2 = el.__dd_childDropZones, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
	      var _ref2;

	      if (_isArray2) {
	        if (_i2 >= _iterator2.length) break;
	        _ref2 = _iterator2[_i2++];
	      } else {
	        _i2 = _iterator2.next();
	        if (_i2.done) break;
	        _ref2 = _i2.value;
	      }

	      var childDropZone = _ref2;

	      if (offsetTop >= childDropZone.top && offsetTop <= childDropZone.top + childDropZone.height && offsetLeft >= childDropZone.left && offsetLeft <= childDropZone.left + childDropZone.width) return childDropZone.el;
	    }
	    return null;
	  };

	  DragDrop.prototype.isSortable = function isSortable(el) {
	    return el && el.matches(constants.sortableSelector);
	  };

	  DragDrop.prototype.isCanvas = function isCanvas(el) {
	    return el && el.matches(constants.canvasSelector);
	  };

	  DragDrop.prototype.positionIsInDropZone = function positionIsInDropZone(el, clientLeft, clientTop) {
	    this.buildDropZoneCacheIfRequired(el);
	    var offsetLeft = clientLeft - el.__dd_clientRect.left,
	        offsetTop = clientTop - el.__dd_clientRect.top;
	    return offsetTop >= 0 && offsetTop <= el.__dd_clientRect.height && offsetLeft >= 0 && offsetLeft <= el.__dd_clientRect.width;
	  };

	  DragDrop.prototype.bindPointerEventsForDragging = function bindPointerEventsForDragging() {
	    this.onPointerMoveBound = this.onPointerMove.bind(this);
	    this.onPointerUpBound = this.onPointerUp.bind(this);
	    document.addEventListener("mousemove", this.onPointerMoveBound, false);
	    document.addEventListener("mouseup", this.onPointerUpBound, false);
	  };

	  DragDrop.prototype.unbindPointerEventsForDragging = function unbindPointerEventsForDragging() {
	    document.removeEventListener("mousemove", this.onPointerMoveBound);
	    document.removeEventListener("mouseup", this.onPointerUpBound);
	  };

	  // WARNING: function may trigger layout refresh
	  // optimisation: don't need to cache all; only cache those likely impacted by offset

	  DragDrop.prototype.cacheChildOffsets = function cacheChildOffsets(el, propertyName) {
	    // don't use babel.io for..of here, as it prevents optimisation
	    for (var i = 0; i < el.children.length; i++) {
	      var childEl = el.children[i];
	      childEl[propertyName] = { top: childEl.offsetTop, left: childEl.offsetLeft };
	    }
	  };

	  DragDrop.prototype.animateElementsBetweenSavedOffsets = function animateElementsBetweenSavedOffsets(el) {
	    var animatedItemCount = 0;
	    for (var _iterator3 = el.children, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
	      var _ref3;

	      if (_isArray3) {
	        if (_i3 >= _iterator3.length) break;
	        _ref3 = _iterator3[_i3++];
	      } else {
	        _i3 = _iterator3.next();
	        if (_i3.done) break;
	        _ref3 = _i3.value;
	      }

	      var childEl = _ref3;

	      if (childEl.matches("." + this.options.placeholderClass)) continue;

	      var oldOffset = childEl._old;
	      var newOffset = childEl._new;

	      if (!oldOffset || !newOffset || oldOffset.top === newOffset.top && oldOffset.left === newOffset.left) continue;

	      if (++animatedItemCount > this.options.animatedElementLimit) break;

	      // the following line makes the animations smoother in safari
	      //childEl.style.webkitTransform = 'translate3d(0,' + (oldOffset.top - newOffset.top) + 'px,0)';

	      Velocity(childEl, {
	        translateX: "+=" + (oldOffset.left - newOffset.left) + "px",
	        translateY: "+=" + (oldOffset.top - newOffset.top) + "px",
	        translateZ: 1
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
	  };

	  return DragDrop;
	})();

	exports["default"] = DragDrop;

	window.dragDrop = new DragDrop();

	dragDrop.registerPlugin(new _DragDropScrollerJs2["default"]());
	module.exports = exports["default"];

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	var acceptsAttribute = 'data-drag-accepts';
	exports.acceptsAttribute = acceptsAttribute;
	var canvasAttribute = 'data-drag-canvas';
	exports.canvasAttribute = canvasAttribute;
	var containmentAttribute = 'data-drag-containment';
	exports.containmentAttribute = containmentAttribute;
	var droppableAttribute = 'data-drag-droppable';
	exports.droppableAttribute = droppableAttribute;
	var snapInBoundsAttribute = 'data-drag-snap-in-bounds';
	exports.snapInBoundsAttribute = snapInBoundsAttribute;
	var snapToGridAttribute = 'data-drag-snap-to-grid';
	exports.snapToGridAttribute = snapToGridAttribute;
	var scrollableAttribute = 'data-drag-scrollable';
	exports.scrollableAttribute = scrollableAttribute;
	var sortableAttribute = 'data-drag-sortable';
	exports.sortableAttribute = sortableAttribute;
	var disabledAttribute = 'data-drag-disabled';
	exports.disabledAttribute = disabledAttribute;
	var handleAttribute = 'data-drag-handle';

	exports.handleAttribute = handleAttribute;
	var draggableSelector = '[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
	exports.draggableSelector = draggableSelector;
	var handleSelector = '[data-drag-handle]';
	exports.handleSelector = handleSelector;
	var sortableSelector = '[' + sortableAttribute + ']';
	exports.sortableSelector = sortableSelector;
	var canvasSelector = '[' + canvasAttribute + ']';
	exports.canvasSelector = canvasSelector;
	var valueSelector = '[data-drag-value]';
	exports.valueSelector = valueSelector;
	var droppableSelector = '[' + droppableAttribute + ']';
	exports.droppableSelector = droppableSelector;
	var dropZoneSelector = '[data-drag-sortable],[data-drag-droppable],[data-drag-canvas]';
	exports.dropZoneSelector = dropZoneSelector;
	var disabledSelector = '[' + disabledAttribute + ']';
	exports.disabledSelector = disabledSelector;
	var scrollableSelector = '[' + scrollableAttribute + ']';

	exports.scrollableSelector = scrollableSelector;
	var dragStartEvent = 'dragstart';
	exports.dragStartEvent = dragStartEvent;
	var dragEndEvent = 'dragend';
	exports.dragEndEvent = dragEndEvent;
	var dragLeaveEvent = 'dragleave';
	exports.dragLeaveEvent = dragLeaveEvent;
	var dragEnterEvent = 'dragenter';
	exports.dragEnterEvent = dragEnterEvent;
	var dropEvent = 'drop';
	exports.dropEvent = dropEvent;
	var dragEvent = 'drag';
	exports.dragEvent = dragEvent;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports.coerce = coerce;
	exports.midpointTop = midpointTop;
	exports.midpointLeft = midpointLeft;
	exports.fuzzyBinarySearch = fuzzyBinarySearch;

	function coerce(value, min, max) {
	  return value > max ? max : value < min ? min : value;
	}

	function midpointTop(clientRect) {
	  return clientRect.top + clientRect.height / 2;
	}

	function midpointLeft(clientRect) {
	  return clientRect.left + clientRect.width / 2;
	}

	function fuzzyBinarySearch(elements, value, accessor) {
	  var lo = 0,
	      hi = elements.length - 1,
	      best = null,
	      bestValue = null;

	  while (lo <= hi) {
	    var mid = lo + hi >>> 1;
	    var midValue = accessor(elements[mid]);
	    if (bestValue === null || Math.abs(midValue - value) < Math.abs(bestValue - value)) {
	      best = mid;
	      bestValue = midValue;
	    }
	    if (midValue < value) {
	      lo = mid + 1;continue;
	    }
	    if (midValue > value) {
	      hi = mid - 1;continue;
	    }
	    break;
	  }
	  return best;
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	// selectors

	'use strict';

	exports.__esModule = true;
	exports.closest = closest;
	exports.ancestors = ancestors;
	exports.translate = translate;
	exports.translate3d = translate3d;
	exports.topLeft = topLeft;
	exports.canScrollDown = canScrollDown;
	exports.canScrollUp = canScrollUp;
	exports.canScrollRight = canScrollRight;
	exports.canScrollLeft = canScrollLeft;
	exports.canScrollVertical = canScrollVertical;
	exports.canScrollHorizontal = canScrollHorizontal;
	exports.cancelEvent = cancelEvent;
	exports.raiseEvent = raiseEvent;

	function closest(el, selector) {
	  if (el === null) return;
	  do {
	    if (el.matches && el.matches(selector)) return el;
	  } while (el = el.parentNode);
	  return null;
	}

	function ancestors(el, selector) {
	  if (el === null) return [];
	  var ancestors = [];
	  do {
	    if (el.matches && el.matches(selector)) ancestors.push(el);
	  } while (el = el.parentNode);
	  return ancestors;
	}

	// vendor

	var vendorTransform = null;
	setTimeout(function () {
	  if (document.body.style.webkitTransform !== undefined) vendorTransform = 'webkitTransform';
	  if (document.body.style.mozTransform !== undefined) vendorTransform = 'mozTransform';
	  if (document.body.style.msTransform !== undefined) vendorTransform = 'msTransform';
	  if (document.body.style.transform !== undefined) vendorTransform = 'transform';
	});

	function translate(el, x, y) {
	  el.style[vendorTransform] = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0)';
	}

	function translate3d(el, x, y, z) {
	  el.style[vendorTransform] = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px)';
	}

	function topLeft(el, t, l) {
	  el.style.top = t + 'px';
	  el.style.left = l + 'px';
	}

	// utilities

	function canScrollDown(el) {
	  return el.scrollTop < el.scrollHeight - el.clientHeight;
	}

	function canScrollUp(el) {
	  return el.scrollTop > 0;
	}

	function canScrollRight(el) {
	  return el.scrollLeft < el.scrollWidth - el.clientWidth;
	}

	function canScrollLeft(el) {
	  return el.scrollLeft > 0;
	}

	function canScrollVertical(el) {
	  return el.scrollHeight > el.clientHeight;
	}

	function canScrollHorizontal(el) {
	  return el.scrollWidth > el.clientWidth;
	}

	// events

	function cancelEvent(e) {
	  e.stopPropagation();
	  e.preventDefault();
	  e.cancelBubble = true;
	  e.returnValue = false;
	}

	function raiseEvent(source, eventName, eventData) {
	  var event = new CustomEvent(eventName, eventData);
	  source.dispatchEvent(event);
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _constantsJs = __webpack_require__(1);

	var constants = _interopRequireWildcard(_constantsJs);

	var _domJs = __webpack_require__(3);

	var dom = _interopRequireWildcard(_domJs);

	// TODO: suspend placeholder updates while scrolling is in progress
	// TODO: adjust scroll speed based on number of items
	// TODO: lock scroll height
	// TODO: refactor: clearer scroll start, scroll finish
	// TODO: refactor: rename ancestors (it's inclusive of this generation)
	// TODO: trigger placeholder update when scroll stops

	var DragDropScrolling = (function () {
	  function DragDropScrolling() {
	    _classCallCheck(this, DragDropScrolling);

	    this.options = {
	      scrollDelay: 1000,
	      scrollDistance: 40,
	      scrollSpeed: 2
	    };
	  }

	  // event handlers

	  DragDropScrolling.prototype.dragStart = function dragStart(context) {
	    context.scrollAnimationFrame = null;
	    context.scrollEl = null;
	    context.scrollDx = null;
	    context.scrollDy = null;
	  };

	  DragDropScrolling.prototype.dragMove = function dragMove(context) {
	    this.tryScroll(context);
	  };

	  DragDropScrolling.prototype.dragEnd = function dragEnd(context) {
	    this.stopScroll(context);
	  };

	  // internal methods

	  DragDropScrolling.prototype.tryScroll = function tryScroll(context) {
	    var _getScrollZoneUnderPointer = this.getScrollZoneUnderPointer(context);

	    context.scrollEl = _getScrollZoneUnderPointer[0];
	    context.scrollDx = _getScrollZoneUnderPointer[1];
	    context.scrollDy = _getScrollZoneUnderPointer[2];

	    if (context.scrollEl) this.startScroll(context);
	    if (!context.scrollEl) this.stopScroll(context);
	  };

	  DragDropScrolling.prototype.startScroll = function startScroll(context) {
	    var self = this;
	    context.scrollAnimationFrame = requestAnimationFrame(function () {
	      self.continueScroll(context);
	    });
	  };

	  DragDropScrolling.prototype.continueScroll = function continueScroll(context) {
	    if (context && context.scrollEl) {
	      var scrollEl = context.scrollEl;
	      scrollEl.scrollTopF = scrollEl.scrollTopF !== undefined ? scrollEl.scrollTopF + context.scrollDy : scrollEl.scrollTop + context.scrollDy;
	      scrollEl.scrollLeftF = scrollEl.scrollLeftF !== undefined ? scrollEl.scrollLeftF + context.scrollDx : scrollEl.scrollLeft + context.scrollDx;
	      scrollEl.scrollTop = scrollEl.scrollTopF;
	      scrollEl.scrollLeft = scrollEl.scrollLeftF;
	      this.tryScroll(context);
	    }
	  };

	  DragDropScrolling.prototype.stopScroll = function stopScroll(context) {
	    if (context.scrollAnimationFrame) {
	      cancelAnimationFrame(context.scrollAnimationFrame);
	      context.scrollAnimationFrame = null;
	    }
	  };

	  DragDropScrolling.prototype.getScrollZoneUnderPointer = function getScrollZoneUnderPointer(context) {
	    var scrollEls = Array.prototype.reverse.apply(dom.ancestors(context.parentEl, constants.scrollableSelector));

	    for (var i = 0; i < scrollEls.length; i++) {
	      var scrollEl = scrollEls[i];
	      var scrollableRect = scrollEl.getBoundingClientRect(); // cache this
	      var dx = 0;
	      var dy = 0;

	      if (scrollEl.getAttribute(constants.scrollableAttribute) !== "vertical") {
	        var hScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.width / 3);
	        if (context.pointerX > scrollableRect.right - hScrollDistance && dom.canScrollRight(scrollEl)) dx = this.calculateScrollSpeed(context.pointerX, [scrollableRect.right - hScrollDistance, scrollableRect.right], [0, +this.options.scrollSpeed]);
	        if (context.pointerX < scrollableRect.left + hScrollDistance && dom.canScrollLeft(scrollEl)) dx = this.calculateScrollSpeed(context.pointerX, [scrollableRect.left + hScrollDistance, scrollableRect.left], [0, -this.options.scrollSpeed]);
	      }

	      if (scrollEl.getAttribute(constants.scrollableAttribute) !== "horizontal") {
	        var vScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.height / 3);
	        if (context.pointerY > scrollableRect.bottom - vScrollDistance && dom.canScrollDown(scrollEl)) dy = this.calculateScrollSpeed(context.pointerY, [scrollableRect.bottom - vScrollDistance, scrollableRect.bottom], [0, +this.options.scrollSpeed]);
	        if (context.pointerY < scrollableRect.top + vScrollDistance && dom.canScrollUp(scrollEl)) dy = this.calculateScrollSpeed(context.pointerY, [scrollableRect.top + vScrollDistance, scrollableRect.top], [0, -this.options.scrollSpeed]);
	      }

	      if (dx !== 0 || dy !== 0) {
	        return [scrollEl, dx, dy];
	      }
	    }
	    return [null, null, null];
	  };

	  DragDropScrolling.prototype.calculateScrollSpeed = function calculateScrollSpeed(pointer, domain, range) {
	    var a = (pointer - domain[0]) / (domain[1] - domain[0]);
	    return a * (range[1] - range[0]) + range[0];
	  };

	  return DragDropScrolling;
	})();

	exports["default"] = DragDropScrolling;
	module.exports = exports["default"];

/***/ }
/******/ ]);