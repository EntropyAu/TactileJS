module Tactile {

  // TODO: xxxxx invalidating geometry cache with heirarchical sortables
  // TODO: xxxxx - invalidate child measures when entering / exiting hierarchical
  // TODO: xxxxx - wrapped elements - delay updates while animation is in progress
  // TODO: xxxxx - constrain placement in canvas

  // TODO: Fix scaled sortable calculations - local xy on move
  // TODO: Fix non-velocity scaled helper
  // TODO: Reapply boundary constraint on window scroll
  // TODO: cache scrollable containers
  // TODO: update source mode if enter-action is defined on target
  // TODO: Add revert behaviour - "origin" (in addition to "last")
  // TODO: Automatically detect scrollables using computedStyle
  // TODO: constrain scroll with blah
  // TODO: constrain scroll with max scroll (iOS does not enforce)
  // TODO: listen to dom mutation events
  // TODO: use pointer (not constrained) location for scrolling (scrolling can be prevented for large items)
  // TODO:  - scrolling should be constrained within boundary
  // TODO: enable events to be registered manually instead of globally


  export class Drag {
    xy:[number,number];
    xyEl:HTMLElement;

    draggable:Draggable;
    helper:Helper;
    source:Container = null;
    target:Container = null;
    boundary:Boundary;
    action:string;
    copy:boolean;
    options:Options;
    geometryCache:Cache;
    containerCache:Cache;

    private _xyChanged:boolean = false;
    private _hasScrolled:boolean = false;
    private _scroller:Scrollable;
    private _lastXyEl:HTMLElement;
    private _afRequestId:number = null;
    private _onScrollOrWheelListener:EventListener;
    private _dragEnded:boolean = false;


    constructor(draggableEl:HTMLElement,
                xy:[number,number],
                xyEl:HTMLElement,
                options:Options) {
      this.options = options;
      this.xy = xy;
      this.xyEl = xyEl || Dom.elementFromPoint(this.xy);

      this.draggable = new Draggable(draggableEl, this);
      this.helper = new Helper(this, this.draggable);
      this.boundary = Boundary.closestForDraggable(this, this.draggable);
      this.copy = false;

      this.geometryCache = new Cache();
      this.containerCache = new Cache();

      // TODO - would be great to have a more robust way of instantiating
      // the source element
      this._updateTarget();
      this.source = this.target;

      this._onScrollOrWheelListener = this._onScrollOrWheel.bind(this);
      document.addEventListener('scroll', this._onScrollOrWheelListener, false);
      document.addEventListener('mousewheel', this._onScrollOrWheelListener, false);
      document.addEventListener('wheel', this._onScrollOrWheelListener, false);

      this._raise(this.draggable.el, 'dragstart')
    }


    move(xy:[number,number], xyEl:HTMLElement):void {
      if (this._dragEnded) return;
      if (!this._afRequestId) this._afRequestId = Polyfill.requestAnimationFrame(this._tick.bind(this));
      this.xy = xy;
      this.xyEl = xyEl;
      this._xyChanged = true;
    }


    cancel(debugElements:boolean = false):void {
      this._dragEnded = true;
      if (this._afRequestId) {
        Polyfill.cancelAnimationFrame(this._afRequestId);
      }
      if (!debugElements) {
        this.draggable.finalizeRevert();
        this.dispose();
      }
    }


    drop():void {
      this._dragEnded = true;
      this._scroller = null;
      if (this._afRequestId) Polyfill.cancelAnimationFrame(this._afRequestId);
      this._tick();
      if (!this._raise(this.draggable.el, "begindrop").defaultPrevented) {
        switch (this.action) {
          case "move":
          case "copy":
            if (this.target.placeholder) {
              this.helper.animateToElementAndPutDown(
                this.target.placeholder.el,
                this._finalizeAction.bind(this));
            } else {
              this._finalizeAction();
            }
            break;
          case "delete":
            this.helper.animateDelete(this._finalizeAction.bind(this));
            break;
          case "revert":
            this._finalizeAction();
        }
      } else {
        // drop has been cancelled on the begindrop event
        this.cancel();
      }
    }


    dispose() {
      this.containerCache.getElements().forEach((t:HTMLElement) => this.containerCache.get(t, 'container').dispose());
      this.helper.dispose();
      this.geometryCache.dispose();
      this.containerCache.dispose();

      document.removeEventListener('scroll', this._onScrollOrWheelListener, false);
      document.removeEventListener('mousewheel', this._onScrollOrWheelListener, false);
      document.removeEventListener('wheel', this._onScrollOrWheelListener, false);
    }


    private _onScrollOrWheel():void {
      this._hasScrolled = true;
      this.geometryCache.clear();
    }


    private _tick():void {
      this._afRequestId = null;

      if (this._xyChanged || this._hasScrolled) {

        // apply bound constraints to the pointer XY value - we pretend that the user
        // has not moved the pointer outside the content bounds of the Boundary element
        if (this.boundary) {
          let constrainedXY = this.boundary.getConstrainedXY(this.xy);
          if (!Vector.equals(constrainedXY, this.xy)) {
            this.xy = constrainedXY;
            this.xyEl = null;
          }
        }

        // if we were not passed the topmost DOM element underneath the mouse XY coordinates
        // as part of the pointer event, or it was cleared as the XY coordinates have been
        // constrained by a data-drag-Boundary, then recalculate the current topmost DOM element
        if (!this.xyEl) this.xyEl = Dom.elementFromPoint(this.xy);

        // check to see whether the helper is hovering over a data-drag-scrollable element
        // only scrollables that are ancestors of the current target element are considered
        // (as there is no value in scrolling a sibling container that cannot accept the
        // currently dragged element)
        if (this.xyEl != this._lastXyEl && this.target && !this._dragEnded) {
          this._scroller = Scrollable.closestReadyScrollable(this.target.el, this, this.xy);
        }

        // update the position of the fixed helper element
        this.helper.setPosition(this.xy);

        this._xyChanged = false;
        this._hasScrolled = false;
      }


      if (this._scroller) {
        // trigger the scroller to scroll another step
        if (this._scroller.step(this.xy)) {
          // scrollable has moved
          this._onScrollOrWheel();
        } else {
          // scrollable has reached its scroll extent
          this._scroller = null;
        };

        // schedule the next update. If the scrollable has reached it's scroll
        // extend, we still schedule another update which will be used to update
        // the target and placeholder positions
        this._afRequestId = Polyfill.requestAnimationFrame(this._tick.bind(this));

      } else {

        // if the topmost DOM element under the constrained pointer has
        // changed, check to see if this means we are over a new target
        if (this.xyEl !== this._lastXyEl) {
          this._updateTarget();
          this._lastXyEl = this.xyEl;
        };

        // notify the current target container that the element has moved
        if (this.target) this.target.move(this.xy);

        // raise the drag event. this is not cancellable
        // note no drag events will be raised while scrolling is in progress
        this._raise(this.draggable.el, 'drag');
      }
    }



    private _updateTarget():void {
      const oldTarget = this.target;

      let newTarget = Container.closestAcceptingTarget(this.xyEl, this.draggable);

      // if the source container leave action is delete,
      // then the drop target cannot be another container
      if (this.source && this.source.leaveAction === "delete" && newTarget !== this.source) {
        newTarget = null;
      }

      // if the current drag operation is bounded, then the target container
      // must be a descendant of the Boundary element
      if (newTarget && this.boundary
                    && !Dom.isDescendant(this.boundary.el, newTarget.el)
                    && this.boundary.el !== newTarget.el) return;

      if (newTarget === oldTarget) return;

      if ((newTarget || this.options.revertBehaviour !== 'last') || (this.source && this.source.leaveAction === "delete")) {
        if (oldTarget === null || this._tryLeaveTarget(oldTarget)) {
          if (newTarget !== null) this._tryEnterTarget(newTarget);
        }
      }
      this._setAction(this._computeAction(this.source, this.target));
    }


    private _tryEnterTarget(container:Container):boolean {
      // raise the dragenter event. If one of the event's listeners
      // calls preventDefault() then don't proceed
      if (!this._raise(container.el, 'dragenter').defaultPrevented) {
        this.target = container;

        // notify the container
        container.enter(this.xy);

        if (this.options.containerHoverClass) {
          Polyfill.addClass(container.el, this.options.containerHoverClass);
        }

        // if the container has specified a helper size (which is based
        // the geometry of it's placeholder) then resize the helper
        // to match the new container
        if (this.options.helperResize && container.helperSize) {
          this.helper.setSizeAndScale(container.helperSize, container.helperScale);
        }
        return true;
      } else {
        // entering the target was prevented by an event listener
        return false;
      }
    }


    private _tryLeaveTarget(container:Container):boolean {
      if (!this._raise(container.el, 'dragleave').defaultPrevented) {
        this.target = null;

        // notify the container
        container.leave();

        if (this.options.containerHoverClass) {
          Polyfill.removeClass(container.el, this.options.containerHoverClass);
        }
        return true;
      } else {
        // leaving the target was prevented by an event listener
        return false;
      }
    }


    private _finalizeAction():void {
      this._raise(this.draggable.el, 'enddrop');

      if (this._raise(this.draggable.el, 'drop').returnValue !== false) {
        // if the drop event listeners return true then update the DOM
        // to reflect the drag changes. If the listeners return false
        // then it is up to the event handler to trigger appropriate updates
        // to the DOM (this provides a hook to allow for frameworks such as
        // react.js, angular or knockout to process the drag actions without
        // interference from tactile.js)
        switch (this.action) {
          case "move": this.draggable.finalizeMove(this.target); break;
          case "copy": this.draggable.finalizeCopy(this.target); break;
          case "delete": this.draggable.finalizeDelete(); break;
          case "revert": this.draggable.finalizeRevert(); break;
        }
      };
      this._raise(this.draggable.el, 'dragend');
      this.dispose();
    }


    // below is a truth table of final drag actions based on the current
    // source and target actions
    //   .---------------------------------------.
    //   | SOURCE | TARGET | = | ACTION | COPY   |
    //   |---------------------------------------|
    //   | -      | -      | = | revert | false  |
    //   | -      | move   | = | move   | false  |
    //   | -      | copy   | = | copy   | true   |
    //   | -      | delete | = | delete | false  |
    //   | move   | -      | = | revert | false  |
    //   | move   | move   | = | move   | false  |
    //   | move   | copy   | = | copy   | true   |
    //   | move   | delete | = | delete | false  |
    //   | copy   | -      | = | delete | true   |
    //   | copy   | move   | = | copy   | true   |
    //   | copy   | copy   | = | copy   | true   |
    //   | copy   | delete | = | delete | true   |
    //   | delete | *      | = | delete | false  |
    //   '---------------------------------------'
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


    private _setAction(actionCopy:[string, boolean]):void {
      if (this.action === actionCopy[0]) return;
      this.helper.setAction(actionCopy[0]);
      this.action = actionCopy[0];
      this.copy = actionCopy[1];
    }


    private _raise(el:Element, eventName:string):CustomEvent {
      let eventData = {
        el: this.draggable.el,
        data: this.draggable.data,
        action: this.action,
        copy: this.copy,
        helperEl: this.helper.el,
        helperXY: this.helper.xy,
        boundaryEl: this.boundary ? this.boundary.el : null,
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
