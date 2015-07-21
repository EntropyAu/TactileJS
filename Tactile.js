var Tactile;
(function (Tactile) {
    var Animation;
    (function (Animation) {
        function set(el, target, options, complete) {
            if (options === void 0) { options = { duration: 0 }; }
            if (complete === void 0) { complete = null; }
            if (window['Velocity']) {
                var velocityOptions = {
                    duration: options.duration,
                    easing: options.easing,
                    complete: complete,
                    queue: false
                };
                window['Velocity'](el, target, velocityOptions);
            }
            else {
                applyStyleProperties(el, target);
                applyTransformProperties(el, target);
                if (complete)
                    complete();
            }
        }
        Animation.set = set;
        function stop(el) {
            if (window["Velocity"]) {
                window['Velocity'](el, 'stop');
            }
        }
        Animation.stop = stop;
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
            var transformOrder = ["translateX", "translateY", "scaleX", "scaleY", "rotateZ"];
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
        setTimeout(function () {
            if (document.body.style.webkitTransform !== undefined)
                vendorTransform = 'webkitTransform';
            if (document.body.style.transform !== undefined)
                vendorTransform = 'transform';
        });
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
            el.style.top = xy[0] + "px";
            el.style.left = xy[1] + "px";
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
            var event = new CustomEvent(eventName, eventData);
            source.dispatchEvent(event);
            return !event.defaultPrevented;
        }
        Events.raise = raise;
        function pointerEventXY(e) {
            if (e instanceof TouchEvent) {
                return [e.touches[0].clientX, e.touches[0].clientY];
            }
            if (e instanceof MouseEvent) {
                return [e.clientX, e.clientY];
            }
        }
        Events.pointerEventXY = pointerEventXY;
        function pointerEventId(e) {
            if (e instanceof TouchEvent) {
                return 0;
            }
            if (e instanceof MouseEvent) {
                return 0;
            }
        }
        Events.pointerEventId = pointerEventId;
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
    var containerSelector = '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]';
    var placeholderSelector = '[data-drag-placeholder]';
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
            el = Tactile.Dom.closest(el, containerSelector);
            while (el && Tactile.Dom.closest(el, placeholderSelector))
                el = Tactile.Dom.closest(el.parentElement, containerSelector);
            return el;
        };
        Container.closestAcceptingTarget = function (el, draggable) {
            var targetEl = this.closest(el);
            while (targetEl) {
                var target = this._getContainer(targetEl, draggable.drag);
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
        Container._getContainer = function (el, drag) {
            var container = el['__tactileContainer'];
            if (!container) {
                container = el['__tactileContainer'] = this.buildContainer(el, drag);
            }
            return container;
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
        Container.prototype.enter = function (xy) {
            this.el.classList.add(this.drag.options.containerHoverClass);
        };
        Container.prototype.move = function (xy) {
        };
        Container.prototype.leave = function () {
            this.el.classList.remove(this.drag.options.containerHoverClass);
        };
        Container.prototype.dispose = function () {
            this.el.classList.remove(this.drag.options.containerHoverClass);
        };
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
        animation: false,
        revertBehaviour: 'last',
        pickUpAnimation: { duration: 300, easing: 'ease-in-out' },
        pickDownAnimation: { duration: 300, easing: 'ease-in-out' },
        resizeAnimation: { duration: 300, easing: 'ease-in-out' },
        dropAnimation: { duration: 300, easing: 'ease-in-out' },
        reorderAnimation: { duration: 150, easing: 'ease-in-out' },
        deleteAnimation: { duration: 300, easing: 'ease-out' },
        pickUpDelay: 0,
        pickUpDistance: 0,
        helperRotation: -1,
        helperShadowSize: 15,
        placeholderClass: 'dd-drag-placeholder',
        containerHoverClass: 'dd-drag-hover',
        scrollSensitivity: '20%',
        scrollSpeed: 1
    };
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Cache = (function () {
        function Cache() {
            this._version = 0;
            if (window['WeakMap']) {
                this._cache = new window['WeakMap']();
            }
        }
        Cache.prototype.get = function (el, key, fn) {
            if (fn === void 0) { fn = null; }
            var elCache = this._getElementCache(el);
            if (elCache[key] !== undefined) {
                return elCache[key];
            }
            else {
                return elCache[key] = fn();
            }
        };
        Cache.prototype.set = function (el, key, value) {
            var elCache = this._getElementCache(el);
            elCache[key] = value;
        };
        Cache.prototype.clear = function () {
            if (window['WeakMap']) {
                this._cache = new window['WeakMap']();
            }
            else {
                this._version += 1;
            }
        };
        Cache.prototype.dispose = function () {
            this._cache = null;
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
                elCache = el['__tactile'];
                var version = el['__tactileVersion'];
                if (!elCache || version < this._version) {
                    el['__tactile'] = elCache = {};
                    el['__tactileVersion'] = version;
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
            this.placeholderSize = null;
            this.placeholderScale = null;
            this._offset = [0, 0];
            this._grid = null;
            this._initializeGrid();
            this._insertPlaceholder();
        }
        Canvas.prototype.enter = function (xy) {
            this.placeholder.setState("ghost");
            this.placeholderSize = this.placeholder.size;
            this.placeholderScale = this.placeholder.scale;
            this.move(xy);
        };
        Canvas.prototype.move = function (xy) {
            var _this = this;
            var rect = this.drag.cache.get(this.el, 'cr', function () { return _this.el.getBoundingClientRect(); });
            var sl = this.drag.cache.get(this.el, 'sl', function () { return _this.el.scrollLeft; });
            var st = this.drag.cache.get(this.el, 'st', function () { return _this.el.scrollTop; });
            var l = xy[0] - rect.left + sl + this.drag.helper.gripOffset[0], t = xy[1] - rect.top + st + this.drag.helper.gripOffset[1];
            l = l / this.placeholderScale[0];
            t = t / this.placeholderScale[1];
            if (this._grid) {
                t = Math.round((t - rect.top) / this._grid[1]) * this._grid[1] + rect.top;
                l = Math.round((l - rect.left) / this._grid[0]) * this._grid[0] + rect.left;
            }
            this._offset = [l, t];
            Tactile.Dom.translate(this.placeholder.el, this._offset);
        };
        Canvas.prototype.leave = function () {
            if (this.leaveAction === "copy" && this.placeholder.isOriginalEl) {
                this.placeholder.setState("materialized");
            }
            else {
                this.placeholder.setState("hidden");
            }
        };
        Canvas.prototype.finalizeDrop = function (draggable) {
            var el = this.placeholder.el;
            this.placeholder.dispose();
            Tactile.Dom.topLeft(el, this._offset);
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
            this.placeholder.el.style.position = 'absolute';
            Tactile.Dom.topLeft(this.placeholder.el, [0, 0]);
            this.placeholder.setState("hidden");
        };
        return Canvas;
    })(Tactile.Container);
    Tactile.Canvas = Canvas;
})(Tactile || (Tactile = {}));
var Tactile;
(function (Tactile) {
    var Drag = (function () {
        function Drag(draggableEl, xy, options) {
            this.source = null;
            this.target = null;
            this._requestId = null;
            window['drag'] = this;
            this.options = options;
            this.xy = xy;
            this.pointerEl = Tactile.Dom.elementFromPoint(xy);
            this.draggable = new Tactile.Draggable(draggableEl, this);
            this.helper = new Tactile.Helper(this, this.draggable);
            this.fence = Tactile.Fence.closestForDraggable(this, this.draggable);
            this.copy = false;
            this.cache = new Tactile.Cache();
            this._updateTarget();
            this.source = this.target;
            document.addEventListener('scroll', this._onScrollOrWheel, false);
            document.addEventListener('mousewheel', this._onScrollOrWheel, false);
            document.addEventListener('wheel', this._onScrollOrWheel, false);
            this._raise(this.draggable.el, 'dragstart');
        }
        Drag.prototype._onScrollOrWheel = function () {
            this.cache.clear();
        };
        Drag.prototype.move = function (xy) {
            if (this._requestId) {
                cancelAnimationFrame(this._requestId);
                this._requestId = null;
            }
            this.xy = this.fence ? this.fence.getConstrainedXY(xy) : xy;
            this.pointerEl = Tactile.Dom.elementFromPoint(this.xy);
            this._scroller = Tactile.Scrollable.closestReadyScrollable(this.pointerEl, this, this.xy);
            this._hover();
            this._raise(this.draggable.el, 'drag');
            this.helper.setPosition(this.xy);
        };
        Drag.prototype._hover = function () {
            this._requestId = null;
            if (this._scroller) {
                if (this._scroller.step(this.xy)) {
                    this.cache.clear();
                }
                else {
                    this._scroller = null;
                }
                ;
                this._requestId = requestAnimationFrame(this._hover.bind(this));
            }
            else {
                this.pointerEl = Tactile.Dom.elementFromPoint(this.xy);
                this._updateTarget();
                if (this.target && Tactile.Maths.contains(this.target.el.getBoundingClientRect(), this.xy))
                    this.target.move(this.xy);
                this._raise(this.draggable.el, 'drag');
            }
        };
        Drag.prototype.cancel = function () {
        };
        Drag.prototype.drop = function () {
            if (this._requestId)
                cancelAnimationFrame(this._requestId);
            if (this.target)
                this._beginDrop();
            else
                this._beginMiss();
            this._raise(this.draggable.el, 'dragend');
        };
        Drag.prototype._beginDrop = function () {
            if (this.target.placeholder && (this.action === "copy" || this.action === "move")) {
                this.helper.animateToElementAndPutDown(this.target.placeholder.el, function () {
                    requestAnimationFrame(function () {
                        this.target.finalizeDrop(this.draggable);
                        this.dispose();
                    }.bind(this));
                }.bind(this));
            }
            if (this.action === "delete") {
                this.helper.animateDelete(function () {
                    this.dispose();
                }.bind(this));
            }
        };
        Drag.prototype._beginMiss = function () {
            this.draggable.finalizeRevert();
            this.dispose();
        };
        Drag.prototype._updateTarget = function () {
            var oldTarget = this.target;
            var newTarget = this.source && this.source.leaveAction === "delete"
                ? null
                : Tactile.Container.closestAcceptingTarget(this.pointerEl, this.draggable);
            if (newTarget === oldTarget)
                return;
            if (newTarget || this.options.revertBehaviour !== 'last') {
                if (oldTarget === null || this._tryLeaveTarget(oldTarget)) {
                    if (newTarget !== null)
                        this._tryEnterTarget(newTarget);
                    this._setAction(this._computeAction(this.source, this.target));
                }
            }
        };
        Drag.prototype._tryEnterTarget = function (container) {
            if (this._raise(container.el, 'dragenter')) {
                container.enter(this.xy);
                if (container.placeholderSize && this.options.helperResize) {
                    this.helper.setSizeAndScale(container.placeholderSize, container.placeholderScale);
                }
                this.target = container;
                return true;
            }
            else {
                return false;
            }
        };
        Drag.prototype._tryLeaveTarget = function (container) {
            if (this._raise(container.el, 'dragleave')) {
                container.leave();
                this.target = null;
                return true;
            }
            else {
                return false;
            }
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
                sourceEl: this.source ? this.source.el : null,
                sourceIndex: this.source ? this.source['index'] : null,
                sourceOffset: this.source ? this.source['offset'] : null,
                sourcePosition: this.source ? this.source['position'] : null,
                targetEl: this.target ? this.target.el : null,
                targetIndex: this.target ? this.target['index'] : null,
                targetOffset: this.target ? this.target['offset'] : null,
                targetPosition: this.target ? this.target['position'] : null
            };
            return Tactile.Events.raise(el, eventName, eventData);
        };
        Drag.prototype.dispose = function () {
            document.removeEventListener('scroll', this._onScrollOrWheel, false);
            document.removeEventListener('mousewheel', this._onScrollOrWheel, false);
            document.removeEventListener('wheel', this._onScrollOrWheel, false);
            this.helper.dispose();
            this.cache.dispose();
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
            this.originalParentEl = el.parentElement;
            this.originalIndex = Tactile.Dom.indexOf(el);
            this.originalSize = [this.el.offsetWidth, this.el.offsetHeight];
            this.originalOffset = [this.el.offsetLeft, this.el.offsetTop];
            this.originalScale = Tactile.Dom.clientScale(el);
            this.data = Tactile.Attributes.get(el, 'data-drag-data');
            this.tags = el.hasAttribute('data-drag-tag')
                ? Tactile.Attributes.getTags(el, 'data-drag-tag')
                : Tactile.Attributes.getTags(el.parentElement, 'data-drag-tag');
        }
        Draggable.closest = function (el) {
            el = Tactile.Dom.closest(el, this.handleOrDraggableSelector);
            if (!el)
                return null;
            if (el.hasAttribute('data-drag-handle')) {
                el = Tactile.Dom.closest(el, this.draggableSelector);
                return el;
            }
            var handleEls = el.querySelectorAll(this.handleSelector);
            var numHandleEls = handleEls.length;
            for (var i = 0; i < numHandleEls; i++) {
                var handleEl = handleEls[i];
                if (Tactile.Dom.closest(handleEl, this.draggableSelector) === el) {
                    return null;
                }
            }
            return el;
        };
        Draggable.closestEnabled = function (el) {
            el = this.closest(el);
            return el && !(el.hasAttribute('data-drag-disabled')
                || el.parentElement && el.parentElement.hasAttribute('data-drag-disabled'))
                ? el
                : null;
        };
        Draggable.prototype.finalizeRevert = function () {
            this.originalParentEl.insertBefore(this.el, this.originalParentEl.children[this.originalIndex]);
        };
        Draggable.handleSelector = '[data-drag-handle]';
        Draggable.draggableSelector = '[data-drag-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
        Draggable.handleOrDraggableSelector = '[data-drag-handle],[data-drag-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
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
            this._bindPointerEvents();
        }
        DragManager.prototype._bindPointerEvents = function () {
            window.addEventListener(Tactile.Events.pointerDownEvent, this._onPointerDownListener, true);
        };
        DragManager.prototype._unbindPointerEvents = function () {
            window.removeEventListener(Tactile.Events.pointerDownEvent, this._onPointerDownListener, true);
        };
        DragManager.prototype._bindPointerEventsForDragging = function (el) {
            window.addEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            window.addEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, false);
            el.addEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            el.addEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, false);
        };
        DragManager.prototype._unbindPointerEventsForDragging = function (el) {
            window.removeEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            window.removeEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, false);
            el.removeEventListener(Tactile.Events.pointerMoveEvent, this._onPointerMoveListener, true);
            el.removeEventListener(Tactile.Events.pointerUpEvent, this._onPointerUpListener, false);
        };
        DragManager.prototype._onPointerDown = function (e) {
            if (e instanceof MouseEvent && e.which !== 0 && e.which !== 1)
                return;
            if (Tactile.Dom.ancestors(e.target, this.options.cancel).length > 0)
                return;
            var xy = Tactile.Events.pointerEventXY(e);
            var dragId = Tactile.Events.pointerEventId(e);
            var el = Tactile.Draggable.closestEnabled(e.target);
            if (!el)
                return false;
            if (this.options.pickUpDelay === null || this.options.pickUpDelay === 0) {
                Tactile.Events.cancel(e);
                this.startDrag(el, dragId, xy);
            }
            else {
                var onpickUpTimeoutHandler = function () {
                    this._onPickUpTimeout(dragId);
                };
                this._pendingDrags[dragId] = {
                    el: el,
                    xy: xy,
                    timerId: setTimeout(onpickUpTimeoutHandler.bind(this), this.options.pickUpDelay)
                };
            }
            this._bindPointerEventsForDragging(e.target);
        };
        DragManager.prototype._onPickUpTimeout = function (dragId) {
            if (this._pendingDrags[dragId]) {
                var pendingDrag = this._pendingDrags[dragId];
                this.startDrag(pendingDrag.draggable, dragId, pendingDrag.xy);
                delete this._pendingDrags[dragId];
            }
        };
        DragManager.prototype._onPointerMove = function (e) {
            var xy = Tactile.Events.pointerEventXY(e);
            var dragId = Tactile.Events.pointerEventId(e);
            if (this._drags[dragId]) {
                var drag = this._drags[dragId];
                Tactile.Events.cancel(e);
                drag.move(xy);
            }
            if (this._pendingDrags[dragId]) {
                var pendingDrag = this._pendingDrags[dragId];
                if (this.options.pickUpDistance && Tactile.Vector.length(Tactile.Vector.subtract(pendingDrag.xy, xy)) > this.options.pickUpDistance)
                    clearTimeout(pendingDrag.timerId);
                this.startDrag(pendingDrag.draggable, dragId, pendingDrag.xy);
                delete this._pendingDrags[dragId];
            }
        };
        DragManager.prototype._onPointerUp = function (e) {
            var dragId = Tactile.Events.pointerEventId(e);
            if (this._drags[dragId]) {
                Tactile.Events.cancel(e);
                this.endDrag(dragId);
            }
            if (this._pendingDrags[dragId]) {
                clearTimeout(this._pendingDrags[dragId].timerId);
            }
        };
        DragManager.prototype.startDrag = function (el, dragId, xy) {
            Tactile.Dom.clearSelection();
            document.body.setAttribute('data-drag-in-progress', '');
            return this._drags[dragId] = new Tactile.Drag(el, xy, this.options);
        };
        DragManager.prototype.endDrag = function (dragId) {
            var drag = this._drags[dragId];
            drag.drop();
            if (Object.keys(this._drags).length == 0) {
                document.body.removeAttribute('data-drag-in-progress');
                this._unbindPointerEventsForDragging(drag.draggable.el);
            }
            delete this._drags[dragId];
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
            var rect = this.drag.cache.get(this.el, 'pr', function () { return Tactile.Dom.getPaddingClientRect(_this.el); });
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
            document.body.appendChild(this.el);
            this.setPosition(this.drag.xy);
            this.setSizeAndScale(draggable.originalSize, draggable.originalScale, false);
            Tactile.Animation.set(this.el, {
                left: this.gripOffset[0],
                top: this.gripOffset[1],
                transformOriginX: 0,
                transformOriginY: 0
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
                translateX: xy[0],
                translateY: xy[1]
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
            Tactile.Animation.set(this.el, {
                width: size[0],
                height: size[1],
                left: this.gripOffset[0],
                top: this.gripOffset[1],
                scaleX: scale[0],
                scaleY: scale[1]
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
                translateX: [rect.left, this.xy[0] - this.gripRelative[0] * el.offsetWidth + minimalDelta],
                translateY: [rect.top, this.xy[1] - this.gripRelative[1] * el.offsetHeight + minimalDelta],
                width: el.offsetWidth,
                height: el.offsetHeight
            }, this.drag.options.dropAnimation, complete);
        };
        Helper.prototype.animateDelete = function (complete) {
            Tactile.Animation.stop(this.el);
            Tactile.Animation.set(this.el, { opacity: 0 }, this.drag.options.deleteAnimation, complete);
        };
        Helper.prototype.dispose = function () {
            this.el.remove();
        };
        Helper.prototype._pickUp = function () {
            Tactile.Animation.set(this.el, {
                rotateZ: [this.drag.options.helperRotation, 0],
                boxShadowBlur: this.drag.options.helperShadowSize
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
            this._updateDimensions();
            this.el.classList.add(this.drag.options.placeholderClass);
            this.el.setAttribute('data-drag-placeholder', '');
            this.setState("ghost", false);
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
                    break;
                case "ghost":
                    this.el.style.visibility = '';
                    Tactile.Animation.set(this.el, { opacity: 0.1 }, velocityOptions);
                    break;
                case "materialized":
                    this.el.style.visibility = '';
                    Tactile.Animation.set(this.el, { opacity: 1.0 }, velocityOptions);
                    break;
            }
            this.state = state;
        };
        Placeholder.prototype.dispose = function () {
            switch (this.state) {
                case "hidden":
                    this.el.remove();
                    this.el = null;
                    break;
                case "ghost":
                case "materialized":
                    if (this.el) {
                        this.el.removeAttribute('data-drag-placeholder');
                        this.el.classList.remove('dd-drag-placeholder');
                        this.el.style.visibility = '';
                        this.el.style.opacity = '';
                    }
                    break;
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
                this._bounds = this.el.getBoundingClientRect();
            }
            var sensitivity = this.drag.options.scrollSensitivity;
            var percent = sensitivity.toString().indexOf('%') !== -1
                ? parseInt(sensitivity.toString(), 10) / 100
                : null;
            this._hSensitivity = Math.min(percent ? percent * this._bounds.width : parseInt(sensitivity.toString(), 10), this._bounds.width / 3);
            this._vSensitivity = Math.min(percent ? percent * this._bounds.height : parseInt(sensitivity.toString(), 10), this._bounds.height / 3);
        }
        Scrollable.closest = function (el) { return Tactile.Dom.closest(el, this._selector); };
        Scrollable.closestReadyScrollable = function (el, drag, xy) {
            var scrollEls = Tactile.Dom.ancestors(el || document.body, this._selector);
            scrollEls.every(function (scrollEl) {
                var scrollable = new Scrollable(scrollEl, drag);
                if (scrollable.canScroll(xy))
                    return scrollable;
            }.bind(this));
            return null;
        };
        Scrollable.prototype.canScroll = function (xy) {
            this._updateVelocity(xy);
            return (this._velocity[0] !== 0 || this._velocity[1] !== 0);
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
        Scrollable._selector = '[data-drag-scrollable]';
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
            this._initializePlaceholder();
            this._initializeChildAndSiblingEls();
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
            this._offsetPlaceholderWithMargin();
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
            this.placeholder.setState("ghost");
            this.placeholderSize = this.placeholder.size;
            this.placeholderScale = this.placeholder.scale;
            this.move(xy);
            this._undoOffsetPlaceholder();
            this._childMeasures.clear();
        };
        Sortable.prototype.move = function (xy) {
            var _this = this;
            if (this._siblingEls.length === 0) {
                if (this._index !== 0) {
                    this._index = 0;
                    this._updateChildTranslations();
                }
                return;
            }
            var bounds = this.drag.cache.get(this.el, 'cr', function () { return _this.el.getBoundingClientRect(); });
            var sl = this.drag.cache.get(this.el, 'sl', function () { return _this.el.scrollLeft; });
            var st = this.drag.cache.get(this.el, 'st', function () { return _this.el.scrollTop; });
            var innerXY = [xy[0] - bounds.left + sl - parseInt(this._style.paddingLeft, 10),
                xy[1] - bounds.top + st - parseInt(this._style.paddingTop, 10)];
            var adjustedXY = [innerXY[0] - this.drag.helper.gripXY[0],
                innerXY[1] - this.drag.helper.gripXY[1]];
            adjustedXY = [adjustedXY[0] / this.placeholderScale[0],
                adjustedXY[1] / this.placeholderScale[1]];
            var naturalOffset = 0;
            var newIndex = 0;
            do {
                var measure = this._getChildMeasure(this._siblingEls[newIndex]);
                if (adjustedXY[this._directionProperties.index] < naturalOffset + measure.measure / 2)
                    break;
                naturalOffset += measure.measure;
                newIndex++;
            } while (newIndex < this._siblingEls.length);
            if (this._index !== newIndex) {
                this._index = newIndex;
                this._updateChildTranslations();
            }
        };
        Sortable.prototype.leave = function () {
            if (this.leaveAction === "copy" && this.placeholder.isOriginalEl) {
                this.placeholder.setState("materialized");
            }
            else {
                this._index = null;
                this._forceFeedRequired = true;
                this._childMeasures.clear();
                this.placeholder.setState("hidden");
                this._offsetPlaceholderWithMargin();
                this._updateChildTranslations();
            }
        };
        Sortable.prototype._offsetPlaceholderWithMargin = function () {
            if (this.el.children.length > 0) {
                var lastChildEl = this.el.children[this.el.children.length - 1];
                var lastChildStyle = getComputedStyle(lastChildEl);
                var newMargin = parseInt(lastChildStyle[this._directionProperties.endMargin], 10) - this.placeholder.outerSize[this._directionProperties.index];
                lastChildEl.style[this._directionProperties.endMargin] = newMargin + 'px';
            }
        };
        Sortable.prototype._undoOffsetPlaceholder = function () {
            if (this.el.children.length > 0) {
                var lastChildEl = this.el.children[this.el.children.length - 1];
                lastChildEl.style[this._directionProperties.endMargin] = '';
            }
        };
        Sortable.prototype.finalizeDrop = function (draggable) {
            this._clearChildTranslations();
            this.el.insertBefore(this.placeholder.el, this._siblingEls[this._index]);
            this.placeholder.dispose();
            this.placeholder = null;
        };
        Sortable.prototype._getChildMeasure = function (el) {
            function getMeasure() {
                return {
                    offset: el[this._directionProperties.layoutOffset] - parseInt(this._style[this._directionProperties.paddingStart], 10),
                    measure: Tactile.Dom[this._directionProperties.outerDimension](el, true),
                    translation: null
                };
            }
            var measure = this._childMeasures.get(el, 'measures', getMeasure.bind(this));
            return measure;
        };
        Sortable.prototype._updateChildTranslations = function () {
            var offset = 0;
            var placeholderOffset = null;
            this._siblingEls.forEach(function (el, index) {
                if (index === this._index) {
                    placeholderOffset = offset;
                    offset += this.placeholder.outerSize[this._directionProperties.index];
                }
                var measure = this._getChildMeasure(el);
                var newTranslation = offset - measure.offset;
                if (measure.translation !== newTranslation || this._forceFeedRequired) {
                    measure.translation = newTranslation;
                    var props = this._forceFeedRequired
                        ? (_a = {}, _a[this._directionProperties.translate] = [measure.translation, Math.random() / 100], _a)
                        : (_b = {}, _b[this._directionProperties.translate] = measure.translation + Math.random() / 100, _b);
                    Tactile.Animation.set(el, props, this.drag.options.reorderAnimation);
                }
                offset += measure.measure;
                var _a, _b;
            }.bind(this));
            if (placeholderOffset === null)
                placeholderOffset = offset;
            var placeholderMeasure = this._getChildMeasure(this.placeholder.el);
            var newPlaceholderTranslation = placeholderOffset - placeholderMeasure.offset;
            if (placeholderMeasure.translation !== newPlaceholderTranslation || this._forceFeedRequired) {
                Tactile.Animation.set(this.placeholder.el, (_a = {}, _a[this._directionProperties.translate] = newPlaceholderTranslation, _a));
                placeholderMeasure.translation = newPlaceholderTranslation;
            }
            this._forceFeedRequired = false;
            var _a;
        };
        Sortable.prototype._clearChildTranslations = function () {
            this._siblingEls.forEach(function (el) {
                Tactile.Animation.stop(el);
                el.setAttribute('style', '');
            });
            this._forceFeedRequired = true;
        };
        Sortable.prototype.dispose = function () {
            this._clearChildTranslations();
            if (this.placeholder)
                this.placeholder.dispose();
        };
        return Sortable;
    })(Tactile.Container);
    Tactile.Sortable = Sortable;
})(Tactile || (Tactile = {}));
//# sourceMappingURL=Tactile.js.map