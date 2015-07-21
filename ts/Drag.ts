module Tactile {

  export class Drag {

    xy:[number,number];
    pointerEl:HTMLElement;

    draggable:Draggable;
    helper:Helper;
    source:Container = null;
    target:Container = null;
    fence:Fence;
    action:DragAction;
    copy:boolean;
    options:Options;
    cache:Cache;

    private _scroller:Scrollable;
    private _requestId:number = null;


    constructor(draggableEl:HTMLElement,
                xy:[number,number],
                options:Options) {
      window['drag'] = this;
      this.options = options;
      this.xy = xy;
      this.pointerEl = Dom.elementFromPoint(xy);

      this.draggable = new Draggable(draggableEl, this);
      this.helper = new Helper(this, this.draggable);
      this.fence = Fence.closestForDraggable(this, this.draggable);
      this.copy = false;

      this.cache = new Cache();

      this._updateTarget();
      this.source = this.target;

      document.addEventListener('scroll', this._onScrollOrWheel, false);
      document.addEventListener('mousewheel', this._onScrollOrWheel, false);
      document.addEventListener('wheel', this._onScrollOrWheel, false);

      this._raise(this.draggable.el, 'dragstart')
    }

    private _onScrollOrWheel():void {
      this.cache.clear();
    }

    move(xy:[number,number]):void {
      // cancel any upcoming hover calls
      if (this._requestId) {
        cancelAnimationFrame(this._requestId);
        this._requestId = null;
      }

      this.xy = this.fence ? this.fence.getConstrainedXY(xy) : xy;
      this.pointerEl = Dom.elementFromPoint(this.xy);
      this._scroller = Scrollable.closestReadyScrollable(this.pointerEl, this, this.xy);
      this._hover();
      this._raise(this.draggable.el, 'drag');
      this.helper.setPosition(this.xy);
    }


    private _hover():void {
      this._requestId = null;
      if (this._scroller) {
        if (this._scroller.step(this.xy)) {
          // clear the cache of client measurements as they may have
          // changed due to scrolling
          this.cache.clear();
        } else {
          this._scroller = null;
        };
        // keep calling the _hover method until we are no longer scrolling
        this._requestId = requestAnimationFrame(this._hover.bind(this));
      } else {
        this.pointerEl = Dom.elementFromPoint(this.xy);
        this._updateTarget();
        if (this.target && Maths.contains(this.target.el.getBoundingClientRect(), this.xy))
          this.target.move(this.xy);
        this._raise(this.draggable.el, 'drag');
      }
    }

    /**
     * Cancel drag and revert item to it's original position
     */
    cancel():void {

    }


    /**
     * Drop the dragged item
     */
    drop():void {
      if (this._requestId) cancelAnimationFrame(this._requestId);
      if (this.target) this._beginDrop(); else this._beginMiss();
      this._raise(this.draggable.el, 'dragend');
    }


    private _beginDrop():void {
      if (this.target.placeholder && (this.action === DragAction.Copy || this.action === DragAction.Move)) {
        this.helper.animateToElementAndPutDown(this.target.placeholder.el, function() {
          requestAnimationFrame(function() {
            this.target.finalizeDrop(this.draggable);
            this.dispose();
          }.bind(this));
        }.bind(this));
      }
      if (this.action === DragAction.Delete) {
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
      let newTarget = this.source && this.source.leaveAction === DragAction.Delete
                    ? null
                    : Container.closestAcceptingTarget(this.pointerEl, this.draggable);
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
    _computeAction(source:Container, target:Container):[DragAction, boolean] {
      if (source === target) return [DragAction.Move, false];
      let [action, copy] = [DragAction.Move, false];
      const leave = this.source ? this.source.leaveAction : DragAction.Move;
      const enter = this.target ? this.target.enterAction : DragAction.Revert;
      if (leave === DragAction.Copy || enter === DragAction.Copy) {
        action = DragAction.Copy;
        copy = true;
      }
      if (enter === DragAction.Revert) action = DragAction.Revert;
      if (leave === DragAction.Delete || enter === DragAction.Delete) action = DragAction.Delete;
      return [action, copy];
    }


    _setAction(actionCopy:[DragAction, boolean]) {
      if (this.action === actionCopy[0]) return;
      this.helper.setAction(actionCopy[0]);
      this.action = actionCopy[0];
      this.copy = actionCopy[1];
    }

    _raise(el:Element, eventName:string) {
      let eventData = {
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
      return Events.raise(el, eventName, eventData);
    }


    dispose() {
      document.removeEventListener('scroll', this._onScrollOrWheel, false);
      document.removeEventListener('mousewheel', this._onScrollOrWheel, false);
      document.removeEventListener('wheel', this._onScrollOrWheel, false);

      //this._knownTargets.forEach((t:Container) => t.dispose());
      this.helper.dispose();
      this.cache.dispose();
    }
  }
}
