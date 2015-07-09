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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

	  _createClass(DragDrop, [{
	    key: "registerPlugin",
	    value: function registerPlugin(plugin) {
	      this.plugins.push(plugin);
	    }
	  }, {
	    key: "onPointerDown",
	    value: function onPointerDown(e) {
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
	    }
	  }, {
	    key: "onPointerMove",
	    value: function onPointerMove(e) {
	      this.dragMove(this.context, e.clientX, e.clientY);
	      dom.cancelEvent(e);
	    }
	  }, {
	    key: "onPointerUp",
	    value: function onPointerUp(e) {
	      this.unbindPointerEventsForDragging();
	      this.dragEnd(this.context);
	    }
	  }, {
	    key: "dragStart",
	    value: function dragStart(dragEl, x, y) {
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
	    }
	  }, {
	    key: "dragMove",
	    value: function dragMove(context, x, y) {
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
	    }
	  }, {
	    key: "applyDirectionConstraint",
	    value: function applyDirectionConstraint(context) {
	      switch (context.orientation) {
	        case "vertical":
	          adjustedX = context.originalOffsetLeft;break;
	        case "horizontal":
	          adjustedY = context.originalOffsetTop;break;
	        case "both":
	          break;
	      }
	    }
	  }, {
	    key: "applyContainmentContraint",
	    value: function applyContainmentContraint(context) {
	      var adjustedX = context.pointerX - context.gripLeftPercent * context.placeholderWidth;
	      var adjustedY = context.pointerY - context.gripTopPercent * context.placeholderHeight;
	      if (this.parentIsContainmentFor(context.parentEl, context.dragEl)) {
	        var containmentRect = context.parentEl.getBoundingClientRect();
	        adjustedX = helpers.coerce(adjustedX, containmentRect.left, containmentRect.right - context.placeholderWidth);
	        adjustedY = helpers.coerce(adjustedY, containmentRect.top, containmentRect.bottom - context.placeholderHeight);
	      }
	      context.constrainedX = adjustedX;
	      context.constrainedY = adjustedY;
	    }
	  }, {
	    key: "dragEnd",
	    value: function dragEnd(context) {

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
	    }
	  }, {
	    key: "findDropZone",
	    value: function findDropZone(context) {
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
	    }
	  }, {
	    key: "setDropZone",
	    value: function setDropZone(context, newDropZoneEl) {
	      if (context.parentEl) {
	        context.parentEl.classList.remove(this.options.dropZoneHoverClass);
	        dom.raiseEvent(context.parentEl, constants.dragLeaveEvent, {});
	      }
	      if (newDropZoneEl) {
	        newDropZoneEl.classList.add(this.options.dropZoneHoverClass);
	        dom.raiseEvent(newDropZoneEl, constants.dragEnterEvent, {});
	      }
	      context.parentEl = newDropZoneEl;
	    }
	  }, {
	    key: "parentIsContainmentFor",
	    value: function parentIsContainmentFor(parentEl, dragEl) {
	      if (parentEl.hasAttribute(constants.containmentAttribute)) {
	        var containmentSelector = parentEl.getAttribute(constants.containmentAttribute);
	        return containmentSelector ? dragEl.matches(containmentSelector) : true;
	      }
	      if (dragEl.hasAttribute(constants.containmentAttribute)) {
	        var containmentSelector = dragEl.getAttribute(constants.containmentAttribute);
	        return containmentSelector ? placeholderEl.matches(containmentSelector) : true;
	      }
	      return false;
	    }
	  }, {
	    key: "updateSortableIndex",

	    // TODO: optimisation, cache layout offsets
	    // TODO: optimisation, check immediate neighbours prior to binary search
	    value: function updateSortableIndex(context) {
	      var direction = context.parentEl.getAttribute(constants.sortableAttribute) || "vertical";

	      var offsetParent = null;
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = context.parentEl.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var childEl = _step.value;

	          offsetParent = childEl.offsetParent;
	          if (offsetParent !== null) break;
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator["return"]) {
	            _iterator["return"]();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
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
	    }
	  }, {
	    key: "updateCanvasOffsets",
	    value: function updateCanvasOffsets(context) {
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
	    }
	  }, {
	    key: "updatePlaceholder",
	    value: function updatePlaceholder(context) {
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
	    }
	  }, {
	    key: "updateGhost",
	    value: function updateGhost(context) {
	      this.updateGhostPosition(context);
	      if (this.options.ghostResize) this.updateGhostSize(context);
	    }
	  }, {
	    key: "updateGhostPosition",
	    value: function updateGhostPosition(context) {
	      Velocity(context.ghostEl, {
	        translateX: context.constrainedX + context.gripLeftPercent * context.placeholderWidth,
	        translateY: context.constrainedY + context.gripTopPercent * context.placeholderHeight,
	        translateZ: 1
	      }, { duration: 0 });
	    }
	  }, {
	    key: "updateGhostSize",
	    value: function updateGhostSize(context) {
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
	    }
	  }, {
	    key: "placeDragElInFinalPosition",
	    value: function placeDragElInFinalPosition() {
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
	  }, {
	    key: "buildDropZoneCache",
	    value: function buildDropZoneCache(el) {
	      el.__dd_clientRect = el.getBoundingClientRect();;
	      el.__dd_scrollTop = el.scrollTop;
	      el.__dd_scrollLeft = el.scrollLeft;
	      el.__dd_childDropZones = [];

	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;

	      try {
	        for (var _iterator2 = el.querySelectorAll(constants.dropZoneSelector)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var childDropZoneEl = _step2.value;

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
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
	            _iterator2["return"]();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }
	    }
	  }, {
	    key: "buildDropZoneCacheIfRequired",
	    value: function buildDropZoneCacheIfRequired(el) {
	      if (!el.__dd_clientRect) this.buildDropZoneCache(el);
	    }
	  }, {
	    key: "clearDropZoneCache",
	    value: function clearDropZoneCache(el) {
	      delete el.__dd_clientRect;
	      delete el.__dd_scrollTop;
	      delete el.__dd_scrollLeft;
	      delete el.__dd_childDropZones;
	    }
	  }, {
	    key: "getChildDropZoneAtOffset",
	    value: function getChildDropZoneAtOffset(el, offsetTop, offsetLeft) {
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;

	      try {
	        for (var _iterator3 = el.__dd_childDropZones[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          var childDropZone = _step3.value;

	          if (offsetTop >= childDropZone.top && offsetTop <= childDropZone.top + childDropZone.height && offsetLeft >= childDropZone.left && offsetLeft <= childDropZone.left + childDropZone.width) return childDropZone.el;
	        }
	      } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
	            _iterator3["return"]();
	          }
	        } finally {
	          if (_didIteratorError3) {
	            throw _iteratorError3;
	          }
	        }
	      }

	      return null;
	    }
	  }, {
	    key: "isSortable",
	    value: function isSortable(el) {
	      return el && el.matches(constants.sortableSelector);
	    }
	  }, {
	    key: "isCanvas",
	    value: function isCanvas(el) {
	      return el && el.matches(constants.canvasSelector);
	    }
	  }, {
	    key: "positionIsInDropZone",
	    value: function positionIsInDropZone(el, clientLeft, clientTop) {
	      this.buildDropZoneCacheIfRequired(el);
	      var offsetLeft = clientLeft - el.__dd_clientRect.left,
	          offsetTop = clientTop - el.__dd_clientRect.top;
	      return offsetTop >= 0 && offsetTop <= el.__dd_clientRect.height && offsetLeft >= 0 && offsetLeft <= el.__dd_clientRect.width;
	    }
	  }, {
	    key: "bindPointerEventsForDragging",
	    value: function bindPointerEventsForDragging() {
	      this.onPointerMoveBound = this.onPointerMove.bind(this);
	      this.onPointerUpBound = this.onPointerUp.bind(this);
	      document.addEventListener("mousemove", this.onPointerMoveBound, false);
	      document.addEventListener("mouseup", this.onPointerUpBound, false);
	    }
	  }, {
	    key: "unbindPointerEventsForDragging",
	    value: function unbindPointerEventsForDragging() {
	      document.removeEventListener("mousemove", this.onPointerMoveBound);
	      document.removeEventListener("mouseup", this.onPointerUpBound);
	    }
	  }, {
	    key: "cacheChildOffsets",

	    // WARNING: function may trigger layout refresh
	    // optimisation: don't need to cache all; only cache those likely impacted by offset
	    value: function cacheChildOffsets(el, propertyName) {
	      // don't use babel.io for..of here, as it prevents optimisation
	      for (var i = 0; i < el.children.length; i++) {
	        var childEl = el.children[i];
	        childEl[propertyName] = { top: childEl.offsetTop, left: childEl.offsetLeft };
	      }
	    }
	  }, {
	    key: "animateElementsBetweenSavedOffsets",
	    value: function animateElementsBetweenSavedOffsets(el) {
	      var animatedItemCount = 0;
	      var _iteratorNormalCompletion4 = true;
	      var _didIteratorError4 = false;
	      var _iteratorError4 = undefined;

	      try {
	        for (var _iterator4 = el.children[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	          var childEl = _step4.value;

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
	      } catch (err) {
	        _didIteratorError4 = true;
	        _iteratorError4 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
	            _iterator4["return"]();
	          }
	        } finally {
	          if (_didIteratorError4) {
	            throw _iteratorError4;
	          }
	        }
	      }
	    }
	  }]);

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

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
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

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _constantsJs = __webpack_require__(1);

	var constants = _interopRequireWildcard(_constantsJs);

	var _domJs = __webpack_require__(3);

	var dom = _interopRequireWildcard(_domJs);

	var DragDropScrolling = (function () {
	  function DragDropScrolling() {
	    _classCallCheck(this, DragDropScrolling);

	    this.options = {
	      scrollDelay: 1000,
	      scrollDistance: 40,
	      scrollSpeed: 1
	    };
	  }

	  _createClass(DragDropScrolling, [{
	    key: "dragStart",

	    // event handlers

	    value: function dragStart(context) {
	      context.scrollAnimationFrame = null;
	      context.scrollEl = null;
	      context.scrollDx = null;
	      context.scrollDy = null;
	    }
	  }, {
	    key: "dragMove",
	    value: function dragMove(context) {
	      this.tryScroll(context);
	    }
	  }, {
	    key: "dragEnd",
	    value: function dragEnd(context) {
	      this.stopScroll(context);
	    }
	  }, {
	    key: "tryScroll",

	    // internal methods

	    value: function tryScroll(context) {
	      var _getScrollZoneUnderPointer = this.getScrollZoneUnderPointer(context);

	      var _getScrollZoneUnderPointer2 = _slicedToArray(_getScrollZoneUnderPointer, 3);

	      context.scrollEl = _getScrollZoneUnderPointer2[0];
	      context.scrollDx = _getScrollZoneUnderPointer2[1];
	      context.scrollDy = _getScrollZoneUnderPointer2[2];

	      if (context.scrollEl) this.startScroll(context);
	      if (!context.scrollEl) this.stopScroll(context);
	    }
	  }, {
	    key: "startScroll",
	    value: function startScroll(context) {
	      var self = this;
	      context.scrollAnimationFrame = requestAnimationFrame(function () {
	        self.continueScroll(context);
	      });
	    }
	  }, {
	    key: "continueScroll",
	    value: function continueScroll(context) {
	      if (context && context.scrollEl) {
	        context.scrollEl.scrollTop += context.scrollDy;
	        context.scrollEl.scrollLeft += context.scrollDx;
	        this.tryScroll(context);
	      }
	    }
	  }, {
	    key: "stopScroll",
	    value: function stopScroll(context) {
	      if (context.scrollAnimationFrame) {
	        cancelAnimationFrame(context.scrollAnimationFrame);
	        context.scrollAnimationFrame = null;
	      }
	    }
	  }, {
	    key: "getScrollZoneUnderPointer",
	    value: function getScrollZoneUnderPointer(context) {
	      var scrollAncestorEls = dom.ancestors(context.parentEl, constants.scrollableSelector);

	      for (var i = 0; i < scrollAncestorEls.length; i++) {
	        var scrollEl = scrollAncestorEls[i];
	        var scrollableRect = scrollEl.getBoundingClientRect(); // cache this
	        var dx = 0;
	        var dy = 0;

	        if (scrollEl.getAttribute(constants.scrollableAttribute) !== "vertical") {
	          var hScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.width / 3);
	          if (context.pointerX > scrollableRect.right - hScrollDistance && dom.canScrollRight(scrollEl)) dx = +this.options.scrollSpeed;
	          if (context.pointerX < scrollableRect.left + hScrollDistance && dom.canScrollLeft(scrollEl)) dx = -this.options.scrollSpeed;
	        }

	        if (scrollEl.getAttribute(constants.scrollableAttribute) !== "horizontal") {
	          var vScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.height / 3);
	          if (context.pointerY < scrollableRect.top + vScrollDistance && dom.canScrollUp(scrollEl)) dy = -this.options.scrollSpeed;
	          if (context.pointerY > scrollableRect.bottom - vScrollDistance && dom.canScrollDown(scrollEl)) dy = +this.options.scrollSpeed;
	        }

	        if (dx !== 0 || dy !== 0) {
	          return [scrollEl, dx, dy];
	        }
	      }
	      return [null, null, null];
	    }
	  }]);

	  return DragDropScrolling;
	})();

	exports["default"] = DragDropScrolling;
	module.exports = exports["default"];

/***/ }
/******/ ]);