import Drag from './Drag.js';
import Draggable from './Draggable.js';
import * as dom from './lib/dom.js';
import * as events from './lib/events.js';
import * as math from './lib/math.js';


const defaultOptions = {
  cancel: 'input,textarea,a,button,select,[data-drag-placeholder]',
  helperResize: true,
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
    this.pendingDrags = {};
    this.drags = {};

    this.onPointerDownListener = this.onPointerDown.bind(this);
    this.onPointerMoveListener = this.onPointerMove.bind(this);
    this.onPointerUpListener   = this.onPointerUp.bind(this);
    this.bindPointerEvents();
  }

  bindPointerEvents() {
    window.addEventListener(events.pointerDownEvent, this.onPointerDownListener, true);
  }

  unbindPointerEvents() {
    window.removeEventListener(events.pointerDownEvent, this.onPointerDownListener);
  }

  bindPointerEventsForDragging(el) {
    window.addEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
    window.addEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
    el.addEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
    el.addEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
  }

  unbindPointerEventsForDragging(el) {
    window.removeEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
    window.removeEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
    el.removeEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
    el.removeEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
  }


  /*******************/
  /* EVENT LISTENERS */
  /*******************/

  onPointerDown(e) {
    if (e.which !== 0 && e.which !== 1) return;
    if (dom.ancestors(e.target, this.options.cancel).length > 0) return;

    const pointerXY = events.pointerEventXY(e);
    const pointerId = events.pointerEventId(e);

    let draggable = Draggable.closest(e.target);
    if (!draggable || !draggable.enabled) {
      return false;
    };


    if (this.options.pickUpDelay === null || this.options.pickUpDelay === 0) {
      events.cancelEvent(e);
      this.startDrag(draggable, pointerId, pointerXY);
    } else {
      let onpickUpTimeoutHandler = function() {
        this.onpickUpTimeout(pointerId);
      }
      this.pendingDrags[pointerId] = {
        draggable: draggable,
        pointerXY: pointerXY,
        timerId: setTimeout(onpickUpTimeoutHandler.bind(this), this.options.pickUpDelay)
      };
    }
    this.bindPointerEventsForDragging(e.target)
  }

  onpickUpTimeout(pointerId) {
    if (this.pendingDrags[pointerId]) {
      let pendingDrag = this.pendingDrags[pointerId];
      this.startDrag(pendingDrag.draggable, pointerId, pendingDrag.pointerXY);
      delete this.pendingDrags[pointerId];
    }
  }


  onPointerMove(e) {
    const pointerXY = events.pointerEventXY(e);
    const pointerId = events.pointerEventId(e);

    if (this.drags[pointerId]) {
      let drag = this.drags[pointerId];
      events.cancelEvent(e);
      drag.move(pointerXY);
    }
    if (this.pendingDrags[pointerId]) {
      let pendingDrag = this.pendingDrags[pointerId];
      // TODO: check relative motion against the item - so flick scrolling does not trigger pick up
      if (this.options.pickUpDistance && math.distance(pendingDrag.pointerXY, pointerXY) > this.options.pickUpDistance)
      clearTimeout(pendingDrag.timerId);
      this.startDrag(pendingDrag.draggable, pointerId, pendingDrag.pointerXY);
      delete this.pendingDrags[pointerId];
    }
  }


  onPointerUp(e) {
    const pointerId = events.pointerEventId(e);

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
  }

  startDrag(draggable, pointerId, pointerXY) {
    dom.clearSelection();
    document.body.setAttribute('data-drag-in-progress', '');
    this.drags[pointerId] = new Drag(draggable, pointerXY, defaultOptions);
  }
}

window.dragManager = new DragManager();
