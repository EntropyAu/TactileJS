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
	  helper: {
	    resize: true,
	    shadowSize: 14
	  },
	  pickup: {
	    delay: 400,
	    distance: 10
	  },
	  css: {
	    placeholder: 'dd-drag-placeholder',
	    containerOver: 'dd-drag-hover'
	  },
	  scroll: {
	    delay: 1000,
	    sensitivity: 40,
	    speed: 2
	  },
	  animation: {
	    duration: 150,
	    easing: 'ease-in-out',
	    elementLimit: 25,
	    animateResize: true
	  }
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

	  DragManager.prototype.bindPointerEventsForDragging = function bindPointerEventsForDragging() {
	    window.addEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
	    window.addEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
	  };

	  DragManager.prototype.unbindPointerEventsForDragging = function unbindPointerEventsForDragging() {
	    window.removeEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
	    window.removeEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
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

	    if (this.options.pickup.delay === null || this.options.pickup.delay === 0) {
	      events.cancelEvent(e);
	      this.drags[pointerId] = new _DragJs2['default'](draggable, pointerXY, defaultOptions);
	      document.body.setAttribute('data-drag-in-progress', '');
	    } else {
	      var onPickupTimeoutHandler = function onPickupTimeoutHandler() {
	        this.onPickUpTimeout(pointerId);
	      };
	      this.pendingDrags[pointerId] = {
	        draggable: draggable,
	        pointerXY: pointerXY,
	        timerId: setTimeout(onPickupTimeoutHandler.bind(this), this.options.pickup.delay)
	      };
	    }
	    this.bindPointerEventsForDragging();
	  };

	  DragManager.prototype.onPickUpTimeout = function onPickUpTimeout(pointerId) {
	    if (this.pendingDrags[pointerId]) {
	      var pendingDrag = this.pendingDrags[pointerId];
	      this.drags[pointerId] = new _DragJs2['default'](pendingDrag.draggable, pendingDrag.pointerXY, this.options);
	      document.body.setAttribute('data-drag-in-progress', '');
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
	      if (this.options.pickup.distance && math.distance(pendingDrag.pointerXY, pointerXY) > this.options.pickup.distance) clearTimeout(pendingDrag.timerId);
	      this.drags[pointerId] = new _DragJs2['default'](pendingDrag.draggable, pendingDrag.pointerXY, this.options);
	      document.body.setAttribute('data-drag-in-progress', '');
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
	        this.unbindPointerEventsForDragging();
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

	var _libEventsJs = __webpack_require__(14);

	var events = _interopRequireWildcard(_libEventsJs);

	var _libMathJs = __webpack_require__(4);

	var math = _interopRequireWildcard(_libMathJs);

	var _libDomJs = __webpack_require__(2);

	var dom = _interopRequireWildcard(_libDomJs);

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
	    this.source = null;
	    this.revertOnCancel = true;

	    this.initialize();
	  }

	  Drag.prototype.initialize = function initialize() {
	    this.helper = new _HelperJs2['default'](this);
	    this.pointerEl = dom.elementFromPoint(this.pointerXY);
	    this.draggable.removeOriginal();
	    this.updateConstrainedPosition();
	    this.helper.setPosition(this.constrainedXY);
	    this.updateTargetContainer();
	    if (this.target) {
	      this.target.setPointerXY(this.constrainedXY);
	      this.target.updatePlaceholder();
	    }
	    events.raiseEvent(this.draggable.el, 'dragstart', this);
	  };

	  Drag.prototype.move = function move(pointerXY) {
	    this.pointerXY = pointerXY;

	    this.updateConstrainedPosition();
	    this.helper.setPosition(this.constrainedXY);

	    function asyncTargetUpdate() {
	      this.pointerEl = dom.elementFromPoint(pointerXY);
	      this.updateTargetContainer();
	      if (this.target) {
	        this.target.setPointerXY(this.constrainedXY);
	        this.target.updatePlaceholder();
	      }
	      events.raiseEvent(this.draggable.el, 'drag', this);
	    }
	    setTimeout(asyncTargetUpdate.bind(this), 0);
	    //scroll.autoScroll(drag);
	  };

	  Drag.prototype.end = function end() {
	    if (this.target) this.drop();else this.cancel();
	    events.raiseEvent(this.draggable.el, 'dragend', this);
	    this.dispose();
	  };

	  Drag.prototype.drop = function drop() {
	    events.raiseEvent(this.draggable.el, 'drop', this);

	    var placeholderRect = this.target.placeholder.el.getBoundingClientRect();
	    this.helper.animateToRect(placeholderRect, function () {});
	  };

	  Drag.prototype.cancel = function cancel() {
	    this.draggable.restoreOriginal();
	  };

	  Drag.prototype.dispose = function dispose() {
	    if (this.target) this.target.dragLeave();

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
	    if (this.target && this.target.contains(this.draggable)) {
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
	    var containerEl = _ContainerFactoryJs2['default'].closest(this.pointerEl);
	    if (containerEl === (this.target ? this.target.el : null)) return;
	    var container = _ContainerFactoryJs2['default'].makeContainer(containerEl, this);

	    if (this.target) this._leaveTarget(this.target);
	    if (container && container.accepts(this.draggable)) this._enterTarget(container);
	  };

	  Drag.prototype._leaveTarget = function _leaveTarget(container) {
	    container.dragLeave();
	    events.raiseEvent(container.el, 'dragleave', this);
	    this.target = null;
	  };

	  Drag.prototype._enterTarget = function _enterTarget(container) {
	    container.dragEnter();
	    events.raiseEvent(container.el, 'dragenter', this);
	    this.helper.setSizeAndScale(container.placeholderSize, container.placeholderScale);
	    this.target = container;
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
	});

	function translate(el, x, y) {
	  el.style[vendorTransform] = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0)';
	}

	function topLeft(el, t, l) {
	  el.style.top = t + 'px';
	  el.style.left = l + 'px';
	}

	function transformOrigin(el, _ref) {
	  var t = _ref[0];
	  var l = _ref[1];

	  el.style.transformOrigin = l + 'px ' + t + 'px';
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

	'use strict';

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

	  Container.prototype.dragEnter = function dragEnter() {
	    this.el.classList.add('dd-drag-over');
	    this.updatePosition(this.drag.constrainedXY);
	    this.insertPlaceholder();
	  };

	  Container.prototype.setPointerXY = function setPointerXY(constrainedXY) {
	    this.updatePosition(constrainedXY);
	    this.updatePlaceholder();
	  };

	  Container.prototype.dragLeave = function dragLeave() {
	    this.el.classList.remove('dd-drag-over');
	    this.removePlaceholder();
	  };

	  Container.prototype.accepts = function accepts(draggable) {
	    if (this.el.hasAttribute('data-drag-disabled')) return false;
	    var acceptsSelector = this.el.getAttribute('data-drag-accepts');
	    return acceptsSelector ? draggable.el.matches(acceptsSelector) : true;
	  };

	  Container.prototype.contains = function contains(draggable) {
	    // draggable is contained by this
	    if (draggable.el.hasAttribute('data-drag-containment')) {
	      var containmentSelector = draggable.el.getAttribute('data-drag-containment');
	      return containmentSelector ? this.el.matches(containmentSelector) : true;
	    }
	    // this contains draggable
	    if (this.el.hasAttribute('data-drag-containment')) {
	      var containmentSelector = this.el.getAttribute('data-drag-containment');
	      return containmentSelector ? draggable.el.matches(containmentSelector) : true;
	    }
	    return false;
	  };

	  return Container;
	})();

	exports['default'] = Container;
	module.exports = exports['default'];

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
	    var handleOrDragEl = dom.closest(el, Draggable.handleOrDraggableSelector);
	    if (!handleOrDragEl) {
	      return null;
	    }

	    // if the pointer is over a handle element, ascend the DOM to find the
	    // associated draggable item
	    if (handleOrDragEl.hasAttribute('data-drag-handle')) {
	      var _dragEl = dom.closest(handleOrDragEl, this.draggableSelector);
	      return _dragEl ? new Draggable(_dragEl) : null;
	    }

	    // if the item contains a handle (which was not the the pointer down spot)
	    // then ignore
	    if (handleOrDragEl.querySelectorAll(this.handleSelector).length > handleOrDragEl.querySelectorAll(this.handleOrDraggableSelector).length) {
	      return null;
	    }

	    var dragEl = handleOrDragEl;
	    return dragEl ? new Draggable(dragEl) : null;
	  };

	  Draggable.prototype.removeOriginal = function removeOriginal() {
	    this.el.remove();
	  };

	  Draggable.prototype.restoreOriginal = function restoreOriginal() {
	    dom.topLeft(this.el, this.originalOffset[1], this.originalOffset[0]);
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
	      return '[data-drag-handle],[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
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
	    this.size = null;
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

	    if (window['Velocity']) {
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
	    if (window['Velocity']) {
	      Velocity(this.el, {
	        translateX: positionXY[0],
	        translateY: positionXY[1],
	        translateZ: 0
	      }, {
	        duration: 0,
	        queue: false
	      });
	    } else {
	      dom.translate(this.el, positionXY[0], positionXY[1]);
	    }
	  };

	  Helper.prototype.setSizeAndScale = function setSizeAndScale(size, scale) {
	    var animate = arguments[2] === undefined ? true : arguments[2];

	    if (this.size && this.scale && this.size[0] === size[0] && this.size[1] === size[1] && this.scale[0] === scale[0] && this.scale[1] === scale[1]) return;

	    if (window['Velocity']) {
	      var velocityOptions = animate && this.drag.options.animation.animateResize ? {
	        duration: this.drag.options.animation.duration,
	        easing: 'linear',
	        queue: false
	      } : {
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
	      this.el.style.width = size[0] + 'px';
	      this.el.style.height = size[1] + 'px';
	      this.el.style.left = -this.gripOffset[0] * size[0] + 'px';
	      this.el.style.top = -this.gripOffset[1] * size[1] + 'px';
	      dom.transformOrigin(this.el, [-this.gripOffset[0] * size[0], -this.gripOffset[1] * size[1]]);
	    }
	    this.size = size;
	  };

	  Helper.prototype.animateToRect = function animateToRect(rect, callback) {
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
	    var snapToGrid = this.el.getAttribute("data-drag-canvas-snap-to-grid") || "";
	    var cellSizeTokens = snapToGrid.split(",");
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

	  CanvasContainer.prototype.insertPlaceholder = function insertPlaceholder() {
	    if (!this.placeholder) {
	      this.placeholder = new _PlaceholderJs2["default"](this.drag);
	      dom.translate(this.placeholder.el, this.offset[0], this.offset[1]);
	      this.el.appendChild(this.placeholder.el);
	      this.placeholderSize = this.placeholder.size;
	      this.placeholderScale = this.placeholder.scale;
	    }
	  };

	  CanvasContainer.prototype.updatePlaceholder = function updatePlaceholder() {
	    dom.translate(this.placeholder.el, this.offset[0], this.offset[1]);
	  };

	  CanvasContainer.prototype.removePlaceholder = function removePlaceholder() {
	    this.placeholder.el.remove();
	    this.placeholder = null;
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
	    this.initialize();
	  }

	  _inherits(SortableContainer, _Container);

	  SortableContainer.prototype.initialize = function initialize() {
	    this.direction = this.el.getAttribute("data-drag-sortable") || "vertical";
	  };

	  SortableContainer.prototype.updatePosition = function updatePosition(constrainedXY) {
	    if (this.el.children.length === 0) {
	      this.index = 0;
	      return;
	    }
	    var newIndex = this.index;
	    // we'll use selection APIs rather than elementAtPoint,
	    // as it returns the closest sibling to the area being selected
	    var closestChildEl = dom.elementFromPointViaSelection(constrainedXY);
	    while (closestChildEl && !dom.isChild(this.el, closestChildEl)) closestChildEl = closestChildEl.parentElement;
	    if (closestChildEl) {
	      var closestChildRect = closestChildEl.getBoundingClientRect();
	      newIndex = dom.indexOf(closestChildEl);

	      if (this.direction === "vertical" && constrainedXY[1] > closestChildRect.top + closestChildRect.height / 2) newIndex++;
	      if ((this.direction === "wrap" || this.direction === "horizontal") && constrainedXY[0] > closestChildRect.left + closestChildRect.width / 2) newIndex++;
	    }

	    this.index = newIndex;
	  };

	  SortableContainer.prototype.insertPlaceholder = function insertPlaceholder() {
	    var _this = this;

	    this.placeholder = new _PlaceholderJs2["default"](this.drag);
	    var mutation = function mutation() {
	      return _this.el.insertBefore(_this.placeholder.el, _this.el.children[_this.index]);
	    };
	    if (this.options.animation) animation.animateDomMutation(this.el, mutation, {
	      duration: this.options.animation.duration,
	      easing: this.options.animation.easing,
	      startIndex: this.index,
	      maxElementsToAnimate: this.options.animation.elementLimit,
	      animateParentSize: true
	    });else mutation();
	    this.placeholderSize = this.placeholder.size;
	    this.placeholderScale = this.placeholder.scale;
	  };

	  SortableContainer.prototype.updatePlaceholder = function updatePlaceholder() {
	    var _this2 = this;

	    var newIndex = this.index,
	        oldIndex = dom.indexOf(this.placeholder.el);
	    if (oldIndex !== newIndex && oldIndex !== newIndex - 1) {
	      var mutation = function mutation() {
	        return _this2.el.insertBefore(_this2.placeholder.el, _this2.el.children[newIndex]);
	      };
	      if (this.options.animation) animation.animateDomMutation(this.el, mutation, {
	        duration: this.options.animation.duration,
	        easing: this.options.animation.easing,
	        startIndex: Math.min(oldIndex, newIndex) - 1,
	        endIndex: Math.max(oldIndex, newIndex) + 1,
	        maxElementsToAnimate: this.options.animation.elementLimit
	      });else mutation();
	    }
	  };

	  SortableContainer.prototype.removePlaceholder = function removePlaceholder(drag) {
	    var _this3 = this;

	    var mutation = function mutation() {
	      return _this3.placeholder.el.remove();
	    };
	    if (this.options.animation) animation.animateDomMutation(this.el, mutation, {
	      duration: this.options.animation.duration,
	      easing: this.options.animation.easing,
	      startIndex: this.index,
	      maxElementsToAnimate: this.options.animation.elementLimit,
	      animateParentSize: true
	    });else mutation();
	    this.placeholder.dispose();
	    this.placeholder = null;
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
	  var endIndex = Math.min(options.endIndex || el.children.length, startIndex + options.maxElementsToAnimate);
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
	    console.log('COMPLETE');
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
	  var map = new Map();
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
	    _classCallCheck(this, Placeholder);

	    this.drag = drag;
	    this.el = null;
	    this.initialize();
	  }

	  Placeholder.prototype.initialize = function initialize(draggable) {
	    this.el = this.drag.draggable.el.cloneNode(true);
	    this.el.removeAttribute('id');
	    this.el.classList.add(this.drag.options.css.placeholder);
	    this.el.setAttribute('data-drag-placeholder', '');
	    dom.translate(this.el, 0, 0);
	    dom.topLeft(this.el, 0, 0);
	  };

	  Placeholder.prototype.dispose = function dispose() {
	    this.el.remove();
	    this.el = null;
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

/***/ }
/******/ ]);