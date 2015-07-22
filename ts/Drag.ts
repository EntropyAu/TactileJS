module Tactile {

  export class Drag {

    xy:[number,number];
    xyEl:HTMLElement;

    draggable:Draggable;
    helper:Helper;
    source:Container = null;
    target:Container = null;
    fence:Fence;
    action:string;
    copy:boolean;
    options:Options;
    scrollCache:Cache;
    containerCache:Cache;

    private _xyChanged:boolean;
    private _scroller:Scrollable;
    private _lastXyEl:HTMLElement;
    private _requestId:number = null;
    private _onScrollOrWheelListener:EventListener;


    constructor(draggableEl:HTMLElement,
                xy:[number,number],
                xyEl:HTMLElement,
                options:Options) {
      this.options = options;
      this.xy = xy;
      this.xyEl = xyEl || Dom.elementFromPoint(this.xy);
      this._xyChanged = false;

      this.draggable = new Draggable(draggableEl, this);
      this.helper = new Helper(this, this.draggable);
      this.fence = Fence.closestForDraggable(this, this.draggable);
      this.copy = false;

      this.scrollCache = new Cache();
      this.containerCache = new Cache();

      this._updateTarget();
      this.source = this.target;

      this._onScrollOrWheelListener = this._onScrollOrWheel.bind(this);

      document.addEventListener('scroll', this._onScrollOrWheelListener, false);
      document.addEventListener('mousewheel', this._onScrollOrWheelListener, false);
      document.addEventListener('wheel', this._onScrollOrWheelListener, false);

      this._raise(this.draggable.el, 'dragstart')
    }


    move(xy:[number,number], xyEl:HTMLElement):void {
      if (!this._requestId) {
        this._requestId = Polyfill.requestAnimationFrame(this._tick.bind(this));
      }
      this.xy = xy;
      this.xyEl = xyEl;
      this._xyChanged = true;
    }


    cancel():void {
      if (this._requestId) Polyfill.cancelAnimationFrame(this._requestId);
      this.draggable.revertOriginal();
    }


    drop():void {
      if (this._requestId) Polyfill.cancelAnimationFrame(this._requestId);
      this._scroller = null;
      this._tick();
      if (this.target) this._beginDrop(); else this._beginMiss();
      this._raise(this.draggable.el, 'drop');
      this._raise(this.draggable.el, 'dragend');
    }


    dispose() {
      this.containerCache.getElements().forEach((t:HTMLElement) => this.containerCache.get(t, 'container').dispose());
      this.helper.dispose();
      this.scrollCache.dispose();
      this.containerCache.dispose();

      document.removeEventListener('scroll', this._onScrollOrWheelListener, false);
      document.removeEventListener('mousewheel', this._onScrollOrWheelListener, false);
      document.removeEventListener('wheel', this._onScrollOrWheelListener, false);
    }


    private _onScrollOrWheel():void {
      this.scrollCache.clear();
    }


    private _tick():void {
      this._requestId = null;

      if (this._xyChanged) {
        if (this.fence) this.xy = this.fence.getConstrainedXY(this.xy);
        if (!this.xyEl) this.xyEl = Dom.elementFromPoint(this.xy);
        if (this.xyEl != this._lastXyEl) {
          this._scroller = Scrollable.closestReadyScrollable(this.xyEl, this, this.xy);
        }
        this._raise(this.draggable.el, 'drag');
        this.helper.setPosition(this.xy);
        this._xyChanged = false;
      }

      if (this._scroller) {
        if (this._scroller.step(this.xy)) {
          // clear the client measurements scrollCache as offsets may have
          // changed due to scrolling
          this.scrollCache.clear();
        } else {
          this._scroller = null;
        };
        // keep calling the _tick method until we are no longer scrolling
        this._requestId = Polyfill.requestAnimationFrame(this._tick.bind(this));
      } else {
        //this.xyEl = Dom.elementFromPoint(this.xy);
        if (this.xyEl !== this._lastXyEl) {
          this._updateTarget();
          this._lastXyEl = this.xyEl;
        };
        if (this.target) {
          const targetBounds = this.scrollCache.get(this.target.el, 'cr', () => this.target.el.getBoundingClientRect());
          if (Maths.contains(targetBounds, this.xy))
            this.target.move(this.xy);
        }
        this._raise(this.draggable.el, 'drag');
      }
    }


    private _beginDrop():void {
      if (this.target.placeholder && (this.action === "copy" || this.action === "move")) {
        this.helper.animateToElementAndPutDown(this.target.placeholder.el, function() {
          Polyfill.requestAnimationFrame(function() {
            this.target.finalizeDrop(this.draggable);
            this.dispose();
          }.bind(this));
        }.bind(this));
      }
      if (this.action === "delete") {
        this.helper.animateDelete(function() {
          this.dispose();
        }.bind(this));
      }
    }


    private _beginMiss():void {
      this.draggable.finalizeRevert();
      // restore draggable to original position
      this.dispose();
    }


    private _updateTarget():void {
      const oldTarget = this.target;
      // if the source.leaveAction is delete, the drop target cannot
      // be another container
      let newTarget = this.source && this.source.leaveAction === "delete"
                    ? null
                    : Container.closestAcceptingTarget(this.xyEl, this.draggable);

      // if the current drag operation is fenced, then the target container
      // must be a descendant of the fence element
      if (newTarget && this.fence
                    && !Dom.isDescendant(this.fence.el, newTarget.el)
                    && this.fence.el !== newTarget.el) return;

      if (newTarget === oldTarget) return;

      if (newTarget || this.options.revertBehaviour !== 'last') {
        if (oldTarget === null || this._tryLeaveTarget(oldTarget)) {
          if (newTarget !== null) this._tryEnterTarget(newTarget);
          this._setAction(this._computeAction(this.source, this.target));
        }
      }
    }


    private _tryEnterTarget(container:Container):boolean {
      if (this._raise(container.el, 'dragenter')) {
        container.enter(this.xy);
        if (container.placeholderSize && this.options.helperResize) {
          this.helper.setSizeAndScale(
            container.placeholderSize,
            container.placeholderScale);
        }
        this.target = container;
        return true;
      } else {
        return false;
      }
    }


    private _tryLeaveTarget(container:Container):boolean {
      if (this._raise(container.el, 'dragleave')) {
        container.leave();
        this.target = null;
        return true;
      } else {
        return false;
      }
    }


    // SOURCE | TARGET | ACTION | DRAGGABLE
    // NULL   | NULL   | revert | original
    // NULL   | move   | move   | original
    // NULL   | copy   | copy   | copy
    // NULL   | delete | delete | original
    // move   | NULL   | revert | original
    // move   | move   | move   | original
    // move   | copy   | copy   | copy
    // move   | delete | delete | original
    // copy   | NULL   | delete | copy
    // copy   | move   | copy   | copy
    // copy   | copy   | copy   | copy
    // copy   | delete | delete | copy
    // delete | *      | delete | original
    private _computeAction(source:Container, target:Container):[string, boolean] {
      if (source === target) return ["move", false];
      let [action, copy] = ["move", false];
      const leave = this.source ? this.source.leaveAction : "move";
      const enter = this.target ? this.target.enterAction : "revert";
      if (leave === "copy" || enter === "copy") {
        action = "copy";
        copy = true;
      }
      if (enter === "revert") action = "revert";
      if (leave === "delete" || enter === "delete") action = "delete";
      return [action, copy];
    }


    private _setAction(actionCopy:[string, boolean]) {
      if (this.action === actionCopy[0]) return;
      this.helper.setAction(actionCopy[0]);
      this.action = actionCopy[0];
      this.copy = actionCopy[1];
    }


    private _raise(el:Element, eventName:string) {
      let eventData = {
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
      return Events.raise(el, eventName, eventData);
    }
  }
}
