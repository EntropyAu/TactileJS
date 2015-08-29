interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    entries(): any;
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V;
    has(key: K): boolean;
    keys(): any;
    set(key: K, value?: V): Map<K, V>;
    size: number;
    values(): any;
}
interface MapConstructor {
    new (): Map<any, any>;
    new <K, V>(): Map<K, V>;
    prototype: Map<any, any>;
}
declare var Map: MapConstructor;
interface VelocityUtilities {
    removeData(el: HTMLElement, keys: string[]): any;
}
interface Velocity {
    (el: HTMLElement | HTMLElement[], properties: any, options?: any): void;
    Utilities: VelocityUtilities;
}
declare var Velocity: Velocity;
declare module Tactile.Animation {
    function set(els: HTMLElement | HTMLElement[], target: any, options?: AnimationOptions, complete?: () => void): void;
    function stop(els: HTMLElement | HTMLElement[]): void;
    function clear(els: HTMLElement | HTMLElement[]): void;
    function animateDomMutation(el: HTMLElement, mutationFunction: Function, options: any, complete?: () => void): void;
    function animateDomMutationLayoutSize(el: HTMLElement, mutationFunction: Function, options: any): void;
}
declare module Tactile.Attributes {
    function get(el: Element, attrName: string, defaultIfPresent?: string, defaultIfNotPresent?: string): string;
    function getTags(el: Element, attrName: string, defaultIfPresent?: string[], defaultIfNotPresent?: string[]): string[];
}
declare module Tactile.Dom {
    function matches(el: HTMLElement, selector: string): boolean;
    function indexOf(el: HTMLElement): number;
    function isChild(el: HTMLElement, childEl: Element): boolean;
    function isDescendant(el: HTMLElement, descendantEl: HTMLElement): boolean;
    function closest(el: HTMLElement, selector: string): HTMLElement;
    function parents(el: HTMLElement, selector?: string): HTMLElement[];
    function ancestors(el: HTMLElement, selector: string): HTMLElement[];
    function copyComputedStyles(sourceEl: HTMLElement, targetEl: HTMLElement): void;
    function stripClasses(el: HTMLElement): void;
    function getContentBoxClientRect(el: Element): {
        top: number;
        left: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
    };
    function children(el: HTMLElement): HTMLElement[];
    function clientScale(el: HTMLElement): [number, number];
    function outerHeight(el: HTMLElement, includeMargins?: boolean): number;
    function outerWidth(el: HTMLElement, includeMargins?: boolean): number;
    function translate(el: HTMLElement, xy: [number, number]): void;
    function transform(el: HTMLElement, options: any): void;
    function topLeft(el: HTMLElement, xy: [number, number]): void;
    function transformOrigin(el: HTMLElement, xy: [number, number]): void;
    function elementFromPoint(xy: [number, number]): HTMLElement;
    function elementFromPointViaSelection(xy: [number, number]): HTMLElement;
    function clearSelection(): void;
    function scrollDirections(el: Element): any;
    function canScrollDown(el: Element): boolean;
    function canScrollUp(el: Element): boolean;
    function canScrollRight(el: Element): boolean;
    function canScrollLeft(el: Element): boolean;
}
declare module Tactile.Events {
    var pointerDownEvent: string;
    var pointerMoveEvent: string;
    var pointerUpEvent: string;
    function cancel(e: Event): void;
    function raise(source: Element, eventName: string, eventData: any): CustomEvent;
    interface NormalizedPointerEvent {
        id: number;
        target: HTMLElement;
        xy: [number, number];
        xyEl: HTMLElement;
    }
    function normalizePointerEvent(e: MouseEvent | TouchEvent): NormalizedPointerEvent[];
}
declare module Tactile.Maths {
    function coerce(value: number, min: number, max: number): number;
    function scale(value: number, domain: [number, number], range: [number, number]): number;
}
declare module Tactile.Geometry {
    function rectContains(rect: ClientRect, xy: [number, number]): boolean;
}
declare module Tactile.Polyfill {
    function requestAnimationFrame(callback: FrameRequestCallback): number;
    function cancelAnimationFrame(handle: number): void;
    function addClass(el: HTMLElement, className: string): void;
    function removeClass(el: HTMLElement, className: string): void;
    function remove(el: HTMLElement): void;
}
declare module Tactile.Text {
    function toProperCase(text: string): string;
}
declare module Tactile.Vector {
    function add(a: [number, number], b: [number, number]): [number, number];
    function subtract(a: [number, number], b: [number, number]): [number, number];
    function multiply(a: [number, number], b: [number, number]): [number, number];
    function multiplyScalar(a: [number, number], s: number): [number, number];
    function divide(a: [number, number], b: [number, number]): [number, number];
    function divideScalar(v: [number, number], s: number): [number, number];
    function lengthSquared(v: [number, number]): number;
    function length(v: [number, number]): number;
    function equals(a: [number, number], b: [number, number]): boolean;
}
declare module Tactile {
    class Container {
        el: HTMLElement;
        drag: Drag;
        static closest(el: HTMLElement): HTMLElement;
        static closestAcceptingTarget(el: HTMLElement, draggable: Draggable): Container;
        static buildContainer(el: HTMLElement, drag: Drag): Container;
        placeholder: Placeholder;
        helperSize: [number, number];
        helperScale: [number, number];
        accepts: string[];
        leaveAction: DragAction;
        enterAction: DragAction;
        isSource: boolean;
        constructor(el: HTMLElement, drag: Drag);
        willAccept(draggable: Draggable): boolean;
        enter(xy: [number, number]): void;
        move(xy: [number, number]): void;
        leave(): void;
        finalizePosition(el: HTMLElement): void;
        dispose(): void;
    }
}
declare module Tactile {
    interface AnimationOptions {
        duration?: number;
        easing?: string | number[];
    }
    interface Options {
        cancel?: string;
        helperResize?: boolean;
        helperCloneStyles?: boolean;
        animation?: boolean;
        revertBehaviour?: string;
        pickUpAnimation?: AnimationOptions;
        pickDownAnimation?: AnimationOptions;
        resizeAnimation?: AnimationOptions;
        dropAnimation?: AnimationOptions;
        reorderAnimation?: AnimationOptions;
        deleteAnimation?: AnimationOptions;
        containerResizeAnimation?: AnimationOptions;
        pickUpDelay?: number;
        pickUpDistance?: number;
        helperRotation?: number;
        helperShadowSize?: number;
        placeholderStyle?: string;
        placeholderClass?: string;
        avoidDomMutations?: boolean;
        scrollAutoDetect?: boolean;
        scrollSensitivity?: string | number;
        scrollSpeed?: number;
    }
    var defaults: Options;
}
declare module Tactile {
    class Cache {
        private _id;
        private _els;
        private _cache;
        constructor();
        get(el: HTMLElement, key: string, fn?: Function): any;
        set(el: HTMLElement, key: string, value: any): void;
        clear(): void;
        dispose(): void;
        getElements(): HTMLElement[];
        forEach(key: string, fn: (value: any, el?: HTMLElement) => void): void;
        private _getElementCache(el);
    }
}
declare module Tactile {
    class Canvas extends Container {
        offset: [number, number];
        grid: [number, number];
        domain: [number, number];
        constructor(el: HTMLElement, drag: Drag);
        enter(xy: [number, number]): void;
        move(xy: [number, number]): void;
        leave(): void;
        finalizePosition(el: HTMLElement): void;
        dispose(): void;
        private _insertPlaceholder();
    }
}
declare module Tactile {
    class Drag {
        xy: [number, number];
        options: Options;
        xyEl: HTMLElement;
        draggable: Draggable;
        helper: Helper;
        source: Container;
        target: Container;
        boundary: Boundary;
        action: DragAction;
        geometryCache: Cache;
        containerCache: Cache;
        private _xyChanged;
        private _hasScrolled;
        private _scroller;
        private _lastXyEl;
        private _afRequestId;
        private _onScrollOrWheelListener;
        private _dragEnded;
        constructor(draggableEl: HTMLElement, xy: [number, number], xyEl: HTMLElement, options: Options);
        move(xy: [number, number], xyEl: HTMLElement): void;
        cancel(debugElements?: boolean): void;
        drop(): void;
        dispose(): void;
        private _bindScrollEvents();
        private _unbindScrollEvents();
        private _onScrollOrWheel();
        private _scheduleTick();
        private _cancelTick();
        private _tick();
        private _updateTarget();
        private _tryEnterTarget(container);
        private _tryLeaveTarget(container);
        private _finalizeAction();
        private _computeAction(source, target);
        private _setAction(action);
        private _raise(el, eventName);
    }
}
declare module Tactile {
    enum DragAction {
        Copy = 0,
        Move = 1,
        Delete = 2,
        Revert = 3,
        Cancel = 4,
    }
}
declare module Tactile {
    class Draggable {
        el: HTMLElement;
        drag: Drag;
        static closest(el: HTMLElement): HTMLElement;
        static closestEnabled(el: HTMLElement): HTMLElement;
        data: any;
        tags: string[];
        originalParentEl: HTMLElement;
        originalIndex: number;
        originalSize: [number, number];
        originalScale: [number, number];
        originalStyle: string;
        originalOffset: [number, number];
        constructor(el: HTMLElement, drag: Drag);
        finalizeMove(target: Container): void;
        finalizeCopy(target: Container): void;
        finalizeDelete(): void;
        finalizeRevert(): void;
    }
}
declare module Tactile {
    class DragManager {
        options: Options;
        private _drags;
        private _pendingDrags;
        private _onPointerDownListener;
        private _onPointerMoveListener;
        private _onPointerUpListener;
        private _onKeyDownListener;
        private _onClickListener;
        constructor(options?: Options);
        set(options: Options): void;
        destroy(): void;
        private _bindEvents();
        private _unbindEvents();
        private _bindDragPendingEvents();
        private _unbindDragPendingEvents();
        private _bindDraggingEvents();
        private _unbindDraggingEvents();
        private _bindDraggingEventsForTarget(el);
        private _unbindDraggingEventsForTarget(el);
        private _onClick(e);
        private _onPointerDown(e);
        private _onPointerMove(e);
        private _onPointerUp(e);
        private _onKeyDown(e);
        private _scheduleDrag(draggableEl, dragId, xy);
        private _startScheduledDrag(dragId);
        private _cancelScheduledDrag(dragId);
        private _startDrag(draggableEl, dragId, xy, xyEl);
        private _endDrag(dragId, cancel?, abort?);
    }
}
declare module Tactile {
    class Droppable extends Container {
        constructor(el: HTMLElement, drag: Drag);
        enter(xy: [number, number]): void;
        move(xy: [number, number]): void;
        leave(): void;
        finalizePosition(el: HTMLElement): void;
    }
}
declare module Tactile {
    class Boundary {
        el: HTMLElement;
        drag: Drag;
        static closestForDraggable(drag: Drag, draggable: Draggable): Boundary;
        tags: string[];
        constructor(el: HTMLElement, drag: Drag);
        constrains(tags: string[]): boolean;
        getConstrainedXY(xy: [number, number]): [number, number];
    }
}
declare module Tactile {
    class Helper {
        drag: Drag;
        el: HTMLElement;
        xy: [number, number];
        gripXY: [number, number];
        gripRelative: [number, number];
        gripOffset: [number, number];
        size: [number, number];
        scale: [number, number];
        constructor(drag: Drag, draggable: Draggable);
        private _initialize(draggable);
        setAction(action: DragAction): void;
        setPosition(xy: [number, number]): void;
        setSizeAndScale(size: [number, number], scale: [number, number], animate?: boolean): void;
        animateToElementAndPutDown(el: HTMLElement, complete?: () => void): void;
        animateDelete(complete?: () => void): void;
        dispose(): void;
        private _pickUp();
    }
}
declare module Tactile {
    class Placeholder {
        el: HTMLElement;
        drag: Drag;
        size: [number, number];
        scale: [number, number];
        outerSize: [number, number];
        isOriginalEl: boolean;
        state: string;
        _originalStyles: CSSStyleDeclaration;
        static buildPlaceholder(containerEl: HTMLElement, drag: Drag): Placeholder;
        constructor(el: HTMLElement, drag: Drag, isOriginalEl?: boolean);
        private _updateDimensions();
        setState(state: string, animate?: boolean): void;
        dispose(): void;
    }
}
declare module Tactile {
    enum Direction {
        Neither = 0,
        Horizontal = 1,
        Vertical = 2,
        Both = 3,
    }
    class Scrollable {
        el: HTMLElement;
        drag: Drag;
        private static _overflowScrollValues;
        private static _detectScrollableDirection(el);
        private static _getScrollableDirection(drag, el);
        static closestScrollableScrollable(drag: Drag, xy: [number, number], xyEl: HTMLElement): any;
        private _bounds;
        private _offset;
        private _velocity;
        private _direction;
        private _sensitivity;
        private _lastUpdate;
        constructor(el: HTMLElement, drag: Drag);
        canScroll(xy: [number, number]): boolean;
        continueScroll(xy: [number, number]): boolean;
        private _updateVelocity(xy);
    }
}
declare module Tactile {
    class Sortable extends Container {
        private index;
        private _direction;
        private _directionProperties;
        private _childEls;
        private _siblingEls;
        private _childGeometry;
        private _style;
        private _avoidDomMutations;
        private _mutObserver;
        constructor(el: HTMLElement, drag: Drag);
        private _initializeMutationListener();
        private _onDomMutation(e);
        enter(xy: [number, number]): void;
        move(xy: [number, number]): void;
        leave(): void;
        finalizePosition(el: HTMLElement): void;
        dispose(): void;
        private _updateIndex(xy);
        private _updateIndexViaOffset(xy);
        private _updateIndexViaSelectionApi(xy);
        private _initializeDirection();
        private _initializePlaceholder();
        private _initializeChildAndSiblingEls();
        private _setPlaceholderIndex(newIndex);
        private _updatePlaceholderPosition(complete?);
        private _getChildGeometry(el);
        private _updatePlaceholderIndex(complete?);
        private _updateChildTranslations(complete?);
        private _clearChildTranslations();
    }
}
