module Tactile {
  export class DragManager {
    options: Options;
    private _drags: any = {};
    private _pendingDrags: any = {};

    private _onPointerDownListener:EventListener;
    private _onPointerMoveListener:EventListener;
    private _onPointerUpListener:EventListener;

    constructor() {
      this.options = defaultOptions;
      this._onPointerDownListener = this._onPointerDown.bind(this);
      this._onPointerMoveListener = this._onPointerMove.bind(this);
      this._onPointerUpListener = this._onPointerUp.bind(this);
      this._bindPointerEvents();
    }

    private _bindPointerEvents() {
      window.addEventListener(Events.pointerDownEvent, this._onPointerDownListener, true);
    }

    private _unbindPointerEvents() {
      window.removeEventListener(Events.pointerDownEvent, this._onPointerDownListener, true);
    }

    private _bindPointerEventsForDragging(el:HTMLElement) {
      window.addEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      window.addEventListener(Events.pointerUpEvent, this._onPointerUpListener, false);
      el.addEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      el.addEventListener(Events.pointerUpEvent, this._onPointerUpListener, false);
    }

    private _unbindPointerEventsForDragging(el:HTMLElement) {
      window.removeEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      window.removeEventListener(Events.pointerUpEvent, this._onPointerUpListener, false);
      el.removeEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      el.removeEventListener(Events.pointerUpEvent, this._onPointerUpListener, false);
    }


    /*******************/
    /* EVENT LISTENERS */
    /*******************/

    private _onPointerDown(e:MouseEvent|TouchEvent) {
      if (e instanceof MouseEvent && e.which !== 0 && e.which !== 1) return;

      if (Dom.ancestors(<HTMLElement>e.target, this.options.cancel).length > 0) return;

      const xy = Events.pointerEventXY(e);
      const dragId = Events.pointerEventId(e);

      let el = Draggable.closestEnabled(<HTMLElement>e.target);
      if (!el) return false;


      if (this.options.pickUpDelay === null || this.options.pickUpDelay === 0) {
        Events.cancel(e);
        this.startDrag(el, dragId, xy);
      } else {
        let onpickUpTimeoutHandler = function() {
          this._onPickUpTimeout(dragId);
        }
        this._pendingDrags[dragId] = {
          el: el,
          xy: xy,
          timerId: setTimeout(onpickUpTimeoutHandler.bind(this), this.options.pickUpDelay)
        };
      }
      this._bindPointerEventsForDragging(<HTMLElement>e.target)
    }


    private _onPickUpTimeout(dragId:number) {
      if (this._pendingDrags[dragId]) {
        let pendingDrag = this._pendingDrags[dragId];
        this.startDrag(pendingDrag.draggable, dragId, pendingDrag.xy);
        delete this._pendingDrags[dragId];
      }
    }


    private _onPointerMove(e:MouseEvent|TouchEvent) {
      const xy = Events.pointerEventXY(e);
      const dragId = Events.pointerEventId(e);

      if (this._drags[dragId]) {
        let drag = this._drags[dragId];
        Events.cancel(e);
        drag.move(xy);
      }
      if (this._pendingDrags[dragId]) {
        let pendingDrag = this._pendingDrags[dragId];
        // TODO: check relative motion against the item - so flick scrolling does not trigger pick up
        if (this.options.pickUpDistance && Vector.length(Vector.subtract(pendingDrag.xy, xy)) > this.options.pickUpDistance)
        clearTimeout(pendingDrag.timerId);
        this.startDrag(pendingDrag.draggable, dragId, pendingDrag.xy);
        delete this._pendingDrags[dragId];
      }
    }


    private _onPointerUp(e:MouseEvent|TouchEvent) {
      const dragId = Events.pointerEventId(e);

      if (this._drags[dragId]) {
        Events.cancel(e);
        this.endDrag(dragId);
      }
      if (this._pendingDrags[dragId]) {
        clearTimeout(this._pendingDrags[dragId].timerId);
      }
    }


    startDrag(el:HTMLElement, dragId:number, xy:[number,number]):Drag {
      Dom.clearSelection();
      document.body.setAttribute('data-drag-in-progress', '');
      return this._drags[dragId] = new Drag(el, xy, this.options);
    }


    endDrag(dragId:number) {
      let drag = this._drags[dragId];
      drag.drop();
      if (Object.keys(this._drags).length == 0) {
        document.body.removeAttribute('data-drag-in-progress');
        this._unbindPointerEventsForDragging(drag.draggable.el);
      }
      delete this._drags[dragId];
    }
  };

  window['dragManager'] = new DragManager();
}
