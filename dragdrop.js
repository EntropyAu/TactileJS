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

	var _DraggableJs = __webpack_require__(18);

	var _DraggableJs2 = _interopRequireDefault(_DraggableJs);

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libEventsJs = __webpack_require__(16);

	var events = _interopRequireWildcard(_libEventsJs);

	var _libMathJs = __webpack_require__(15);

	var math = _interopRequireWildcard(_libMathJs);

	var defaultOptions = {
	  cancel: 'input,textarea,a,button,select,[data-drag-placeholder]',
	  helperResize: true,
	  helperCloneStyles: true,
	  pickUpAnimation: { duration: 300, easing: 'ease-in-out' },
	  pickDownAnimation: { duration: 300, easing: 'ease-in-out' },
	  resizeAnimation: { duration: 300, easing: 'ease-in-out' },
	  dropAnimation: { duration: 300, easing: 'ease-in-out' },
	  reorderAnimation: { duration: 150, easing: 'ease-in-out' },
	  pickUpDelay: 0,
	  pickUpDistance: 0,
	  helperRotation: -1,
	  helperShadowSize: 15,
	  placeholderClass: 'dd-drag-placeholder',
	  containerHoverClass: 'dd-drag-hover',
	  scrollDelay: 500,
	  scrollSensitivity: '15%',
	  scrollSpeed: 1,
	  animation: false
	};

	var DragManager = (function () {
	  function DragManager() {
	    _classCallCheck(this, DragManager);

	    this.options = defaultOptions;
	    this._pendingDrags = {};
	    this._drags = {};

	    this._onPointerDownListener = this._onPointerDown.bind(this);
	    this._onPointerMoveListener = this._onPointerMove.bind(this);
	    this._onPointerUpListener = this._onPointerUp.bind(this);
	    this._bindPointerEvents();
	  }

	  DragManager.prototype._bindPointerEvents = function _bindPointerEvents() {
	    window.addEventListener(events.pointerDownEvent, this._onPointerDownListener, true);
	  };

	  DragManager.prototype._unbindPointerEvents = function _unbindPointerEvents() {
	    window.removeEventListener(events.pointerDownEvent, this._onPointerDownListener);
	  };

	  DragManager.prototype._bindPointerEventsForDragging = function _bindPointerEventsForDragging(el) {
	    window.addEventListener(events.pointerMoveEvent, this._onPointerMoveListener, true);
	    window.addEventListener(events.pointerUpEvent, this._onPointerUpListener, false);
	    el.addEventListener(events.pointerMoveEvent, this._onPointerMoveListener, true);
	    el.addEventListener(events.pointerUpEvent, this._onPointerUpListener, false);
	  };

	  DragManager.prototype._unbindPointerEventsForDragging = function _unbindPointerEventsForDragging(el) {
	    window.removeEventListener(events.pointerMoveEvent, this._onPointerMoveListener, true);
	    window.removeEventListener(events.pointerUpEvent, this._onPointerUpListener, false);
	    el.removeEventListener(events.pointerMoveEvent, this._onPointerMoveListener, true);
	    el.removeEventListener(events.pointerUpEvent, this._onPointerUpListener, false);
	  };

	  /*******************/
	  /* EVENT LISTENERS */
	  /*******************/

	  DragManager.prototype._onPointerDown = function _onPointerDown(e) {
	    if (e.which !== 0 && e.which !== 1) return;
	    if (dom.ancestors(e.target, this.options.cancel).length > 0) return;

	    var xy = events.pointerEventXY(e);
	    var pointerId = events.pointerEventId(e);

	    var draggable = _DraggableJs2['default'].closest(e.target);
	    if (!draggable || !draggable.enabled) {
	      return false;
	    };

	    if (this.options.pickUpDelay === null || this.options.pickUpDelay === 0) {
	      events.cancelEvent(e);
	      this.startDrag(draggable, pointerId, xy);
	    } else {
	      var onpickUpTimeoutHandler = function onpickUpTimeoutHandler() {
	        this._onPickUpTimeout(pointerId);
	      };
	      this._pendingDrags[pointerId] = {
	        draggable: draggable,
	        xy: xy,
	        timerId: setTimeout(onpickUpTimeoutHandler.bind(this), this.options.pickUpDelay)
	      };
	    }
	    this._bindPointerEventsForDragging(e.target);
	  };

	  DragManager.prototype._onPickUpTimeout = function _onPickUpTimeout(pointerId) {
	    if (this._pendingDrags[pointerId]) {
	      var pendingDrag = this._pendingDrags[pointerId];
	      this.startDrag(pendingDrag.draggable, pointerId, pendingDrag.xy);
	      delete this._pendingDrags[pointerId];
	    }
	  };

	  DragManager.prototype._onPointerMove = function _onPointerMove(e) {
	    var xy = events.pointerEventXY(e);
	    var pointerId = events.pointerEventId(e);

	    if (this._drags[pointerId]) {
	      var drag = this._drags[pointerId];
	      events.cancelEvent(e);
	      drag.move(xy);
	    }
	    if (this._pendingDrags[pointerId]) {
	      var pendingDrag = this._pendingDrags[pointerId];
	      // TODO: check relative motion against the item - so flick scrolling does not trigger pick up
	      if (this.options.pickUpDistance && math.distance(pendingDrag.xy, xy) > this.options.pickUpDistance) clearTimeout(pendingDrag.timerId);
	      this.startDrag(pendingDrag.draggable, pointerId, pendingDrag.xy);
	      delete this._pendingDrags[pointerId];
	    }
	  };

	  DragManager.prototype._onPointerUp = function _onPointerUp(e) {
	    var pointerId = events.pointerEventId(e);

	    if (this._drags[pointerId]) {
	      events.cancelEvent(e);
	      this._drags[pointerId].end();
	      delete this._drags[pointerId];
	      if (Object.keys(this._drags).length == 0) {
	        document.body.removeAttribute('data-drag-in-progress');
	        this._unbindPointerEventsForDragging(e.target);
	      }
	    }
	    if (this._pendingDrags[pointerId]) {
	      clearTimeout(this._pendingDrags[pointerId].timerId);
	    }
	  };

	  DragManager.prototype.startDrag = function startDrag(draggable, pointerId, xy) {
	    dom.clearSelection();
	    document.body.setAttribute('data-drag-in-progress', '');
	    var drag = new _DragJs2['default'](draggable, xy, defaultOptions);
	    this._drags[pointerId] = drag;
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

	var _CacheJs = __webpack_require__(2);

	var _CacheJs2 = _interopRequireDefault(_CacheJs);

	var _ContainerJs = __webpack_require__(3);

	var _ContainerJs2 = _interopRequireDefault(_ContainerJs);

	var _ContainerFactoryJs = __webpack_require__(6);

	var _ContainerFactoryJs2 = _interopRequireDefault(_ContainerFactoryJs);

	var _HelperJs = __webpack_require__(12);

	var _HelperJs2 = _interopRequireDefault(_HelperJs);

	var _PlaceholderJs = __webpack_require__(8);

	var _PlaceholderJs2 = _interopRequireDefault(_PlaceholderJs);

	var _ScrollableJs = __webpack_require__(13);

	var _ScrollableJs2 = _interopRequireDefault(_ScrollableJs);

	var _FenceJs = __webpack_require__(14);

	var _FenceJs2 = _interopRequireDefault(_FenceJs);

	var _libEventsJs = __webpack_require__(16);

	var events = _interopRequireWildcard(_libEventsJs);

	var _libMathJs = __webpack_require__(15);

	var math = _interopRequireWildcard(_libMathJs);

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libRectJs = __webpack_require__(17);

	var rect = _interopRequireWildcard(_libRectJs);

	// TODO: Animated destroy (_beginDrop elsewhere)
	// TODO: Event properties
	// TODO: Fade helper when drop will cancel

	// TODO: Fix scaling behaviour
	// TODO: Scroll adjust scroll maxV based on number of items
	// TODO: Scroll trigger placeholder update when scroll stops
	// TODO: Copy behaviour

	var Drag = (function () {
	  function Drag(draggable, xy, options) {
	    _classCallCheck(this, Drag);

	    this.options = options;
	    this.xy = xy;
	    this.pointerEl = null;

	    this.draggable = draggable;
	    this.helper = new _HelperJs2['default'](this);
	    this.source = null;
	    this.target = null;
	    this.fence = null;
	    this.action = null;
	    this.copy = false;

	    this.cache = new _CacheJs2['default']();
	    this.revertPosition = 'last'; // "remove", "last"
	    this._knownTargets = new Map();
	    this._start(xy);
	  }

	  Drag.prototype._start = function _start(xy) {
	    this.pointerEl = dom.elementFromPoint(xy);
	    this._updateTarget();
	    this.source = this.target;
	    this.fence = _FenceJs2['default'].closestForDraggable(this, this.draggable);
	    events.raiseEvent(this.draggable.el, 'dragstart', this);
	  };

	  Drag.prototype.move = function move(xy) {
	    this.xy = this.fence ? this.fence.getConstrainedXY(xy) : xy;

	    if (!this.scroller || !this.scroller._updateVelocity(this.xy)) {
	      this.pointerEl = dom.elementFromPoint(this.xy);
	      this._updateTarget();
	      // check first to see if the we are in the target bounds
	      // note this would be calling for the second time.. FIX THIS
	      if (this.target && rect.contains(this.target.el.getBoundingClientRect(), this.xy)) {
	        this.target.updatePosition(this.xy);
	      }
	      this._checkForScrolling(this.xy);
	      events.raiseEvent(this.draggable.el, 'drag', this);
	    }
	    this.helper.setPosition(this.xy);
	  };

	  Drag.prototype.end = function end() {
	    if (this.target) this._beginDrop();else this._beginCancel();
	    if (this.scroller) this.scroller.stopScroll();
	    events.raiseEvent(this.draggable.el, 'dragend', this);
	  };

	  Drag.prototype.dispose = function dispose() {
	    this._knownTargets.forEach(function (t) {
	      return t.dispose();
	    });
	    this.helper.dispose();
	    this.cache.dispose();
	  };

	  Drag.prototype._checkForScrolling = function _checkForScrolling(xy) {
	    this.scroller = false;
	    var scrollEls = dom.ancestors(this.target ? this.target.el : document.body, _ScrollableJs2['default'].selector);
	    scrollEls.every((function (scrollEl) {
	      var scrollable = new _ScrollableJs2['default'](this, scrollEl);
	      if (scrollable.tryScroll(xy)) {
	        this.scroller = scrollable;
	        return false;
	      }
	      return true;
	    }).bind(this));
	  };

	  Drag.prototype._beginDrop = function _beginDrop() {
	    events.raiseEvent(this.draggable.el, 'beginDrop', this);
	    if (this.target.placeholder) {
	      this.helper.animateToElementAndPutDown(this.target.placeholder.el, (function () {
	        requestAnimationFrame((function () {
	          this.target.finalizeDrop(this.draggable);
	          this.dispose();
	        }).bind(this));
	      }).bind(this));
	    }
	  };

	  Drag.prototype._beginCancel = function _beginCancel() {
	    this.draggable.finalizeRevert();
	    // restore draggable to original position
	    this.dispose();
	  };

	  Drag.prototype._applyDirectionConstraint = function _applyDirectionConstraint(drag) {
	    switch (drag.orientation) {
	      case 'vertical':
	        adjustedX = drag.originalOffsetLeft;break;
	      case 'horizontal':
	        adjustedY = drag.originalOffsetTop;break;
	      case 'both':
	        break;
	    }
	  };

	  Drag.prototype._updateTarget = function _updateTarget() {
	    var oldTarget = this.target;
	    var newTarget = this.source && this.source.leaveAction === 'delete' ? null : this._findAcceptingTarget(this.pointerEl);
	    if (newTarget === oldTarget) return;

	    if (newTarget || this.revertPosition !== 'last') {
	      if (oldTarget) this._leaveTarget(oldTarget);
	      if (newTarget) this._enterTarget(newTarget);
	      this._computeAction();
	    }
	  };

	  Drag.prototype._findAcceptingTarget = function _findAcceptingTarget(el) {
	    var targetEl = _ContainerFactoryJs2['default'].closest(el);
	    while (targetEl) {
	      var target = this._getContainer(targetEl);
	      if (target.willAccept(this.draggable)) return target;
	      targetEl = _ContainerFactoryJs2['default'].closest(targetEl.parentElement);
	    }
	    return null;
	  };

	  Drag.prototype._getContainer = function _getContainer(el) {
	    var container = this._knownTargets.get(el);
	    if (!container) {
	      container = _ContainerFactoryJs2['default'].makeContainer(el, this);
	      this._knownTargets.set(el, container);
	    }
	    return container;
	  };

	  Drag.prototype._enterTarget = function _enterTarget(container) {
	    if (events.raiseEvent(container.el, 'dragenter', this)) {
	      container.updatePosition(this.xy);
	      container.enter();
	      if (container.placeholderSize && this.options.helperResize) {
	        this.helper.setSizeAndScale(container.placeholderSize, container.placeholderScale);
	      }
	      this.target = container;
	    }
	  };

	  // SOURCE | TARGET | ACTION | DRAGGABLE
	  // NULL   | NULL   | revert | original
	  // NULL   | move   | move   | original
	  // NULL   | copy   | copy   | copy
	  // NULL   | delete | delete | original
	  // move   | NULL   | revert | original
	  // move   | move   | move   | original
	  // move   | copy   | copy   | copy
	  // move   | delete | delete | original
	  // copy   | NULL   | delete | copy
	  // copy   | move   | copy   | copy
	  // copy   | copy   | copy   | copy
	  // copy   | delete | delete | copy
	  // delete | *      | delete | original

	  Drag.prototype._computeAction = function _computeAction(source, target) {
	    if (source === target) return ['move', 'original'];

	    var action = 'move';
	    var appliesTo = 'original';

	    var leave = this.source ? this.source.leaveAction : 'move';
	    var enter = this.target ? this.target.enterAction : 'revert';
	    if (leave === 'copy' || enter === 'copy') {
	      action = 'copy';
	      appliesTo = 'copy';
	    }
	    if (enter === 'revert') action = 'revert';
	    if (leave === 'delete' || enter === 'delete') action = 'delete';
	    return [action, appliesTo];
	  };

	  Drag.prototype.setAction = function setAction(action, appliesTo) {
	    if (this.action === action) return;
	    this.helper.setAction(action);
	    this.action = action;
	  };

	  Drag.prototype._leaveTarget = function _leaveTarget(container) {
	    if (events.raiseEvent(container.el, 'dragleave', this)) {
	      container.leave();
	      this.target = null;
	    }
	  };

	  return Drag;
	})();

	exports['default'] = Drag;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Cache = (function () {
	  function Cache() {
	    _classCallCheck(this, Cache);

	    this._cache = new WeakMap();
	    this._scrollCache = new WeakMap();
	    this.initialize();
	  }

	  Cache.prototype.initialize = function initialize() {
	    this._scrollListener = this._onScroll.bind(this);
	    document.addEventListener('scroll', this._scrollListener, false);
	  };

	  Cache.prototype.cache = function cache(el, key, fn) {
	    return this._getFromCache(this._cache, el, key, fn);
	  };

	  Cache.prototype.scrollInvalidatedCache = function scrollInvalidatedCache(el, key, fn) {
	    return this._getFromCache(this._scrollCache, el, key, fn);
	  };

	  Cache.prototype._getFromCache = function _getFromCache(cache, el, key, fn) {
	    var properties = cache.get(el);
	    if (!properties) {
	      properties = new Map();
	      cache.set(el, properties);
	    }
	    if (properties.has(key)) {
	      return properties.get(key);
	    } else {
	      var value = fn();
	      properties.set(key, value);
	      return value;
	    }
	  };

	  Cache.prototype._onScroll = function _onScroll() {
	    this._scrollCache = new WeakMap();
	  };

	  Cache.prototype.dispose = function dispose() {
	    document.removeEventListener('scroll', this._scrollListener, false);
	  };

	  return Cache;
	})();

	exports['default'] = Cache;
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libAttrJs = __webpack_require__(5);

	var attr = _interopRequireWildcard(_libAttrJs);

	var Container = (function () {
	  function Container(el, drag) {
	    _classCallCheck(this, Container);

	    this.el = el;
	    this.drag = drag;
	    this.options = drag.options;
	    this.placeholder = null;
	    this.placeholderSize = null;
	    this.placeholderScale = 1;

	    this.accepts = el.hasAttribute("data-drag-accepts") ? attr.getAttributeSet(el, "data-drag-accepts") : attr.getAttributeSet(el, "data-drag-tag");

	    this.leaveAction = attr.getAttributeWithDefaults(el, "data-drag-leave-action", "move");
	    this.enterAction = attr.getAttributeWithDefaults(el, "data-drag-enter-action", "move");
	  }

	  Container.matches = function matches(el) {
	    return el ? el.matches(this.selector) : false;
	  };

	  Container.prototype.willAccept = function willAccept(draggable) {
	    var _this = this;

	    if (this.el === draggable.originalParentEl) return true;
	    if (this.el.hasAttribute("data-drag-disabled")) return false;
	    return this.accepts.has("*") || Array.from(draggable.tags).some(function (t) {
	      return _this.accepts.has(t);
	    });
	  };

	  Container.prototype.enter = function enter() {
	    this.el.classList.add(this.options.containerHoverClass);
	  };

	  Container.prototype.leave = function leave() {
	    this.el.classList.remove(this.options.containerHoverClass);
	  };

	  Container.prototype.dispose = function dispose() {
	    this.el.classList.remove(this.options.containerHoverClass);
	  };

	  Container.prototype.updatePosition = function updatePosition(xy) {};

	  return Container;
	})();

	exports["default"] = Container;
	module.exports = exports["default"];

/***/ },
/* 4 */
/***/ function(module, exports) {

	// selectors

	'use strict';

	exports.__esModule = true;
	exports.indexOf = indexOf;
	exports.isChild = isChild;
	exports.closest = closest;
	exports.parents = parents;
	exports.copyComputedStyles = copyComputedStyles;
	exports.stripClasses = stripClasses;
	exports.getPaddingClientRect = getPaddingClientRect;
	exports.childElementArray = childElementArray;
	exports.ancestors = ancestors;
	exports.clientScale = clientScale;
	exports.outerHeight = outerHeight;
	exports.outerWidth = outerWidth;
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
	    if (el.matches && el.matches(selector)) {
	      return el;
	    }
	  } while (el = el.parentNode);
	  return null;
	}

	function parents(el, selector) {
	  var parents = [];
	  while (el = el.parentNode) {
	    if (el.matches && el.matches(selector)) {
	      parents.push(el);
	    }
	  }
	  return parents;
	}

	function copyComputedStyles(sourceEl, targetEl) {
	  targetEl.style.cssText = getComputedStyle(sourceEl).cssText;
	  Array.from(sourceEl.children).forEach(function (el, i) {
	    return copyComputedStyles(el, targetEl.children[i]);
	  });
	}

	function stripClasses(el) {
	  el.className = '';
	  Array.from(el.children).forEach(function (el) {
	    return stripClasses(el);
	  });
	}

	function getPaddingClientRect(el) {
	  var style = getComputedStyle(el);
	  var rect = el.getBoundingClientRect();
	  var l = parseInt(style.borderLeftWidth, 10);
	  var t = parseInt(style.borderTopWidth, 10);
	  var r = parseInt(style.borderRightWidth, 10);
	  var b = parseInt(style.borderBottomWidth, 10);
	  return {
	    top: rect.top + t,
	    left: rect.left + l,
	    right: rect.right - r,
	    bottom: rect.bottom - b,
	    width: rect.width - l - r,
	    height: rect.height - t - b
	  };
	}

	function childElementArray(el) {
	  var childEls = [];
	  var childNodeList = el.children;
	  for (var i = 0; i < childNodeList.length; i++) {
	    if (childNodeList.item(i).nodeType === 1) childEls.push(childNodeList.item(i));
	  }
	  return childEls;
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

	function outerHeight(el) {
	  var includeMargins = arguments[1] === undefined ? false : arguments[1];

	  if (!includeMargins) return el.offsetHeight;
	  var style = getComputedStyle(el);
	  return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
	}

	function outerWidth(el) {
	  var includeMargins = arguments[1] === undefined ? false : arguments[1];

	  if (!includeMargins) return el.offsetWidth;
	  var style = getComputedStyle(el);
	  return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
	}

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

	function translate(el, _ref) {
	  var x = _ref[0];
	  var y = _ref[1];

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

	function topLeft(el, _ref2) {
	  var l = _ref2[0];
	  var t = _ref2[1];

	  el.style.top = t + 'px';
	  el.style.left = l + 'px';
	}

	function transformOrigin(el, _ref3) {
	  var l = _ref3[0];
	  var t = _ref3[1];

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
/* 5 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.getAttributeWithDefaults = getAttributeWithDefaults;
	exports.getAttributeSetWithDefaults = getAttributeSetWithDefaults;
	exports.getAttributeSet = getAttributeSet;
	exports.overrideOptions = overrideOptions;

	function getAttributeWithDefaults(element, attributeName) {
	  var defaultIfPresent = arguments[2] === undefined ? '' : arguments[2];
	  var defaultIfNotPresent = arguments[3] === undefined ? null : arguments[3];

	  if (element.hasAttribute(attributeName)) {
	    return element.getAttribute(attributeName) || defaultIfPresent;
	  } else {
	    return defaultIfNotPresent;
	  }
	}

	function getAttributeSetWithDefaults(element, attributeName, defaultIfPresent, defaultIfNotPresent) {
	  if (element.hasAttribute(attributeName)) {
	    var attributeValue = element.getAttribute(attributeName);
	    if (attributeValue && attributeValue.length > 0) {
	      return new Set(attributeValue.split(/[\ ,]/g));
	    } else {
	      return new Set(defaultIfPresent);
	    }
	  } else {
	    return new Set(defaultIfNotPresent);
	  }
	}

	function getAttributeSet(element, attributeName) {
	  return getAttributeSetWithDefaults(element, attributeName, [], []);
	}

	function overrideOptions(el) {
	  for (var _iterator = el.attributes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	    var _ref;

	    if (_isArray) {
	      if (_i >= _iterator.length) break;
	      _ref = _iterator[_i++];
	    } else {
	      _i = _iterator.next();
	      if (_i.done) break;
	      _ref = _i.value;
	    }

	    var option = _ref;
	  }
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _CanvasJs = __webpack_require__(7);

	var _CanvasJs2 = _interopRequireDefault(_CanvasJs);

	var _DroppableJs = __webpack_require__(10);

	var _DroppableJs2 = _interopRequireDefault(_DroppableJs);

	var _SortableJs = __webpack_require__(11);

	var _SortableJs2 = _interopRequireDefault(_SortableJs);

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var containerSelector = '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]';
	var placeholderSelector = '[data-drag-placeholder]';

	var ContainerFactory = (function () {
	  function ContainerFactory() {
	    _classCallCheck(this, ContainerFactory);
	  }

	  ContainerFactory.closest = function closest(el) {
	    el = dom.closest(el, containerSelector);
	    while (el && dom.closest(el, placeholderSelector)) el = dom.closest(el.parentElement, containerSelector);
	    return el;
	  };

	  ContainerFactory.makeContainer = function makeContainer(el, drag) {
	    if (_CanvasJs2['default'].matches(el)) return new _CanvasJs2['default'](el, drag);
	    if (_DroppableJs2['default'].matches(el)) return new _DroppableJs2['default'](el, drag);
	    if (_SortableJs2['default'].matches(el)) return new _SortableJs2['default'](el, drag);
	    return null;
	  };

	  return ContainerFactory;
	})();

	exports['default'] = ContainerFactory;
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _ContainerJs = __webpack_require__(3);

	var _ContainerJs2 = _interopRequireDefault(_ContainerJs);

	var _PlaceholderJs = __webpack_require__(8);

	var _PlaceholderJs2 = _interopRequireDefault(_PlaceholderJs);

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libAttrJs = __webpack_require__(5);

	var attr = _interopRequireWildcard(_libAttrJs);

	var Canvas = (function (_Container) {
	  function Canvas(el, drag) {
	    _classCallCheck(this, Canvas);

	    _Container.call(this, el, drag);
	    this._drag = drag;
	    this._offset = [0, 0];
	    this._grid = null;
	    this._initializeGrid();
	    this._insertPlaceholder();
	  }

	  _inherits(Canvas, _Container);

	  Canvas.prototype._initializeGrid = function _initializeGrid() {
	    var gridAttribute = attr.getAttributeWithDefaults(this.el, "data-drag-grid", "10,10", "1,1");
	    var tokens = gridAttribute.split(",");
	    this._grid = [parseInt(tokens[0], 10) || 1, parseInt(tokens[1], 10) || parseInt(tokens[0], 10) || 1];
	  };

	  // TODO pass originalEl

	  Canvas.prototype._insertPlaceholder = function _insertPlaceholder(originalEl) {
	    this.placeholder = new _PlaceholderJs2["default"](this.drag, originalEl);
	    this.placeholder.el.style.position = "absolute";
	    this.placeholder.el.style.top = "0";
	    this.placeholder.el.style.left = "0";
	    if (!originalEl) {
	      this.el.appendChild(this.placeholder.el);
	    }
	    this.placeholder.setState("hidden");
	  };

	  Canvas.prototype.updatePosition = function updatePosition(xy) {
	    var _this = this;

	    _Container.prototype.updatePosition.call(this, xy);
	    var rect = this._drag.cache.scrollInvalidatedCache(this.el, "cr", function () {
	      return _this.el.getBoundingClientRect();
	    });
	    var sl = this._drag.cache.scrollInvalidatedCache(this.el, "sl", function () {
	      return _this.el.scrollLeft;
	    });
	    var st = this._drag.cache.scrollInvalidatedCache(this.el, "st", function () {
	      return _this.el.scrollTop;
	    });
	    var l = xy[0] - rect.left + sl - this.drag.helper.grip[0] * this.drag.helper.size[0],
	        t = xy[1] - rect.top + st - this.drag.helper.grip[1] * this.drag.helper.size[1];
	    t = Math.round((t - rect.top) / this._grid[1]) * this._grid[1] + rect.top;
	    l = Math.round((l - rect.left) / this._grid[0]) * this._grid[0] + rect.left;
	    this._offset = [l, t];
	    dom.translate(this.placeholder.el, this._offset);
	  };

	  Canvas.prototype.enter = function enter() {
	    _Container.prototype.enter.call(this);
	    this.placeholder.setState("ghosted");
	    this.placeholderSize = this.placeholder.size;
	    this.placeholderScale = this.placeholder.scale;
	  };

	  Canvas.prototype.leave = function leave() {
	    _Container.prototype.leave.call(this);
	    if (this.leaveAction === "copy" && this.placeholder.isOriginal) {
	      this.placeholder.setState("materialized");
	    } else {
	      this.placeholder.setState("hidden");
	    }
	  };

	  Canvas.prototype.finalizeDrop = function finalizeDrop(draggable) {
	    this.placeholder.dispose();
	    dom.topLeft(draggable.el, this._offset);
	    this.el.appendChild(draggable.el);
	  };

	  _createClass(Canvas, null, [{
	    key: "selector",
	    get: function get() {
	      return "[data-drag-canvas]";
	    }
	  }]);

	  return Canvas;
	})(_ContainerJs2["default"]);

	exports["default"] = Canvas;
	module.exports = exports["default"];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libAnimationJs = __webpack_require__(9);

	var animation = _interopRequireWildcard(_libAnimationJs);

	var Placeholder = (function () {
	  function Placeholder(drag) {
	    var draggableEl = arguments[1] === undefined ? null : arguments[1];

	    _classCallCheck(this, Placeholder);

	    this.drag = drag;
	    this.isDraggableEl = !!draggableEl;
	    this.el = draggableEl;
	    this.state = 'none';
	    this.initialize();
	  }

	  Placeholder.closest = function closest(el) {
	    return dom.closest(el, '[data-drag-placeholder]');
	  };

	  Placeholder.prototype.setState = function setState(state) {
	    var animate = arguments[1] === undefined ? true : arguments[1];

	    if (this.state === state) return;
	    var velocityOptions = animate ? { duration: 200, queue: false } : { duration: 0, queue: false };
	    switch (state) {
	      case 'hidden':
	        this._hide();break;
	      case 'ghosted':
	        this._show();animation.set(this.el, { opacity: 0.1 }, velocityOptions);break;
	      case 'materialized':
	        this._show();animation.set(this.el, { opacity: 1.0 }, velocityOptions);break;
	    }
	    this.state = state;
	  };

	  Placeholder.prototype._hide = function _hide() {
	    this.el.style.visibility = 'hidden';
	  };

	  Placeholder.prototype._show = function _show() {
	    this.el.style.visibility = '';
	  };

	  Placeholder.prototype.initialize = function initialize(draggable) {
	    if (!this.isDraggableEl) {
	      this.el = this.drag.draggable.el.cloneNode(true);
	      this.el.removeAttribute('id');
	    }
	    this.el.classList.add(this.drag.options.placeholderClass);
	    this.el.setAttribute('data-drag-placeholder', '');
	    this.setState('ghosted', false);
	  };

	  Placeholder.prototype.dispose = function dispose() {
	    switch (this.state) {
	      case 'hidden':
	        this.el.remove();
	        this.el = null;
	        break;
	      case 'ghosted':
	      case 'materialized':
	        // restore the original draggable element settings
	        this.el.removeAttribute('data-drag-placeholder');
	        this.el.classList.remove('dd-drag-placeholder');
	        this.el.style.webkitTransform = '';
	        this.el.style.mozTransform = '';
	        this.el.style.msTransform = '';
	        this.el.style.transform = '';
	        this.el.style.visibility = '';
	        this.el.style.opacity = '';
	        break;
	    }
	  };

	  _createClass(Placeholder, [{
	    key: 'size',
	    get: function get() {
	      return [this.el.offsetWidth, this.el.offsetHeight];
	    }
	  }, {
	    key: 'outerSize',
	    get: function get() {
	      return [dom.outerWidth(this.el, true), dom.outerHeight(this.el, true)];
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
/* 9 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports.set = set;
	exports.stop = stop;
	exports.animateDomMutation = animateDomMutation;
	function unwrapVelocityPropertyValue(value) {
	  return Array.isArray(value) ? value[0] : value;
	}

	function applyStyleProperties(el, properties) {
	  var cssProperties = {
	    "top": "px",
	    "left": "px",
	    "opacity": "",
	    "width": "px",
	    "height": "px"
	  };

	  for (var property in properties) {
	    if (cssProperties[property]) {
	      var value = unwrapVelocityPropertyValue(properties[property]);
	      el.style[property] = value + cssProperties[property];
	    }
	  }
	}

	function applyTransformProperties(el, properties) {
	  var transformProperties = {
	    "translateX": "px",
	    "translateY": "px",
	    "scaleX": "",
	    "scaleY": "",
	    "rotateZ": "deg"
	  };

	  // follow the same transform order as Velocity.js to ensure consistent results
	  var transformOrder = ["translateX", "translateY", "scaleX", "scaleY", "rotateZ"];

	  // cache the transform values on the element. This avoids us having
	  // to parse the transform string when we do a partial update
	  var transformHash = el.__tactile_transform || {};
	  for (var property in properties) {
	    if (transformProperties[property]) {
	      var _value = unwrapVelocityPropertyValue(properties[property]);
	      transformHash[property] = _value + transformProperties[property];
	    }
	  }

	  // build the transform string
	  var transformValues = [];
	  transformOrder.forEach(function (property) {
	    if (transformHash[property]) {
	      transformValues.push(property + "(" + transformHash[property] + ")");
	    }
	  });
	  var value = transformValues.join(" ");

	  el.__tactile_transform = transformHash;
	  if (el.style.webkitTransform !== undefined) el.style.webkitTransform = value;
	  if (el.style.mozTransform !== undefined) el.style.mozTransform = value;
	  if (el.style.msTransform !== undefined) el.style.msTransform = value;
	  if (el.style.transform !== undefined) el.style.transform = value;
	}

	function set(el, target) {
	  var options = arguments[2] === undefined ? { duration: 0 } : arguments[2];
	  var complete = arguments[3] === undefined ? null : arguments[3];

	  if (window["Velocity"]) {
	    options.complete = complete;
	    options.queue = false;
	    Velocity(el, target, options);
	  } else {
	    applyStyleProperties(el, target);
	    applyTransformProperties(el, target);
	    if (complete) complete();
	  }
	}

	function stop(el) {
	  if (window["Velocity"]) {
	    Velocity(el, "stop");
	  }
	}

	function animateDomMutation(el, mutationFunction, options) {
	  var startIndex = options.startIndex || 0;
	  var endIndex = Math.min(options.endIndex || el.children.length + 1, startIndex + options.elementLimit);
	  var easing = options.easing || "ease-in-out";
	  var duration = options.duration || 400;
	  var originalStyleHeight = null,
	      originalStyleWidth = null,
	      oldSize = null,
	      newSize = null;

	  var oldOffsets = childOffsetMap(el, startIndex, endIndex);
	  if (options.animateParentSize) {
	    originalStyleHeight = "";
	    originalStyleWidth = "";
	    el.style.width = "";
	    el.style.height = "";
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
	      translateX: "+=" + (oldOffset[0] - newOffset[0]) + "px",
	      translateY: "+=" + (oldOffset[1] - newOffset[1]) + "px",
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _ContainerJs = __webpack_require__(3);

	var _ContainerJs2 = _interopRequireDefault(_ContainerJs);

	var Droppable = (function (_Container) {
	  function Droppable(el, drag) {
	    _classCallCheck(this, Droppable);

	    _Container.call(this, el, drag);
	  }

	  _inherits(Droppable, _Container);

	  Droppable.prototype.updatePosition = function updatePosition(xy) {};

	  Droppable.prototype.finalizeDrop = function finalizeDrop(draggable) {};

	  _createClass(Droppable, null, [{
	    key: "selector",
	    get: function get() {
	      return "[data-drag-droppable]";
	    }
	  }]);

	  return Droppable;
	})(_ContainerJs2["default"]);

	exports["default"] = Droppable;
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

	var _ContainerJs = __webpack_require__(3);

	var _ContainerJs2 = _interopRequireDefault(_ContainerJs);

	var _PlaceholderJs = __webpack_require__(8);

	var _PlaceholderJs2 = _interopRequireDefault(_PlaceholderJs);

	var _libAnimationJs = __webpack_require__(9);

	var animation = _interopRequireWildcard(_libAnimationJs);

	var _libAttrJs = __webpack_require__(5);

	var attr = _interopRequireWildcard(_libAttrJs);

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var Sortable = (function (_Container) {
	  function Sortable(el, drag) {
	    _classCallCheck(this, Sortable);

	    _Container.call(this, el, drag);
	    this._index = null;
	    this._drag = drag;
	    this._direction = null;
	    this._directionProperties = null;
	    this._childEls = null;
	    this._siblingEls = null;
	    this._childMeasures = new WeakMap();
	    this._style = getComputedStyle(this.el);
	    this._forceFeedRequired = true;

	    this._initializeDirection();
	    this._initializePlaceholder();
	    this._initializeChildAndSiblingEls();
	  }

	  _inherits(Sortable, _Container);

	  Sortable.prototype._initializeDirection = function _initializeDirection() {
	    this._direction = this.el.getAttribute("data-drag-sortable") || "vertical";
	    this._directionProperties = this._direction === "vertical" ? {
	      index: 1,
	      translate: "translateY",
	      paddingStart: "paddingTop",
	      endMargin: "marginBottom",
	      layoutOffset: "offsetTop",
	      outerDimension: "outerHeight"
	    } : {
	      index: 0,
	      translate: "translateX",
	      paddingStart: "paddingLeft",
	      endMargin: "marginRight",
	      layoutOffset: "offsetLeft",
	      outerDimension: "outerWidth"
	    };
	  };

	  Sortable.prototype._initializePlaceholder = function _initializePlaceholder() {
	    if (this._drag.draggable.originalParentEl === this.el) {
	      this.placeholder = new _PlaceholderJs2["default"](this._drag, this._drag.draggable.el);
	    } else {
	      this.placeholder = new _PlaceholderJs2["default"](this._drag);
	      this.el.appendChild(this.placeholder.el);
	    }
	    this.placeholder.setState("hidden");
	    this._addNegativeMarginToLastChild();
	  };

	  Sortable.prototype._initializeChildAndSiblingEls = function _initializeChildAndSiblingEls() {
	    this._childEls = dom.childElementArray(this.el);
	    this._siblingEls = this._childEls.slice(0);
	    var placeholderElIndex = this._childEls.indexOf(this.placeholder.el);
	    if (placeholderElIndex !== -1) {
	      this._siblingEls.splice(placeholderElIndex, 1);
	    }
	  };

	  Sortable.prototype.enter = function enter() {
	    _Container.prototype.enter.call(this);
	    this.placeholder.setState("ghosted");
	    this.placeholderSize = this.placeholder.size;
	    this.placeholderScale = this.placeholder.scale;
	    this._removeNegativeMarginFromLastChild();
	    this._childMeasures = new WeakMap();
	  };

	  Sortable.prototype.leave = function leave() {
	    _Container.prototype.leave.call(this);
	    if (this.leaveAction === "copy" && this.placeholder.isDraggableEl) {
	      this.placeholder.setState("materialized");
	    } else {
	      this._index = null;
	      this._forceFeedRequired = true;
	      this._childMeasures = new WeakMap();
	      this.placeholder.setState("hidden");
	      this._addNegativeMarginToLastChild();
	      this._updateChildTranslations();
	    }
	  };

	  Sortable.prototype._addNegativeMarginToLastChild = function _addNegativeMarginToLastChild() {
	    if (this.el.children.length === 0) return;
	    var lastChildEl = this.el.children[this.el.children.length - 1];
	    var lastChildStyle = getComputedStyle(lastChildEl);
	    var newMargin = parseInt(lastChildStyle[this._directionProperties.endMargin], 10) - this.placeholder.outerSize[this._directionProperties.index];
	    lastChildEl.style[this._directionProperties.endMargin] = newMargin + "px";
	  };

	  Sortable.prototype._removeNegativeMarginFromLastChild = function _removeNegativeMarginFromLastChild() {
	    if (this.el.children.length === 0) return;
	    var lastChildEl = this.el.children[this.el.children.length - 1];
	    lastChildEl.style[this._directionProperties.endMargin] = "";
	  };

	  Sortable.prototype.finalizeDrop = function finalizeDrop(draggable) {
	    this._clearChildTranslations();
	    this.el.insertBefore(this.placeholder.el, this._siblingEls[this._index]);
	    this.placeholder.dispose(this._drag.action === "copy");
	    this.placeholder = null;
	  };

	  Sortable.prototype._getChildMeasure = function _getChildMeasure(el) {
	    var measure = this._childMeasures.get(el);
	    if (!measure) {
	      measure = {
	        offset: el[this._directionProperties.layoutOffset] - parseInt(this._style[this._directionProperties.paddingStart], 10),
	        measure: dom[this._directionProperties.outerDimension](el, true),
	        translation: null
	      };
	      this._childMeasures.set(el, measure);
	    }
	    return measure;
	  };

	  Sortable.prototype.updatePosition = function updatePosition(xy) {
	    var _this = this;

	    _Container.prototype.updatePosition.call(this, xy);
	    // if it's empty, answer is simple
	    if (this._siblingEls.length === 0) {
	      if (this._index !== 0) {
	        this._index = 0;
	        this._updateChildTranslations();
	      }
	      return;
	    }

	    var bounds = this._drag.cache.scrollInvalidatedCache(this.el, "cr", function () {
	      return _this.el.getBoundingClientRect();
	    });
	    var sl = this._drag.cache.scrollInvalidatedCache(this.el, "sl", function () {
	      return _this.el.scrollLeft;
	    });
	    var st = this._drag.cache.scrollInvalidatedCache(this.el, "st", function () {
	      return _this.el.scrollTop;
	    });
	    // calculate the position of the item relative to this container
	    var innerXY = [xy[0] - bounds.left + sl - parseInt(this._style.paddingLeft, 10), xy[1] - bounds.top + st - parseInt(this._style.paddingTop, 10)];
	    var adjustedXY = [innerXY[0] - this._drag.helper.grip[0] * this._drag.helper.size[0], innerXY[1] - this._drag.helper.grip[1] * this._drag.helper.size[1]];

	    var naturalOffset = 0;
	    var newIndex = 0;
	    do {
	      var measure = this._getChildMeasure(this._siblingEls[newIndex]);
	      if (adjustedXY[this._directionProperties.index] < naturalOffset + measure.measure / 2) break;
	      naturalOffset += measure.measure;
	      newIndex++;
	    } while (newIndex < this._siblingEls.length);

	    if (this._index !== newIndex) {
	      this._index = newIndex;
	      this._updateChildTranslations();
	    }
	  };

	  Sortable.prototype._updateChildTranslations = function _updateChildTranslations() {
	    var offset = 0;
	    var placeholderOffset = null;

	    this._siblingEls.forEach((function (el, index) {
	      if (index === this._index) {
	        placeholderOffset = offset;
	        offset += this.placeholder.outerSize[this._directionProperties.index];
	      }
	      var measure = this._getChildMeasure(el);
	      var newTranslation = offset - measure.offset;
	      if (measure.translation !== newTranslation || this._forceFeedRequired) {
	        var _ref, _ref2;

	        measure.translation = newTranslation;
	        var props = this._forceFeedRequired ? (_ref = {}, _ref[this._directionProperties.translate] = [measure.translation, Math.random() / 100], _ref) : (_ref2 = {}, _ref2[this._directionProperties.translate] = measure.translation + Math.random() / 100, _ref2);
	        animation.set(el, props, this._drag.options.reorderAnimation);
	      }
	      offset += measure.measure;
	    }).bind(this));

	    if (placeholderOffset === null) placeholderOffset = offset;
	    var placeholderMeasure = this._getChildMeasure(this.placeholder.el);
	    var newPlaceholderTranslation = placeholderOffset - placeholderMeasure.offset;
	    if (placeholderMeasure.translation !== newPlaceholderTranslation || this._forceFeedRequired) {
	      var _animation$set;

	      animation.set(this.placeholder.el, (_animation$set = {}, _animation$set[this._directionProperties.translate] = newPlaceholderTranslation, _animation$set));
	      placeholderMeasure.translation = newPlaceholderTranslation;
	    }
	    this._forceFeedRequired = false;
	  };

	  Sortable.prototype._clearChildTranslations = function _clearChildTranslations() {
	    // synchronously clear the transform styles (rather than calling
	    // velocity.js) to avoid flickering when the dom elements are reordered
	    this._siblingEls.forEach(function (el) {
	      animation.stop(el);
	      el.setAttribute("style", "");
	    });
	    this._forceFeedRequired = true;
	  };

	  Sortable.prototype.dispose = function dispose() {
	    this._clearChildTranslations();
	    if (this.placeholder) this.placeholder.dispose();
	    _Container.prototype.dispose.call(this);
	  };

	  _createClass(Sortable, null, [{
	    key: "selector",
	    get: function get() {
	      return "[data-drag-sortable]";
	    }
	  }]);

	  return Sortable;
	})(_ContainerJs2["default"]);

	exports["default"] = Sortable;
	module.exports = exports["default"];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libAnimationJs = __webpack_require__(9);

	var animation = _interopRequireWildcard(_libAnimationJs);

	var Helper = (function () {
	  function Helper(drag) {
	    _classCallCheck(this, Helper);

	    this.options = drag.options;
	    this._drag = drag;
	    this._el = null;
	    this.grip = null;
	    this.size = [0, 0];
	    this.scale = [1, 1];
	    this._position = [0, 0];
	    this._initialize();
	  }

	  Helper.prototype._initialize = function _initialize() {
	    this._el = this._drag.draggable.el.cloneNode(true);
	    this._el.removeAttribute("id");
	    this._el.setAttribute("data-drag-helper", "");

	    var s = this._el.style;
	    if (this.options.helperCloneStyles) {
	      dom.copyComputedStyles(this._drag.draggable.el, this._el);
	      dom.stripClasses(this._el);
	      s.setProperty("position", "fixed", "important");
	      s.setProperty("display", "block", "important");
	      s.setProperty("zIndex", "100000", "important");
	      s.top = "";
	      s.left = "";
	      s.webkitTransform = "";
	      s.mozTransform = "";
	      s.msTransform = "";
	      s.transform = "";
	      s.webkitTransition = "";
	      s.mozTransition = "";
	      s.msTransition = "";
	      s.transition = "";
	      s.boxShadow = "";
	    };

	    // any existing transitions may screw up velocity"s work
	    // TODO: deal with iOS where a 10ms transition makes movement smoother
	    s.webkitTransition = "none";
	    s.mozTransition = "none";
	    s.msTransition = "none";
	    s.transition = "none";
	    s.margin = "0";

	    var rect = this._drag.draggable.el.getBoundingClientRect();
	    this.grip = [(this._drag.xy[0] - rect.left) / rect.width, (this._drag.xy[1] - rect.top) / rect.height];

	    // set the layout offset and translation synchronously to avoid flickering
	    // velocityJS will update these values asynchronously.
	    dom.topLeft(this._el, [-this.grip[0] * this.size[0], -this.grip[1] * this.size[1]]);
	    dom.translate(this._el, this._drag.xy);
	    document.body.appendChild(this._el);

	    this._offsetGrip();
	    this.setPosition(this._drag.xy);
	    this.setSizeAndScale(this._drag.draggable.originalSize, this._drag.draggable.originalScale, false);
	    this._el.focus();
	    this._pickUp();
	  };

	  Helper.prototype.setAction = function setAction(action) {
	    var opacity = 1;
	    switch (action) {
	      case "revert":
	        opacity = 0.50;break;
	      case "delete":
	        opacity = 0.25;break;
	    }
	    animation.set(this._el, { opacity: opacity }, { duration: 200 });
	  };

	  Helper.prototype.setPosition = function setPosition(positionXY) {
	    if (this._position[0] === positionXY[0] && this._position[1] === positionXY[1]) return;
	    animation.set(this._el, {
	      translateX: positionXY[0],
	      translateY: positionXY[1]
	    });
	    this._position = positionXY;
	  };

	  Helper.prototype.setSizeAndScale = function setSizeAndScale(size, scale) {
	    var animate = arguments[2] === undefined ? true : arguments[2];

	    if (this.size[0] === size[0] && this.size[1] === size[1] && this.scale[0] === scale[0] && this.scale[1] === scale[1]) return;

	    animation.set(this._el, {
	      width: size[0],
	      height: size[1],
	      left: -this.grip[0] * size[0],
	      top: -this.grip[1] * size[1],
	      scaleX: scale[0],
	      scaleY: scale[1]
	    }, animate ? this.options.resizeAnimation : undefined);

	    this.size = size;
	    this.scale = scale;
	  };

	  Helper.prototype.animateToElementAndPutDown = function animateToElementAndPutDown(el, complete) {
	    animation.stop(this._el);

	    var rect = el.getBoundingClientRect();
	    // prevent velocity from immediately applying the new value, when the
	    // new and old values are equal. This causes flickering in some
	    // circumstances
	    var minimalDelta = 0.0001;
	    animation.set(this._el, {
	      rotateZ: 0,
	      boxShadowBlur: 0,
	      top: [0, 0 + minimalDelta],
	      left: [0, 0 + minimalDelta],
	      translateX: [rect.left, this._position[0] - this.grip[0] * el.offsetWidth + minimalDelta],
	      translateY: [rect.top, this._position[1] - this.grip[1] * el.offsetHeight + minimalDelta],
	      width: el.offsetWidth,
	      height: el.offsetHeight
	    }, this.options.dropAnimation, complete);
	  };

	  Helper.prototype.dispose = function dispose() {
	    this._el.remove();
	  };

	  Helper.prototype._pickUp = function _pickUp() {
	    animation.set(this._el, {
	      rotateZ: [this.options.helperRotation, 0],
	      boxShadowBlur: this.options.helperShadowSize
	    }, this.options.pickUpAnimation);
	  };

	  Helper.prototype._offsetGrip = function _offsetGrip() {
	    animation.set(this._el, {
	      left: -this.grip[0] * this.size[0],
	      top: -this.grip[1] * this.size[1]
	    });
	  };

	  return Helper;
	})();

	exports["default"] = Helper;
	module.exports = exports["default"];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var rect = _interopRequireWildcard(_libDomJs);

	var Scrollable = (function () {
	  function Scrollable(drag, el) {
	    _classCallCheck(this, Scrollable);

	    this.el = el;
	    this._drag = drag;
	    this.options = drag.options;
	    this._bounds = null;
	    this._offset = null;
	    this._velocity = [0, 0];
	    this._hEnabled = false;
	    this._vEnabled = false;
	    this._hSensitivity = 0;
	    this._vSensitivity = 0;
	    this._requestId = null;
	    this._lastUpdate = null;

	    this._initializeDirections();
	    this._initializeBounds();
	    this._initializeSensitivity();
	  }

	  Scrollable.closest = function closest(el) {
	    return dom.closest(el, this.selector);
	  };

	  Scrollable.scale = function scale(v, d, r) {
	    return (v - d[0]) / (d[1] - d[0]) * (r[1] - r[0]) + r[0];
	  };

	  Scrollable.prototype._initializeDirections = function _initializeDirections() {
	    var style = getComputedStyle(this.el);
	    this._hEnabled = style.overflowX === "auto" || style.overflowX === "scroll";
	    this._vEnabled = style.overflowY === "auto" || style.overflowY === "scroll";
	  };

	  Scrollable.prototype._initializeBounds = function _initializeBounds() {
	    if (this.el.tagName === "BODY") {
	      var w = document.documentElement.clientWidth;
	      var h = document.documentElement.clientHeight;
	      this._bounds = { left: 0, top: 0, width: w, height: h, right: w, bottom: h };
	    } else {
	      this._bounds = this.el.getBoundingClientRect();
	    }
	  };

	  Scrollable.prototype._initializeSensitivity = function _initializeSensitivity() {
	    var sensitivity = this.options.scrollSensitivity;
	    var percent = sensitivity.toString().indexOf("%") !== -1 ? parseInt(sensitivity, 10) / 100 : null;
	    this._hSensitivity = Math.min(percent ? percent * this._bounds.width : parseInt(sensitivity, 10), this._bounds.width / 3);
	    this._vSensitivity = Math.min(percent ? percent * this._bounds.height : parseInt(sensitivity, 10), this._bounds.height / 3);
	  };

	  Scrollable.prototype.tryScroll = function tryScroll(xy) {
	    this._updateVelocity(xy);
	    if (this._velocity[0] !== 0 || this._velocity[1] !== 0) {
	      this._offset = [this.el.scrollLeft, this.el.scrollTop];
	      this._requestId = requestAnimationFrame(this.continueScroll.bind(this));
	      return true;
	    }
	    return false;
	  };

	  Scrollable.prototype.continueScroll = function continueScroll() {
	    this._requestId = null;
	    // calculate the amount we want to scroll
	    var currentUpdate = new Date();
	    var elapsedTimeMs = this._lastUpdate ? currentUpdate - this._lastUpdate : 16;
	    this._offset = [this._offset[0] + this._velocity[0] * elapsedTimeMs, this._offset[1] + this._velocity[1] * elapsedTimeMs];

	    // scroll the scrollable
	    if (this._velocity[0] !== 0) this.el.scrollLeft = this._offset[0];
	    if (this._velocity[1] !== 0) this.el.scrollTop = this._offset[1];
	    this._lastUpdate = currentUpdate;

	    // schedule the next scroll update
	    if (this._velocity[0] !== 0 || this._velocity[1] !== 0) this._requestId = requestAnimationFrame(this.continueScroll.bind(this));
	  };

	  Scrollable.prototype.stopScroll = function stopScroll() {
	    cancelAnimationFrame(this._requestId);
	    this._requestId = null;
	    this._lastUpdate = null;
	  };

	  Scrollable.prototype._updateVelocity = function _updateVelocity(xy) {
	    var maxV = this.options.scrollSpeed;
	    var b = this._bounds;

	    var v = [0, 0];
	    if (rect.contains(b, xy)) {
	      if (this._hEnabled) {
	        if (xy[0] > b.right - this._hSensitivity && dom.canScrollRight(this.el)) v[0] = Scrollable.scale(xy[0], [b.right - this._hSensitivity, b.right], [0, +maxV]);
	        if (xy[0] < b.left + this._hSensitivity && dom.canScrollLeft(this.el)) v[0] = Scrollable.scale(xy[0], [b.left + this._hSensitivity, b.left], [0, -maxV]);
	      }
	      if (this._vEnabled) {
	        if (xy[1] > b.bottom - this._vSensitivity && dom.canScrollDown(this.el)) v[1] = Scrollable.scale(xy[1], [b.bottom - this._vSensitivity, b.bottom], [0, +maxV]);
	        if (xy[1] < b.top + this._vSensitivity && dom.canScrollUp(this.el)) v[1] = Scrollable.scale(xy[1], [b.top + this._vSensitivity, b.top], [0, -maxV]);
	      }
	    }
	    this._velocity = v;
	    return this._velocity[0] !== 0 || this._velocity[1] !== 0;
	  };

	  _createClass(Scrollable, null, [{
	    key: "selector",
	    get: function get() {
	      return "[data-drag-scrollable]";
	    }
	  }]);

	  return Scrollable;
	})();

	exports["default"] = Scrollable;
	module.exports = exports["default"];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libAttrJs = __webpack_require__(5);

	var attr = _interopRequireWildcard(_libAttrJs);

	var _libMathJs = __webpack_require__(15);

	var math = _interopRequireWildcard(_libMathJs);

	var attribute = "data-drag-fence";
	var selector = "[data-drag-fence]";

	var Fence = (function () {
	  function Fence(el, drag) {
	    _classCallCheck(this, Fence);

	    this.el = el;
	    this._drag = drag;
	    this._tags = attr.getAttributeSetWithDefaults(el, attribute, ["*"]);
	  }

	  Fence.closestForDraggable = function closestForDraggable(drag, draggable) {
	    var el = draggable.el;
	    while (el = dom.closest(el.parentElement, selector)) {
	      var candidateFence = new Fence(el, drag);
	      if (candidateFence.willConstrain(draggable)) {
	        return candidateFence;
	      }
	    }
	    return null;
	  };

	  Fence.prototype.willConstrain = function willConstrain(draggable) {
	    var _this = this;

	    return this._tags.has("*") || Array.from(draggable.tags).some(function (t) {
	      return _this._tags.has(t);
	    });
	  };

	  Fence.prototype.getConstrainedXY = function getConstrainedXY(xy) {
	    var _this2 = this;

	    var grip = this._drag.helper.grip;
	    var size = this._drag.helper.size;

	    // adjust for helper grip offset
	    var tl = [xy[0] - grip[0] * size[0], xy[1] - grip[1] * size[1]];

	    // coerce the top-left coordinates to fit within the fence element bounds
	    var rect = this._drag.cache.scrollInvalidatedCache(this.el, "pr", function () {
	      return dom.getPaddingClientRect(_this2.el);
	    });
	    tl[0] = math.coerce(tl[0], rect.left, rect.right - size[0]);
	    tl[1] = math.coerce(tl[1], rect.top, rect.bottom - size[1]);

	    // return the coerced values, restoring the helper grip offset
	    return [tl[0] + grip[0] * size[0], tl[1] + grip[1] * size[1]];
	  };

	  return Fence;
	})();

	exports["default"] = Fence;
	module.exports = exports["default"];

/***/ },
/* 15 */
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

	function midpointTop(rect) {
	  return rect.top + rect.height / 2;
	}

	function midpointLeft(rect) {
	  return rect.left + rect.width / 2;
	}

	function distance(p1, p2) {
	  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
	}

/***/ },
/* 16 */
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
	  return !event.defaultPrevented;
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
/* 17 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports.contains = contains;

	function contains(rect, xy) {
	  return xy[0] >= rect.left && xy[0] <= rect.right && xy[1] >= rect.top && xy[1] <= rect.bottom;
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _libDomJs = __webpack_require__(4);

	var dom = _interopRequireWildcard(_libDomJs);

	var _libAttrJs = __webpack_require__(5);

	var attr = _interopRequireWildcard(_libAttrJs);

	var handleSelector = "[data-drag-handle]";
	var draggableSelector = "[data-drag-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *";
	var handleOrDraggableSelector = handleSelector + "," + draggableSelector;

	var Draggable = (function () {
	  function Draggable(el) {
	    _classCallCheck(this, Draggable);

	    this.el = el;
	    this.originalParentEl = el.parentElement;
	    this.originalIndex = dom.indexOf(el);
	    this.originalSize = [this.el.offsetWidth, this.el.offsetHeight];
	    this.originalOffset = [this.el.offsetLeft, this.el.offsetTop];
	    this.originalScale = dom.clientScale(el);
	    this.tags = el.hasAttribute("data-drag-tag") ? attr.getAttributeSet(el, "data-drag-tag") : attr.getAttributeSet(el.parentElement, "data-drag-tag");
	  }

	  Draggable.closest = function closest(el) {
	    el = dom.closest(el, handleOrDraggableSelector);
	    if (!el) return null;

	    // if the pointer is over a handle element, ascend the DOM to find the
	    // associated draggable item
	    if (el.hasAttribute("data-drag-handle")) {
	      el = dom.closest(el, draggableSelector);
	      return el ? new Draggable(el) : null;
	    }

	    // check all of the drag handles underneath this draggable element,
	    // and make sure they all belong to other (child) draggables
	    for (var _iterator = el.querySelectorAll(handleSelector), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	      var _ref;

	      if (_isArray) {
	        if (_i >= _iterator.length) break;
	        _ref = _iterator[_i++];
	      } else {
	        _i = _iterator.next();
	        if (_i.done) break;
	        _ref = _i.value;
	      }

	      var handleEl = _ref;

	      if (dom.closest(handleEl, draggableSelector) === el) return null;
	    }

	    return el ? new Draggable(el) : null;
	  };

	  Draggable.prototype.finalizeRevert = function finalizeRevert() {
	    this.originalParentEl.insertBefore(this.el, this.originalParentEl.children[this.originalIndex]);
	  };

	  _createClass(Draggable, [{
	    key: "enabled",
	    get: function get() {
	      return !(this.el.hasAttribute("data-drag-disabled") || this.el.parentElement && this.el.parentElement.hasAttribute("data-drag-disabled"));
	    }
	  }]);

	  return Draggable;
	})();

	exports["default"] = Draggable;
	module.exports = exports["default"];

/***/ }
/******/ ]);