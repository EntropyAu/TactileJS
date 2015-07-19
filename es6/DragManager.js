import Drag from './Drag.js';
import Draggable from './Draggable.js';
import * as dom from './lib/dom.js';
import * as events from './lib/events.js';
import * as math from './lib/math.js';


const defaultOptions = {
  cancel: 'input,textarea,a,button,select,[data-drag-placeholder]',
  helperResize: true,
  helperCloneStyles: true,
  pickUpAnimation:   { duration: 300, easing: 'ease-in-out' },
  pickDownAnimation: { duration: 300, easing: 'ease-in-out' },
  resizeAnimation:   { duration: 300, easing: 'ease-in-out' },
  dropAnimation:     { duration: 300, easing: 'ease-in-out' },
  reorderAnimation:  { duration: 150, easing: 'ease-in-out' },
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


export default class DragManager {
  constructor() {
    this.options = defaultOptions;
    this._pendingDrags = {};
    this._drags = {};

    this._onPointerDownListener = this._onPointerDown.bind(this);
    this._onPointerMoveListener = this._onPointerMove.bind(this);
    this._onPointerUpListener   = this._onPointerUp.bind(this);
    this._bindPointerEvents();
  }

  _bindPointerEvents() {
    window.addEventListener(events.pointerDownEvent, this._onPointerDownListener, true);
  }

  _unbindPointerEvents() {
    window.removeEventListener(events.pointerDownEvent, this._onPointerDownListener);
  }

  _bindPointerEventsForDragging(el) {
    window.addEventListener(events.pointerMoveEvent, this._onPointerMoveListener, true);
    window.addEventListener(events.pointerUpEvent, this._onPointerUpListener, false);
    el.addEventListener(events.pointerMoveEvent, this._onPointerMoveListener, true);
    el.addEventListener(events.pointerUpEvent, this._onPointerUpListener, false);
  }

  _unbindPointerEventsForDragging(el) {
    window.removeEventListener(events.pointerMoveEvent, this._onPointerMoveListener, true);
    window.removeEventListener(events.pointerUpEvent, this._onPointerUpListener, false);
    el.removeEventListener(events.pointerMoveEvent, this._onPointerMoveListener, true);
    el.removeEventListener(events.pointerUpEvent, this._onPointerUpListener, false);
  }


  /*******************/
  /* EVENT LISTENERS */
  /*******************/

  _onPointerDown(e) {
    if (e.which !== 0 && e.which !== 1) return;
    if (dom.ancestors(e.target, this.options.cancel).length > 0) return;

    const xy = events.pointerEventXY(e);
    const pointerId = events.pointerEventId(e);

    let draggable = Draggable.closest(e.target);
    if (!draggable || !draggable.enabled) {
      return false;
    };


    if (this.options.pickUpDelay === null || this.options.pickUpDelay === 0) {
      events.cancelEvent(e);
      this.startDrag(draggable, pointerId, xy);
    } else {
      let onpickUpTimeoutHandler = function() {
        this._onPickUpTimeout(pointerId);
      }
      this._pendingDrags[pointerId] = {
        draggable: draggable,
        xy: xy,
        timerId: setTimeout(onpickUpTimeoutHandler.bind(this), this.options.pickUpDelay)
      };
    }
    this._bindPointerEventsForDragging(e.target)
  }


  _onPickUpTimeout(pointerId) {
    if (this._pendingDrags[pointerId]) {
      let pendingDrag = this._pendingDrags[pointerId];
      this.startDrag(pendingDrag.draggable, pointerId, pendingDrag.xy);
      delete this._pendingDrags[pointerId];
    }
  }


  _onPointerMove(e) {
    const xy = events.pointerEventXY(e);
    const pointerId = events.pointerEventId(e);

    if (this._drags[pointerId]) {
      let drag = this._drags[pointerId];
      events.cancelEvent(e);
      drag.move(xy);
    }
    if (this._pendingDrags[pointerId]) {
      let pendingDrag = this._pendingDrags[pointerId];
      // TODO: check relative motion against the item - so flick scrolling does not trigger pick up
      if (this.options.pickUpDistance && math.distance(pendingDrag.xy, xy) > this.options.pickUpDistance)
      clearTimeout(pendingDrag.timerId);
      this.startDrag(pendingDrag.draggable, pointerId, pendingDrag.xy);
      delete this._pendingDrags[pointerId];
    }
  }


  _onPointerUp(e) {
    const pointerId = events.pointerEventId(e);

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
  }


  startDrag(draggable, pointerId, xy) {
    dom.clearSelection();
    document.body.setAttribute('data-drag-in-progress', '');
    let drag = new Drag(draggable, xy, defaultOptions);
    this._drags[pointerId] = drag;
  }
}


window.dragManager = new DragManager();
