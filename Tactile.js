var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Tactile;
(function (Tactile) {
    var Animation;
    (function (Animation) {
        function set(els, target, options, complete) {
            if (options === void 0) { options = { duration: 0 }; }
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
                var elsArray = [].concat(els);
                for (var i = 0; i < elsArray.length; i++) {
                    var el = elsArray[i];
                    applyStyleProperties(el, target, i);
                    applyTransformProperties(el, target, i);
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
        function clear(els) {
            if (window["Velocity"]) {
                for (var _i = 0, _a = [].concat(els); _i < _a.length; _i++) {
                    var el = _a[_i];
                    Velocity.Utilities.removeData(el, ["velocity"]);
                }
            }
        }
        Animation.clear = clear;
        function animateDomMutation(el, mutationFunction, options, complete) {
            var startIndex = options.startIndex || 0;
            var endIndex = Math.min(options.endIndex || el.children.length + 1, startIndex + options.elementLimit || Number.MAX_VALUE);
            var cache = new Tactile.Cache();
            var oldOffsets = childOffsetMap(cache, 'old', el, startIndex, endIndex);
            mutationFunction();
            var newOffsets = childOffsetMap(cache, 'new', el, startIndex, endIndex);
            animateBetweenOffsets(cache, el, startIndex, endIndex, options.animationOptions, complete);
        }
        Animation.animateDomMutation = animateDomMutation;
        function animateDomMutationLayoutSize(el, mutationFunction, options) {
            var oldScrollSize = [el.scrollWidth, el.scrollHeight];
            var oldOffsetSize = [el.offsetWidth, el.offsetHeight];
            var oldWidthStyle = el.style.width;
            var oldHeightStyle = el.style.height;
            el.style.width = oldOffsetSize[0] + "px";
            el.style.height = oldOffsetSize[1] + "px";
            mutationFunction();
            var newScrollSize = [el.scrollWidth, el.scrollHeight];
            function complete() {
                el.style.width = oldWidthStyle;
                el.style.height = oldHeightStyle;
            }
            Velocity(el, {
                width: oldOffsetSize[0] + (newScrollSize[0] - oldScrollSize[0]),
                height: oldOffsetSize[1] + (newScrollSize[1] - oldScrollSize[1])
            }, {
                duration: 3000,
                easing: 'ease-in-out',
                complete: complete
            });
        }
        Animation.animateDomMutationLayoutSize = animateDomMutationLayoutSize;
        ;
        function animateBetweenOffsets(cache, el, startIndex, endIndex, animationOptions, complete) {
            var els = [];
            var elOffsets = [];
            for (var _i = 0, _a = cache.getElements(); _i < _a.length; _i++) {
                var childEl = _a[_i];
                if (Tactile.Dom.matches(childEl, '[data-drag-placeholder]'))
                    continue;
                var oldOffset = cache.get(childEl, 'old');
                var newOffset = cache.get(childEl, 'new');
                if (!oldOffset || !newOffset || Tactile.Vector.equals(oldOffset, newOffset))
                    continue;
                els.push(childEl);
                elOffsets.push(Tactile.Vector.subtract(oldOffset, newOffset));
                Tactile.Dom.translate(childEl, Tactile.Vector.subtract(oldOffset, newOffset));
            }
            set(els, {
                translateX: [0, function (i) { return elOffsets[i][0]; }],
                translateY: [0, function (i) { return elOffsets[i][1]; }],
            }, {
                duration: animationOptions.duration,
                easing: animationOptions.easing
            }, complete);
        }
        function childOffsetMap(cache, key, el, startIndex, endIndex) {
            for (var i = startIndex; i < endIndex; i++) {
                var childEl = el.children[i];
                if (childEl)
                    cache.set(childEl, key, [childEl.offsetLeft, childEl.offsetTop]);
            }
        }
        function unwrapVelocityPropertyValue(value, index) {
            if (typeof value === 'function')
                value = value(index);
            return Array.isArray(value) ? value[0] : value;
        }
        function applyStyleProperties(el, properties, index) {
            var propertyUnits = {
                "top": "px",
                "left": "px",
                "opacity": "",
                "width": "px",
                "height": "px"
            };
            for (var property in properties) {
                if (propertyUnits[property]) {
                    var value = unwrapVelocityPropertyValue(properties[property], index);
                    el.style[property] = value + propertyUnits[property];
                }
            }
        }
        function applyTransformProperties(el, properties, index) {
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
                    var value_1 = unwrapVelocityPropertyValue(properties[property], index);
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
            return (el !== descendantEl && el.contains(descendantEl));
        }
        Dom.isDescendant = isDescendant;
        function closest(el, selector) {
            if (el === null)
                return;
            if (typeof el["closest"] === 'function') {
                return el["closest"](selector);
            }
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
                if (!selector || matches(el, selector))
                    parents.push(el);
            }
            return parents;
        }
        Dom.parents = parents;
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
        function copyComputedStyles(sourceEl, targetEl) {
            if (sourceEl && targetEl) {
                targetEl.style.cssText = getComputedStyle(sourceEl).cssText;
                var targetChildren_1 = children(targetEl);
                children(sourceEl).forEach(function (el, i) { return copyComputedStyles(el, targetChildren_1[i]); });
            }
        }
        Dom.copyComputedStyles = copyComputedStyles;
        function stripClasses(el) {
            el.className = '';
            children(el).forEach(function (el) { return stripClasses(el); });
        }
        Dom.stripClasses = stripClasses;
        function getContentBoxClientRect(el) {
            var style = getComputedStyle(el);
            var rect = el.getBoundingClientRect();
            var l = parseInt(style.borderLeftWidth, 10) || 0;
            var t = parseInt(style.borderTopWidth, 10) || 0;
            var r = parseInt(style.borderRightWidth, 10) || 0;
            var b = parseInt(style.borderBottomWidth, 10) || 0;
            return {
                top: rect.top + t,
                left: rect.left + l,
                right: rect.right - r,
                bottom: rect.bottom - b,
                width: rect.width - l - r,
                height: rect.height - t - b
            };
        }
        Dom.getContentBoxClientRect = getContentBoxClientRect;
        function children(el, selector) {
            return [].slice.call(el.children);
        }
        Dom.children = children;
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
    })(Maths = Tactile.Maths || (Tactile.Maths = {}));
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Geometry;
    (function (Geometry) {
        function rectContains(rect, xy) {
            return xy[0] >= rect.left && xy[0] <= rect.right
                && xy[1] >= rect.top && xy[1] <= rect.bottom;
        }
        Geometry.rectContains = rectContains;
    })(Geometry = Tactile.Geometry || (Tactile.Geometry = {}));
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
    var Text;
    (function (Text) {
        function toProperCase(text) {
            return text
                ? text.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); })
                : null;
        }
        Text.toProperCase = toProperCase;
    })(Text = Tactile.Text || (Tactile.Text = {}));
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
            this.leaveAction = Tactile.DragAction[Tactile.Text.toProperCase(Tactile.Attributes.get(el, 'data-drag-leave-action', 'move'))];
            this.enterAction = Tactile.DragAction[Tactile.Text.toProperCase(Tactile.Attributes.get(el, 'data-drag-enter-action', 'move'))];
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
            if (Tactile.Dom.matches(el, '[data-drag-sortable]'))
                return new Tactile.Sortable(el, drag);
            if (Tactile.Dom.matches(el, '[data-drag-droppable]'))
                return new Tactile.Droppable(el, drag);
            return null;
        };
        Container.prototype.willAccept = function (draggable) {
            var _this = this;
            if (this.el === draggable.originalParentEl)
                return true;
            if (this.el.hasAttribute('data-drag-disabled'))
                return false;
            return this.accepts.indexOf('*') !== -1 || draggable.tags.some(function (t) { return _this.accepts.indexOf(t) !== -1; });
        };
        Container.prototype.enter = function (xy) { };
        Container.prototype.move = function (xy) { };
        Container.prototype.leave = function () { };
        Container.prototype.finalizePosition = function (el) { };
        Container.prototype.dispose = function () { };
        return Container;
    }());
    Tactile.Container = Container;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    ;
    Tactile.defaults = {
        cancel: 'input,textarea,a,button,select',
        helperResize: true,
        helperCloneStyles: true,
        animation: true,
        revertBehaviour: 'last',
        pickUpAnimation: { duration: 300, easing: 'ease-in-out' },
        pickDownAnimation: { duration: 300, easing: 'ease-in-out' },
        resizeAnimation: { duration: 600, easing: 'ease-in-out' },
        dropAnimation: { duration: 300, easing: 'ease-in-out' },
        reorderAnimation: { duration: 300, easing: 'ease-in-out' },
        deleteAnimation: { duration: 300, easing: 'ease-in-out' },
        containerResizeAnimation: { duration: 300, easing: 'ease-in-out' },
        pickUpDelay: 100,
        pickUpDistance: 10,
        helperRotation: -2,
        helperShadowSize: 25,
        placeholderClass: 'tactile-drag-placeholder',
        avoidDomMutations: true,
        scrollAutoDetect: true,
        scrollSensitivity: '15%',
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
                return fn ? elCache[key] = fn() : undefined;
            }
        };
        Cache.prototype.set = function (el, key, value) {
            var elCache = this._getElementCache(el);
            return elCache[key] = value;
        };
        Cache.prototype.clear = function () {
            var _this = this;
            if (_useMap) {
                this._cache.clear();
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
        Cache.prototype.forEach = function (key, fn) {
            this.getElements().forEach(function (el) {
                var value = this.get(el, key);
                if (value !== undefined)
                    fn(value, el);
            }.bind(this));
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
    }());
    Tactile.Cache = Cache;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Canvas = (function (_super) {
        __extends(Canvas, _super);
        function Canvas(el, drag) {
            _super.call(this, el, drag);
            this.offset = [0, 0];
            this.grid = null;
            this.domain = null;
            var gridAttribute = Tactile.Attributes.get(this.el, 'data-drag-grid', '10,10');
            if (gridAttribute !== null) {
                var tokens = gridAttribute.split(',');
                this.grid = [parseInt(tokens[0], 10) || 1,
                    parseInt(tokens[1], 10) || parseInt(tokens[0], 10) || 1];
            }
        }
        Canvas.prototype.enter = function (xy) {
            if (!this.placeholder) {
                this._insertPlaceholder();
                this.helperSize = this.placeholder.size;
                this.helperScale = this.placeholder.scale;
            }
            this.placeholder.setState("ghost");
            this.move(xy);
        };
        Canvas.prototype.move = function (xy) {
            var _this = this;
            var gripOffset = this.drag.helper.gripOffset;
            var helperSize = this.drag.helper.size;
            var tl = [xy[0] + gripOffset[0], xy[1] + gripOffset[1]];
            var rect = this.drag.geometryCache.get(this.el, 'content-box', function () { return Tactile.Dom.getContentBoxClientRect(_this.el); });
            tl[0] = Tactile.Maths.coerce(tl[0], rect.left, rect.right - helperSize[0]);
            tl[1] = Tactile.Maths.coerce(tl[1], rect.top, rect.bottom - helperSize[1]);
            tl = [tl[0] - gripOffset[0], tl[1] - gripOffset[1]];
            var scrollOffset = this.drag.geometryCache.get(this.el, 'so', function () { return [_this.el.scrollLeft, _this.el.scrollTop]; });
            var localOffset = [tl[0] - rect.left - (parseInt(this.el.style.paddingLeft, 10) || 0) + scrollOffset[0] + this.drag.helper.gripOffset[0],
                tl[1] - rect.top - (parseInt(this.el.style.paddingTop, 10) || 0) + scrollOffset[1] + this.drag.helper.gripOffset[1]];
            localOffset = Tactile.Vector.divide(localOffset, this.helperScale);
            if (this.grid) {
                localOffset = [Math.round(localOffset[0] / this.grid[0]) * this.grid[0],
                    Math.round(localOffset[1] / this.grid[1]) * this.grid[1]];
            }
            Tactile.Dom.translate(this.placeholder.el, localOffset);
            this.offset = localOffset;
        };
        Canvas.prototype.leave = function () {
            if (this.leaveAction === Tactile.DragAction.Copy && this.placeholder.isOriginalEl) {
                this.placeholder.setState("materialized");
            }
            else {
                this.placeholder.setState("hidden");
            }
        };
        Canvas.prototype.finalizePosition = function (el) {
            Tactile.Dom.topLeft(el, this.offset);
            this.el.appendChild(el);
        };
        Canvas.prototype.dispose = function () {
            if (this.placeholder)
                this.placeholder.dispose();
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
        return Canvas;
    }(Tactile.Container));
    Tactile.Canvas = Canvas;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Drag = (function () {
        function Drag(draggableEl, xy, xyEl, options) {
            this.xy = xy;
            this.options = options;
            this.draggable = null;
            this.helper = null;
            this.source = null;
            this.target = null;
            this.boundary = null;
            this.action = Tactile.DragAction.Move;
            this.geometryCache = new Tactile.Cache();
            this.containerCache = new Tactile.Cache();
            this._xyChanged = false;
            this._hasScrolled = false;
            this._afRequestId = null;
            this._dragEnded = false;
            this.xyEl = xyEl || Tactile.Dom.elementFromPoint(this.xy);
            this.draggable = new Tactile.Draggable(draggableEl, this);
            this.helper = new Tactile.Helper(this, this.draggable);
            this.boundary = Tactile.Boundary.closestForDraggable(this, this.draggable);
            this._updateTarget();
            this.source = this.target;
            this._onScrollOrWheelListener = this._onScrollOrWheel.bind(this);
            this._bindScrollEvents();
            this._raise(this.draggable.el, 'dragstart');
        }
        Drag.prototype.move = function (xy, xyEl) {
            if (this._dragEnded)
                return;
            this.xy = xy;
            this.xyEl = xyEl;
            this._xyChanged = true;
            this._scheduleTick();
        };
        Drag.prototype.cancel = function (debugElements) {
            if (debugElements === void 0) { debugElements = false; }
            this._dragEnded = true;
            this._raise(this.draggable.el, 'dragend');
            this._cancelTick();
            if (!debugElements) {
                this.draggable.finalizeRevert();
                this.dispose();
            }
        };
        Drag.prototype.drop = function () {
            this._dragEnded = true;
            this._scroller = null;
            this._tick();
            this._cancelTick();
            if (!this._raise(this.draggable.el, "begindrop").defaultPrevented) {
                switch (this.action) {
                    case Tactile.DragAction.Move:
                    case Tactile.DragAction.Copy:
                        if (this.target.placeholder) {
                            this.helper.animateToElementAndPutDown(this.target.placeholder.el, this._finalizeAction.bind(this));
                        }
                        else {
                            this._finalizeAction();
                        }
                        break;
                    case Tactile.DragAction.Delete:
                        this.helper.animateDelete(this._finalizeAction.bind(this));
                        break;
                    case Tactile.DragAction.Revert:
                        this._finalizeAction();
                }
            }
            else {
                this.cancel();
            }
        };
        Drag.prototype.dispose = function () {
            this.containerCache.forEach('container', function (value) { value.dispose(); });
            this.helper.dispose();
            this.draggable.dispose();
            this.geometryCache.dispose();
            this.containerCache.dispose();
            this.target && this.target.dispose();
            this.source && this.source.dispose();
            this._unbindScrollEvents();
        };
        Drag.prototype._bindScrollEvents = function () {
            document.addEventListener('scroll', this._onScrollOrWheelListener, false);
            document.addEventListener('mousewheel', this._onScrollOrWheelListener, false);
            document.addEventListener('wheel', this._onScrollOrWheelListener, false);
        };
        Drag.prototype._unbindScrollEvents = function () {
            document.removeEventListener('scroll', this._onScrollOrWheelListener, false);
            document.removeEventListener('mousewheel', this._onScrollOrWheelListener, false);
            document.removeEventListener('wheel', this._onScrollOrWheelListener, false);
        };
        Drag.prototype._onScrollOrWheel = function () {
            this._hasScrolled = true;
            this.geometryCache.clear();
            this._scheduleTick();
        };
        Drag.prototype._scheduleTick = function () {
            if (!this._afRequestId) {
                this._afRequestId = Tactile.Polyfill.requestAnimationFrame(this._tick.bind(this));
            }
        };
        Drag.prototype._cancelTick = function () {
            if (this._afRequestId) {
                Tactile.Polyfill.cancelAnimationFrame(this._afRequestId);
                this._afRequestId = null;
            }
        };
        Drag.prototype._tick = function () {
            this._afRequestId = null;
            if (this._xyChanged || this._hasScrolled) {
                if (this.boundary) {
                    var constrainedXY = this.boundary.getConstrainedXY(this.xy);
                    if (!Tactile.Vector.equals(constrainedXY, this.xy)) {
                        this.xy = constrainedXY;
                        this.xyEl = null;
                    }
                }
                if (!this.xyEl)
                    this.xyEl = Tactile.Dom.elementFromPoint(this.xy);
                if (this.xyEl != this._lastXyEl && this.target && !this._dragEnded) {
                    this._scroller = Tactile.Scrollable.closestScrollableScrollable(this, this.xy, this.target.el);
                }
                this.helper.setPosition(this.xy);
                this._xyChanged = false;
                this._hasScrolled = false;
            }
            if (this._scroller) {
                if (this._scroller.continueScroll(this.xy)) {
                    this._onScrollOrWheel();
                }
                else {
                    this._scroller = null;
                }
                ;
                this._scheduleTick();
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
            if (this.source && this.source.leaveAction === Tactile.DragAction.Delete && newTarget !== this.source) {
                newTarget = null;
            }
            if (newTarget && this.boundary
                && !Tactile.Dom.isDescendant(this.boundary.el, newTarget.el)
                && this.boundary.el !== newTarget.el)
                return;
            if (newTarget === oldTarget)
                return;
            if ((newTarget || this.options.revertBehaviour !== "last") || (this.source && this.source.leaveAction === Tactile.DragAction.Delete)) {
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
                if (this.options.helperResize && container.helperSize) {
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
                return true;
            }
            else {
                return false;
            }
        };
        Drag.prototype._finalizeAction = function () {
            this._raise(this.draggable.el, 'enddrop');
            this._raise(this.draggable.el, 'dragend');
            if (this._raise(this.draggable.el, 'drop').returnValue !== false) {
                switch (this.action) {
                    case Tactile.DragAction.Move:
                        this.draggable.finalizeMove(this.target);
                        break;
                    case Tactile.DragAction.Copy:
                        this.draggable.finalizeCopy(this.target);
                        break;
                    case Tactile.DragAction.Delete:
                        this.draggable.finalizeDelete();
                        break;
                    case Tactile.DragAction.Revert:
                        this.draggable.finalizeRevert();
                        break;
                }
            }
            ;
            this.dispose();
        };
        Drag.prototype._computeAction = function (source, target) {
            if (source === target)
                return Tactile.DragAction.Move;
            var action = Tactile.DragAction.Move;
            var leave = this.source ? this.source.leaveAction : Tactile.DragAction.Move;
            var enter = this.target ? this.target.enterAction : Tactile.DragAction.Revert;
            if (leave === Tactile.DragAction.Copy || enter === Tactile.DragAction.Copy) {
                action = Tactile.DragAction.Copy;
            }
            if (enter === Tactile.DragAction.Revert)
                action = Tactile.DragAction.Revert;
            if (leave === Tactile.DragAction.Delete || enter === Tactile.DragAction.Delete)
                action = Tactile.DragAction.Delete;
            return action;
        };
        Drag.prototype._setAction = function (action) {
            if (this.action === action)
                return;
            this.helper.setAction(action);
            this.action = action;
        };
        Drag.prototype._raise = function (el, eventName) {
            var eventData = {
                bubbles: true,
                cancelable: true,
                detail: {
                    el: this.draggable.el,
                    data: this.draggable.data,
                    action: Tactile.DragAction[this.action].toLowerCase(),
                    helperEl: this.helper.el,
                    helperXY: this.helper.xy,
                    boundaryEl: this.boundary ? this.boundary.el : null,
                    sourceEl: this.draggable.originalParentEl,
                    sourceIndex: this.draggable.originalIndex,
                    sourceOffset: this.draggable.originalOffset,
                    targetEl: this.target ? this.target.el : null,
                    targetIndex: this.target ? this.target['index'] : null,
                    targetOffset: this.target ? this.target['offset'] : null
                }
            };
            return Tactile.Events.raise(el, 'tactile:' + eventName, eventData);
        };
        return Drag;
    }());
    Tactile.Drag = Drag;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    (function (DragAction) {
        DragAction[DragAction["Copy"] = 0] = "Copy";
        DragAction[DragAction["Move"] = 1] = "Move";
        DragAction[DragAction["Delete"] = 2] = "Delete";
        DragAction[DragAction["Revert"] = 3] = "Revert";
        DragAction[DragAction["Cancel"] = 4] = "Cancel";
    })(Tactile.DragAction || (Tactile.DragAction = {}));
    var DragAction = Tactile.DragAction;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Draggable = (function () {
        function Draggable(el, drag) {
            this.el = el;
            this.drag = drag;
            this.draggableId = Tactile.Attributes.get(el, 'data-drag-id');
            this.data = Tactile.Attributes.get(el, 'data-drag-data');
            this.tags = el.hasAttribute('data-drag-tag')
                ? Tactile.Attributes.getTags(el, 'data-drag-tag')
                : Tactile.Attributes.getTags(el.parentElement, 'data-drag-tag');
            this._captureOriginalPosition();
            this._initializeMutationListener();
        }
        Draggable.closest = function (el) {
            el = Tactile.Dom.closest(el, '[data-drag-handle],[data-drag-draggable],ol[data-drag-sortable] > li,ul[data-drag-canvas] > li');
            if (!el)
                return null;
            if (el.hasAttribute('data-drag-helper'))
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
        Draggable.prototype._captureOriginalPosition = function () {
            this.originalStyle = this.el.getAttribute('style');
            var style = getComputedStyle(this.el);
            this.originalParentEl = this.el.parentElement;
            this.originalIndex = Tactile.Dom.indexOf(this.el);
            this.originalSize = [this.el.offsetWidth, this.el.offsetHeight];
            this.originalScale = Tactile.Dom.clientScale(this.el);
            this.originalOffset = [parseInt(style.left, 10), parseInt(style.top, 10)];
        };
        Draggable.prototype._initializeMutationListener = function () {
            if (!window["MutationObserver"])
                return;
            this._mutObserver = new MutationObserver(this._onDomMutation.bind(this));
            this._mutObserver.observe(this.originalParentEl, { childList: true, subtree: false });
        };
        Draggable.prototype._onDomMutation = function (e) {
            console.log("Draggable._onDomMutation", e);
            this._updateDraggableElement();
        };
        Draggable.prototype._disposeMutationListener = function () {
            if (this._mutObserver) {
                this._mutObserver.disconnect();
                this._mutObserver = null;
            }
        };
        Draggable.prototype._updateDraggableElement = function () {
            if (!this.draggableId)
                return;
            var childrenWithId = Tactile.Dom.children(this.el, "[data-drag-id='" + this.draggableId + "']");
            if (childrenWithId.length > 0) {
                this.el = childrenWithId[0];
            }
        };
        Draggable.prototype.dispose = function () {
            this._disposeMutationListener();
        };
        Draggable.prototype.finalizeMove = function (target) {
            this.el.setAttribute('style', this.originalStyle);
            target.finalizePosition(this.el);
        };
        Draggable.prototype.finalizeCopy = function (target) {
            var el = this.el.cloneNode(true);
            el.setAttribute('style', this.originalStyle);
            el.removeAttribute('id');
            el.removeAttribute('data-drag-placeholder');
            target.finalizePosition(el);
        };
        Draggable.prototype.finalizeDelete = function () {
            Tactile.Polyfill.remove(this.el);
        };
        Draggable.prototype.finalizeRevert = function () {
            this.el.setAttribute('style', this.originalStyle);
            this.originalParentEl.insertBefore(this.el, this.originalParentEl.children[this.originalIndex]);
        };
        return Draggable;
    }());
    Tactile.Draggable = Draggable;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var DragManager = (function () {
        function DragManager(options) {
            this.options = Tactile.defaults;
            this._drags = {};
            this._pendingDrags = {};
            this._onPointerDownListener = this._onPointerDown.bind(this);
            this._onPointerMoveListener = this._onPointerMove.bind(this);
            this._onPointerUpListener = this._onPointerUp.bind(this);
            this._onClickListener = this._onClick.bind(this);
            this._onKeyDownListener = this._onKeyDown.bind(this);
            this._bindEvents();
            this.set(options);
        }
        DragManager.prototype.set = function (options) {
            for (var key in (options || {}))
                this.options[key] = options[key];
        };
        DragManager.prototype.destroy = function () {
            this._unbindEvents();
        };
        DragManager.prototype._bindEvents = function () {
            window.addEventListener(Tactile.Events.pointerDownEvent, this._onPointerDownListener, true);
            window.addEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, true);
        };
        DragManager.prototype._unbindEvents = function () {
            window.removeEventListener(Tactile.Events.pointerDownEvent, this._onPointerDownListener, true);
            window.removeEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, true);
        };
        DragManager.prototype._bindDragPendingEvents = function () {
            window.addEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            window.addEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, true);
        };
        DragManager.prototype._unbindDragPendingEvents = function () {
            window.removeEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            window.removeEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, true);
        };
        DragManager.prototype._bindDraggingEvents = function () {
            window.addEventListener('keydown', this._onKeyDownListener, true);
            window.addEventListener("click", this._onClickListener, true);
        };
        DragManager.prototype._unbindDraggingEvents = function () {
            window.removeEventListener('keydown', this._onKeyDownListener, true);
            window.removeEventListener("click", this._onClickListener, true);
        };
        DragManager.prototype._bindDraggingEventsForTarget = function (el) {
            el.addEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            el.addEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, true);
        };
        DragManager.prototype._unbindDraggingEventsForTarget = function (el) {
            el.removeEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            el.removeEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, true);
        };
        DragManager.prototype._onClick = function (e) {
            Tactile.Events.cancel(e);
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
                if (this.options.pickUpDelay === 0) {
                    this._startDrag(draggableEl, pointer.id, pointer.xy, pointer.xyEl);
                    Tactile.Events.cancel(e);
                }
                else {
                    this._scheduleDrag(draggableEl, pointer.id, pointer.xy);
                }
                ;
            }
            this._bindDragPendingEvents();
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
                        this._startScheduledDrag(pointer.id);
                }
            }
        };
        DragManager.prototype._onPointerUp = function (e) {
            for (var _i = 0, _a = Tactile.Events.normalizePointerEvent(e); _i < _a.length; _i++) {
                var pointer = _a[_i];
                if (this._drags[pointer.id]) {
                    this._endDrag(pointer.id);
                    Tactile.Events.cancel(e);
                }
                if (this._pendingDrags[pointer.id]) {
                    this._cancelScheduledDrag(pointer.id);
                }
            }
        };
        DragManager.prototype._onKeyDown = function (e) {
            if (e.which === 27) {
                Object.keys(this._drags).forEach(function (dragId) {
                    this._endDrag(parseInt(dragId, 10), true, e.shiftKey);
                }.bind(this));
            }
        };
        DragManager.prototype._scheduleDrag = function (draggableEl, dragId, xy) {
            var onPickUpTimeout = function () { this._startScheduledDrag(dragId); }.bind(this);
            this._pendingDrags[dragId] = {
                id: dragId,
                el: draggableEl,
                xy: xy,
                timerId: this.options.pickUpDelay ? setTimeout(onPickUpTimeout, this.options.pickUpDelay) : null
            };
        };
        DragManager.prototype._startScheduledDrag = function (dragId) {
            var pendingDrag = this._pendingDrags[dragId];
            clearTimeout(pendingDrag.timerId);
            this._startDrag(pendingDrag.el, pendingDrag.id, pendingDrag.xy, pendingDrag.xyEl);
            delete this._pendingDrags[dragId];
        };
        DragManager.prototype._cancelScheduledDrag = function (dragId) {
            var pendingDrag = this._pendingDrags[dragId];
            clearTimeout(pendingDrag.timerId);
            delete this._pendingDrags[pendingDrag.id];
        };
        DragManager.prototype._startDrag = function (draggableEl, dragId, xy, xyEl) {
            Tactile.Dom.clearSelection();
            document.body.setAttribute('data-drag-in-progress', '');
            this._bindDraggingEvents();
            if (xyEl)
                this._bindDraggingEventsForTarget(xyEl);
            return this._drags[dragId] = new Tactile.Drag(draggableEl, xy, xyEl, this.options);
        };
        DragManager.prototype._endDrag = function (dragId, cancel, abort) {
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
                setTimeout(function () {
                    this._unbindDraggingEvents();
                    this._unbindDragPendingEvents();
                    this._unbindDraggingEventsForTarget(drag.draggable.el);
                }.bind(this), 0);
            }
        };
        return DragManager;
    }());
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
        Droppable.prototype.finalizePosition = function (el) {
            Tactile.Polyfill.remove(el);
        };
        return Droppable;
    }(Tactile.Container));
    Tactile.Droppable = Droppable;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Boundary = (function () {
        function Boundary(el, drag) {
            this.el = el;
            this.drag = drag;
            this.tags = Tactile.Attributes.getTags(el, 'data-drag-bounds', ['*']);
        }
        Boundary.closestForDraggable = function (drag, draggable) {
            var el = draggable.el;
            while (el = Tactile.Dom.closest(el.parentElement, '[data-drag-bounds]')) {
                var candidateBound = new Boundary(el, drag);
                if (candidateBound.constrains(draggable.tags)) {
                    return candidateBound;
                }
            }
            return null;
        };
        Boundary.prototype.constrains = function (tags) {
            var _this = this;
            return this.tags.indexOf('*') !== -1 || tags.some(function (t) { return _this.tags.indexOf(t) !== -1; });
        };
        Boundary.prototype.getConstrainedXY = function (xy) {
            var _this = this;
            var gripOffset = this.drag.helper.gripOffset;
            var helperSize = this.drag.helper.size;
            var tl = [xy[0] + gripOffset[0], xy[1] + gripOffset[1]];
            var rect = this.drag.geometryCache.get(this.el, 'cb', function () { return Tactile.Dom.getContentBoxClientRect(_this.el); });
            tl[0] = Tactile.Maths.coerce(tl[0], rect.left, rect.right - helperSize[0]);
            tl[1] = Tactile.Maths.coerce(tl[1], rect.top, rect.bottom - helperSize[1]);
            return [tl[0] - gripOffset[0], tl[1] - gripOffset[1]];
        };
        return Boundary;
    }());
    Tactile.Boundary = Boundary;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Helper = (function () {
        function Helper(drag, draggable) {
            this.drag = drag;
            this.scale = [1, 1];
            this.xy = [0, 0];
            this._initialize(draggable);
        }
        Helper.prototype._initialize = function (draggable) {
            this.el = draggable.el.cloneNode(true);
            this.el.removeAttribute("id");
            this.el.setAttribute("data-drag-helper", "");
            this.el.removeAttribute("data-drag-placeholder");
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
            s.transition = "none";
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
                case Tactile.DragAction.Revert:
                    opacity = 0.50;
                    break;
                case Tactile.DragAction.Delete:
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
            this.size = size;
            this.scale = scale;
        };
        Helper.prototype.animateToElementAndPutDown = function (el, complete) {
            Tactile.Animation.stop(this.el);
            var rect = el.getBoundingClientRect();
            var minimalDelta = 0.0001;
            Tactile.Animation.set(this.el, {
                rotateZ: 0,
                boxShadowBlur: 0,
                translateX: rect.left - this.gripOffset[0] * this.scale[0],
                translateY: rect.top - this.gripOffset[1] * this.scale[1],
                width: el.offsetWidth,
                height: el.offsetHeight
            }, this.drag.options.dropAnimation, complete);
        };
        Helper.prototype.animateDelete = function (complete) {
            Tactile.Animation.stop(this.el);
            Tactile.Animation.set(this.el, {
                opacity: 0,
                scaleX: 0,
                scaleY: 0
            }, this.drag.options.deleteAnimation, complete);
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
    }());
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
            this._originalStyles = getComputedStyle(el);
            this._updateDimensions();
            Tactile.Polyfill.addClass(this.el, this.drag.options.placeholderClass);
            this.el.setAttribute('data-drag-placeholder', '');
            this.el.style.opacity = "0";
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
                    this.el.style.position = "absolute";
                    this.el.style.top = "-10000px";
                    this.el.style.left = "-10000px";
                    this.drag.geometryCache.clear();
                    break;
                case "ghost":
                case "materialized":
                    this.el.style.visibility = '';
                    this.el.style.position = "";
                    this.el.style.top = '';
                    this.el.style.left = '';
                    Tactile.Animation.set(this.el, { opacity: state === 'ghost' ? 0.1 : 1.0 }, velocityOptions);
                    this.drag.geometryCache.clear();
                    this._updateDimensions();
                    break;
            }
            this.state = state;
        };
        Placeholder.prototype.dispose = function () {
            if (!this.el)
                return;
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
    }());
    Tactile.Placeholder = Placeholder;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    (function (Direction) {
        Direction[Direction["Neither"] = 0] = "Neither";
        Direction[Direction["Horizontal"] = 1] = "Horizontal";
        Direction[Direction["Vertical"] = 2] = "Vertical";
        Direction[Direction["Both"] = 3] = "Both";
    })(Tactile.Direction || (Tactile.Direction = {}));
    var Direction = Tactile.Direction;
    var Scrollable = (function () {
        function Scrollable(el, drag) {
            var _this = this;
            this.el = el;
            this.drag = drag;
            this._bounds = null;
            this._offset = null;
            this._velocity = [0, 0];
            this._direction = Direction.Neither;
            this._sensitivity = [0, 0];
            this._lastUpdate = null;
            this._direction = Scrollable._getScrollableDirection(drag, this.el);
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
            this._sensitivity = [
                Math.min(percent ? percent * this._bounds.width : parseInt(sensitivity.toString(), 10), this._bounds.width / 3),
                Math.min(percent ? percent * this._bounds.height : parseInt(sensitivity.toString(), 10), this._bounds.height / 3)
            ];
        }
        Scrollable._detectScrollableDirection = function (el) {
            var style = getComputedStyle(el);
            return ([Direction.Neither,
                Direction.Horizontal,
                Direction.Vertical,
                Direction.Both])[(this._overflowScrollValues.test(style.overflowX) ? 1 : 0) +
                (this._overflowScrollValues.test(style.overflowY) ? 2 : 0)];
        };
        Scrollable._getScrollableDirection = function (drag, el) {
            var _this = this;
            var directionText = Tactile.Attributes.get(el, "data-drag-scrollable", Direction[Direction.Both], null);
            var direction = Direction[Tactile.Text.toProperCase(directionText)];
            if (direction === undefined && drag.options.scrollAutoDetect) {
                return drag.containerCache.get(el, "scrollDirection", function () { return _this._detectScrollableDirection(el); });
            }
            else {
                return direction || Direction.Neither;
            }
        };
        Scrollable.closestScrollableScrollable = function (drag, xy, xyEl) {
            var cursorEl = xyEl;
            while (cursorEl !== null) {
                if (this._getScrollableDirection(drag, cursorEl) != Direction.Neither) {
                    var scrollable = drag.containerCache.get(cursorEl, "Scrollable", function () { return new Scrollable(cursorEl, drag); });
                    if (scrollable.canScroll(xy)) {
                        return scrollable;
                    }
                }
                cursorEl = cursorEl.parentElement;
            }
            return null;
        };
        Scrollable.prototype.canScroll = function (xy) {
            this._updateVelocity(xy);
            return Tactile.Vector.lengthSquared(this._velocity) > 0;
        };
        Scrollable.prototype.continueScroll = function (xy) {
            if (!this._lastUpdate) {
                this._offset = [this.el.scrollLeft, this.el.scrollTop];
            }
            ;
            this._updateVelocity(xy);
            var currentUpdate = new Date();
            var elapsedTimeMs = this._lastUpdate !== null
                ? (currentUpdate.getTime() - this._lastUpdate.getTime())
                : 16;
            this._offset = Tactile.Vector.add(this._offset, Tactile.Vector.multiplyScalar(this._velocity, elapsedTimeMs));
            if (this._velocity[0] !== 0)
                this.el.scrollLeft = this._offset[0];
            if (this._velocity[1] !== 0)
                this.el.scrollTop = this._offset[1];
            this._lastUpdate = currentUpdate;
            return Tactile.Vector.lengthSquared(this._velocity) > 0;
        };
        Scrollable.prototype._updateVelocity = function (xy) {
            var maxV = this.drag.options.scrollSpeed;
            var b = this._bounds;
            var v = [0, 0];
            if (Tactile.Geometry.rectContains(b, xy)) {
                if (this._direction === Direction.Horizontal || this._direction === Direction.Both) {
                    if (xy[0] > b.right - this._sensitivity[0] && Tactile.Dom.canScrollRight(this.el))
                        v[0] = Tactile.Maths.scale(xy[0], [b.right - this._sensitivity[0], b.right], [0, +maxV]);
                    if (xy[0] < b.left + this._sensitivity[0] && Tactile.Dom.canScrollLeft(this.el))
                        v[0] = Tactile.Maths.scale(xy[0], [b.left + this._sensitivity[0], b.left], [0, -maxV]);
                }
                if (this._direction === Direction.Vertical || this._direction === Direction.Both) {
                    if (xy[1] > b.bottom - this._sensitivity[1] && Tactile.Dom.canScrollDown(this.el))
                        v[1] = Tactile.Maths.scale(xy[1], [b.bottom - this._sensitivity[1], b.bottom], [0, +maxV]);
                    if (xy[1] < b.top + this._sensitivity[1] && Tactile.Dom.canScrollUp(this.el))
                        v[1] = Tactile.Maths.scale(xy[1], [b.top + this._sensitivity[1], b.top], [0, -maxV]);
                }
            }
            this._velocity = v;
        };
        Scrollable._overflowScrollValues = /^(auto|scroll)$/;
        return Scrollable;
    }());
    Tactile.Scrollable = Scrollable;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Sortable = (function (_super) {
        __extends(Sortable, _super);
        function Sortable(el, drag) {
            _super.call(this, el, drag);
            this._style = getComputedStyle(this.el);
            this._avoidDomMutations = true;
            this._entered = false;
            this._childGeometry = new Tactile.Cache();
            this._initializeDirection();
            this._initializeMutationListener();
        }
        Sortable.prototype.enter = function (viewportXY) {
            this.index = null;
            this._entered = true;
            if (!this.placeholder) {
                this._initializeChildAndSiblingEls();
                this._initializePlaceholder();
            }
            this._resizeToIncludePlaceholder();
            this.placeholder.setState("ghost");
            this._childGeometry.clear();
            this.helperSize = this.placeholder.size;
            this.helperScale = this.placeholder.scale;
            this._updatePlaceholderPosition(false);
            this.move(viewportXY);
            this._updatePlaceholderPosition(true);
        };
        Sortable.prototype.move = function (xy) {
            this._updateIndex(xy);
        };
        Sortable.prototype.leave = function () {
            this._entered = false;
            if (this.leaveAction === Tactile.DragAction.Copy && this.placeholder.isOriginalEl) {
                this.placeholder.setState("materialized");
            }
            else {
                this.index = null;
                this._resizeToExcludePlaceholder();
                this._updatePlaceholderPosition(true, function () {
                    if (!this._entered) {
                        this.placeholder.setState("hidden");
                        this._clearChildTranslations();
                        this._childGeometry.clear();
                    }
                }.bind(this));
            }
        };
        Sortable.prototype.finalizePosition = function (el) {
            this.el.insertBefore(el, this._siblingEls[this.index]);
        };
        Sortable.prototype.dispose = function () {
            this.placeholder && this.placeholder.dispose();
            if (this._mutObserver) {
                this._mutObserver.disconnect();
                this._mutObserver = null;
            }
            this._clearChildTranslations();
            this._childGeometry.dispose();
        };
        Sortable.prototype._initializeMutationListener = function () {
            if (!window["MutationObserver"])
                return;
            this._mutObserver = new MutationObserver(this._onDomMutation.bind(this));
            this._mutObserver.observe(this.el, { childList: true, subtree: true });
        };
        Sortable.prototype._onDomMutation = function (e) {
            console.log("Sortable._onDomMutation", e);
            this._initializeChildAndSiblingEls();
            this._childGeometry.clear();
            this._updatePlaceholderPosition(false);
        };
        Sortable.prototype._updateIndex = function (viewportXY) {
            if (this._siblingEls.length === 0) {
                return this._setPlaceholderIndex(0);
            }
            if (this._direction !== 'wrap') {
                this._updateIndexViaOffset(viewportXY);
            }
            else {
                this._updateIndexViaSelectionApi(viewportXY);
            }
        };
        Sortable.prototype._updateIndexViaOffset = function (viewportXY) {
            var _this = this;
            var bounds = this.drag.geometryCache.get(this.el, 'cr', function () { return _this.el.getBoundingClientRect(); });
            var sl = this.drag.geometryCache.get(this.el, 'sl', function () { return _this.el.scrollLeft; });
            var st = this.drag.geometryCache.get(this.el, 'st', function () { return _this.el.scrollTop; });
            var innerXY = [viewportXY[0] - bounds.left + sl - parseInt(this._style.paddingLeft, 10),
                viewportXY[1] - bounds.top + st - parseInt(this._style.paddingTop, 10)];
            var adjustedXY = [innerXY[0] - this.drag.helper.gripXY[0],
                innerXY[1] - this.drag.helper.gripXY[1]];
            adjustedXY = [adjustedXY[0] / this.helperScale[0],
                adjustedXY[1] / this.helperScale[1]];
            var naturalOffset = 0;
            var newIndex = 0;
            do {
                var geometry = this._getChildGeometry(this._siblingEls[newIndex]);
                if (adjustedXY[this._directionProperties.index] < naturalOffset + geometry.dimension / 2)
                    break;
                naturalOffset += geometry.dimension;
                newIndex++;
            } while (newIndex < this._siblingEls.length);
            this._setPlaceholderIndex(newIndex);
        };
        Sortable.prototype._updateIndexViaSelectionApi = function (viewportXY) {
            var closestElement = Tactile.Dom.elementFromPointViaSelection(viewportXY);
            var closestElementParents = Tactile.Dom.ancestors(closestElement, 'li');
            var closestSiblingEl = this._siblingEls.filter(function (el) { return closestElementParents.indexOf(el) !== -1; })[0];
            if (closestSiblingEl && !Tactile.Dom.matches(closestSiblingEl, '.velocity-animating')) {
                var newIndex = this._siblingEls.indexOf(closestSiblingEl);
                var childBounds = closestSiblingEl.getBoundingClientRect();
                if (viewportXY[0] > childBounds.left + childBounds.width / 2)
                    newIndex++;
                this._setPlaceholderIndex(newIndex);
            }
        };
        Sortable.prototype._initializeDirection = function () {
            this._direction = Tactile.Attributes.get(this.el, "data-drag-sortable", "vertical");
            this._directionProperties = this._direction === "horizontal"
                ? {
                    index: 0,
                    translate: 'translateX',
                    paddingStart: 'paddingLeft',
                    layoutOffset: 'offsetLeft',
                    dimension: 'width',
                    outerDimension: 'outerWidth'
                } : {
                index: 1,
                translate: 'translateY',
                paddingStart: 'paddingTop',
                layoutOffset: 'offsetTop',
                dimension: 'height',
                outerDimension: 'outerHeight'
            };
            if (this._direction === 'wrap') {
                this._avoidDomMutations = false;
            }
            else {
                this._avoidDomMutations = this.drag.options.avoidDomMutations;
            }
        };
        Sortable.prototype._initializePlaceholder = function () {
            if (this.drag.draggable.originalParentEl === this.el) {
                this.placeholder = new Tactile.Placeholder(this.drag.draggable.el, this.drag);
                this.index = this._childEls.indexOf(this.drag.draggable.el);
            }
            else {
                this.placeholder = Tactile.Placeholder.buildPlaceholder(this.el, this.drag);
            }
        };
        Sortable.prototype._initializeChildAndSiblingEls = function () {
            this._childEls = Tactile.Dom.children(this.el);
            this._siblingEls = this._childEls.slice(0);
            var draggableElIndex = this._childEls.indexOf(this.drag.draggable.el);
            if (draggableElIndex !== -1) {
                this._siblingEls.splice(draggableElIndex, 1);
            }
        };
        Sortable.prototype._setPlaceholderIndex = function (newIndex) {
            if (newIndex !== this.index) {
                this.index = newIndex;
                this._updatePlaceholderPosition();
            }
        };
        Sortable.prototype._updatePlaceholderPosition = function (animate, complete) {
            if (animate === void 0) { animate = true; }
            if (this._avoidDomMutations) {
                this._updateChildTranslations(animate, complete);
            }
            else {
                this._updatePlaceholderIndex(complete);
            }
        };
        Sortable.prototype._getChildGeometry = function (el) {
            function getGeometry() {
                return {
                    layoutOffset: el[this._directionProperties.layoutOffset] - parseInt(this._style[this._directionProperties.paddingStart], 10),
                    dimension: Tactile.Dom[this._directionProperties.outerDimension](el, true),
                    translation: null
                };
            }
            var geometry = this._childGeometry.get(el, 'geometry', getGeometry.bind(this));
            return geometry;
        };
        Sortable.prototype._updatePlaceholderIndex = function (complete) {
            var _this = this;
            var domMutation = function () { return _this.el.insertBefore(_this.placeholder.el, _this._siblingEls[_this.index]); };
            Tactile.Animation.animateDomMutation(this.el, domMutation, { animationOptions: this.drag.options.reorderAnimation }, complete);
        };
        Sortable.prototype._updateChildTranslations = function (animate, complete) {
            if (animate === void 0) { animate = true; }
            var offset = 0;
            var placeholderOffset = null;
            var els = [];
            var elValues = [];
            var index = 0;
            for (var _i = 0, _a = this._siblingEls; _i < _a.length; _i++) {
                var el = _a[_i];
                if (index === this.index) {
                    placeholderOffset = offset;
                    offset += this.placeholder.outerSize[this._directionProperties.index];
                }
                var geometry = this._getChildGeometry(el);
                var newTranslation = offset - geometry.layoutOffset;
                if (geometry.translation !== newTranslation) {
                    geometry.translation = newTranslation;
                    els.push(el);
                    elValues.push(newTranslation);
                }
                offset += geometry.dimension;
                index++;
            }
            var translate = this._directionProperties.translate;
            var props = (_b = {}, _b[translate] = function (i) { return elValues[i]; }, _b);
            Tactile.Animation.set(els, props, animate ? this.drag.options.reorderAnimation : { duration: 0 }, complete);
            if (placeholderOffset === null)
                placeholderOffset = offset;
            var placeholderGeometry = this._getChildGeometry(this.placeholder.el);
            var newPlaceholderTranslation = placeholderOffset - placeholderGeometry.layoutOffset;
            if (placeholderGeometry.translation !== newPlaceholderTranslation) {
                Tactile.Dom.transform(this.placeholder.el, (_c = {}, _c[translate] = newPlaceholderTranslation, _c));
                placeholderGeometry.translation = newPlaceholderTranslation;
            }
            if (els.length === 0 || !animate) {
                complete && complete();
            }
            var _b, _c;
        };
        Sortable.prototype._resizeToExcludePlaceholder = function () {
            var _this = this;
            if (this.el.style[this._directionProperties.dimension] === 'auto') {
                var dimension = this.el.clientHeight;
                var placeholderDimension = this.placeholder.outerSize[this._directionProperties.index];
                var attributes = (_a = {}, _a[this._directionProperties.dimension] = dimension - placeholderDimension, _a);
                console.log("Sortable._resizeToExcludePlaceholder", this.el, attributes);
                Tactile.Animation.set(this.el, attributes, this.drag.options.containerResizeAnimation, function () {
                    _this.el.style[_this._directionProperties.dimension] = 'auto';
                });
            }
            var _a;
        };
        Sortable.prototype._resizeToIncludePlaceholder = function () {
            var _this = this;
            if (this.el.style[this._directionProperties.dimension] === 'auto') {
                var dimension = this.el.clientHeight;
                var placeholderDimension = this.placeholder.outerSize[this._directionProperties.index];
                var attributes = (_a = {}, _a[this._directionProperties.dimension] = dimension + placeholderDimension, _a);
                console.log("Sortable._resizeToIncludePlaceholder", this.el, attributes);
                Tactile.Animation.set(this.el, attributes, this.drag.options.containerResizeAnimation, function () {
                    _this.el.style[_this._directionProperties.dimension] = 'auto';
                });
            }
            var _a;
        };
        Sortable.prototype._clearChildTranslations = function () {
            Tactile.Animation.stop(this._siblingEls || []);
            for (var _i = 0, _a = this._childEls || []; _i < _a.length; _i++) {
                var el = _a[_i];
                el.style.transform = '';
                el.style.webkitTransform = '';
            }
            ;
            Tactile.Animation.clear(this._siblingEls || []);
        };
        return Sortable;
    }(Tactile.Container));
    Tactile.Sortable = Sortable;
})(Tactile || (Tactile = {}));
//# sourceMappingURL=Tactile.js.map