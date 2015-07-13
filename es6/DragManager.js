import Drag from './Drag.js';
import Draggable from './Draggable.js';
import * as dom from './lib/dom.js';
import * as events from './lib/events.js';
import * as math from './lib/math.js';


const defaultOptions = {
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
    containerOver: 'dd-drag-hover',
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

  bindPointerEventsForDragging() {
    window.addEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
    window.addEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
  }

  unbindPointerEventsForDragging() {
    window.removeEventListener(events.pointerMoveEvent, this.onPointerMoveListener, true);
    window.removeEventListener(events.pointerUpEvent, this.onPointerUpListener, false);
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
    if (!draggable) return false;

    dom.clearSelection();

    if (this.options.pickup.delay === null || this.options.pickup.delay === 0) {
      events.cancelEvent(e);
      this.drags[pointerId] = new Drag(draggable, pointerXY, defaultOptions);
      document.body.setAttribute('data-drag-in-progress', '');
    } else {
      let onPickupTimeoutHandler = function() {
        this.onPickUpTimeout(pointerId);
      }
      this.pendingDrags[pointerId] = {
        draggable: draggable,
        pointerXY: pointerXY,
        timerId: setTimeout(onPickupTimeoutHandler.bind(this), this.options.pickup.delay)
      };
    }
    this.bindPointerEventsForDragging()
  }


  onPickUpTimeout(pointerId) {
    if (this.pendingDrags[pointerId]) {
      let pendingDrag = this.pendingDrags[pointerId];
      this.drags[pointerId] = new Drag(pendingDrag.draggable, pendingDrag.pointerXY, this.options);
      document.body.setAttribute('data-drag-in-progress', '');
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
      if (this.options.pickup.distance && math.distance(pendingDrag.pointerXY, pointerXY) > this.options.pickup.distance)
      clearTimeout(pendingDrag.timerId);
      this.drags[pointerId] = new Drag(pendingDrag.draggable, pendingDrag.pointerXY, this.options);
      document.body.setAttribute('data-drag-in-progress', '');
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
        this.unbindPointerEventsForDragging();
      }
    }
    if (this.pendingDrags[pointerId]) {
      clearTimeout(this.pendingDrags[pointerId].timerId);
    }
  }
}

window.dragManager = new DragManager();
