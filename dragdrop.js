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

	var _helpersJs = __webpack_require__(1);

	var helpers = _interopRequireWildcard(_helpersJs);

	var _domJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_domJs);

	var DragDrop = (function () {
	  function DragDrop() {
	    _classCallCheck(this, DragDrop);

	    this.context = null;
	    this.options = {
	      draggableSelector: "[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *",
	      handleSelector: "[data-drag-handle]",
	      sortableSelector: "[data-drag-sortable]",
	      canvasSelector: "[data-drag-canvas]",
	      valueSelector: "[data-drag-value]",
	      droppableSelector: "[data-drag-droppable]",
	      dropZoneSelector: "[data-drag-sortable],[data-drag-droppable],[data-drag-canvas]",
	      disabledSelector: "[data-drag-disabled]",
	      scrollableSelector: "[data-drag-scrollable]",
	      placeholderClass: "dd-drag-placeholder",
	      ghostClass: "dd-drag-ghost",
	      overlayClass: "dd-drag-overlay",
	      dropZoneHoverClass: "dd-drag-hover",
	      duration: 150,
	      easing: "ease-in-out",
	      animateGhostSize: true,
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

	      var handleEl = dom.closest(e.target, this.options.handleSelector + "," + this.options.draggableSelector);
	      if (!handleEl) return;

	      var dragEl = handleEl;
	      if (handleEl.matches(this.options.handleSelector)) {
	        // since the pointer is down on a handle element, walk up the DOM to find the associated item
	        dragEl = dom.closest(handleEl, this.options.draggableSelector);
	      } else {
	        // if the item contains a handle (which was not the the pointer down spot) then ignore
	        // TODO need to generate permutations of descendant item handle selector
	        if (dragEl.querySelectorAll(this.options.handleSelector).length > dragEl.querySelectorAll(this.options.draggableSelector + " " + this.options.handleSelector).length) return;
	      }
	      if (!dragEl) return;

	      dom.cancelEvent(e);

	      // abort the drag if the element is marked as [data-drag-disabled]
	      if (dragEl.matches(this.options.disabledSelector)) return;

	      var parentEl = dragEl.parentElement;
	      var parentIndex = Array.prototype.indexOf.call(parentEl.children, dragEl);

	      var dragElClientRect = dragEl.getBoundingClientRect();
	      var parentElClientRect = parentEl.getBoundingClientRect();
	      var offsetTop = dragElClientRect.top - parentElClientRect.top;
	      var offsetLeft = dragElClientRect.left - parentElClientRect.left;

	      // record the offset of the grip point on the drag item
	      var gripTop = e.clientY - dragElClientRect.top;
	      var gripLeft = e.clientX - dragElClientRect.left;

	      parentEl.removeChild(dragEl);

	      // create the overlay (which contains the ghost)
	      var overlayEl = document.createElement("div");
	      overlayEl.classList.add(this.options.overlayClass);
	      document.body.appendChild(overlayEl);

	      // create the ghost (the copy of the item that follows the pointer)
	      var ghostEl = dragEl.cloneNode(true);
	      ghostEl.removeAttribute("id");
	      ghostEl.classList.add(this.options.ghostClass);
	      ghostEl.style.width = dragElClientRect.width + "px";
	      ghostEl.style.height = dragElClientRect.height + "px";
	      ghostEl.style.transform = "";
	      ghostEl.style.msTransform = "";
	      ghostEl.style.mozTransform = "";
	      ghostEl.style.webkitTransform = "";
	      ghostEl.style.top = "";
	      ghostEl.style.left = "";
	      Velocity(ghostEl, { translateX: e.clientX - gripLeft, translateY: e.clientY - gripTop, boxShadowBlur: 0 }, { duration: 0 });
	      overlayEl.appendChild(ghostEl);

	      // animate the ghost 'lifting up' from the original position
	      Velocity(ghostEl, { rotateZ: -1, boxShadowBlur: 10 }, { duration: this.options.duration, easing: this.options.easing });

	      // apply focus to the ghost to clear any in-progress selections
	      ghostEl.focus();

	      // create the placeholder element
	      var placeholderEl = dragEl.cloneNode(true);
	      placeholderEl.removeAttribute("id");
	      placeholderEl.classList.add(this.options.placeholderClass);
	      placeholderEl.style.transform = "";
	      placeholderEl.style.msTransform = "";
	      placeholderEl.style.mozTransform = "";
	      placeholderEl.style.webkitTransform = "";
	      placeholderEl.style.top = "";
	      placeholderEl.style.left = "";
	      parentEl.insertBefore(placeholderEl, dragEl.nextSibling);

	      var orientation = dragEl.getAttribute("data-drag-orientation") || "both";

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

	      dom.raiseEvent(dragEl, "dragstart", {});

	      this._bindPointerEventsForDragging();
	    }
	  }, {
	    key: "onPointerMove",
	    value: function onPointerMove(e) {
	      // suppress default event handling, prevents the drag from being interpreted as a selection
	      dom.cancelEvent(e);

	      this.context.pointerClientX = e.clientX;
	      this.context.pointerClientY = e.clientY;

	      var newClientTop = e.clientY - this.context.gripTop;
	      var newClientLeft = e.clientX - this.context.gripLeft;
	      switch (this.context.orientation) {
	        case "vertical":
	          newClientLeft = this.context.originalOffsetLeft;break;
	        case "horizontal":
	          newClientTop = this.context.originalOffsetTop;break;
	        case "both":
	          break;
	      }

	      dom.raiseEvent(this.context.dragEl, "drag", {});

	      this._findDropZone(e.clientX, e.clientY);
	      if (this.context.parentEl.matches(this.options.sortableSelector)) this._updateSortableIndex(e.clientX, e.clientY);
	      if (this.context.parentEl.matches(this.options.canvasSelector)) this._updateCanvasOffsets(e.clientX, e.clientY);
	      this._updatePlaceholder();
	      this._updateGhost(newClientLeft, newClientTop);
	      this._autoScroll(e.clientX, e.clientY);
	    }
	  }, {
	    key: "_autoScroll",
	    value: function _autoScroll(clientLeft, clientTop) {
	      if (!this.context.parentEl) return;
	      if (dom.canScrollVertical(this.context.parentEl)) {
	        var containerRect = this.context.parentEl.getBoundingClientRect();
	        if (clientTop > containerRect.bottom - 20) {
	          this.context.parentEl.scrollTop += 5;
	        }
	        if (clientTop < containerRect.top + 20) {
	          this.context.parentEl.scrollTop += -5;
	        }
	      }
	    }
	  }, {
	    key: "_onScrollInterval",
	    value: function _onScrollInterval() {
	      this.context.scrollInterval = setInterval(this._onScrollInterval.bind(this), 16);
	    }
	  }, {
	    key: "_findDropZone",
	    value: function _findDropZone(clientLeft, clientTop) {
	      // walk up the drop zone tree until we find the closest drop zone that includes the dragged item
	      while (!this._positionIsInDropZone(this.context.parentEl, clientLeft, clientTop)) {
	        var parentDropZoneEl = dom.closest(this.context.parentEl.parentElement, "body," + this.options.dropZoneSelector);
	        if (!parentDropZoneEl) break;
	        this.context.parentEl.classList.remove(this.options.dropZoneHoverClass);
	        dom.raiseEvent(this.context.parentEl, "dragleave", {});
	        this.context.parentEl = parentDropZoneEl;
	      }

	      // walk down the drop zone tree to the lowest level dropZone
	      this._buildDropZoneCacheIfRequired(this.context.parentEl);
	      var offsetLeft = clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft,
	          offsetTop = clientTop - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop;
	      var childDropZoneEl = this._getChildDropZoneAtOffset(this.context.parentEl, offsetTop, offsetLeft);
	      while (childDropZoneEl) {
	        this.context.parentEl = childDropZoneEl;
	        this._buildDropZoneCacheIfRequired(this.context.parentEl);
	        offsetLeft = clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft, offsetTop = clientTop - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop;

	        this.context.parentEl.classList.add(this.options.dropZoneHoverClass);
	        dom.raiseEvent(this.context.parentEl, "dragenter", {});
	        childDropZoneEl = this._getChildDropZoneAtOffset(this.context.parentEl, offsetTop, offsetLeft);
	      }
	    }
	  }, {
	    key: "_updateSortableIndex",

	    // TODO: optimisation, cache layout offsets
	    value: function _updateSortableIndex(clientLeft, clientTop) {
	      var direction = this.context.parentEl.getAttribute("data-drag-sortable") || "vertical";
	      var newIndex = null;

	      switch (direction) {
	        case "horizontal":
	          newIndex = helpers.fuzzyBinarySearch(this.context.parentEl.children, clientLeft, function (el) {
	            return helpers.midpointLeft(el.getBoundingClientRect());
	          });
	          break;
	        case "vertical":
	          newIndex = helpers.fuzzyBinarySearch(this.context.parentEl.children, clientTop, function (el) {
	            return helpers.midpointTop(el.getBoundingClientRect());
	          });
	          break;
	        case "wrap":
	          throw new Error("Not implemented");
	      }
	      // the parent index will be based on the set of children INCLUDING the placeholder element we need to compensate
	      if (this.context.placeholderIndex && newIndex > this.context.placeholderIndex) newIndex++;

	      this.context.parentIndex = newIndex;
	    }
	  }, {
	    key: "_updateCanvasOffsets",
	    value: function _updateCanvasOffsets(clientLeft, clientTop) {
	      var offsetLeft = clientLeft - this.context.parentEl.__dd_clientRect.left + this.context.parentEl.scrollLeft,
	          offsetTop = clientTop - this.context.parentEl.__dd_clientRect.top + this.context.parentEl.scrollTop;

	      // snap to drop zone bounds
	      var snapToBounds = this.context.parentEl.getAttribute("data-drag-snap-to-bounds");
	      if (snapToBounds) {
	        var dropZoneOffsets = this.context.parentEl.getBoundingClientRect();
	        if (newLeft < dropZoneOffsets.left) newLeft = dropZoneOffsets.left;
	        if (newTop < dropZoneOffsets.top) newTop = dropZoneOffsets.top;
	        if (newLeft < dropZoneOffsets.right - this.context.ghostWidth) newLeft = dropZoneOffsets.right - this.context.ghostWidth;
	        if (newTop > dropZoneOffsets.bottom - this.context.ghostHeight) newTop = dropZoneOffsets.bottom - this.context.ghostHeight;
	      }

	      // snap to dropZone grid
	      var snapToGrid = this.context.parentEl.getAttribute("data-drag-snap-to-grid");
	      if (snapToGrid) {
	        var cellSizeTokens = snapToGrid.split(",");
	        var cellW = parseInt(cellSizeTokens[0], 10);
	        var cellH = parseInt(cellSizeTokens[1], 10) || cellW;
	        var dropZoneOffsets = this.context.parentEl.getBoundingClientRect();
	        newTop = Math.round((newTop - dropZoneOffsets.top) / cellH) * cellH + dropZoneOffsets.top;
	        newLeft = Math.round((newLeft - dropZoneOffsets.left) / cellW) * cellW + dropZoneOffsets.left;
	      }
	      this.context.offsetLeft = offsetLeft;
	      this.context.offsetTop = offsetTop;
	    }
	  }, {
	    key: "_updateGhost",
	    value: function _updateGhost(clientLeft, clientTop) {
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
	          easing: "linear",
	          queue: false });
	      }
	    }
	  }, {
	    key: "_updatePlaceholder",
	    value: function _updatePlaceholder() {
	      var animate = arguments[0] === undefined ? true : arguments[0];

	      // check if we have any work to do...
	      if (this.context.parentIndex === this.context.placeholderIndex && this.context.parentEl === this.context.placeholderParentEl && this.context.offsetTop === this.context.placeholderOffsetTop && this.context.offsetLeft === this.context.placeholderOffsetLeft) return;

	      // TODO: optimisation, update both old and new before triggering animation avoid two layout passes
	      // TODO: optimisation, recycle old positions
	      animate = animate && this.options.duration > 0;

	      var newPhParentEl = this.context.parentEl.matches(this.options.dropZoneSelector) ? this.context.parentEl : null;

	      // first, remove the old placeholder
	      if (this.context.placeholderParentEl && (this.context.parentEl === null || this.context.parentEl !== newPhParentEl)) {
	        if (animate) this._cacheChildOffsets(this.context.placeholderParentEl, "_old");
	        this.context.placeholderEl.remove();
	        if (animate) this._cacheChildOffsets(this.context.placeholderParentEl, "_new");
	        if (animate) this._animateElementsBetweenSavedOffsets(this.context.placeholderParentEl);
	        this.context.placeholderWidth = null;
	        this.context.placeholderHeight = null;
	        this.context.placeholderParentEl = null;
	      }

	      // insert the new placeholder
	      if (this._isSortable(newPhParentEl) && (this.context.placeholderParentEl !== this.context.parentEl || this.context.placeholderIndex !== this.context.parentIndex)) {
	        if (animate) this._cacheChildOffsets(this.context.parentEl, "_old");
	        this.context.parentEl.insertBefore(this.context.placeholderEl, this.context.parentEl.children[this.context.parentIndex]);
	        if (animate) this._cacheChildOffsets(this.context.parentEl, "_new");
	        if (animate) this._animateElementsBetweenSavedOffsets(this.context.parentEl);
	        this.context.placeholderParentEl = this.context.parentEl;
	      }

	      if (this._isCanvas(newPhParentEl)) {
	        if (this.context.placeholderParentEl !== this.context.parentEl) {
	          this.context.parentEl.appendChild(this.context.placeholderEl);
	          this.context.placeholderParentEl = this.context.parentEl;
	        }
	        dom.translate(this.context.placeholderEl, this.context.offsetLeft, this.context.offsetTop);
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
	    key: "_buildDropZoneCache",
	    value: function _buildDropZoneCache(parentEl) {
	      parentEl.__dd_clientRect = parentEl.getBoundingClientRect();;
	      parentEl.__dd_scrollTop = parentEl.scrollTop;
	      parentEl.__dd_scrollLeft = parentEl.scrollLeft;
	      parentEl.__dd_childDropZones = [];

	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = parentEl.querySelectorAll(this.options.dropZoneSelector)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var childDropZoneEl = _step.value;

	          // if the descendant dropZone is embedded within another descendant dropZone let's ignore it.
	          var intermediateDropZoneEl = dom.closest(childDropZoneEl.parentElement, this.options.dropZoneSelector + ",body");
	          if (intermediateDropZoneEl !== null && intermediateDropZoneEl !== parentEl) continue;

	          // if this drop zone is contained within a placeholder, ignore it
	          if (dom.closest(childDropZoneEl, "." + this.options.placeholderClass)) continue;

	          var childRect = childDropZoneEl.getBoundingClientRect();
	          parentEl.__dd_childDropZones.push({
	            el: childDropZoneEl,
	            top: childRect.top - parentEl.__dd_clientRect.top + parentEl.__dd_scrollTop,
	            left: childRect.left - parentEl.__dd_clientRect.left + parentEl.__dd_scrollLeft,
	            width: childRect.width,
	            height: childRect.height
	          });
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
	    key: "_buildDropZoneCacheIfRequired",
	    value: function _buildDropZoneCacheIfRequired(parentEl) {
	      if (!parentEl.__dd_clientRect) this._buildDropZoneCache(parentEl);
	    }
	  }, {
	    key: "_clearDropZoneCache",
	    value: function _clearDropZoneCache(parentEl) {
	      delete parentEl.__dd_clientRect;
	      delete parentEl.__dd_scrollTop;
	      delete parentEl.__dd_scrollLeft;
	      delete parentEl.__dd_childDropZones;
	    }
	  }, {
	    key: "_getChildDropZoneAtOffset",
	    value: function _getChildDropZoneAtOffset(parentEl, offsetTop, offsetLeft) {
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;

	      try {
	        for (var _iterator2 = parentEl.__dd_childDropZones[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var childDropZone = _step2.value;

	          if (offsetTop >= childDropZone.top && offsetTop <= childDropZone.top + childDropZone.height && offsetLeft >= childDropZone.left && offsetLeft <= childDropZone.left + childDropZone.width) return childDropZone.el;
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

	      return null;
	    }
	  }, {
	    key: "_isSortable",
	    value: function _isSortable(el) {
	      return el && el.matches(this.options.sortableSelector);
	    }
	  }, {
	    key: "_isCanvas",
	    value: function _isCanvas(el) {
	      return el && el.matches(this.options.canvasSelector);
	    }
	  }, {
	    key: "_positionIsInDropZone",
	    value: function _positionIsInDropZone(parentEl, clientLeft, clientTop) {
	      this._buildDropZoneCacheIfRequired(parentEl);
	      var offsetLeft = clientLeft - parentEl.__dd_clientRect.left,
	          offsetTop = clientTop - parentEl.__dd_clientRect.top;
	      return offsetTop >= 0 && offsetTop <= parentEl.__dd_clientRect.height && offsetLeft >= 0 && offsetLeft <= parentEl.__dd_clientRect.width;
	    }
	  }, {
	    key: "_checkScrollProximity",
	    value: function _checkScrollProximity(parentEl, offsetTop, offsetLeft) {}
	  }, {
	    key: "_bindPointerEventsForDragging",
	    value: function _bindPointerEventsForDragging() {
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
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;

	      try {
	        for (var _iterator3 = el.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          var childEl = _step3.value;

	          childEl[propertyName] = { top: childEl.offsetTop, left: childEl.offsetLeft };
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
/* 2 */
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