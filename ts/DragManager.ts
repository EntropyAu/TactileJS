module Tactile {
  export class DragManager {
    options: Options;
    private _drags: any = {};
    private _pendingDrags: any = {};

    private _onPointerDownListener:EventListener;
    private _onPointerMoveListener:EventListener;
    private _onPointerUpListener:EventListener;
    private _onKeyDownListener:EventListener;


    constructor() {
      this.options = defaults;
      this._onPointerDownListener = this._onPointerDown.bind(this);
      this._onPointerMoveListener = this._onPointerMove.bind(this);
      this._onPointerUpListener = this._onPointerUp.bind(this);
      this._onKeyDownListener = this._onKeyDown.bind(this);
      this._bindEvents();
    }


    private _bindEvents() {
      window.addEventListener(Events.pointerDownEvent, this._onPointerDownListener, true);
    }


    private _unbindEvents() {
      window.removeEventListener(Events.pointerDownEvent, this._onPointerDownListener, true);
    }


    private _bindDraggingEvents() {
      window.addEventListener('keydown', this._onKeyDownListener, false);
      window.addEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      window.addEventListener(Events.pointerUpEvent, this._onPointerUpListener, false);
    }


    private _unbindDraggingEvents() {
      window.removeEventListener('keydown', this._onKeyDownListener, false);
      window.removeEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      window.removeEventListener(Events.pointerUpEvent, this._onPointerUpListener, false);
    }


    private _bindDraggingEventsForTarget(el:HTMLElement) {
      el.addEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      el.addEventListener(Events.pointerUpEvent, this._onPointerUpListener, false);
    }


    private _unbindDraggingEventsForTarget(el:HTMLElement) {
      el.removeEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      el.removeEventListener(Events.pointerUpEvent, this._onPointerUpListener, false);
    }


    /*******************/
    /* EVENT LISTENERS */
    /*******************/

    private _onPointerDown(e:MouseEvent|TouchEvent) {
      if (e instanceof MouseEvent && e.which !== 0 && e.which !== 1) return;

      for (let pointer of Events.normalizePointerEvent(e)) {
        if (Dom.ancestors(pointer.target, this.options.cancel).length > 0) continue;
        let draggableEl = Draggable.closestEnabled(pointer.target);
        if (!draggableEl) continue;

        if (!this.options.pickUpDelay) {
          this.startDrag(draggableEl, pointer.id, pointer.xy, pointer.xyEl);
        } else  {
          this.scheduleDrag(draggableEl, pointer.id, pointer.xy);
        };

        Events.cancel(e);
      }
    }


    private _onPointerMove(e:MouseEvent|TouchEvent) {
      for (let pointer of Events.normalizePointerEvent(e)) {
        if (this._drags[pointer.id]) {
          this._drags[pointer.id].move(pointer.xy, pointer.xyEl);
          Events.cancel(e);
        }
        if (this._pendingDrags[pointer.id]) {
          let pendingDrag = this._pendingDrags[pointer.id];
          if (this.options.pickUpDistance > 0 && Vector.length(Vector.subtract(pendingDrag.xy, pointer.xy)) > this.options.pickUpDistance)
            this.startScheduledDrag(pointer.id);
        }
      }
    }


    private _onPointerUp(e:MouseEvent|TouchEvent) {
      for (let pointer of Events.normalizePointerEvent(e)) {
        if (this._drags[pointer.id]) {
          this.endDrag(pointer.id);
          Events.cancel(e);
        }
        if (this._pendingDrags[pointer.id]) {
          this.cancelScheduledDrag(pointer.id);
        }
      }
    }


    private _onKeyDown(e:KeyboardEvent):void {
      if (e.which === 27 /* ESC */) {
        Object.keys(this._drags).forEach(function (dragId) {
          this.endDrag(parseInt(dragId, 10), true, e.shiftKey);
        }.bind(this));
      }
    }


    startDrag(draggableEl:HTMLElement, dragId:number, xy:[number,number], xyEl:HTMLElement):Drag {
      Dom.clearSelection();
      document.body.setAttribute('data-drag-in-progress', '');
      this._bindDraggingEvents();
      if (xyEl) this._bindDraggingEventsForTarget(xyEl);
      return this._drags[dragId] = new Drag(draggableEl, xy, xyEl, this.options);
    }


    scheduleDrag(draggableEl:HTMLElement, dragId:number, xy:[number,number]):void {
      let onPickUpTimeout = function() { this.startScheduledDrag(dragId); }.bind(this);
      this._pendingDrags[dragId] = {
        el: draggableEl,
        xy: xy,
        timerId: setTimeout(onPickUpTimeout, this.options.pickUpDelay)
      };
    }


    endDrag(dragId:number, cancel:boolean = false, abort:boolean = false) {
      let drag = this._drags[dragId];
      if (!cancel) drag.drop(); else drag.cancel(abort);
      delete this._drags[dragId];
      if (Object.keys(this._drags).length == 0) {
        document.body.removeAttribute('data-drag-in-progress');
        this._unbindDraggingEvents();
        this._unbindDraggingEventsForTarget(drag.draggable.el);
      }
    }



    startScheduledDrag(dragId:number) {
      let pendingDrag = this._pendingDrags[dragId];
      clearTimeout(pendingDrag.timerId);
      this.startDrag(pendingDrag.el, pendingDrag.id, pendingDrag.xy, pendingDrag.xyEl);
      delete this._pendingDrags[pendingDrag.id];
    }


    cancelScheduledDrag(dragId:number) {
      let pendingDrag = this._pendingDrags[dragId];
      clearTimeout(pendingDrag.timerId);
      delete this._pendingDrags[pendingDrag.id];
    }
  };

  window['dragManager'] = new DragManager();
}
