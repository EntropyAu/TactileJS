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

	var _DragDropScrollerJs = __webpack_require__(6);

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
	      animatedElementLimit: 10
	    };
	    var onPointerDown = this.onPointerDown.bind(this);
	    document.addEventListener("mousedown", onPointerDown, false);
	  }

	  _createClass(DragDrop, [{
	    key: "addPlugin",
	    value: function addPlugin(plugin) {
	      this.plugins.push(plugin);
	    }
	  }, {
	    key: "onPointerMove",
	    value: function onPointerMove(e) {
	      // suppress default event handling, prevents the drag from being interpreted as a selection
	      dom.cancelEvent(e);
	      this.dragMove(this.context, e.clientX, e.clientY);
	    }
	  }, {
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
	      if (dragEl.hasAttribute(constants.disabledAttribute)) return;

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
	        pointerY: e.clientY
	      };

	      this.updatePlaceholder(this.context, false);
	      this.findDropZone(this.context);
	      dom.raiseEvent(dragEl, "dragstart", {});
	      this.bindPointerEventsForDragging();

	      // notify plugins
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = this.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var plugin = _step.value;

	          if (plugin.dragStart) plugin.dragStart(this.context);
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
	      if (this.isSortable(context.parentEl)) this.updateSortableIndex(context);
	      if (this.isCanvas(context.parentEl)) this.updateCanvasOffsets(context);
	      this.updatePlaceholder(context);
	      this.updateGhost(context);

	      // notify plugins
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;

	      try {
	        for (var _iterator2 = this.plugins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var plugin = _step2.value;

	          if (plugin.dragMove) plugin.dragMove(this.context);
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
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;

	      try {
	        for (var _iterator3 = context.parentEl.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          var childEl = _step3.value;

	          offsetParent = childEl.offsetParent;
	          if (offsetParent !== null) break;
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

	      var offsetParentRect = offsetParent.getBoundingClientRect();
	      var offsetPointerX = context.pointerX - offsetParentRect.left + offsetParent.scrollLeft;
	      var offsetPointerY = context.pointerY - offsetParentRect.top + offsetParent.scrollTop;

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
	      this.unbindPointerEventsForDragging();
	      this.dragEnd(this.context);
	    }
	  }, {
	    key: "dragEnd",
	    value: function dragEnd(context) {
	      dom.raiseEvent(context.dragEl, "dragend", {});
	      dom.raiseEvent(context.dragEl, "drop", {});

	      // notify plugins
	      var _iteratorNormalCompletion4 = true;
	      var _didIteratorError4 = false;
	      var _iteratorError4 = undefined;

	      try {
	        for (var _iterator4 = this.plugins[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	          var plugin = _step4.value;

	          if (plugin.dragEnd) plugin.dragEnd(context);
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

	      if (context.placeholderParentEl) {
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

	      var _iteratorNormalCompletion5 = true;
	      var _didIteratorError5 = false;
	      var _iteratorError5 = undefined;

	      try {
	        for (var _iterator5 = el.querySelectorAll(constants.dropZoneSelector)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	          var childDropZoneEl = _step5.value;

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
	        _didIteratorError5 = true;
	        _iteratorError5 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
	            _iterator5["return"]();
	          }
	        } finally {
	          if (_didIteratorError5) {
	            throw _iteratorError5;
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
	      var _iteratorNormalCompletion6 = true;
	      var _didIteratorError6 = false;
	      var _iteratorError6 = undefined;

	      try {
	        for (var _iterator6 = el.__dd_childDropZones[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	          var childDropZone = _step6.value;

	          if (offsetTop >= childDropZone.top && offsetTop <= childDropZone.top + childDropZone.height && offsetLeft >= childDropZone.left && offsetLeft <= childDropZone.left + childDropZone.width) return childDropZone.el;
	        }
	      } catch (err) {
	        _didIteratorError6 = true;
	        _iteratorError6 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
	            _iterator6["return"]();
	          }
	        } finally {
	          if (_didIteratorError6) {
	            throw _iteratorError6;
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
	      var _iteratorNormalCompletion7 = true;
	      var _didIteratorError7 = false;
	      var _iteratorError7 = undefined;

	      try {
	        for (var _iterator7 = el.children[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	          var childEl = _step7.value;

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
	        _didIteratorError7 = true;
	        _iteratorError7 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
	            _iterator7["return"]();
	          }
	        } finally {
	          if (_didIteratorError7) {
	            throw _iteratorError7;
	          }
	        }
	      }
	    }
	  }]);

	  return DragDrop;
	})();

	exports.DragDrop = DragDrop;

	window.dragDrop = new DragDrop();

	dragDrop.addPlugin(new _DragDropScrollerJs2["default"]());

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
	var sortableAttribute = 'data-drag-sortable';
	exports.sortableAttribute = sortableAttribute;
	var droppableAttribute = 'data-drag-droppable';
	exports.droppableAttribute = droppableAttribute;
	var snapInBoundsAttribute = 'data-drag-snap-in-bounds';
	exports.snapInBoundsAttribute = snapInBoundsAttribute;
	var snapToGridAttribute = 'data-drag-snap-to-grid';
	exports.snapToGridAttribute = snapToGridAttribute;
	var scrollableAttribute = 'data-drag-scrollable';
	exports.scrollableAttribute = scrollableAttribute;
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
	exports.ancestors = ancestors;
	exports.translate = translate;
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
/* 4 */,
/* 5 */,
/* 6 */
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

	var _helpersJs = __webpack_require__(2);

	var helpers = _interopRequireWildcard(_helpersJs);

	var _domJs = __webpack_require__(3);

	var dom = _interopRequireWildcard(_domJs);

	var DragDropScrolling = (function () {
	  function DragDropScrolling() {
	    _classCallCheck(this, DragDropScrolling);

	    this.options = {
	      scrollDelay: 1000,
	      scrollDistance: 40,
	      scrollSpeed: 3
	    };
	  }

	  _createClass(DragDropScrolling, [{
	    key: "dragStart",
	    value: function dragStart(context) {
	      context.scrollAnimationFrame = null;
	      context.scrollEl = null;
	      context.scrollDx = null;
	      context.scrollDy = null;
	    }
	  }, {
	    key: "dragMove",

	    // scroll event handlers

	    value: function dragMove(context) {
	      this.updateAutoScroll(context);
	    }
	  }, {
	    key: "dragEnd",
	    value: function dragEnd(context) {
	      this.stopAutoScroll(context);
	    }
	  }, {
	    key: "updateAutoScroll",

	    // internal methods

	    value: function updateAutoScroll(context) {
	      var _getScrollZoneUnderPointer = this.getScrollZoneUnderPointer(context);

	      var _getScrollZoneUnderPointer2 = _slicedToArray(_getScrollZoneUnderPointer, 3);

	      context.scrollEl = _getScrollZoneUnderPointer2[0];
	      context.scrollDx = _getScrollZoneUnderPointer2[1];
	      context.scrollDy = _getScrollZoneUnderPointer2[2];

	      if (context.scrollEl) this.startAutoScroll(context);
	      if (!context.scrollEl) this.stopAutoScroll(context);
	    }
	  }, {
	    key: "startAutoScroll",
	    value: function startAutoScroll(context) {
	      var self = this;
	      context.scrollAnimationFrame = requestAnimationFrame(function () {
	        self.continueAutoScroll(context);
	      });
	    }
	  }, {
	    key: "stopAutoScroll",
	    value: function stopAutoScroll(context) {
	      if (context.scrollAnimationFrame) {
	        cancelAnimationFrame(context.scrollAnimationFrame);
	        context.scrollAnimationFrame = null;
	      }
	    }
	  }, {
	    key: "continueAutoScroll",
	    value: function continueAutoScroll(context) {
	      if (context && context.scrollEl) {
	        context.scrollEl.scrollTop += context.scrollDy;
	        context.scrollEl.scrollLeft += context.scrollDx;
	        this.updateAutoScroll(context);
	      }
	    }
	  }, {
	    key: "getScrollZoneUnderPointer",
	    value: function getScrollZoneUnderPointer(context) {
	      var scrollableAncestorEls = dom.ancestors(context.parentEl, constants.scrollableSelector);

	      for (var i = 0; i < scrollableAncestorEls.length; i++) {
	        var scrollEl = scrollableAncestorEls[i];
	        var scrollableRect = scrollEl.getBoundingClientRect(); // cache this
	        var sx = 0;
	        var sy = 0;

	        if (scrollEl.getAttribute(constants.scrollAttribute) !== "vertical") {
	          var hScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.width / 3);
	          if (context.pointerX > scrollableRect.right - hScrollDistance && dom.canScrollRight(scrollEl)) sx = +this.options.scrollSpeed;
	          if (context.pointerX < scrollableRect.left + hScrollDistance && dom.canScrollLeft(scrollEl)) sx = -this.options.scrollSpeed;
	        }

	        if (scrollEl.getAttribute(constants.scrollAttribute) !== "horizontal") {
	          var vScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.height / 3);
	          if (context.pointerY < scrollableRect.top + vScrollDistance && dom.canScrollUp(scrollEl)) sy = -this.options.scrollSpeed;
	          if (context.pointerY > scrollableRect.bottom - vScrollDistance && dom.canScrollDown(scrollEl)) sy = +this.options.scrollSpeed;
	        }

	        if (sx !== 0 || sy !== 0) {
	          return [scrollEl, sx, sy];
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