module Tactile {
  export class DragManager {
    public options: Options = defaults;

    private _drags: any = {};
    private _pendingDrags: any = {};
    private _onPointerDownListener: EventListener;
    private _onPointerMoveListener: EventListener;
    private _onPointerUpListener: EventListener;
    private _onKeyDownListener: EventListener;
    private _onClickListener: EventListener;


    constructor(options?: Options) {
      this._onPointerDownListener = this._onPointerDown.bind(this);
      this._onPointerMoveListener = this._onPointerMove.bind(this);
      this._onPointerUpListener = this._onPointerUp.bind(this);
      this._onClickListener = this._onClick.bind(this);
      this._onKeyDownListener = this._onKeyDown.bind(this);
      this._bindEvents();
      this.set(options);
    }

    /******************/
    /* PUBLIC METHODS */
    /******************/

    set(options: Options) {
      for (let key in (options || {}))
        this.options[key] = options[key];
    }


    destroy() {
      this._unbindEvents();
    }


    /*******************/
    /* EVENT LISTENERS */
    /*******************/

    private _bindEvents() {
      window.addEventListener(Events.pointerDownEvent, this._onPointerDownListener, true);
      window.addEventListener(Events.pointerUpEvent, this._onPointerUpListener, true);
    }


    private _unbindEvents() {
      window.removeEventListener(Events.pointerDownEvent, this._onPointerDownListener, true);
      window.removeEventListener(Events.pointerUpEvent, this._onPointerUpListener, true);
    }


    private _bindDragPendingEvents() {
      window.addEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      window.addEventListener(Events.pointerUpEvent, this._onPointerUpListener, true);
    }


    private _unbindDragPendingEvents() {
      window.removeEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      window.removeEventListener(Events.pointerUpEvent, this._onPointerUpListener, true);
    }


    private _bindDraggingEvents() {
      window.addEventListener('keydown', this._onKeyDownListener, true);
      window.addEventListener("click", this._onClickListener, true);
    }


    private _unbindDraggingEvents() {
      window.removeEventListener('keydown', this._onKeyDownListener, true);
      window.removeEventListener("click", this._onClickListener, true);
    }


    private _bindDraggingEventsForTarget(el: HTMLElement) {
      el.addEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      el.addEventListener(Events.pointerUpEvent, this._onPointerUpListener, true);
    }


    private _unbindDraggingEventsForTarget(el: HTMLElement) {
      el.removeEventListener(Events.pointerMoveEvent, this._onPointerMoveListener, true);
      el.removeEventListener(Events.pointerUpEvent, this._onPointerUpListener, true);
    }

    private _onClick(e: MouseEvent) {
      Events.cancel(e);
    }

    private _onPointerDown(e: MouseEvent|TouchEvent) {
      if (e instanceof MouseEvent && e.which !== 0 && e.which !== 1) return;

      for (let pointer of Events.normalizePointerEvent(e)) {
        if (Dom.ancestors(pointer.target, this.options.cancel).length > 0) continue;
        let draggableEl = Draggable.closestEnabled(pointer.target);
        if (!draggableEl) continue;

        if (this.options.pickUpDelay === 0) {
          this._startDrag(draggableEl, pointer.id, pointer.xy, pointer.xyEl);
          Events.cancel(e);
        } else {
          this._scheduleDrag(draggableEl, pointer.id, pointer.xy);
        };
      }
      this._bindDragPendingEvents();
    }


    private _onPointerMove(e: MouseEvent|TouchEvent) {
      for (let pointer of Events.normalizePointerEvent(e)) {
        if (this._drags[pointer.id]) {
          this._drags[pointer.id].move(pointer.xy, pointer.xyEl);
          Events.cancel(e);
        }
        if (this._pendingDrags[pointer.id]) {
          let pendingDrag = this._pendingDrags[pointer.id];
          if (this.options.pickUpDistance > 0 && Vector.length(Vector.subtract(pendingDrag.xy, pointer.xy)) > this.options.pickUpDistance)
            this._startScheduledDrag(pointer.id);
        }
      }
    }


    private _onPointerUp(e: MouseEvent|TouchEvent) {
      for (let pointer of Events.normalizePointerEvent(e)) {
        if (this._drags[pointer.id]) {
          this._endDrag(pointer.id);
          Events.cancel(e);
        }
        if (this._pendingDrags[pointer.id]) {
          this._cancelScheduledDrag(pointer.id);
        }
      }
    }


    private _onKeyDown(e: KeyboardEvent): void {
      if (e.which === 27 /* ESC */) {
        Object.keys(this._drags).forEach(function(dragId) {
          this._endDrag(parseInt(dragId, 10), true, e.shiftKey);
        }.bind(this));
      }
    }


    private _scheduleDrag(draggableEl: HTMLElement, dragId: number, xy: [number, number]): void {
      let onPickUpTimeout = function() { this._startScheduledDrag(dragId); }.bind(this);
      this._pendingDrags[dragId] = {
        id: dragId,
        el: draggableEl,
        xy: xy,
        timerId: this.options.pickUpDelay ? setTimeout(onPickUpTimeout, this.options.pickUpDelay) : null
      };
    }


    private _startScheduledDrag(dragId: number) {
      let pendingDrag = this._pendingDrags[dragId];
      clearTimeout(pendingDrag.timerId);
      this._startDrag(pendingDrag.el, pendingDrag.id, pendingDrag.xy, pendingDrag.xyEl);
      delete this._pendingDrags[dragId];
    }


    private _cancelScheduledDrag(dragId: number) {
      let pendingDrag = this._pendingDrags[dragId];
      clearTimeout(pendingDrag.timerId);
      delete this._pendingDrags[pendingDrag.id];
    }


    private _startDrag(draggableEl: HTMLElement, dragId: number, xy: [number, number], xyEl: HTMLElement): Drag {
      Dom.clearSelection();
      document.body.setAttribute('data-drag-in-progress', '');
      this._bindDraggingEvents();
      if (xyEl) this._bindDraggingEventsForTarget(xyEl);
      return this._drags[dragId] = new Drag(draggableEl, xy, xyEl, this.options);
    }


    private _endDrag(dragId: number, cancel: boolean = false, abort: boolean = false) {
      let drag = this._drags[dragId];
      if (!cancel) drag.drop(); else drag.cancel(abort);
      delete this._drags[dragId];
      if (Object.keys(this._drags).length == 0) {
        document.body.removeAttribute('data-drag-in-progress');
        setTimeout(function() {
          this._unbindDraggingEvents();
          this._unbindDragPendingEvents();
          this._unbindDraggingEventsForTarget(drag.draggable.el);
        }.bind(this), 0)
      }
    }
  };

  window['dragManager'] = new DragManager();
}
