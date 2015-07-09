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

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _constantsJs = __webpack_require__(1);

	var constants = _interopRequireWildcard(_constantsJs);

	var _helpersJs = __webpack_require__(2);

	var helpers = _interopRequireWildcard(_helpersJs);

	var _domJs = __webpack_require__(3);

	var dom = _interopRequireWildcard(_domJs);

	// conventions
	// all client positions are expressed as x,y
	// all offset positions are expressed as l,t

	var DragDrop = (function () {
	  function DragDrop() {
	    _classCallCheck(this, DragDrop);

	    this.context = null;
	    this.options = {
	      placeholderClass: "dd-drag-placeholder",
	      ghostClass: "dd-drag-ghost",
	      overlayClass: "dd-drag-overlay",
	      dropZoneHoverClass: "dd-drag-hover",
	      duration: 150,
	      easing: "ease-in-out",
	      ghostResize: true,
	      ghostResizeAnimated: true,
	      animatedElementLimit: 10,
	      scrollDelay: 1000,
	      scrollDistance: 40,
	      scrollSpeed: 5
	    };
	    var onPointerDown = this.onPointerDown.bind(this);
	    document.addEventListener("mousedown", onPointerDown, false);
	  }

	  _createClass(DragDrop, [{
	    key: "onPointerDown",
	    value: function onPointerDown(e) {
	      // support left click only
	      if (e.which !== 1) return;

	      var handleEl = dom.closest(e.target, constants.handleSelector + "," + constants.draggableSelector);
	      if (!handleEl) return;

	      var dragEl = handleEl;
	      if (handleEl.matches(constants.handleSelector)) {
	        // since the pointer is down on a handle element, walk up the DOM to find the associated item
	        dragEl = dom.closest(handleEl, constants.draggableSelector);
	      } else {
	        // if the item contains a handle (which was not the the pointer down spot) then ignore
	        // TODO need to generate permutations of descendant item handle selector
	        if (dragEl.querySelectorAll(constants.handleSelector).length > dragEl.querySelectorAll(constants.draggableSelector + " " + constants.handleSelector).length) return;
	      }
	      if (!dragEl) return;

	      dom.cancelEvent(e);

	      // abort the drag if the element is marked as [data-drag-disabled]
	      if (dragEl.matches(constants.disabledSelector)) return;

	      var parentEl = dragEl.parentElement;
	      var parentIndex = Array.prototype.indexOf.call(parentEl.children, dragEl);

	      var dragElRect = dragEl.getBoundingClientRect();
	      var parentElRect = parentEl.getBoundingClientRect();
	      var offsetTop = dragElRect.top - parentElRect.top;
	      var offsetLeft = dragElRect.left - parentElRect.left;
	      var pointerX = e.clientX;
	      var pointerY = e.clientY;

	      // record the offset of the grip point on the drag item
	      var gripTop = e.clientY - dragElRect.top;
	      var gripLeft = e.clientX - dragElRect.left;
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
	      Velocity(ghostEl, { rotateZ: -1, boxShadowBlur: 10 }, { duration: this.options.duration, easing: this.options.easing });

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
	        scrollInterval: null
	      };

	      this.updatePlaceholder(this.context, false);
	      this.findDropZone(this.context);
	      dom.raiseEvent(dragEl, "dragstart", {});
	      this.bindPointerEventsForDragging();
	    }
	  }, {
	    key: "dragStart",
	    value: function dragStart(dragEl) {}
	  }, {
	    key: "onPointerMove",
	    value: function onPointerMove(e) {
	      // suppress default event handling, prevents the drag from being interpreted as a selection
	      dom.cancelEvent(e);
	      this.dragMove(this.context, e.clientX, e.clientY);
	    }
	  }, {
	    key: "dragMove",
	    value: function dragMove(context, x, y) {
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

	      dom.raiseEvent(context.dragEl, "drag", {});

	      this.findDropZone(context);
	      if (this._isSortable(context.parentEl)) this.updateSortableIndex(context);
	      if (this._isCanvas(context.parentEl)) this.updateCanvasOffsets(context);
	      this.updatePlaceholder(context);
	      this.updateGhost(context);
	      this.autoScroll(context);
	    }
	  }, {
	    key: "autoScroll",
	    value: function autoScroll(context) {
	      if (!context.parentEl) return;
	      if (dom.canScrollVertical(context.parentEl)) {
	        var containerRect = context.parentEl.getBoundingClientRect();
	        if (context.pointerY > containerRect.bottom - 20) {
	          context.parentEl.scrollTop += 5;
	        }
	        if (context.pointerY < containerRect.top + 20) {
	          context.parentEl.scrollTop += -5;
	        }
	      }
	    }
	  }, {
	    key: "_onScrollInterval",
	    value: function _onScrollInterval() {
	      this.context.scrollInterval = setInterval(this._onScrollInterval.bind(this), 16);
	    }
	  }, {
	    key: "findDropZone",
	    value: function findDropZone(context) {
	      // walk up the drop zone tree until we find the closest drop zone that includes the dragged item
	      while (!this.positionIsInDropZone(context.parentEl, context.pointerX, context.pointerY)) {
	        var parentDropZoneEl = dom.closest(context.parentEl.parentElement, "body," + constants.dropZoneSelector);
	        if (!parentDropZoneEl) break;
	        context.parentEl.classList.remove(this.options.dropZoneHoverClass);
	        dom.raiseEvent(context.parentEl, "dragleave", {});
	        context.parentEl = parentDropZoneEl;
	      }

	      // walk down the drop zone tree to the lowest level dropZone
	      this.buildDropZoneCacheIfRequired(context.parentEl);
	      var offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
	          offsetTop = context.pointerY - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;
	      var childDropZoneEl = this.getChildDropZoneAtOffset(context.parentEl, offsetTop, offsetLeft);
	      while (childDropZoneEl) {
	        context.parentEl = childDropZoneEl;
	        this.buildDropZoneCacheIfRequired(context.parentEl);
	        offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft, offsetTop = context.pointerY - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;

	        context.parentEl.classList.add(this.options.dropZoneHoverClass);
	        dom.raiseEvent(context.parentEl, "dragenter", {});
	        childDropZoneEl = this.getChildDropZoneAtOffset(context.parentEl, offsetTop, offsetLeft);
	      }
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
	      var offsetPointerX = context.pointerX - offsetParentRect.left + offsetParent.scrollLeft;
	      var offsetPointerY = context.pointerY - offsetParentRect.top + offsetParent.scrollTop;

	      var newIndex = null;
	      switch (direction) {
	        case "horizontal":
	          newIndex = helpers.fuzzyBinarySearch(context.parentEl.children, offsetPointerX, function (el) {
	            return helpers.midpointLeft(el.getBoundingClientRect());
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
	      var offsetLeft = context.pointerX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
	          offsetTop = context.pointerY - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;

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
	        if (animate) this._cacheChildOffsets(context.placeholderParentEl, "_old");
	        context.placeholderEl.remove();
	        if (animate) this._cacheChildOffsets(context.placeholderParentEl, "_new");
	        if (animate) this._animateElementsBetweenSavedOffsets(context.placeholderParentEl);
	        context.placeholderWidth = null;
	        context.placeholderHeight = null;
	        context.placeholderParentEl = null;
	      }

	      // insert the new placeholder
	      if (this._isSortable(newPhParentEl) && (context.placeholderParentEl !== context.parentEl || context.placeholderIndex !== context.parentIndex)) {
	        if (animate) this._cacheChildOffsets(context.parentEl, "_old");
	        context.parentEl.insertBefore(context.placeholderEl, context.parentEl.children[context.parentIndex]);
	        if (animate) this._cacheChildOffsets(context.parentEl, "_new");
	        if (animate) this._animateElementsBetweenSavedOffsets(context.parentEl);
	        context.placeholderParentEl = context.parentEl;
	      }

	      if (this._isCanvas(newPhParentEl)) {
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
	        translateX: context.pointerX,
	        translateY: context.pointerY
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
	    key: "onPointerUp",
	    value: function onPointerUp(e) {
	      this._unbindPointerEventsForDragging();
	      dom.raiseEvent(this.context.dragEl, "dragend", {});
	      dom.raiseEvent(this.context.dragEl, "drop", {});

	      if (this.context.placeholderParentEl) {
	        var placeholderRect = this.context.placeholderEl.getBoundingClientRect();
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
	        Velocity(this.context.ghostEl, targetProps, {
	          duration: this.options.duration,
	          easing: this.options.easing,
	          complete: this._placeDragElInFinalPosition.bind(this)
	        });
	      } else {
	        this._placeDragElInFinalPosition();
	      }
	    }
	  }, {
	    key: "_placeDragElInFinalPosition",
	    value: function _placeDragElInFinalPosition() {
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
	    key: "_clearDropZoneCache",
	    value: function _clearDropZoneCache(el) {
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
	    key: "_isSortable",
	    value: function _isSortable(el) {
	      return el && el.matches(constants.sortableSelector);
	    }
	  }, {
	    key: "_isCanvas",
	    value: function _isCanvas(el) {
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
	    key: "_checkScrollProximity",
	    value: function _checkScrollProximity(el, offsetTop, offsetLeft) {}
	  }, {
	    key: "bindPointerEventsForDragging",
	    value: function bindPointerEventsForDragging() {
	      this.onPointerMoveBound = this.onPointerMove.bind(this);
	      this.onPointerUpBound = this.onPointerUp.bind(this);
	      document.addEventListener("mousemove", this.onPointerMoveBound, false);
	      document.addEventListener("mouseup", this.onPointerUpBound, false);
	    }
	  }, {
	    key: "_unbindPointerEventsForDragging",
	    value: function _unbindPointerEventsForDragging() {
	      document.removeEventListener("mousemove", this.onPointerMoveBound);
	      document.removeEventListener("mouseup", this.onPointerUpBound);
	    }
	  }, {
	    key: "_dragenter",
	    value: function _dragenter(dropZoneEl, event) {
	      dropZoneEl.classList.add(this.options.dropZoneHoverClass);
	    }
	  }, {
	    key: "_dragleave",
	    value: function _dragleave(dropZoneEl, event) {
	      dropZoneEl.classList.remove(this.options.dropZoneHoverClass);
	    }
	  }, {
	    key: "_cacheChildOffsets",

	    // WARNING: function may trigger layout refresh
	    value: function _cacheChildOffsets(el, propertyName) {
	      // don't use babel.io for..of here, as it prevents optimisation
	      for (var i = 0; i < el.children.length; i++) {
	        var childEl = el.children[i];
	        childEl[propertyName] = { top: childEl.offsetTop, left: childEl.offsetLeft };
	      }
	    }
	  }, {
	    key: "_animateElementsBetweenSavedOffsets",
	    value: function _animateElementsBetweenSavedOffsets(el) {
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
	            translateY: "+=" + (oldOffset.top - newOffset.top) + "px"
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

	exports.DragDrop = DragDrop;

	window.dragDrop = new DragDrop();

	// iterate up the tree until we find a scrollable element
	//

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var sortableAttribute = 'data-drag-sortable';
	exports.sortableAttribute = sortableAttribute;
	var snapInBoundsAttribute = 'data-drag-snap-in-bounds';
	exports.snapInBoundsAttribute = snapInBoundsAttribute;
	var snapToGridAttribute = 'data-drag-snap-to-grid';

	exports.snapToGridAttribute = snapToGridAttribute;
	var draggableSelector = '[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
	exports.draggableSelector = draggableSelector;
	var handleSelector = '[data-drag-handle]';
	exports.handleSelector = handleSelector;
	var sortableSelector = '[data-drag-sortable]';
	exports.sortableSelector = sortableSelector;
	var canvasSelector = '[data-drag-canvas]';
	exports.canvasSelector = canvasSelector;
	var valueSelector = '[data-drag-value]';
	exports.valueSelector = valueSelector;
	var droppableSelector = '[data-drag-droppable]';
	exports.droppableSelector = droppableSelector;
	var dropZoneSelector = '[data-drag-sortable],[data-drag-droppable],[data-drag-canvas]';
	exports.dropZoneSelector = dropZoneSelector;
	var disabledSelector = '[data-drag-disabled]';
	exports.disabledSelector = disabledSelector;
	var scrollableSelector = '[data-drag-scrollable]';
	exports.scrollableSelector = scrollableSelector;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.midpointTop = midpointTop;
	exports.midpointLeft = midpointLeft;
	exports.fuzzyBinarySearch = fuzzyBinarySearch;

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
	exports.translate = translate;
	exports.topLeft = topLeft;
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

	function topLeft(el, t, l) {
	  el.style.top = t + 'px';
	  el.style.left = l + 'px';
	}

	// utilities

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

/***/ }
/******/ ]);