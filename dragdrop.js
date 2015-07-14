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

	'use strict';

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _DragJs = __webpack_require__(1);

	var _DragJs2 = _interopRequireDefault(_DragJs);

	var _DraggableJs = __webpack_require__(6);

	var _DraggableJs2 = _interopRequireDefault(_DraggableJs);

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libEventsJs = __webpack_require__(14);

	var events = _interopRequireWildcard(_libEventsJs);

	var _libMathJs = __webpack_require__(4);

	var math = _interopRequireWildcard(_libMathJs);

	var defaultOptions = {
	  cancel: 'input,textarea,a,button,select',
	  helperResize: true,
	  animatePickup: false,
	  pickupDelay: 0,
	  pickupDistance: 0,
	  placeholderClass: 'dd-drag-placeholder',
	  containerHoverClass: 'dd-drag-hover',
	  scrollDelay: 500,
	  scrollSensitivity: 50,
	  scrollSpeed: 0.5,
	  animation: false
	  /*{
	    duration: 250,
	    easing: 'ease-in-out',
	    elementLimit: 25,
	    animateResize: true,
	    animateSortableResize: false
	  }*/
	};

	var DragManager = (function () {
	  function DragManager() {
	    _classCallCheck(this, DragManager);

	    this.options = defaultOptions;
	    this.pendingDrags = {};
	    this.drags = {};

	    this.onPointerDownListener = this.onPointerDown.bind(this);
	    this.onPointerMoveListener = this.onPointerMove.bind(this);
	    this.onPointerUpListener = this.onPointerUp.bind(this);
	    this.bindPointerEvents();
	  }

	  DragManager.prototype.bindPointerEvents = function bindPointerEvents() {
	    window.addEventListener(events.pointerDownEvent, this.onPointerDownListener, true);
	  };

	  DragManager.prototype.unbindPointerEvents = function unbindPointerEvents() {
	    window.removeEventListener(events.pointerDownEvent, this.onPointerDownListener);
	  };

	  DragManager.prototype.bindPointerEventsForDragging = function bindPointerEventsForDragging(el) {
	    window.addEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
	    window.addEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
	    el.addEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
	    el.addEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
	  };

	  DragManager.prototype.unbindPointerEventsForDragging = function unbindPointerEventsForDragging(el) {
	    window.removeEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
	    window.removeEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
	    el.removeEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
	    el.removeEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
	  };

	  /*******************/
	  /* EVENT LISTENERS */
	  /*******************/

	  DragManager.prototype.onPointerDown = function onPointerDown(e) {
	    if (e.which !== 0 && e.which !== 1) return;
	    if (dom.ancestors(e.target, this.options.cancel).length > 0) return;

	    var pointerXY = events.pointerEventXY(e);
	    var pointerId = events.pointerEventId(e);

	    var draggable = _DraggableJs2['default'].closest(e.target);
	    if (!draggable) return false;

	    dom.clearSelection();

	    if (this.options.pickupDelay === null || this.options.pickupDelay === 0) {
	      events.cancelEvent(e);
	      document.body.setAttribute('data-drag-in-progress', '');
	      this.drags[pointerId] = new _DragJs2['default'](draggable, pointerXY, defaultOptions);
	    } else {
	      var onPickupTimeoutHandler = function onPickupTimeoutHandler() {
	        this.onPickUpTimeout(pointerId);
	      };
	      this.pendingDrags[pointerId] = {
	        draggable: draggable,
	        pointerXY: pointerXY,
	        timerId: setTimeout(onPickupTimeoutHandler.bind(this), this.options.pickupDelay)
	      };
	    }
	    this.bindPointerEventsForDragging(e.target);
	  };

	  DragManager.prototype.onPickUpTimeout = function onPickUpTimeout(pointerId) {
	    if (this.pendingDrags[pointerId]) {
	      var pendingDrag = this.pendingDrags[pointerId];
	      document.body.setAttribute('data-drag-in-progress', '');
	      this.drags[pointerId] = new _DragJs2['default'](pendingDrag.draggable, pendingDrag.pointerXY, this.options);
	      delete this.pendingDrags[pointerId];
	    }
	  };

	  DragManager.prototype.onPointerMove = function onPointerMove(e) {
	    var pointerXY = events.pointerEventXY(e);
	    var pointerId = events.pointerEventId(e);

	    if (this.drags[pointerId]) {
	      var drag = this.drags[pointerId];
	      events.cancelEvent(e);
	      drag.move(pointerXY);
	    }
	    if (this.pendingDrags[pointerId]) {
	      var pendingDrag = this.pendingDrags[pointerId];
	      // TODO: check relative motion against the item - so flick scrolling does not trigger pick up
	      if (this.options.pickupDistance && math.distance(pendingDrag.pointerXY, pointerXY) > this.options.pickupDistance) clearTimeout(pendingDrag.timerId);
	      document.body.setAttribute('data-drag-in-progress', '');
	      this.drags[pointerId] = new _DragJs2['default'](pendingDrag.draggable, pendingDrag.pointerXY, this.options);
	      delete this.pendingDrags[pointerId];
	    }
	  };

	  DragManager.prototype.onPointerUp = function onPointerUp(e) {
	    var pointerId = events.pointerEventId(e);

	    if (this.drags[pointerId]) {
	      events.cancelEvent(e);
	      this.drags[pointerId].end();
	      delete this.drags[pointerId];
	      if (Object.keys(this.drags).length == 0) {
	        document.body.removeAttribute('data-drag-in-progress');
	        this.unbindPointerEventsForDragging(e.target);
	      }
	    }
	    if (this.pendingDrags[pointerId]) {
	      clearTimeout(this.pendingDrags[pointerId].timerId);
	    }
	  };

	  return DragManager;
	})();

	exports['default'] = DragManager;

	window.dragManager = new DragManager();
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _ContainerJs = __webpack_require__(5);

	var _ContainerJs2 = _interopRequireDefault(_ContainerJs);

	var _ContainerFactoryJs = __webpack_require__(8);

	var _ContainerFactoryJs2 = _interopRequireDefault(_ContainerFactoryJs);

	var _HelperJs = __webpack_require__(7);

	var _HelperJs2 = _interopRequireDefault(_HelperJs);

	var _PlaceholderJs = __webpack_require__(15);

	var _PlaceholderJs2 = _interopRequireDefault(_PlaceholderJs);

	var _ScrollableJs = __webpack_require__(17);

	var _ScrollableJs2 = _interopRequireDefault(_ScrollableJs);

	var _libEventsJs = __webpack_require__(14);

	var events = _interopRequireWildcard(_libEventsJs);

	var _libMathJs = __webpack_require__(4);

	var math = _interopRequireWildcard(_libMathJs);

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	// TODO: Animated revert
	// TODO: Animated resize
	// TODO: Animated destroy (drop elsewhere)
	// TODO: Animated pickup

	// TODO: Scroll only if scrollable is an ancestor of the target element
	// TODO: Scroll does not propagate if target element is constrained

	// TODO: Scroll slow down as you approach extremity
	// TODO: Scroll adjust scroll maxV based on number of items
	// TODO: Scroll trigger placeholder update when scroll stops
	// TODO: Copy behaviour

	var Drag = (function () {
	  function Drag(draggable, pointerXY, options) {
	    _classCallCheck(this, Drag);

	    this.options = options;
	    this.pointerXY = pointerXY;
	    this.constrainedXY = null;
	    this.pointerEl = null;
	    this.helper = null;

	    this.draggable = draggable;
	    this.target = null;
	    this.knownTargets = new WeakMap();
	    this.revertOnCancel = true;

	    this.initialize();
	  }

	  Drag.prototype.initialize = function initialize() {
	    this.helper = new _HelperJs2['default'](this);
	    this.updateConstrainedPosition();
	    this.pointerEl = dom.elementFromPoint(this.pointerXY);
	    this.updateTargetContainer(true);
	    events.raiseEvent(this.draggable.el, 'dragstart', this);
	  };

	  Drag.prototype.move = function move(pointerXY) {
	    this.pointerXY = pointerXY;
	    this.updateConstrainedPosition();

	    if (!this.scroller || !this.scroller.updateVelocity(this.pointerXY)) {
	      this.pointerEl = dom.elementFromPoint(pointerXY);
	      this.updateTargetContainer();
	      if (this.target) this.target.setPointerXY(this.constrainedXY);
	      events.raiseEvent(this.draggable.el, 'drag', this);
	      this.updateScroll();
	    }
	    this.helper.setPosition(this.constrainedXY);
	  };

	  Drag.prototype.updateScroll = function updateScroll() {
	    this.scroller = false;
	    var scrollEls = dom.ancestors(this.pointerEl, _ScrollableJs2['default'].selector);
	    scrollEls.every((function (scrollEl) {
	      var scrollable = new _ScrollableJs2['default'](this, scrollEl);
	      if (scrollable.tryScroll(this.pointerXY)) {
	        this.scroller = scrollable;
	        return false;
	      }
	      return true;
	    }).bind(this));
	  };

	  Drag.prototype.end = function end() {
	    if (this.target) this.drop();else this.cancel();
	    if (this.scroller) this.scroller.cancelScroll();
	    events.raiseEvent(this.draggable.el, 'dragend', this);
	    this.dispose();
	  };

	  Drag.prototype.drop = function drop() {
	    events.raiseEvent(this.draggable.el, 'drop', this);
	    var placeholderRect = this.target.placeholder.el.getBoundingClientRect();
	    this.helper.animateToRect(placeholderRect, (function () {
	      this.target.dropDraggable(this.draggable);
	    }).bind(this));
	  };

	  Drag.prototype.cancel = function cancel() {
	    this.draggable.restoreOriginal();
	  };

	  Drag.prototype.dispose = function dispose() {
	    if (this.target) {
	      this.target.el.classList.remove('dd-drag-over');
	    }

	    this.helper.dispose();
	    this.helper = null;
	  };

	  Drag.prototype.applyDirectionConstraint = function applyDirectionConstraint(drag) {
	    switch (drag.orientation) {
	      case 'vertical':
	        adjustedX = drag.originalOffsetLeft;break;
	      case 'horizontal':
	        adjustedY = drag.originalOffsetTop;break;
	      case 'both':
	        break;
	    }
	  };

	  Drag.prototype.updateConstrainedPosition = function updateConstrainedPosition() {
	    if (this.target && this.target.captures(this.draggable)) {
	      var constrained = [this.pointerXY[0] - this.helper.gripOffset[0] * this.helper.size[0], this.pointerXY[1] - this.helper.gripOffset[1] * this.helper.size[1]];
	      var rect = this.target.el.getBoundingClientRect();
	      constrained[0] = math.coerce(constrained[0], rect.left, rect.right - this.helper.size[0]);
	      constrained[1] = math.coerce(constrained[1], rect.top, rect.bottom - this.helper.size[1]);
	      this.constrainedXY = [constrained[0] + this.helper.gripOffset[0] * this.helper.size[0], constrained[1] + this.helper.gripOffset[1] * this.helper.size[1]];
	    } else {
	      this.constrainedXY = this.pointerXY;
	    }
	  };

	  Drag.prototype.updateTargetContainer = function updateTargetContainer() {
	    var removeOriginal = arguments[0] === undefined ? false : arguments[0];

	    if (this.target && this.target.captures(this.draggable)) return;
	    var placeholderEl = _PlaceholderJs2['default'].closest(this.pointerEl);
	    var containerEl = _ContainerFactoryJs2['default'].closest(placeholderEl ? placeholderEl.parentElement : this.pointerEl);
	    if (containerEl === (this.target ? this.target.el : null)) return;

	    if (this.target) this._leaveTarget(this.target);

	    if (containerEl) {
	      var container = this.knownTargets.get(containerEl);
	      if (!container) {
	        container = _ContainerFactoryJs2['default'].makeContainer(containerEl, this);
	        this.knownTargets.set(containerEl, container);
	      }
	      if (container.accepts(this.draggable)) this._enterTarget(container, removeOriginal);
	    }
	  };

	  Drag.prototype._enterTarget = function _enterTarget(container, removeOriginal) {
	    container.updatePosition(this.constrainedXY);
	    container.insertPlaceholder(removeOriginal ? this.draggable.el : null);
	    events.raiseEvent(container.el, 'dragenter', this);
	    if (this.options.helperResize) {
	      this.helper.setSizeAndScale(container.placeholderSize, container.placeholderScale);
	    }
	    container.el.classList.add(this.options.containerHoverClass);
	    this.target = container;
	  };

	  Drag.prototype._leaveTarget = function _leaveTarget(container) {
	    container.removePlaceholder();
	    events.raiseEvent(container.el, 'dragleave', this);
	    container.el.classList.remove(this.options.containerHoverClass);
	    this.target = null;
	  };

	  return Drag;
	})();

	exports['default'] = Drag;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	// selectors

	'use strict';

	exports.__esModule = true;
	exports.indexOf = indexOf;
	exports.isChild = isChild;
	exports.closest = closest;
	exports.ancestors = ancestors;
	exports.clientScale = clientScale;
	exports.translate = translate;
	exports.transform = transform;
	exports.topLeft = topLeft;
	exports.transformOrigin = transformOrigin;
	exports.elementFromPoint = elementFromPoint;
	exports.elementFromPointViaSelection = elementFromPointViaSelection;
	exports.clearSelection = clearSelection;
	exports.canScrollDown = canScrollDown;
	exports.canScrollUp = canScrollUp;
	exports.canScrollRight = canScrollRight;
	exports.canScrollLeft = canScrollLeft;
	exports.canScrollVertical = canScrollVertical;
	exports.canScrollHorizontal = canScrollHorizontal;

	function indexOf(el) {
	  return Array.prototype.indexOf.call(el.parentElement.children, el);
	}

	function isChild(el, childEl) {
	  return Array.prototype.indexOf.call(el.children, childEl) !== -1;
	}

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

	function clientScale(el) {
	  var rect = el.getBoundingClientRect();
	  return [rect.width / el.offsetWidth, rect.height / el.offsetHeight];
	}

	// vendor

	var vendorTransform = null;
	setTimeout(function () {
	  if (document.body.style.webkitTransform !== undefined) vendorTransform = 'webkitTransform';
	  if (document.body.style.mozTransform !== undefined) vendorTransform = 'mozTransform';
	  if (document.body.style.msTransform !== undefined) vendorTransform = 'msTransform';
	  if (document.body.style.transform !== undefined) vendorTransform = 'transform';
	  var iOS = navigator.userAgent.match(/iPad|iPhone|iPod/g) ? true : false;
	  document.body.classList.toggle('ios', iOS);
	  document.body.classList.toggle('not-ios', !iOS);
	});

	function translate(el, x, y) {
	  el.style[vendorTransform] = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0)';
	}

	function transform(el, options) {
	  var transform = [];
	  if (options.translateX) transform.push('translateX(' + options.translateX + 'px)');
	  if (options.translateY) transform.push('translateY(' + options.translateY + 'px)');
	  if (options.translateZ) transform.push('translateZ(' + options.translateZ + 'px)');
	  if (options.scaleX) transform.push('scaleX(' + options.scaleX + ')');
	  if (options.scaleY) transform.push('scaleY(' + options.scaleY + ')');
	  if (options.rotateZ) transform.push('rotateZ(' + options.rotateZ + 'deg)');
	  el.style[vendorTransform] = transform.join(' ');
	}

	function topLeft(el, _ref) {
	  var l = _ref[0];
	  var t = _ref[1];

	  el.style.top = t + 'px';
	  el.style.left = l + 'px';
	}

	function transformOrigin(el, _ref2) {
	  var t = _ref2[0];
	  var l = _ref2[1];

	  el.style.transformOrigin = l + '% ' + t + '%';
	  el.style.webkitTransformOrigin = l + '% ' + t + '%';
	}

	function elementFromPoint(xy) {
	  return document.elementFromPoint(xy[0], xy[1]);
	}

	function elementFromPointViaSelection(xy) {
	  var node = null;
	  // webkit
	  if (document.caretRangeFromPoint) {
	    var range = document.caretRangeFromPoint(xy[0], xy[1]);
	    if (range) node = range.startContainer;
	  }
	  // mozilla
	  if (document.caretPositionFromPoint) {
	    var range = document.caretPositionFromPoint(xy[0], xy[1]);
	    if (range) node = range.offsetNode;
	  }
	  // internet explorer
	  if (document.createTextRange) {
	    var range = document.createTextRange();
	    range.moveToPoint(xy[0], xy[1]);
	    return node = range.parentElement();
	  }
	  if (node && node.parentElement && !(node instanceof Element)) node = node.parentElement;
	  return node;
	}

	function clearSelection() {
	  if (window.getSelection) {
	    if (window.getSelection().empty) {
	      // Chrome
	      window.getSelection().empty();
	    } else if (window.getSelection().removeAllRanges) {
	      // Firefox
	      window.getSelection().removeAllRanges();
	    }
	  } else if (document.selection) {
	    // IE?
	    document.selection.empty();
	  }
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

/***/ },
/* 3 */,
/* 4 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports.coerce = coerce;
	exports.midpointTop = midpointTop;
	exports.midpointLeft = midpointLeft;
	exports.distance = distance;

	function coerce(value, min, max) {
	  return value > max ? max : value < min ? min : value;
	}

	function midpointTop(clientRect) {
	  return clientRect.top + clientRect.height / 2;
	}

	function midpointLeft(clientRect) {
	  return clientRect.left + clientRect.width / 2;
	}

	function distance(p1, p2) {
	  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	var Container = (function () {
	  function Container(el, drag) {
	    _classCallCheck(this, Container);

	    this.el = el;
	    this.drag = drag;
	    this.placeholder = null;
	    this.placeholderSize = [0, 0];
	    this.placeholderScale = 1;
	    this.options = drag.options;
	  }

	  Container.matches = function matches(el) {
	    return el ? el.matches(this.selector) : false;
	  };

	  Container.prototype.setPointerXY = function setPointerXY(constrainedXY) {
	    this.updatePosition(constrainedXY);
	    this.updatePlaceholder();
	  };

	  Container.prototype.updatePosition = function updatePosition() {
	    throw new Error("Not implemented");
	  };

	  Container.prototype.updatePlaceholder = function updatePlaceholder() {
	    throw new Error("Not implemented");
	  };

	  Container.prototype.accepts = function accepts(draggable) {
	    if (this.el.hasAttribute("data-drag-disabled")) return false;
	    var acceptsSelector = this.el.getAttribute("data-drag-accepts");
	    return acceptsSelector ? draggable.el.matches(acceptsSelector) : draggable.originalParentEl === this.el;
	  };

	  Container.prototype.captures = function captures(draggable) {
	    if (this.el.hasAttribute("data-drag-capture")) return true;

	    // draggable is contained by this
	    if (draggable.el.hasAttribute("data-drag-containment")) {
	      var containmentSelector = draggable.el.getAttribute("data-drag-containment");
	      return containmentSelector ? this.el.matches(containmentSelector) : true;
	    }
	    // this contains draggable
	    if (this.el.hasAttribute("data-drag-containment")) {
	      var containmentSelector = this.el.getAttribute("data-drag-containment");
	      return containmentSelector ? draggable.el.matches(containmentSelector) : true;
	    }
	    return false;
	  };

	  return Container;
	})();

	exports["default"] = Container;
	module.exports = exports["default"];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	var Draggable = (function () {
	  function Draggable(el) {
	    _classCallCheck(this, Draggable);

	    this.el = el;
	    this.originalParentEl = el.parentElement;
	    this.originalIndex = dom.indexOf(el);
	    this.originalSize = [this.el.offsetWidth, this.el.offsetHeight];
	    this.originalOffset = [this.el.offsetLeft, this.el.offsetTop];
	    this.originalScale = dom.clientScale(el);
	  }

	  Draggable.closest = function closest(el) {
	    var dragEl = dom.closest(el, Draggable.handleOrDraggableSelector);
	    if (!dragEl) return null;

	    // if the pointer is over a handle element, ascend the DOM to find the
	    // associated draggable item
	    if (dragEl.hasAttribute('data-drag-handle')) {
	      dragEl = dom.closest(dragEl, this.draggableSelector);
	      return dragEl ? new Draggable(dragEl) : null;
	    }

	    // if the item contains a handle (which was not the the pointer down spot)
	    // then ignore
	    // TODO: fix this
	    console.log(dragEl.querySelectorAll(this.handleUnderDraggableSelector).length);
	    if (dragEl.querySelectorAll(this.handleSelector).length > dragEl.querySelectorAll(this.handleUnderDraggableSelector).length) {
	      return null;
	    }

	    return dragEl ? new Draggable(dragEl) : null;
	  };

	  Draggable.prototype.removeOriginal = function removeOriginal() {
	    this.el.remove();
	  };

	  Draggable.prototype.clean = function clean() {
	    this.el.removeAttribute('data-drag-placeholder');
	    this.el.classList.remove('dd-drag-placeholder');
	    this.el.style.webkitTransform = '';
	    this.el.style.transform = '';
	    this.el.style.visibility = 'visible';
	  };

	  Draggable.prototype.restoreOriginal = function restoreOriginal() {
	    dom.topLeft(this.el, this.originalOffset);
	    this.originalParentEl.insertBefore(this.el, this.originalParentEl.children[this.originalIndex]);
	  };

	  _createClass(Draggable, [{
	    key: 'enabled',
	    get: function get() {
	      return !(this.el.hasAttribute('data-drag-disabled') || this.el.parentElement && this.el.parentElement.hasAttribute('data-drag-disabled'));
	    }
	  }], [{
	    key: 'handleSelector',
	    get: function get() {
	      return '[data-drag-handle]';
	    }
	  }, {
	    key: 'draggableSelector',
	    get: function get() {
	      return '[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
	    }
	  }, {
	    key: 'handleOrDraggableSelector',
	    get: function get() {
	      return this.handleSelector + ',' + this.draggableSelector;
	    }
	  }, {
	    key: 'handleUnderDraggableSelector',
	    get: function get() {
	      return '[data-draggable] [data-drag-handle],[data-drag-sortable] [data-drag-handle],[data-drag-canvas] [data-drag-handle]';
	    }
	  }]);

	  return Draggable;
	})();

	exports['default'] = Draggable;
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	var Helper = (function () {
	  function Helper(drag) {
	    _classCallCheck(this, Helper);

	    this.drag = drag;
	    this.el = null;
	    this.overlayEl = null;
	    this.gripOffset = null;
	    this.size = [0, 0];
	    this.scale = [1, 1];
	    this.position = [0, 0];
	    this.initialize();
	  }

	  Helper.prototype.initialize = function initialize() {
	    this.overlayEl = document.createElement('div');
	    this.overlayEl.setAttribute('data-drag-overlay', '');

	    this.el = this.drag.draggable.el.cloneNode(true);
	    this.el.removeAttribute('id');
	    this.el.setAttribute('data-drag-helper', '');

	    var rect = this.drag.draggable.el.getBoundingClientRect();
	    this.gripOffset = [(this.drag.pointerXY[0] - rect.left) / rect.width, (this.drag.pointerXY[1] - rect.top) / rect.height];

	    this.overlayEl.appendChild(this.el);
	    document.body.appendChild(this.overlayEl);

	    this.setPosition(this.drag.pointerXY);
	    this.setSizeAndScale(this.drag.draggable.originalSize, this.drag.draggable.originalScale, false);

	    this.el.focus();

	    if (this.drag.options.animatePickup && window['Velocity']) {
	      Velocity(this.el, {
	        rotateZ: -1,
	        boxShadowBlur: this.drag.options.helper.shadowSize
	      }, {
	        duration: this.drag.options.animation.duration,
	        easing: this.drag.options.animation.easing
	      });
	    }
	  };

	  Helper.prototype.setPosition = function setPosition(positionXY) {
	    this.position = positionXY;
	    this.updateTransform();
	  };

	  Helper.prototype.setSizeAndScale = function setSizeAndScale(size, scale) {
	    var animate = arguments[2] === undefined ? true : arguments[2];

	    if (this.size && this.scale && this.size[0] === size[0] && this.size[1] === size[1] && this.scale[0] === scale[0] && this.scale[1] === scale[1]) return;

	    /*
	    if (animate && window['Velocity']) {
	      const velocityOptions = this.drag.options.animation.animateResize
	                            ? {
	                                duration: this.drag.options.animation.duration,
	                                easing: 'linear',
	                                queue: false
	                              }
	                            : {
	                                duration: 0,
	                                queue: false
	                              };
	      Velocity(this.el, {
	        width: size[0],
	        height: size[1],
	        left: -this.gripOffset[0] * size[0],
	        top: -this.gripOffset[1] * size[1],
	        transformOriginX: this.gripOffset[0] * size[0],
	        transformOriginY: this.gripOffset[1] * size[1],
	        scaleX: scale[0],
	        scaleY: scale[1]
	      }, velocityOptions);
	    } else {
	      */
	    this.el.style.width = size[0] + 'px';
	    this.el.style.height = size[1] + 'px';
	    this.el.style.left = -this.gripOffset[0] * size[0] + 'px';
	    this.el.style.top = -this.gripOffset[1] * size[1] + 'px';
	    dom.transformOrigin(this.el, [-this.gripOffset[0], -this.gripOffset[1]]);
	    this.scale = scale;
	    this.updateTransform();
	    //}
	    this.size = size;
	  };

	  Helper.prototype.updateTransform = function updateTransform() {
	    dom.transform(this.el, {
	      translateX: this.position[0],
	      translateY: this.position[1],
	      translateZ: 0,
	      scaleX: this.scale[0],
	      scaleY: this.scale[1],
	      rotateZ: -1
	    });
	  };

	  Helper.prototype.animateToRect = function animateToRect(rect, callback) {
	    return callback();
	    var targetProps = {
	      translateX: [rect.left, 'ease-out'],
	      translateY: [rect.top, 'ease-out'],
	      top: [0, 'ease-out'],
	      left: [0, 'ease-out'],
	      rotateZ: 0,
	      boxShadowBlur: 0
	    };
	    if (this.drag.options.animation.animateResize) {
	      targetProps.width = [rect.width, 'ease-out'];
	      targetProps.height = [rect.height, 'ease-out'];
	    }
	    Velocity(this.el, targetProps, {
	      duration: this.drag.options.animation.duration,
	      easing: this.drag.options.animation.easing,
	      complete: callback
	    });
	  };

	  Helper.prototype.dispose = function dispose(drag) {
	    this.overlayEl.remove();
	    this.el.remove();
	  };

	  return Helper;
	})();

	exports['default'] = Helper;
	module.exports = exports['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _CanvasContainerJs = __webpack_require__(9);

	var _CanvasContainerJs2 = _interopRequireDefault(_CanvasContainerJs);

	var _DroppableContainerJs = __webpack_require__(10);

	var _DroppableContainerJs2 = _interopRequireDefault(_DroppableContainerJs);

	var _SortableContainerJs = __webpack_require__(11);

	var _SortableContainerJs2 = _interopRequireDefault(_SortableContainerJs);

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	var ContainerFactory = (function () {
	  function ContainerFactory() {
	    _classCallCheck(this, ContainerFactory);
	  }

	  ContainerFactory.closest = function closest(el) {
	    return dom.closest(el, this.selector);
	  };

	  ContainerFactory.makeContainer = function makeContainer(el, drag) {
	    if (_CanvasContainerJs2['default'].matches(el)) return new _CanvasContainerJs2['default'](el, drag);
	    if (_DroppableContainerJs2['default'].matches(el)) return new _DroppableContainerJs2['default'](el, drag);
	    if (_SortableContainerJs2['default'].matches(el)) return new _SortableContainerJs2['default'](el, drag);
	    return null;
	  };

	  _createClass(ContainerFactory, null, [{
	    key: 'selector',
	    get: function get() {
	      return '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]';
	    }
	  }]);

	  return ContainerFactory;
	})();

	exports['default'] = ContainerFactory;
	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _ContainerJs = __webpack_require__(5);

	var _ContainerJs2 = _interopRequireDefault(_ContainerJs);

	var _PlaceholderJs = __webpack_require__(15);

	var _PlaceholderJs2 = _interopRequireDefault(_PlaceholderJs);

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	var CanvasContainer = (function (_Container) {
	  function CanvasContainer(el, drag) {
	    _classCallCheck(this, CanvasContainer);

	    _Container.call(this, el, drag);
	    this.offset = [0, 0];
	    this.grid = null;
	    this.initialize();
	  }

	  _inherits(CanvasContainer, _Container);

	  CanvasContainer.prototype.initialize = function initialize() {
	    var grid = this.el.getAttribute("data-drag-grid") || "";
	    var cellSizeTokens = grid.split(",");
	    this.grid = [parseInt(cellSizeTokens[0], 10) || 1, parseInt(cellSizeTokens[1], 10) || parseInt(cellSizeTokens[0], 10) || 1];
	  };

	  CanvasContainer.prototype.updatePosition = function updatePosition(constrainedXY) {
	    // TODO cache if possible
	    var rect = this.el.getBoundingClientRect();
	    var l = constrainedXY[0] - rect.left + this.el.scrollLeft - this.drag.helper.gripOffset[0] * this.drag.helper.size[0],
	        t = constrainedXY[1] - rect.top + this.el.scrollTop - this.drag.helper.gripOffset[1] * this.drag.helper.size[1];
	    t = Math.round((t - rect.top) / this.grid[1]) * this.grid[1] + rect.top;
	    l = Math.round((l - rect.left) / this.grid[0]) * this.grid[0] + rect.left;
	    this.offset = [l, t];
	  };

	  CanvasContainer.prototype.insertPlaceholder = function insertPlaceholder(originalEl) {
	    if (!this.placeholder) {
	      this.placeholder = new _PlaceholderJs2["default"](this.drag, originalEl);
	      dom.translate(this.placeholder.el, this.offset[0], this.offset[1]);
	      if (!originalEl) {
	        this.el.appendChild(this.placeholder.el);
	      }
	      this.placeholderSize = this.placeholder.size;
	      this.placeholderScale = this.placeholder.scale;
	    }
	  };

	  CanvasContainer.prototype.updatePlaceholder = function updatePlaceholder() {
	    dom.translate(this.placeholder.el, this.offset[0], this.offset[1]);
	  };

	  CanvasContainer.prototype.removePlaceholder = function removePlaceholder() {
	    this.placeholder.el.style.visibility = "hidden";
	  };

	  CanvasContainer.prototype.dropDraggable = function dropDraggable(draggable) {
	    this.placeholder.dispose();
	    draggable.clean();
	    dom.topLeft(draggable.el, this.offset);
	    this.el.appendChild(draggable.el);
	  };

	  _createClass(CanvasContainer, null, [{
	    key: "selector",
	    get: function get() {
	      return "[data-drag-canvas]";
	    }
	  }]);

	  return CanvasContainer;
	})(_ContainerJs2["default"]);

	exports["default"] = CanvasContainer;
	module.exports = exports["default"];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _ContainerJs = __webpack_require__(5);

	var _ContainerJs2 = _interopRequireDefault(_ContainerJs);

	var DroppableContainer = (function (_Container) {
	  function DroppableContainer() {
	    _classCallCheck(this, DroppableContainer);

	    _Container.apply(this, arguments);
	  }

	  _inherits(DroppableContainer, _Container);

	  DroppableContainer.prototype.updateTarget = function updateTarget(drag) {};

	  _createClass(DroppableContainer, null, [{
	    key: "selector",
	    get: function get() {
	      return "[data-drag-droppable]";
	    }
	  }]);

	  return DroppableContainer;
	})(_ContainerJs2["default"]);

	exports["default"] = DroppableContainer;
	module.exports = exports["default"];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _ContainerJs = __webpack_require__(5);

	var _ContainerJs2 = _interopRequireDefault(_ContainerJs);

	var _PlaceholderJs = __webpack_require__(15);

	var _PlaceholderJs2 = _interopRequireDefault(_PlaceholderJs);

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libAnimationJs = __webpack_require__(13);

	var animation = _interopRequireWildcard(_libAnimationJs);

	var SortableContainer = (function (_Container) {
	  function SortableContainer(el, drag) {
	    _classCallCheck(this, SortableContainer);

	    _Container.call(this, el, drag);
	    this.index = 0;
	    this.direction = "vertical";
	    this.childEls = [];
	    this.placeholderIndex = 0;
	    this.initialize();
	  }

	  _inherits(SortableContainer, _Container);

	  SortableContainer.prototype.initialize = function initialize() {
	    this.direction = this.el.getAttribute("data-drag-sortable") || "vertical";
	    this.childEls = Array.prototype.splice.call(this.el.children, 0);
	    // remove the draggable element from the child array
	    var draggableElIndex = this.childEls.indexOf(this.drag.draggable.el);
	    if (draggableElIndex !== -1) this.childEls.splice(draggableElIndex, 1);
	    this.updateIndex(this.drag.constrainedXY);
	  };

	  SortableContainer.prototype.updatePosition = function updatePosition(xy) {
	    this.updateIndex(xy);
	  };

	  SortableContainer.prototype.updateIndex = function updateIndex(xy) {
	    if (this.childEls.length === 0) return this.index = 0;

	    // we'll use selection APIs rather than elementAtPoint,
	    // as it returns the closest sibling to the area being selected
	    // TODO - do performance comparison between "viaSelection" and normal elementFromPoint
	    var closestEl = dom.elementFromPointViaSelection(xy);

	    // find the closest direct descendant of this sortable container
	    while (closestEl && this.childEls.indexOf(closestEl) === -1) {
	      closestEl = closestEl.parentElement;
	    }

	    if (closestEl) {
	      if (this.placeholder && closestEl === this.placeholder.el) return;
	      this.index = this.childEls.indexOf(closestEl);
	      var closestRect = closestEl.getBoundingClientRect();

	      switch (this.direction) {
	        case "vertical":
	          if (xy[1] > closestRect.top + closestRect.height / 2) this.index++;
	          break;
	        case "horizontal":
	        case "wrap":
	          if (xy[0] > closestRect.left + closestRect.width / 2) this.index++;
	          break;
	      }
	    }
	  };

	  //var end = new Date();
	  //var start = new Date();
	  //if (new Date() % 100 === 0) document.querySelector(".header.item").innerHTML = "<p>" + (end - start) + "ms</p>";

	  SortableContainer.prototype.insertPlaceholder = function insertPlaceholder(originalEl) {
	    if (!this.placeholder) {
	      this.placeholder = new _PlaceholderJs2["default"](this.drag, originalEl);
	      if (!originalEl) this.el.appendChild(this.placeholder.el);
	      this.placeholderIndex = dom.indexOf(this.placeholder.el);
	    }
	    /*
	    function mutation() {
	      if (originalEl) originalEl.remove();
	      self.el.insertBefore(self.placeholder.el, self.el.children[self.index]);
	    }
	    if (this.options.animation)
	      animation.animateDomMutation(this.el, mutation.bind(this),
	      {
	        duration: this.options.animation.duration,
	        easing: this.options.animation.easing,
	        startIndex: this.index,
	        elementLimit: this.options.animation.elementLimit,
	        animateParentSize: this.options.animation.animateSortableResize
	      });
	    else mutation();
	    */
	    this.placeholderSize = this.placeholder.size;
	    this.placeholderScale = this.placeholder.scale;
	    this.placeholder.el.style.visibility = "visible";
	  };

	  SortableContainer.prototype.updatePlaceholder = function updatePlaceholder() {
	    //let newIndex = this.index,
	    //    oldIndex = dom.indexOf(this.placeholder.el);
	    //if (oldIndex !== newIndex && oldIndex !== newIndex - 1) {
	    /*
	    let self = this;
	    function mutation() {
	      //self.el.insertBefore(self.placeholder.el, self.el.children[newIndex]);
	    }
	    if (this.options.animation)
	      animation.animateDomMutation(this.el, mutation,
	      {
	        duration: this.options.animation.duration,
	        easing: this.options.animation.easing,
	        startIndex: Math.min(oldIndex, newIndex) - 1,
	        endIndex: Math.max(oldIndex, newIndex) + 1,
	        elementLimit: this.options.animation.elementLimit
	      });
	    else mutation();
	    */
	    this.updateChildOffsets();
	  };

	  SortableContainer.prototype.removePlaceholder = function removePlaceholder(drag) {
	    this.placeholder.el.style.visibility = "hidden";
	    /*
	    function mutation() {
	      self.placeholder.el.remove();
	    }
	    if (this.options.animation)
	      animation.animateDomMutation(this.el, mutation,
	      {
	        duration: this.options.animation.duration,
	        easing: this.options.animation.easing,
	        startIndex: this.index,
	        elementLimit: this.options.animation.elementLimit,
	        animateParentSize: this.options.animation.animateSortableResize
	      });
	    else mutation();
	    this.placeholder.dispose();
	    this.placeholder = null;
	    */
	    this.index == null;
	    this.updateChildOffsets();
	  };

	  SortableContainer.prototype.updateChildOffsets = function updateChildOffsets() {
	    var index = 0;
	    var offset = 0;
	    this.childEls.forEach((function (el) {
	      if (index === this.placeholderIndex) {
	        offset -= this.direction === "vertical" ? this.placeholderSize[1] : this.placeholderSize[0];
	      }
	      if (index === this.index) {
	        offset += this.direction === "vertical" ? this.placeholderSize[1] : this.placeholderSize[0];
	      }
	      if (el._offset !== offset && !(offset === 0 && el._offset === undefined)) {
	        el.style.webkitTransform = this.direction === "vertical" ? "translate(0," + offset + "px)" : "translate(" + offset + "px,0)";
	        el._offset = offset;
	      }
	      index++;
	    }).bind(this));
	  };

	  SortableContainer.prototype.dropDraggable = function dropDraggable(draggable) {
	    this.placeholder.dispose();
	    draggable.clean();
	    this.el.insertBefore(draggable.el, this.childEls[this.index]);
	    this.childEls.forEach(function (el) {
	      el.style.webkitTransform = "";
	      el.style.transform = "";
	    });
	  };

	  _createClass(SortableContainer, null, [{
	    key: "selector",
	    get: function get() {
	      return "[data-drag-sortable]";
	    }
	  }]);

	  return SortableContainer;
	})(_ContainerJs2["default"]);

	exports["default"] = SortableContainer;
	module.exports = exports["default"];

/***/ },
/* 12 */,
/* 13 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.animateDomMutation = animateDomMutation;

	function animateDomMutation(el, mutationFunction, options) {
	  var startIndex = options.startIndex || 0;
	  var endIndex = Math.min(options.endIndex || el.children.length + 1, startIndex + options.elementLimit);
	  var easing = options.easing || 'ease-in-out';
	  var duration = options.duration || 400;
	  var originalStyleHeight = null,
	      originalStyleWidth = null,
	      oldSize = null,
	      newSize = null;

	  var oldOffsets = childOffsetMap(el, startIndex, endIndex);
	  if (options.animateParentSize) {
	    originalStyleHeight = '';
	    originalStyleWidth = '';
	    el.style.width = '';
	    el.style.height = '';
	    oldSize = [el.offsetWidth, el.offsetHeight];
	  }
	  mutationFunction();
	  var newOffsets = childOffsetMap(el, startIndex, endIndex);
	  if (options.animateParentSize) {
	    newSize = [el.offsetWidth, el.offsetHeight];
	  }

	  animateBetweenOffsets(el, oldOffsets, newOffsets, startIndex, endIndex, duration, easing);

	  if (options.animateParentSize) {
	    animateSize(el, oldSize, newSize, originalStyleWidth, originalStyleHeight, duration, easing);
	  }
	}

	function animateSize(el, oldSize, newSize, originalStyleWidth, originalStyleHeight, duration, easing) {
	  function onComplete() {
	    el.style.width = originalStyleWidth;
	    el.style.height = originalStyleHeight;
	  }
	  Velocity(el, {
	    width: [newSize[0], oldSize[0]],
	    height: [newSize[1], oldSize[1]]
	  }, {
	    duration: duration,
	    easing: easing,
	    queue: false,
	    complete: onComplete
	  });
	}

	function animateBetweenOffsets(el, oldOffsets, newOffsets, startIndex, endIndex, duration, easing) {
	  for (var i = startIndex; i < endIndex + 1; i++) {
	    var childEl = el.children[i];
	    if (!childEl) continue;

	    //if (childEl.matches('[data-drag-placeholder]')) continue;

	    var oldOffset = oldOffsets.get(childEl);
	    var newOffset = newOffsets.get(childEl);
	    if (!oldOffset || !newOffset || oldOffset[0] === newOffset[0] && oldOffset[1] === newOffset[1]) continue;

	    // the following line makes the animations smoother in safari
	    //childEl.style.webkitTransform = 'translate3d(0,' + (oldOffset.top - newOffset.top) + 'px,0)';

	    Velocity(childEl, {
	      translateX: '+=' + (oldOffset[0] - newOffset[0]) + 'px',
	      translateY: '+=' + (oldOffset[1] - newOffset[1]) + 'px',
	      translateZ: 0
	    }, { duration: 0 });

	    Velocity(childEl, {
	      translateX: 0,
	      translateY: 0
	    }, {
	      duration: duration,
	      easing: easing,
	      queue: false
	    });
	  }
	}

	function childOffsetMap(el, startIndex, endIndex) {
	  var map = new WeakMap();
	  for (var i = startIndex; i < endIndex; i++) {
	    var childEl = el.children[i];
	    if (childEl) map.set(childEl, [childEl.offsetLeft, childEl.offsetTop]);
	  }
	  return map;
	}

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.cancelEvent = cancelEvent;
	exports.raiseEvent = raiseEvent;
	exports.pointerEventXY = pointerEventXY;
	exports.pointerEventId = pointerEventId;
	var pointerDownEvent = document['ontouchstart'] !== undefined ? 'touchstart' : 'mousedown';
	exports.pointerDownEvent = pointerDownEvent;
	var pointerMoveEvent = document['ontouchmove'] !== undefined ? 'touchmove' : 'mousemove';
	exports.pointerMoveEvent = pointerMoveEvent;
	var pointerUpEvent = document['ontouchend'] !== undefined ? 'touchend' : 'mouseup';

	exports.pointerUpEvent = pointerUpEvent;

	function cancelEvent(e) {
	  e.stopPropagation();
	  e.preventDefault();
	  e.cancelBubble = true;
	  e.returnValue = false;
	}

	function raiseEvent(source, eventName, eventData) {
	  var event = new CustomEvent(eventName, eventData);
	  source.dispatchEvent(event);
	  return event;
	}

	function pointerEventXY(e) {
	  var clientX = e.touches ? e.touches[0].clientX : e.clientX;
	  var clientY = e.touches ? e.touches[0].clientY : e.clientY;
	  return [clientX, clientY];
	}

	function pointerEventId(e) {
	  return e.touchId ? e.touchId : 0;
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	var Placeholder = (function () {
	  function Placeholder(drag) {
	    var draggableEl = arguments[1] === undefined ? null : arguments[1];

	    _classCallCheck(this, Placeholder);

	    this.drag = drag;
	    this.isDraggableEl = !!draggableEl;
	    this.el = draggableEl;
	    this.initialize();
	  }

	  Placeholder.closest = function closest(el) {
	    return dom.closest(el, '[data-drag-placeholder]');
	  };

	  Placeholder.prototype.initialize = function initialize(draggable) {
	    if (!this.isDraggableEl) {
	      this.el = this.drag.draggable.el.cloneNode(true);
	      this.el.removeAttribute('id');
	    }
	    this.el.classList.add(this.drag.options.placholderClass);
	    this.el.setAttribute('data-drag-placeholder', '');
	    dom.translate(this.el, 0, 0);
	    dom.topLeft(this.el, [0, 0]);
	  };

	  Placeholder.prototype.dispose = function dispose() {
	    if (!this.isDraggableEl) {
	      this.el.remove();
	      this.el = null;
	    } else {
	      // restore the original draggable element settings
	      this.el.removeAttribute('data-drag-placeholder');
	      this.el.classList.remove('dd-drag-placeholder');
	      this.el.style.webkitTransform = '';
	      this.el.style.transform = '';
	      this.el.style.visibility = 'visible';
	      this.el = null;
	    }
	  };

	  _createClass(Placeholder, [{
	    key: 'size',
	    get: function get() {
	      return [this.el.offsetWidth, this.el.offsetHeight];
	    }
	  }, {
	    key: 'scale',
	    get: function get() {
	      return dom.clientScale(this.el);
	    }
	  }]);

	  return Placeholder;
	})();

	exports['default'] = Placeholder;
	module.exports = exports['default'];

/***/ },
/* 16 */,
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

	var Scrollable = (function () {
	  function Scrollable(drag, el) {
	    _classCallCheck(this, Scrollable);

	    this.el = el;
	    this.velocity = [0, 0];
	    this.offset = [0, 0];
	    this.direction = 'both';
	    this.lastUpdate = null;
	    this.options = drag.options;
	    this.initialize();
	  }

	  Scrollable.closest = function closest(el) {
	    return dom.closest(el, this.selector);
	  };

	  Scrollable.scale = function scale(v, d, r) {
	    return (v - d[0]) / (d[1] - d[0]) * (r[1] - r[0]) + r[0];
	  };

	  Scrollable.prototype.initialize = function initialize() {
	    this.direction = this.el.getAttribute('data-drag-scrollable') || 'both';
	    if (this.el.tagName === 'BODY') {
	      this.bounds = {
	        left: 0,
	        top: 0,
	        width: document.documentElement.clientWidth,
	        height: document.documentElement.clientHeight,
	        right: document.documentElement.clientWidth,
	        bottom: document.documentElement.clientHeight
	      };
	    } else {
	      this.bounds = this.el.getBoundingClientRect();
	    }
	  };

	  Scrollable.prototype.tryScroll = function tryScroll(pointerXY) {
	    this.updateVelocity(pointerXY);
	    if (this.velocity[0] !== 0 || this.velocity[1] !== 0) {
	      this.startScroll();
	      return true;
	    }
	    return false;
	  };

	  Scrollable.prototype.startScroll = function startScroll() {
	    this.requestId = requestAnimationFrame(this.continueScroll.bind(this));
	    this.offset = [this.el.scrollLeft, this.el.scrollTop];
	  };

	  Scrollable.prototype.continueScroll = function continueScroll() {
	    var currentUpdate = new Date();
	    var elapsedTimeMs = this.lastUpdate ? currentUpdate - this.lastUpdate : 16;
	    this.requestId = null;
	    this.offset = [this.offset[0] + this.velocity[0] * elapsedTimeMs, this.offset[1] + this.velocity[1] * elapsedTimeMs];

	    if (this.velocity[0] !== 0) this.el.scrollLeft = this.offset[0];
	    if (this.velocity[1] !== 0) this.el.scrollTop = this.offset[1];
	    if (this.velocity[0] !== 0 || this.velocity[1] !== 0) this.requestId = requestAnimationFrame(this.continueScroll.bind(this));
	    this.lastUpdate = currentUpdate;
	  };

	  Scrollable.prototype.cancelScroll = function cancelScroll() {
	    cancelAnimationFrame(this.requestId);
	    this.requestId = null;
	    this.lastUpdate = null;
	  };

	  Scrollable.prototype.updateVelocity = function updateVelocity(xy) {
	    var sensitivity = this.options.scrollSensitivity;
	    var maxV = this.options.scrollSpeed;
	    var b = this.bounds;

	    var v = [0, 0];
	    if (xy[0] >= this.bounds.left && xy[0] <= this.bounds.right && xy[1] >= this.bounds.top && xy[1] <= this.bounds.bottom) {

	      if (this.direction !== 'vertical') {
	        var hs = Math.min(sensitivity, b.width / 3);
	        if (xy[0] > b.right - hs && dom.canScrollRight(this.el)) v[0] = Scrollable.scale(xy[0], [b.right - hs, b.right], [0, +maxV]);
	        if (xy[0] < b.left + hs && dom.canScrollLeft(this.el)) v[0] = Scrollable.scale(xy[0], [b.left + hs, b.left], [0, -maxV]);
	      }

	      if (this.direction !== 'horizontal') {
	        var vs = Math.min(sensitivity, b.height / 3);
	        if (xy[1] > b.bottom - vs && dom.canScrollDown(this.el)) v[1] = Scrollable.scale(xy[1], [b.bottom - vs, b.bottom], [0, +maxV]);
	        if (xy[1] < b.top + vs && dom.canScrollUp(this.el)) v[1] = Scrollable.scale(xy[1], [b.top + vs, b.top], [0, -maxV]);
	      }
	    }
	    this.velocity = v;
	    return this.velocity[0] !== 0 || this.velocity[1] !== 0;
	  };

	  _createClass(Scrollable, null, [{
	    key: 'selector',
	    get: function get() {
	      return '[data-drag-scrollable]';
	    }
	  }]);

	  return Scrollable;
	})();

	exports['default'] = Scrollable;
	module.exports = exports['default'];

/***/ }
/******/ ]);