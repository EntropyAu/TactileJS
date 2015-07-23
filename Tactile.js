var Tactile;
(function (Tactile) {
    var Animation;
    (function (Animation) {
        function set(els, target, options, complete) {
            if (options === void 0) { options = { duration: 0 }; }
            if (complete === void 0) { complete = null; }
            if (window['Velocity']) {
                var velocityOptions = {
                    duration: options.duration,
                    easing: options.easing,
                    complete: complete,
                    queue: false
                };
                window['Velocity'](els, target, velocityOptions);
            }
            else {
                for (var _i = 0, _a = [].concat(els); _i < _a.length; _i++) {
                    var el = _a[_i];
                    applyStyleProperties(el, target);
                    applyTransformProperties(el, target);
                }
                if (complete)
                    complete();
            }
        }
        Animation.set = set;
        function stop(els) {
            if (window["Velocity"]) {
                window['Velocity'](els, 'stop');
            }
        }
        Animation.stop = stop;
        function animateDomMutation(el, mutationFunction, options) {
            var startIndex = options.startIndex || 0;
            var endIndex = Math.min(options.endIndex || el.children.length + 1, startIndex + options.elementLimit);
            var easing = options.easing || 'ease-in-out';
            var duration = options.duration || 400;
            var originalStyleHeight = null, originalStyleWidth = null, oldSize = null, newSize = null;
            var cache = new Tactile.Cache();
            var oldOffsets = childOffsetMap(cache, 'old', el, startIndex, endIndex);
            if (options.animateParentSize) {
                originalStyleHeight = '';
                originalStyleWidth = '';
                el.style.width = '';
                el.style.height = '';
                oldSize = [el.offsetWidth, el.offsetHeight];
            }
            mutationFunction();
            var newOffsets = childOffsetMap(cache, 'new', el, startIndex, endIndex);
            if (options.animateParentSize) {
                newSize = [el.offsetWidth, el.offsetHeight];
            }
            animateBetweenOffsets(cache, el, startIndex, endIndex, duration, easing);
            if (options.animateParentSize) {
                animateSize(el, oldSize, newSize, originalStyleWidth, originalStyleHeight, duration, easing);
            }
        }
        Animation.animateDomMutation = animateDomMutation;
        function animateSize(el, oldSize, newSize, originalStyleWidth, originalStyleHeight, duration, easing) {
            function complete() {
                el.style.width = originalStyleWidth;
                el.style.height = originalStyleHeight;
            }
            window['Velocity'](el, {
                width: [newSize[0], oldSize[0]],
                height: [newSize[1], oldSize[1]]
            }, {
                duration: duration,
                easing: easing,
                queue: false,
                complete: complete
            });
        }
        function animateBetweenOffsets(cache, el, startIndex, endIndex, duration, easing) {
            for (var i = startIndex; i < endIndex + 1; i++) {
                var childEl = el.children[i];
                if (!childEl)
                    continue;
                var oldOffset = cache.get(childEl, 'old');
                var newOffset = cache.get(childEl, 'new');
                if (!oldOffset || !newOffset || (oldOffset[0] === newOffset[0] && oldOffset[1] === newOffset[1]))
                    continue;
                window['Velocity'](childEl, {
                    translateX: '+=' + (oldOffset[0] - newOffset[0]) + 'px',
                    translateY: '+=' + (oldOffset[1] - newOffset[1]) + 'px',
                    translateZ: 0
                }, { duration: 0 });
                window['Velocity'](childEl, {
                    translateX: 0,
                    translateY: 0
                }, {
                    duration: duration,
                    easing: easing,
                    queue: false
                });
            }
        }
        function childOffsetMap(cache, key, el, startIndex, endIndex) {
            for (var i = startIndex; i < endIndex; i++) {
                var childEl = el.children[i];
                if (childEl)
                    cache.set(childEl, key, [childEl.offsetLeft, childEl.offsetTop]);
            }
        }
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
                "translateZ": "px",
                "scaleX": "",
                "scaleY": "",
                "rotateZ": "deg"
            };
            var transformOrder = ["translateX", "translateY", "translateZ", "scaleX", "scaleY", "rotateZ"];
            var transformHash = el['__tactile_transform'] || {};
            for (var property in properties) {
                if (transformProperties[property]) {
                    var value_1 = unwrapVelocityPropertyValue(properties[property]);
                    transformHash[property] = value_1 + transformProperties[property];
                }
            }
            var transformValues = [];
            transformOrder.forEach(function (property) {
                if (transformHash[property]) {
                    transformValues.push(property + "(" + transformHash[property] + ")");
                }
            });
            var value = transformValues.join(' ');
            el['__tactile_transform'] = transformHash;
            if (el.style.webkitTransform !== undefined)
                el.style.webkitTransform = value;
            if (el.style.transform !== undefined)
                el.style.transform = value;
        }
    })(Animation = Tactile.Animation || (Tactile.Animation = {}));
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Attributes;
    (function (Attributes) {
        function get(el, attrName, defaultIfPresent, defaultIfNotPresent) {
            if (defaultIfPresent === void 0) { defaultIfPresent = ''; }
            if (defaultIfNotPresent === void 0) { defaultIfNotPresent = null; }
            if (el.hasAttribute(attrName)) {
                return el.getAttribute(attrName) || defaultIfPresent;
            }
            else {
                return defaultIfNotPresent;
            }
        }
        Attributes.get = get;
        function getTags(el, attrName, defaultIfPresent, defaultIfNotPresent) {
            if (defaultIfPresent === void 0) { defaultIfPresent = []; }
            if (defaultIfNotPresent === void 0) { defaultIfNotPresent = []; }
            if (el.hasAttribute(attrName)) {
                var attributeValue = el.getAttribute(attrName);
                if (attributeValue && attributeValue.length > 0) {
                    return attributeValue.split(/[\ ,]/g);
                }
                else {
                    return defaultIfPresent;
                }
            }
            else {
                return defaultIfNotPresent;
            }
        }
        Attributes.getTags = getTags;
    })(Attributes = Tactile.Attributes || (Tactile.Attributes = {}));
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Dom;
    (function (Dom) {
        function matches(el, selector) {
            if (el['matches'])
                return el['matches'](selector);
            if (el['msMatchesSelector'])
                return el['msMatchesSelector'](selector);
            if (el['mozMatchesSelector'])
                return el['mozMatchesSelector'](selector);
            if (el['webkitMatchesSelector'])
                return el['webkitMatchesSelector'](selector);
        }
        Dom.matches = matches;
        function indexOf(el) {
            return Array.prototype.indexOf.call(el.parentElement.children, el);
        }
        Dom.indexOf = indexOf;
        function isChild(el, childEl) {
            return Array.prototype.indexOf.call(el.children, childEl) !== -1;
        }
        Dom.isChild = isChild;
        function isDescendant(el, descendantEl) {
            do {
                descendantEl = descendantEl.parentElement;
            } while (descendantEl && descendantEl !== el);
            return descendantEl === el;
        }
        Dom.isDescendant = isDescendant;
        function closest(el, selector) {
            if (el === null)
                return;
            do {
                if (matches(el, selector))
                    return el;
            } while (el = el.parentNode);
            return null;
        }
        Dom.closest = closest;
        function parents(el, selector) {
            var parents = [];
            while (el = el.parentNode) {
                if (matches(el, selector))
                    parents.push(el);
            }
            return parents;
        }
        Dom.parents = parents;
        function copyComputedStyles(sourceEl, targetEl) {
            targetEl.style.cssText = getComputedStyle(sourceEl).cssText;
            var targetChildren = children(targetEl);
            children(sourceEl).forEach(function (el, i) { return copyComputedStyles(el, targetChildren[i]); });
        }
        Dom.copyComputedStyles = copyComputedStyles;
        function stripClasses(el) {
            el.className = '';
            children(el).forEach(function (el) { return stripClasses(el); });
        }
        Dom.stripClasses = stripClasses;
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
        Dom.getPaddingClientRect = getPaddingClientRect;
        function children(el) {
            return [].slice.call(el.children);
        }
        Dom.children = children;
        function ancestors(el, selector) {
            if (el === null)
                return [];
            var ancestors = [];
            do {
                if (matches(el, selector))
                    ancestors.push(el);
            } while (el = el.parentNode);
            return ancestors;
        }
        Dom.ancestors = ancestors;
        function clientScale(el) {
            var rect = el.getBoundingClientRect();
            return [rect.width / el.offsetWidth, rect.height / el.offsetHeight];
        }
        Dom.clientScale = clientScale;
        function outerHeight(el, includeMargins) {
            if (includeMargins === void 0) { includeMargins = false; }
            if (!includeMargins)
                return el.offsetHeight;
            var style = getComputedStyle(el);
            return el.offsetHeight + parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
        }
        Dom.outerHeight = outerHeight;
        function outerWidth(el, includeMargins) {
            if (includeMargins === void 0) { includeMargins = false; }
            if (!includeMargins)
                return el.offsetWidth;
            var style = getComputedStyle(el);
            return el.offsetWidth + parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);
        }
        Dom.outerWidth = outerWidth;
        var vendorTransform = null;
        if (document.documentElement.style.webkitTransform !== undefined)
            vendorTransform = 'webkitTransform';
        if (document.documentElement.style.transform !== undefined)
            vendorTransform = 'transform';
        function translate(el, xy) {
            el.style[vendorTransform] = "translateX(" + xy[0] + "px) translateY(" + xy[1] + "px) translateZ(0)";
        }
        Dom.translate = translate;
        function transform(el, options) {
            var transform = [];
            if (options.translateX)
                transform.push("translateX(" + options.translateX + "px)");
            if (options.translateY)
                transform.push("translateY(" + options.translateY + "px)");
            if (options.translateZ)
                transform.push("translateZ(" + options.translateZ + "px)");
            if (options.scaleX)
                transform.push("scaleX(" + options.scaleX + ")");
            if (options.scaleY)
                transform.push("scaleY(" + options.scaleY + ")");
            if (options.rotateZ)
                transform.push("rotateZ(" + options.rotateZ + "deg)");
            el.style[vendorTransform] = transform.join(' ');
        }
        Dom.transform = transform;
        function topLeft(el, xy) {
            el.style.left = xy[0] + "px";
            el.style.top = xy[1] + "px";
        }
        Dom.topLeft = topLeft;
        function transformOrigin(el, xy) {
            el.style.transformOrigin = xy[0] + "% " + xy[1] + "%";
            el.style.webkitTransformOrigin = xy[0] + "% " + xy[1] + "%";
        }
        Dom.transformOrigin = transformOrigin;
        function elementFromPoint(xy) {
            return document.elementFromPoint(xy[0], xy[1]);
        }
        Dom.elementFromPoint = elementFromPoint;
        function elementFromPointViaSelection(xy) {
            var node = null;
            if (document['caretRangeFromPoint']) {
                var range = document['caretRangeFromPoint'](xy[0], xy[1]);
                if (range)
                    node = range.startContainer;
            }
            if (document['caretPositionFromPoint']) {
                var range = document['caretPositionFromPoint'](xy[0], xy[1]);
                if (range)
                    node = range.offsetNode;
            }
            if (document['createTextRange']) {
                var range = document['createTextRange']();
                range.moveToPoint(xy[0], xy[1]);
                return node = range.parentElement();
            }
            if (node && node.parentElement && !(node instanceof Element))
                node = node.parentElement;
            return node;
        }
        Dom.elementFromPointViaSelection = elementFromPointViaSelection;
        function clearSelection() {
            if (window.getSelection) {
                if (window.getSelection().empty) {
                    window.getSelection().empty();
                }
                else if (window.getSelection().removeAllRanges) {
                    window.getSelection().removeAllRanges();
                }
            }
            else if (document['selection']) {
                document['selection'].empty();
            }
        }
        Dom.clearSelection = clearSelection;
        function scrollDirections(el) {
            var style = getComputedStyle(this.el);
            var he = style.overflowX === 'auto' || style.overflowX === 'scroll', ve = style.overflowY === 'auto' || style.overflowY === 'scroll', st = el.scrollTop, sl = el.scrollLeft;
            return {
                up: ve ? st : 0,
                left: he ? sl : 0,
                down: ve ? (el.scrollHeight - el.clientHeight) - st : 0,
                right: he ? (el.scrollWidth - el.clientWidth) - sl : 0
            };
        }
        Dom.scrollDirections = scrollDirections;
        function canScrollDown(el) {
            return el.scrollTop < el.scrollHeight - el.clientHeight;
        }
        Dom.canScrollDown = canScrollDown;
        function canScrollUp(el) {
            return el.scrollTop > 0;
        }
        Dom.canScrollUp = canScrollUp;
        function canScrollRight(el) {
            return el.scrollLeft < el.scrollWidth - el.clientWidth;
        }
        Dom.canScrollRight = canScrollRight;
        function canScrollLeft(el) {
            return el.scrollLeft > 0;
        }
        Dom.canScrollLeft = canScrollLeft;
    })(Dom = Tactile.Dom || (Tactile.Dom = {}));
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Events;
    (function (Events) {
        Events.pointerDownEvent = document['ontouchstart'] !== undefined
            ? 'touchstart'
            : 'mousedown';
        Events.pointerMoveEvent = document['ontouchmove'] !== undefined
            ? 'touchmove'
            : 'mousemove';
        Events.pointerUpEvent = document['ontouchend'] !== undefined
            ? 'touchend'
            : 'mouseup';
        function cancel(e) {
            e.stopPropagation();
            e.preventDefault();
            e.cancelBubble = true;
            e.returnValue = false;
        }
        Events.cancel = cancel;
        function raise(source, eventName, eventData) {
            var event = null;
            if (typeof CustomEvent === 'function') {
                event = new CustomEvent(eventName, eventData);
            }
            else {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent(event, true, true, eventData);
            }
            source.dispatchEvent(event);
            return event;
        }
        Events.raise = raise;
        function normalizePointerEvent(e) {
            if (e['changedTouches'])
                return _normalizeTouchEvent(e);
            if (e['clientX'])
                return _normalizeMouseEvent(e);
        }
        Events.normalizePointerEvent = normalizePointerEvent;
        function _normalizeTouchEvent(e) {
            var pointers = [];
            for (var i = 0; i < e.changedTouches.length; i++) {
                var touch = e.changedTouches[i];
                pointers.push({
                    id: touch.identifier,
                    target: touch.target,
                    xy: [touch.clientX, touch.clientY],
                    xyEl: e.type === 'touchstart' ? touch.target : null
                });
            }
            return pointers;
        }
        function _normalizeMouseEvent(e) {
            return [{ id: 0, target: e.target, xy: [e.clientX, e.clientY], xyEl: e.target }];
        }
    })(Events = Tactile.Events || (Tactile.Events = {}));
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Maths;
    (function (Maths) {
        function coerce(value, min, max) {
            return value > max ? max : (value < min ? min : value);
        }
        Maths.coerce = coerce;
        function scale(value, domain, range) {
            return (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]) + range[0];
        }
        Maths.scale = scale;
        function contains(rect, xy) {
            return xy[0] >= rect.left && xy[0] <= rect.right
                && xy[1] >= rect.top && xy[1] <= rect.bottom;
        }
        Maths.contains = contains;
    })(Maths = Tactile.Maths || (Tactile.Maths = {}));
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Polyfill;
    (function (Polyfill) {
        var timeLast = 0;
        function requestAnimationFrame(callback) {
            if (window['requestAnimationFrame'])
                return window.requestAnimationFrame(callback);
            if (window['mozRequestAnimationFrame'])
                return window['mozRequestAnimationFrame'](callback);
            if (window['webkitRequestAnimationFrame'])
                return window['webkitRequestAnimationFrame'](callback);
            var timeCurrent = (new Date()).getTime(), timeDelta;
            timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
            timeLast = timeCurrent + timeDelta;
            return setTimeout(function () { callback(timeCurrent + timeDelta); }, timeDelta);
        }
        Polyfill.requestAnimationFrame = requestAnimationFrame;
        ;
        function cancelAnimationFrame(handle) {
            if (window['cancelAnimationFrame'])
                return window.cancelAnimationFrame(handle);
            if (window['mozCancelAnimationFrame'])
                return window['mozCancelAnimationFrame'](handle);
            if (window['webkitCancelAnimationFrame'])
                return window['webkitCancelAnimationFrame'](handle);
            clearTimeout(handle);
        }
        Polyfill.cancelAnimationFrame = cancelAnimationFrame;
        ;
        function addClass(el, className) {
            if (el.classList !== undefined) {
                el.classList.add(className);
            }
            else {
                var classes = (el.getAttribute('class') || '').split(/\s+/);
                if (classes.indexOf(className) === -1) {
                    classes.push(className);
                    el.setAttribute('class', classes.join(' '));
                }
            }
        }
        Polyfill.addClass = addClass;
        function removeClass(el, className) {
            if (el.classList !== undefined) {
                el.classList.remove(className);
            }
            else {
                var classes = (el.getAttribute('class') || '').split(/\s+/);
                var index = classes.indexOf(className);
                if (index !== -1) {
                    classes.splice(index, 1);
                    el.setAttribute('class', classes.join(' '));
                }
            }
        }
        Polyfill.removeClass = removeClass;
        function remove(el) {
            if (typeof el.remove === 'function') {
                el.remove();
            }
            else {
                el.parentNode.removeChild(el);
            }
        }
        Polyfill.remove = remove;
    })(Polyfill = Tactile.Polyfill || (Tactile.Polyfill = {}));
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Vector;
    (function (Vector) {
        function add(a, b) {
            return [a[0] + b[0], a[1] + b[1]];
        }
        Vector.add = add;
        function subtract(a, b) {
            return [a[0] - b[0], a[1] - b[1]];
        }
        Vector.subtract = subtract;
        function multiply(a, b) {
            return [a[0] * b[0], a[1] * b[1]];
        }
        Vector.multiply = multiply;
        function multiplyScalar(a, s) {
            return [a[0] * s, a[1] * s];
        }
        Vector.multiplyScalar = multiplyScalar;
        function divide(a, b) {
            return [a[0] / b[0], a[1] / b[1]];
        }
        Vector.divide = divide;
        function divideScalar(v, s) {
            return [v[0] / s, v[1] / s];
        }
        Vector.divideScalar = divideScalar;
        function lengthSquared(v) {
            return v[0] * v[0] + v[1] * v[1];
        }
        Vector.lengthSquared = lengthSquared;
        function length(v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        }
        Vector.length = length;
        function equals(a, b) {
            return a && b && a[0] === b[0] && a[1] === b[1];
        }
        Vector.equals = equals;
    })(Vector = Tactile.Vector || (Tactile.Vector = {}));
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Container = (function () {
        function Container(el, drag) {
            this.el = el;
            this.drag = drag;
            this.isSource = false;
            this.accepts = el.hasAttribute('data-drag-accepts')
                ? Tactile.Attributes.getTags(el, 'data-drag-accepts')
                : Tactile.Attributes.getTags(el, 'data-drag-tag');
            this.leaveAction = Tactile.Attributes.get(el, 'data-drag-leave-action', 'move');
            this.enterAction = Tactile.Attributes.get(el, 'data-drag-enter-action', 'move');
        }
        Container.closest = function (el) {
            el = Tactile.Dom.closest(el, '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]');
            while (el && Tactile.Dom.closest(el, '[data-drag-placeholder]'))
                el = Tactile.Dom.closest(el.parentElement, '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]');
            return el;
        };
        Container.closestAcceptingTarget = function (el, draggable) {
            var _this = this;
            var targetEl = this.closest(el);
            while (targetEl) {
                var target = draggable.drag.containerCache.get(targetEl, 'container', function () { return _this.buildContainer(targetEl, draggable.drag); });
                if (target.willAccept(draggable))
                    return target;
                targetEl = this.closest(targetEl.parentElement);
            }
            return null;
        };
        Container.buildContainer = function (el, drag) {
            if (Tactile.Dom.matches(el, '[data-drag-canvas]'))
                return new Tactile.Canvas(el, drag);
            if (Tactile.Dom.matches(el, '[data-drag-droppable]'))
                return new Tactile.Droppable(el, drag);
            if (Tactile.Dom.matches(el, '[data-drag-sortable]'))
                return new Tactile.Sortable(el, drag);
            return null;
        };
        Container.prototype.willAccept = function (draggable) {
            var _this = this;
            if (this.el === draggable.originalParentEl)
                return true;
            if (this.el.hasAttribute('data-drag-disabled'))
                return false;
            return this.accepts.indexOf('*') !== -1
                || draggable.tags.some(function (t) { return _this.accepts.indexOf(t) !== -1; });
        };
        Container.prototype.enter = function (xy) { };
        Container.prototype.move = function (xy) { };
        Container.prototype.leave = function () { };
        Container.prototype.dispose = function () { };
        return Container;
    })();
    Tactile.Container = Container;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    ;
    Tactile.defaultOptions = {
        cancel: 'input,textarea,a,button,select,[data-drag-placeholder]',
        helperResize: true,
        helperCloneStyles: false,
        animation: true,
        revertBehaviour: 'last',
        pickUpAnimation: { duration: 300, easing: 'ease-in-out' },
        pickDownAnimation: { duration: 300, easing: 'ease-in-out' },
        resizeAnimation: { duration: 300, easing: 'ease-in-out' },
        dropAnimation: { duration: 300, easing: 'ease-in-out' },
        reorderAnimation: { duration: 300, easing: 'ease-in-out' },
        deleteAnimation: { duration: 300, easing: 'ease-out' },
        containerResizeAnimation: { duration: 300, easing: 'ease-in' },
        pickUpDelay: 0,
        pickUpDistance: 0,
        helperRotation: -1,
        helperShadowSize: 15,
        placeholderStyle: 'clone',
        placeholderClass: 'dd-drag-placeholder',
        containerHoverClass: 'dd-drag-hover',
        scrollSensitivity: '20%',
        scrollSpeed: 1
    };
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var uuid = 1;
    var _useMap = window['Map'] !== undefined
        && (new Map().values !== undefined
            && new Map().values().next !== undefined);
    var Cache = (function () {
        function Cache() {
            if (_useMap) {
                this._cache = new Map();
            }
            else {
                this._id = "__tactile" + uuid++;
                this._els = [];
            }
        }
        Cache.prototype.get = function (el, key, fn) {
            var elCache = this._getElementCache(el);
            if (elCache[key] !== undefined) {
                return elCache[key];
            }
            else {
                return fn ? elCache[key] = fn() : null;
            }
        };
        Cache.prototype.set = function (el, key, value) {
            var elCache = this._getElementCache(el);
            return elCache[key] = value;
        };
        Cache.prototype.clear = function () {
            var _this = this;
            if (_useMap) {
                this._cache = new Map();
            }
            else {
                this._els.forEach(function (el) { return delete el[_this._id]; });
                this._els = [];
            }
        };
        Cache.prototype.dispose = function () {
            var _this = this;
            if (_useMap) {
                this._cache = null;
            }
            else {
                this._els.forEach(function (el) { return delete el[_this._id]; });
                this._els = [];
            }
        };
        Cache.prototype.getElements = function () {
            if (_useMap) {
                var els = [];
                var iterator = this._cache.keys();
                var result = iterator.next();
                while (!result.done) {
                    els.push(result.value);
                    result = iterator.next();
                }
                return els;
            }
            else {
                return this._els;
            }
        };
        Cache.prototype._getElementCache = function (el) {
            var elCache = null;
            if (this._cache) {
                elCache = this._cache.get(el);
                if (!elCache) {
                    elCache = {};
                    this._cache.set(el, elCache);
                }
            }
            else {
                elCache = el[this._id];
                if (!elCache) {
                    this._els.push(el);
                    el[this._id] = elCache = {};
                }
            }
            return elCache;
        };
        return Cache;
    })();
    Tactile.Cache = Cache;
})(Tactile || (Tactile = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Tactile;
(function (Tactile) {
    var Canvas = (function (_super) {
        __extends(Canvas, _super);
        function Canvas(el, drag) {
            _super.call(this, el, drag);
            this.offset = [0, 0];
            this._grid = null;
            this._initializeGrid();
        }
        Canvas.prototype.enter = function (xy) {
            if (!this.placeholder) {
                this._insertPlaceholder();
                this.helperSize = this.placeholder.size;
                this.helperScale = this.placeholder.scale;
            }
            this.move(xy);
        };
        Canvas.prototype.move = function (xy) {
            var _this = this;
            var rect = this.drag.geometryCache.get(this.el, 'clientRect', function () { return _this.el.getBoundingClientRect(); });
            var scrollOffset = this.drag.geometryCache.get(this.el, 'scrollOffset', function () { return [_this.el.scrollLeft, _this.el.scrollTop]; });
            var localOffset = [xy[0] - rect.left + scrollOffset[0] + this.drag.helper.gripOffset[0],
                xy[1] - rect.top + scrollOffset[1] + this.drag.helper.gripOffset[1]];
            localOffset = Tactile.Vector.divide(localOffset, this.helperScale);
            if (this._grid) {
                localOffset = [Math.round(localOffset[0] / this._grid[0]) * this._grid[0],
                    Math.round(localOffset[1] / this._grid[1]) * this._grid[1]];
            }
            this.offset = localOffset;
            Tactile.Dom.translate(this.placeholder.el, this.offset);
        };
        Canvas.prototype.leave = function () {
            if (this.leaveAction === "copy" && this.placeholder.isOriginalEl) {
                this.placeholder.setState("materialized");
            }
        };
        Canvas.prototype.finalizeDrop = function (draggable) {
            var el = this.placeholder.el;
            Tactile.Dom.topLeft(el, this.offset);
        };
        Canvas.prototype._initializeGrid = function () {
            var gridAttribute = Tactile.Attributes.get(this.el, 'data-drag-grid', '10,10');
            if (gridAttribute !== null) {
                var tokens = gridAttribute.split(',');
                this._grid = [parseInt(tokens[0], 10) || 1,
                    parseInt(tokens[1], 10) || parseInt(tokens[0], 10) || 1];
            }
        };
        Canvas.prototype._insertPlaceholder = function () {
            if (this.drag.draggable.originalParentEl === this.el) {
                this.placeholder = new Tactile.Placeholder(this.drag.draggable.el, this.drag);
            }
            else {
                this.placeholder = Tactile.Placeholder.buildPlaceholder(this.el, this.drag);
            }
            Tactile.Dom.topLeft(this.placeholder.el, [0, 0]);
            this.placeholder.setState("hidden");
        };
        Canvas.prototype.dispose = function () {
            this.placeholder.setState("materialized", false);
            if (this.placeholder)
                this.placeholder.dispose();
        };
        return Canvas;
    })(Tactile.Container);
    Tactile.Canvas = Canvas;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Drag = (function () {
        function Drag(draggableEl, xy, xyEl, options) {
            this.source = null;
            this.target = null;
            this._xyChanged = false;
            this._hasScrolled = false;
            this._afRequestId = null;
            this._dragEnded = false;
            this.options = options;
            this.xy = xy;
            this.xyEl = xyEl || Tactile.Dom.elementFromPoint(this.xy);
            this.draggable = new Tactile.Draggable(draggableEl, this);
            this.helper = new Tactile.Helper(this, this.draggable);
            this.fence = Tactile.Fence.closestForDraggable(this, this.draggable);
            this.copy = false;
            this.geometryCache = new Tactile.Cache();
            this.containerCache = new Tactile.Cache();
            this._updateTarget();
            this.source = this.target;
            this._onScrollOrWheelListener = this._onScrollOrWheel.bind(this);
            document.addEventListener('scroll', this._onScrollOrWheelListener, false);
            document.addEventListener('mousewheel', this._onScrollOrWheelListener, false);
            document.addEventListener('wheel', this._onScrollOrWheelListener, false);
            this._raise(this.draggable.el, 'dragstart');
        }
        Drag.prototype.move = function (xy, xyEl) {
            if (this._dragEnded)
                return;
            if (!this._afRequestId)
                this._afRequestId = Tactile.Polyfill.requestAnimationFrame(this._tick.bind(this));
            this.xy = xy;
            this.xyEl = xyEl;
            this._xyChanged = true;
        };
        Drag.prototype.cancel = function (abort) {
            if (abort === void 0) { abort = false; }
            if (!abort) {
                this._dragEnded = true;
                if (this._afRequestId)
                    Tactile.Polyfill.cancelAnimationFrame(this._afRequestId);
                this.draggable.revertOriginal();
            }
            else {
            }
        };
        Drag.prototype.drop = function () {
            this._dragEnded = true;
            if (this._afRequestId)
                Tactile.Polyfill.cancelAnimationFrame(this._afRequestId);
            this._scroller = null;
            this._tick();
            if (!this._raise(this.draggable.el, "begindrop").defaultPrevented) {
                switch (this.action) {
                    case "move":
                    case "copy":
                        if (this.target.placeholder) {
                            this.helper.animateToElementAndPutDown(this.target.placeholder.el, this._finalizeAction.bind(this));
                        }
                        else {
                            this._finalizeAction();
                        }
                        break;
                    case "delete":
                        this.helper.animateDelete(this._finalizeAction.bind(this));
                        break;
                    case "revert":
                        this._finalizeAction();
                }
            }
            else {
            }
        };
        Drag.prototype.dispose = function () {
            var _this = this;
            this.containerCache.getElements().forEach(function (t) { return _this.containerCache.get(t, 'container').dispose(); });
            this.helper.dispose();
            this.geometryCache.dispose();
            this.containerCache.dispose();
            document.removeEventListener('scroll', this._onScrollOrWheelListener, false);
            document.removeEventListener('mousewheel', this._onScrollOrWheelListener, false);
            document.removeEventListener('wheel', this._onScrollOrWheelListener, false);
        };
        Drag.prototype._onScrollOrWheel = function () {
            this._hasScrolled = true;
            this.geometryCache.clear();
        };
        Drag.prototype._tick = function () {
            this._afRequestId = null;
            if (this._xyChanged || this._hasScrolled) {
                if (this.fence) {
                    var constrainedXY = this.fence.getConstrainedXY(this.xy);
                    if (!Tactile.Vector.equals(constrainedXY, this.xy)) {
                        this.xy = constrainedXY;
                        this.xyEl = null;
                    }
                }
                if (!this.xyEl)
                    this.xyEl = Tactile.Dom.elementFromPoint(this.xy);
                if (this.xyEl != this._lastXyEl && this.target && !this._dragEnded) {
                    this._scroller = Tactile.Scrollable.closestReadyScrollable(this.target.el, this, this.xy);
                }
                this.helper.setPosition(this.xy);
                this._xyChanged = false;
                this._hasScrolled = false;
            }
            if (this._scroller) {
                if (this._scroller.step(this.xy)) {
                    this._onScrollOrWheel();
                }
                else {
                    this._scroller = null;
                }
                ;
                this._afRequestId = Tactile.Polyfill.requestAnimationFrame(this._tick.bind(this));
            }
            else {
                if (this.xyEl !== this._lastXyEl) {
                    this._updateTarget();
                    this._lastXyEl = this.xyEl;
                }
                ;
                if (this.target)
                    this.target.move(this.xy);
                this._raise(this.draggable.el, 'drag');
            }
        };
        Drag.prototype._updateTarget = function () {
            var oldTarget = this.target;
            var newTarget = Tactile.Container.closestAcceptingTarget(this.xyEl, this.draggable);
            if (this.source && this.source.leaveAction === "delete" && newTarget !== this.source) {
                newTarget = null;
            }
            if (newTarget && this.fence
                && !Tactile.Dom.isDescendant(this.fence.el, newTarget.el)
                && this.fence.el !== newTarget.el)
                return;
            if (newTarget === oldTarget)
                return;
            if ((newTarget || this.options.revertBehaviour !== 'last') || (this.source && this.source.leaveAction === "delete")) {
                if (oldTarget === null || this._tryLeaveTarget(oldTarget)) {
                    if (newTarget !== null)
                        this._tryEnterTarget(newTarget);
                }
            }
            this._setAction(this._computeAction(this.source, this.target));
        };
        Drag.prototype._tryEnterTarget = function (container) {
            if (!this._raise(container.el, 'dragenter').defaultPrevented) {
                this.target = container;
                container.enter(this.xy);
                if (this.options.containerHoverClass) {
                    Tactile.Polyfill.addClass(container.el, this.options.containerHoverClass);
                }
                if (container.helperSize && this.options.helperResize) {
                    this.helper.setSizeAndScale(container.helperSize, container.helperScale);
                }
                return true;
            }
            else {
                return false;
            }
        };
        Drag.prototype._tryLeaveTarget = function (container) {
            if (!this._raise(container.el, 'dragleave').defaultPrevented) {
                this.target = null;
                container.leave();
                if (this.options.containerHoverClass) {
                    Tactile.Polyfill.removeClass(container.el, this.options.containerHoverClass);
                }
                return true;
            }
            else {
                return false;
            }
        };
        Drag.prototype._finalizeAction = function () {
            this._raise(this.draggable.el, 'enddrop');
            if (this._raise(this.draggable.el, 'drop').returnValue) {
                switch (this.action) {
                    case "move":
                        this.draggable.finalizeMove(this.target);
                        break;
                    case "copy":
                        this.draggable.finalizeCopy(this.target);
                        break;
                    case "delete":
                        this.draggable.finalizeDelete();
                        break;
                    case "revert":
                        this.draggable.finalizeRevert();
                        break;
                }
            }
            ;
            this._raise(this.draggable.el, 'dragend');
            this.dispose();
        };
        Drag.prototype._computeAction = function (source, target) {
            if (source === target)
                return ["move", false];
            var _a = ["move", false], action = _a[0], copy = _a[1];
            var leave = this.source ? this.source.leaveAction : "move";
            var enter = this.target ? this.target.enterAction : "revert";
            if (leave === "copy" || enter === "copy") {
                action = "copy";
                copy = true;
            }
            if (enter === "revert")
                action = "revert";
            if (leave === "delete" || enter === "delete")
                action = "delete";
            return [action, copy];
        };
        Drag.prototype._setAction = function (actionCopy) {
            if (this.action === actionCopy[0])
                return;
            this.helper.setAction(actionCopy[0]);
            this.action = actionCopy[0];
            this.copy = actionCopy[1];
        };
        Drag.prototype._raise = function (el, eventName) {
            var eventData = {
                item: this.draggable.el,
                data: this.draggable.data,
                action: this.action,
                copy: this.copy,
                helperEl: this.helper.el,
                helperXY: this.helper.xy,
                fenceEl: this.fence ? this.fence.el : null,
                sourceEl: this.draggable.originalParentEl,
                sourceIndex: this.draggable.originalIndex,
                sourceOffset: this.draggable.originalOffset,
                targetEl: this.target ? this.target.el : null,
                targetIndex: this.target ? this.target['index'] : null,
                targetOffset: this.target ? this.target['offset'] : null
            };
            return Tactile.Events.raise(el, eventName, eventData);
        };
        return Drag;
    })();
    Tactile.Drag = Drag;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Draggable = (function () {
        function Draggable(el, drag) {
            this.el = el;
            this.drag = drag;
            this.originalStyle = el.getAttribute('style');
            this.originalParentEl = el.parentElement;
            this.originalIndex = Tactile.Dom.indexOf(el);
            this.originalSize = [this.el.offsetWidth, this.el.offsetHeight];
            this.originalScale = Tactile.Dom.clientScale(el);
            var style = getComputedStyle(this.el);
            this.originalOffset = [parseInt(style.left, 10), parseInt(style.top, 10)];
            this.data = Tactile.Attributes.get(el, 'data-drag-data');
            this.tags = el.hasAttribute('data-drag-tag')
                ? Tactile.Attributes.getTags(el, 'data-drag-tag')
                : Tactile.Attributes.getTags(el.parentElement, 'data-drag-tag');
        }
        Draggable.closest = function (el) {
            el = Tactile.Dom.closest(el, '[data-drag-handle],[data-drag-draggable],ol[data-drag-sortable] > li,ul[data-drag-canvas] > li');
            if (!el)
                return null;
            if (el.hasAttribute('data-drag-handle')) {
                el = Tactile.Dom.closest(el, '[data-drag-draggable],ol[data-drag-sortable] > li,ul[data-drag-canvas] > li');
                return el;
            }
            var handleEls = el.querySelectorAll('[data-drag-handle]');
            var numHandleEls = handleEls.length;
            for (var i = 0; i < numHandleEls; i++) {
                var handleEl = handleEls[i];
                if (Tactile.Dom.closest(handleEl, '[data-drag-draggable],ol[data-drag-sortable] > li,ul[data-drag-canvas] > li') === el) {
                    return null;
                }
            }
            return el;
        };
        Draggable.closestEnabled = function (el) {
            el = this.closest(el);
            return el && !(el.hasAttribute('data-drag-disabled') || el.parentElement && el.parentElement.hasAttribute('data-drag-disabled'))
                ? el
                : null;
        };
        Draggable.prototype.finalizeMove = function (target) {
            target.finalizePosition(this.el);
        };
        Draggable.prototype.finalizeCopy = function (target) {
            var el = this.el.cloneNode(true);
            el.removeAttribute('id');
            target.finalizePosition(el);
        };
        Draggable.prototype.finalizeDelete = function () {
            Tactile.Polyfill.remove(this.el);
        };
        Draggable.prototype.finalizeRevert = function () {
            this.originalParentEl.insertBefore(this.el, this.originalParentEl.children[this.originalIndex]);
        };
        Draggable.prototype.revertOriginal = function () {
            this.el.setAttribute('style', this.originalStyle);
            this.originalParentEl.insertBefore(this.el, this.originalParentEl.children[this.originalIndex]);
        };
        return Draggable;
    })();
    Tactile.Draggable = Draggable;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var DragManager = (function () {
        function DragManager() {
            this._drags = {};
            this._pendingDrags = {};
            this.options = Tactile.defaultOptions;
            this._onPointerDownListener = this._onPointerDown.bind(this);
            this._onPointerMoveListener = this._onPointerMove.bind(this);
            this._onPointerUpListener = this._onPointerUp.bind(this);
            this._onKeyDownListener = this._onKeyDown.bind(this);
            this._bindEvents();
        }
        DragManager.prototype._bindEvents = function () {
            window.addEventListener(Tactile.Events.pointerDownEvent, this._onPointerDownListener, true);
        };
        DragManager.prototype._unbindEvents = function () {
            window.removeEventListener(Tactile.Events.pointerDownEvent, this._onPointerDownListener, true);
        };
        DragManager.prototype._bindDraggingEvents = function () {
            window.addEventListener('keydown', this._onKeyDownListener, false);
            window.addEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            window.addEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, false);
        };
        DragManager.prototype._unbindDraggingEvents = function () {
            window.removeEventListener('keydown', this._onKeyDownListener, false);
            window.removeEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            window.removeEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, false);
        };
        DragManager.prototype._bindDraggingEventsForTarget = function (el) {
            el.addEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            el.addEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, false);
        };
        DragManager.prototype._unbindDraggingEventsForTarget = function (el) {
            el.removeEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            el.removeEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, false);
        };
        DragManager.prototype._onPointerDown = function (e) {
            if (e instanceof MouseEvent && e.which !== 0 && e.which !== 1)
                return;
            for (var _i = 0, _a = Tactile.Events.normalizePointerEvent(e); _i < _a.length; _i++) {
                var pointer = _a[_i];
                if (Tactile.Dom.ancestors(pointer.target, this.options.cancel).length > 0)
                    continue;
                var draggableEl = Tactile.Draggable.closestEnabled(pointer.target);
                if (!draggableEl)
                    continue;
                if (!this.options.pickUpDelay) {
                    this.startDrag(draggableEl, pointer.id, pointer.xy, pointer.xyEl);
                }
                else {
                    this.scheduleDrag(draggableEl, pointer.id, pointer.xy);
                }
                ;
                Tactile.Events.cancel(e);
            }
        };
        DragManager.prototype._onPointerMove = function (e) {
            for (var _i = 0, _a = Tactile.Events.normalizePointerEvent(e); _i < _a.length; _i++) {
                var pointer = _a[_i];
                if (this._drags[pointer.id]) {
                    this._drags[pointer.id].move(pointer.xy, pointer.xyEl);
                    Tactile.Events.cancel(e);
                }
                if (this._pendingDrags[pointer.id]) {
                    var pendingDrag = this._pendingDrags[pointer.id];
                    if (this.options.pickUpDistance > 0 && Tactile.Vector.length(Tactile.Vector.subtract(pendingDrag.xy, pointer.xy)) > this.options.pickUpDistance)
                        this.startScheduledDrag(pointer.id);
                }
            }
        };
        DragManager.prototype._onPointerUp = function (e) {
            for (var _i = 0, _a = Tactile.Events.normalizePointerEvent(e); _i < _a.length; _i++) {
                var pointer = _a[_i];
                if (this._drags[pointer.id]) {
                    this.endDrag(pointer.id);
                    Tactile.Events.cancel(e);
                }
                if (this._pendingDrags[pointer.id]) {
                    this.cancelScheduledDrag(pointer.id);
                }
            }
        };
        DragManager.prototype._onKeyDown = function (e) {
            if (e.which === 27) {
                Object.keys(this._drags).forEach(function (dragId) {
                    this.endDrag(parseInt(dragId, 10), true, e.shiftKey);
                }.bind(this));
            }
        };
        DragManager.prototype.startDrag = function (draggableEl, dragId, xy, xyEl) {
            Tactile.Dom.clearSelection();
            document.body.setAttribute('data-drag-in-progress', '');
            this._bindDraggingEvents();
            if (xyEl)
                this._bindDraggingEventsForTarget(xyEl);
            return this._drags[dragId] = new Tactile.Drag(draggableEl, xy, xyEl, this.options);
        };
        DragManager.prototype.scheduleDrag = function (draggableEl, dragId, xy) {
            var onPickUpTimeout = function () { this.startScheduledDrag(dragId); }.bind(this);
            this._pendingDrags[dragId] = {
                el: draggableEl,
                xy: xy,
                timerId: setTimeout(onPickUpTimeout, this.options.pickUpDelay)
            };
        };
        DragManager.prototype.endDrag = function (dragId, cancel, abort) {
            if (cancel === void 0) { cancel = false; }
            if (abort === void 0) { abort = false; }
            var drag = this._drags[dragId];
            if (!cancel)
                drag.drop();
            else
                drag.cancel(abort);
            delete this._drags[dragId];
            if (Object.keys(this._drags).length == 0) {
                document.body.removeAttribute('data-drag-in-progress');
                this._unbindDraggingEvents();
                this._unbindDraggingEventsForTarget(drag.draggable.el);
            }
        };
        DragManager.prototype.startScheduledDrag = function (dragId) {
            var pendingDrag = this._pendingDrags[dragId];
            clearTimeout(pendingDrag.timerId);
            this.startDrag(pendingDrag.el, pendingDrag.id, pendingDrag.xy, pendingDrag.xyEl);
            delete this._pendingDrags[pendingDrag.id];
        };
        DragManager.prototype.cancelScheduledDrag = function (dragId) {
            var pendingDrag = this._pendingDrags[dragId];
            clearTimeout(pendingDrag.timerId);
            delete this._pendingDrags[pendingDrag.id];
        };
        return DragManager;
    })();
    Tactile.DragManager = DragManager;
    ;
    window['dragManager'] = new DragManager();
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Droppable = (function (_super) {
        __extends(Droppable, _super);
        function Droppable(el, drag) {
            _super.call(this, el, drag);
        }
        Droppable.prototype.enter = function (xy) {
        };
        Droppable.prototype.move = function (xy) {
        };
        Droppable.prototype.leave = function () {
        };
        Droppable.prototype.finalizeDrop = function (draggable) { };
        return Droppable;
    })(Tactile.Container);
    Tactile.Droppable = Droppable;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var attribute = 'data-drag-fence';
    var selector = '[data-drag-fence]';
    var Fence = (function () {
        function Fence(el, drag) {
            this.el = el;
            this.drag = drag;
            this.tags = Tactile.Attributes.getTags(el, attribute, ['*']);
        }
        Fence.closestForDraggable = function (drag, draggable) {
            var el = draggable.el;
            while (el = Tactile.Dom.closest(el.parentElement, selector)) {
                var candidateFence = new Fence(el, drag);
                if (candidateFence.constrains(draggable.tags)) {
                    return candidateFence;
                }
            }
            return null;
        };
        Fence.prototype.constrains = function (tags) {
            var _this = this;
            return this.tags.indexOf('*') !== -1
                || tags.some(function (t) { return _this.tags.indexOf(t) !== -1; });
        };
        Fence.prototype.getConstrainedXY = function (xy) {
            var _this = this;
            var gripOffset = this.drag.helper.gripOffset;
            var size = this.drag.helper.size;
            var tl = [xy[0] + gripOffset[0], xy[1] + gripOffset[1]];
            var rect = this.drag.geometryCache.get(this.el, 'pr', function () { return Tactile.Dom.getPaddingClientRect(_this.el); });
            tl[0] = Tactile.Maths.coerce(tl[0], rect.left, rect.right - size[0]);
            tl[1] = Tactile.Maths.coerce(tl[1], rect.top, rect.bottom - size[1]);
            return [tl[0] - gripOffset[0], tl[1] - gripOffset[1]];
        };
        return Fence;
    })();
    Tactile.Fence = Fence;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Helper = (function () {
        function Helper(drag, draggable) {
            this.scale = [1, 1];
            this.drag = drag;
            this.xy = [0, 0];
            this._initialize(draggable);
        }
        Helper.prototype._initialize = function (draggable) {
            this.el = draggable.el.cloneNode(true);
            this.el.removeAttribute("id");
            this.el.setAttribute("data-drag-helper", "");
            var s = this.el.style;
            if (this.drag.options.helperCloneStyles) {
                Tactile.Dom.copyComputedStyles(draggable.el, this.el);
                Tactile.Dom.stripClasses(this.el);
                s.setProperty('position', 'fixed', 'important');
                s.setProperty('display', 'block', 'important');
                s.setProperty('zIndex', '100000', 'important');
                s.opacity = '1';
                s.cursor = '';
                s.transform = '';
                s.transformOrigin = '';
                s.boxShadow = '';
            }
            ;
            s.webkitTransition = "none";
            s.transition = "none";
            s.webkitTransform = "none";
            s.transform = "none";
            s.margin = "0";
            var rect = draggable.el.getBoundingClientRect();
            this.gripXY = Tactile.Vector.subtract(this.drag.xy, [rect.left, rect.top]);
            this.gripRelative = Tactile.Vector.divide(this.gripXY, [rect.width, rect.height]);
            this.gripOffset = Tactile.Vector.multiplyScalar(this.gripXY, -1);
            Tactile.Dom.topLeft(this.el, this.gripOffset);
            Tactile.Dom.translate(this.el, this.drag.xy);
            this.el.style.width = rect.width + 'px';
            this.el.style.height = rect.height + 'px';
            document.body.appendChild(this.el);
            this.setPosition(this.drag.xy);
            this.setSizeAndScale(draggable.originalSize, draggable.originalScale, false);
            Tactile.Animation.set(this.el, {
                left: this.gripOffset[0],
                top: this.gripOffset[1],
                transformOriginX: this.gripXY[0],
                transformOriginY: this.gripXY[1]
            });
            this.el.focus();
            this._pickUp();
        };
        Helper.prototype.setAction = function (action) {
            var opacity = 1;
            switch (action) {
                case "revert":
                    opacity = 0.50;
                    break;
                case "delete":
                    opacity = 0.25;
                    break;
            }
            Tactile.Animation.set(this.el, { opacity: opacity }, { duration: 200 });
        };
        Helper.prototype.setPosition = function (xy) {
            if (Tactile.Vector.equals(this.xy, xy))
                return;
            Tactile.Animation.set(this.el, {
                translateX: [xy[0], xy[0]],
                translateY: [xy[1], xy[1]],
                translateZ: [1, 1]
            });
            this.xy = xy;
        };
        Helper.prototype.setSizeAndScale = function (size, scale, animate) {
            if (animate === void 0) { animate = true; }
            if (Tactile.Vector.equals(this.size, size) && Tactile.Vector.equals(this.scale, scale))
                return;
            this.size = size;
            this.scale = scale;
            this.gripXY = Tactile.Vector.multiply(this.gripRelative, size);
            this.gripOffset = Tactile.Vector.multiplyScalar(this.gripXY, -1);
            var minimalDelta = 0.0001;
            Tactile.Animation.set(this.el, {
                width: size[0],
                height: size[1],
                left: this.gripOffset[0],
                top: this.gripOffset[1],
                transformOriginX: this.gripXY[0],
                transformOriginY: this.gripXY[1],
                scaleX: [scale[0], this.scale[0] + minimalDelta],
                scaleY: [scale[1], this.scale[1] + minimalDelta]
            }, animate ? this.drag.options.resizeAnimation : undefined);
        };
        Helper.prototype.animateToElementAndPutDown = function (el, complete) {
            Tactile.Animation.stop(this.el);
            var rect = el.getBoundingClientRect();
            var minimalDelta = 0.0001;
            Tactile.Animation.set(this.el, {
                rotateZ: 0,
                boxShadowBlur: 0,
                top: [0, 0 + minimalDelta],
                left: [0, 0 + minimalDelta],
                translateX: [rect.left, this.xy[0] - this.gripRelative[0] * rect.width + minimalDelta],
                translateY: [rect.top, this.xy[1] - this.gripRelative[1] * rect.height + minimalDelta],
                transformOriginX: [this.gripXY[0], this.gripXY[0] + minimalDelta],
                transformOriginY: [this.gripXY[1], this.gripXY[1] + minimalDelta],
                width: el.offsetWidth,
                height: el.offsetHeight
            }, this.drag.options.dropAnimation, complete);
        };
        Helper.prototype.animateDelete = function (complete) {
            Tactile.Animation.stop(this.el);
            Tactile.Animation.set(this.el, { opacity: 0 }, this.drag.options.deleteAnimation, complete);
        };
        Helper.prototype.dispose = function () {
            Tactile.Polyfill.remove(this.el);
        };
        Helper.prototype._pickUp = function () {
            Tactile.Animation.set(this.el, {
                rotateZ: [this.drag.options.helperRotation, 0],
                boxShadowBlur: [this.drag.options.helperShadowSize, 'easeOutBack']
            }, this.drag.options.pickUpAnimation);
        };
        return Helper;
    })();
    Tactile.Helper = Helper;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Placeholder = (function () {
        function Placeholder(el, drag, isOriginalEl) {
            if (isOriginalEl === void 0) { isOriginalEl = true; }
            this.el = el;
            this.drag = drag;
            this.isOriginalEl = isOriginalEl;
            this._originalStyle = el.getAttribute('style');
            this._originalStyles = getComputedStyle(el);
            this._updateDimensions();
            Tactile.Polyfill.addClass(this.el, this.drag.options.placeholderClass);
            this.el.setAttribute('data-drag-placeholder', '');
            this.el.style.opacity = "0";
            this.setState("hidden", false);
        }
        Placeholder.buildPlaceholder = function (containerEl, drag) {
            var el = drag.draggable.el.cloneNode(true);
            el.removeAttribute('id');
            containerEl.appendChild(el);
            return new Placeholder(el, drag, false);
        };
        Placeholder.prototype._updateDimensions = function () {
            this.size = [this.el.offsetWidth, this.el.offsetHeight];
            this.outerSize = [Tactile.Dom.outerWidth(this.el, true), Tactile.Dom.outerHeight(this.el, true)];
            this.scale = Tactile.Dom.clientScale(this.el);
        };
        Placeholder.prototype.setState = function (state, animate) {
            if (animate === void 0) { animate = true; }
            if (this.state === state)
                return;
            var velocityOptions = animate
                ? { duration: 200, queue: false }
                : { duration: 0, queue: false };
            switch (state) {
                case "hidden":
                    this.el.style.visibility = 'hidden';
                    Tactile.Animation.set(this.el, {
                        marginBottom: -this.size[1],
                        marginRight: -this.size[0]
                    }, animate ? this.drag.options.containerResizeAnimation : undefined);
                    break;
                case "ghost":
                case "materialized":
                    this.el.style.visibility = '';
                    this.el.style.marginBottom = '';
                    Tactile.Animation.set(this.el, { opacity: state === 'ghost' ? 0.1 : 1.0 }, velocityOptions);
                    Tactile.Animation.set(this.el, {
                        marginBottom: parseInt(this._originalStyles.marginBottom, 10),
                        marginRight: parseInt(this._originalStyles.marginRight, 10)
                    }, animate ? this.drag.options.containerResizeAnimation : undefined);
                    break;
            }
            this.state = state;
        };
        Placeholder.prototype.dispose = function () {
            Tactile.Animation.stop(this.el);
            if (this.isOriginalEl) {
                this.el.removeAttribute('data-drag-placeholder');
                Tactile.Polyfill.removeClass(this.el, this.drag.options.placeholderClass);
                this.el.style.visibility = '';
                this.el.style.opacity = '';
                this.el.style.transform = '';
            }
            else {
                Tactile.Polyfill.remove(this.el);
                this.el = null;
            }
        };
        return Placeholder;
    })();
    Tactile.Placeholder = Placeholder;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Scrollable = (function () {
        function Scrollable(el, drag) {
            var _this = this;
            this._bounds = null;
            this._offset = null;
            this._velocity = [0, 0];
            this._hEnabled = false;
            this._vEnabled = false;
            this._hSensitivity = 0;
            this._vSensitivity = 0;
            this._lastUpdate = null;
            this.el = el;
            this.drag = drag;
            var style = getComputedStyle(this.el);
            this._hEnabled = style.overflowX === 'auto' || style.overflowX === 'scroll';
            this._vEnabled = style.overflowY === 'auto' || style.overflowY === 'scroll';
            if (this.el.tagName === 'BODY') {
                var w = document.documentElement.clientWidth;
                var h = document.documentElement.clientHeight;
                this._bounds = { left: 0, top: 0, width: w, height: h, right: w, bottom: h };
            }
            else {
                this._bounds = this.drag.geometryCache.get(this.el, 'cr', function () { return _this.el.getBoundingClientRect(); });
            }
            var sensitivity = this.drag.options.scrollSensitivity;
            var percent = sensitivity.toString().indexOf('%') !== -1
                ? parseInt(sensitivity.toString(), 10) / 100
                : null;
            this._hSensitivity = Math.min(percent ? percent * this._bounds.width : parseInt(sensitivity.toString(), 10), this._bounds.width / 3);
            this._vSensitivity = Math.min(percent ? percent * this._bounds.height : parseInt(sensitivity.toString(), 10), this._bounds.height / 3);
        }
        Scrollable.closestReadyScrollable = function (el, drag, xy) {
            var scrollEls = Tactile.Dom.ancestors(el || document.body, '[data-drag-scrollable]');
            for (var _i = 0; _i < scrollEls.length; _i++) {
                var scrollEl = scrollEls[_i];
                var scrollable = new Scrollable(scrollEl, drag);
                if (scrollable.canScroll(xy))
                    return scrollable;
            }
            return null;
        };
        Scrollable.prototype.canScroll = function (xy) {
            this._updateVelocity(xy);
            return Tactile.Vector.lengthSquared(this._velocity) > 0;
        };
        Scrollable.prototype.step = function (xy) {
            this._updateVelocity(xy);
            if (!this._lastUpdate) {
                this._offset = [this.el.scrollLeft, this.el.scrollTop];
            }
            ;
            var currentUpdate = new Date();
            var elapsedTimeMs = this._lastUpdate !== null ? (currentUpdate.getTime() - this._lastUpdate.getTime()) : 16;
            this._offset = Tactile.Vector.add(this._offset, Tactile.Vector.multiplyScalar(this._velocity, elapsedTimeMs));
            if (this._velocity[0] !== 0)
                this.el.scrollLeft = this._offset[0];
            if (this._velocity[1] !== 0)
                this.el.scrollTop = this._offset[1];
            this._lastUpdate = currentUpdate;
            return (this._velocity[0] !== 0 || this._velocity[1] !== 0);
        };
        Scrollable.prototype._updateVelocity = function (xy) {
            var maxV = this.drag.options.scrollSpeed;
            var b = this._bounds;
            var v = [0, 0];
            if (Tactile.Maths.contains(b, xy)) {
                if (this._hEnabled) {
                    if (xy[0] > b.right - this._hSensitivity && Tactile.Dom.canScrollRight(this.el))
                        v[0] = Tactile.Maths.scale(xy[0], [b.right - this._hSensitivity, b.right], [0, +maxV]);
                    if (xy[0] < b.left + this._hSensitivity && Tactile.Dom.canScrollLeft(this.el))
                        v[0] = Tactile.Maths.scale(xy[0], [b.left + this._hSensitivity, b.left], [0, -maxV]);
                }
                if (this._vEnabled) {
                    if (xy[1] > b.bottom - this._vSensitivity && Tactile.Dom.canScrollDown(this.el))
                        v[1] = Tactile.Maths.scale(xy[1], [b.bottom - this._vSensitivity, b.bottom], [0, +maxV]);
                    if (xy[1] < b.top + this._vSensitivity && Tactile.Dom.canScrollUp(this.el))
                        v[1] = Tactile.Maths.scale(xy[1], [b.top + this._vSensitivity, b.top], [0, -maxV]);
                }
            }
            this._velocity = v;
        };
        return Scrollable;
    })();
    Tactile.Scrollable = Scrollable;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Sortable = (function (_super) {
        __extends(Sortable, _super);
        function Sortable(el, drag) {
            _super.call(this, el, drag);
            this._style = getComputedStyle(this.el);
            this._forceFeedRequired = true;
            this._childMeasures = new Tactile.Cache();
            this._initializeDirection();
        }
        Sortable.prototype._initializeDirection = function () {
            this._direction = this.el.getAttribute('data-drag-sortable') || "vertical";
            this._directionProperties = this._direction === "vertical"
                ? {
                    index: 1,
                    translate: 'translateY',
                    paddingStart: 'paddingTop',
                    endMargin: 'marginBottom',
                    layoutOffset: 'offsetTop',
                    outerDimension: 'outerHeight'
                }
                : {
                    index: 0,
                    translate: 'translateX',
                    paddingStart: 'paddingLeft',
                    endMargin: 'marginRight',
                    layoutOffset: 'offsetLeft',
                    outerDimension: 'outerWidth'
                };
        };
        Sortable.prototype._initializePlaceholder = function () {
            if (this.drag.draggable.originalParentEl === this.el) {
                this.placeholder = new Tactile.Placeholder(this.drag.draggable.el, this.drag);
            }
            else {
                this.placeholder = Tactile.Placeholder.buildPlaceholder(this.el, this.drag);
            }
        };
        Sortable.prototype._initializeChildAndSiblingEls = function () {
            this._childEls = Tactile.Dom.children(this.el);
            this._siblingEls = this._childEls.slice(0);
            var placeholderElIndex = this._childEls.indexOf(this.placeholder.el);
            if (placeholderElIndex !== -1) {
                this._siblingEls.splice(placeholderElIndex, 1);
            }
        };
        Sortable.prototype.enter = function (xy) {
            if (!this.placeholder) {
                this._initializePlaceholder();
                this._initializeChildAndSiblingEls();
            }
            this.placeholder.setState("ghost");
            this.helperSize = this.placeholder.size;
            this.helperScale = this.placeholder.scale;
            this.move(xy);
            this._childMeasures.clear();
        };
        Sortable.prototype.move = function (xy) {
            var _this = this;
            if (this._siblingEls.length === 0) {
                if (this.index !== 0) {
                    this.index = 0;
                    this._updateChildTranslations();
                }
                return;
            }
            var bounds = this.drag.geometryCache.get(this.el, 'cr', function () { return _this.el.getBoundingClientRect(); });
            var sl = this.drag.geometryCache.get(this.el, 'sl', function () { return _this.el.scrollLeft; });
            var st = this.drag.geometryCache.get(this.el, 'st', function () { return _this.el.scrollTop; });
            var innerXY = [xy[0] - bounds.left + sl - parseInt(this._style.paddingLeft, 10),
                xy[1] - bounds.top + st - parseInt(this._style.paddingTop, 10)];
            var adjustedXY = [innerXY[0] - this.drag.helper.gripXY[0],
                innerXY[1] - this.drag.helper.gripXY[1]];
            adjustedXY = [adjustedXY[0] / this.helperScale[0],
                adjustedXY[1] / this.helperScale[1]];
            var naturalOffset = 0;
            var newIndex = 0;
            do {
                var measure = this._getChildMeasure(this._siblingEls[newIndex]);
                if (adjustedXY[this._directionProperties.index] < naturalOffset + measure.dimension / 2)
                    break;
                naturalOffset += measure.dimension;
                newIndex++;
            } while (newIndex < this._siblingEls.length);
            this._setPlaceholderIndex(newIndex);
        };
        Sortable.prototype._setPlaceholderIndex = function (newIndex) {
            if (newIndex !== this.index) {
                this.index = newIndex;
                this._updateChildTranslations();
            }
        };
        Sortable.prototype.leave = function () {
            if (this.leaveAction === "copy" && this.placeholder.isOriginalEl) {
                this.placeholder.setState("materialized");
            }
            else {
                this.index = null;
                this._childMeasures.clear();
                this.placeholder.setState("hidden");
                this._updateChildTranslations();
            }
        };
        Sortable.prototype.finalizePosition = function (el) {
            this.el.insertBefore(el, this.el.children[this.index]);
        };
        Sortable.prototype._getChildMeasure = function (el) {
            function getMeasure() {
                return {
                    layoutOffset: el[this._directionProperties.layoutOffset] - parseInt(this._style[this._directionProperties.paddingStart], 10),
                    dimension: Tactile.Dom[this._directionProperties.outerDimension](el, true),
                    translation: null
                };
            }
            var measure = this._childMeasures.get(el, 'measures', getMeasure.bind(this));
            return measure;
        };
        Sortable.prototype._updateChildTranslations = function () {
            var offset = 0;
            var placeholderOffset = null;
            var translatedEls = [];
            var translatedValues = [];
            this._siblingEls.forEach(function (el, index) {
                if (index === this.index) {
                    placeholderOffset = offset;
                    offset += this.placeholder.outerSize[this._directionProperties.index];
                }
                var measure = this._getChildMeasure(el);
                var newTranslation = offset - measure.layoutOffset;
                if (measure.translation !== newTranslation || this._forceFeedRequired) {
                    measure.translation = newTranslation;
                    translatedEls.push(el);
                    translatedValues.push(newTranslation);
                }
                offset += measure.dimension;
            }.bind(this));
            if (this._forceFeedRequired) {
                Tactile.Animation.set(translatedEls, (_a = {}, _a[this._directionProperties.translate] = [function (i) { return translatedValues[i]; },
                    function (i) { return translatedValues[i] + Math.random() / 100; }], _a), this.drag.options.reorderAnimation);
            }
            else {
                Tactile.Animation.set(translatedEls, (_b = {}, _b[this._directionProperties.translate] = function (i) { return translatedValues[i]; }, _b), this.drag.options.reorderAnimation);
            }
            if (placeholderOffset === null)
                placeholderOffset = offset;
            var placeholderMeasure = this._getChildMeasure(this.placeholder.el);
            var newPlaceholderTranslation = placeholderOffset - placeholderMeasure.layoutOffset;
            if (placeholderMeasure.translation !== newPlaceholderTranslation || this._forceFeedRequired) {
                Tactile.Dom.transform(this.placeholder.el, (_c = {}, _c[this._directionProperties.translate] = newPlaceholderTranslation, _c));
                placeholderMeasure.translation = newPlaceholderTranslation;
            }
            this._forceFeedRequired = false;
            var _a, _b, _c;
        };
        Sortable.prototype._clearChildTranslations = function () {
            Tactile.Animation.stop(this._siblingEls || []);
            if (this._childEls) {
                this._childEls.forEach(function (el) {
                    el.style.transform = '';
                    el.style.webkitTransform = '';
                });
            }
            this._forceFeedRequired = true;
        };
        Sortable.prototype.dispose = function () {
            if (this.placeholder)
                this.placeholder.dispose();
            this._clearChildTranslations();
            this._childMeasures.dispose();
        };
        return Sortable;
    })(Tactile.Container);
    Tactile.Sortable = Sortable;
})(Tactile || (Tactile = {}));
//# sourceMappingURL=Tactile.js.map