module Tactile {
  export class Helper {

    el:HTMLElement;
    drag:Drag;
    gripXY:[number,number];
    gripRelative:[number,number];
    gripOffset:[number,number];
    size:[number,number];
    scale:[number,number];
    xy:[number,number];


    constructor(drag:Drag, draggable:Draggable) {
      this.drag = drag;
      this.xy = [0,0];

      this._initialize(draggable);
    }


    private _initialize(draggable:Draggable):void {
      this.el = <HTMLElement>draggable.el.cloneNode(true);
      this.el.removeAttribute("id");
      this.el.setAttribute("data-drag-helper", "");

      const s = this.el.style;
      if (this.drag.options.helperCloneStyles) {
        Dom.copyComputedStyles(draggable.el, this.el);
        Dom.stripClasses(this.el);
        s.setProperty('position', 'fixed', 'important');
        s.setProperty('display', 'block', 'important');
        s.setProperty('zIndex', '100000', 'important');
      };

      // any existing transitions may screw up velocity's work
      // TODO: deal with iOS where a 10ms transition makes movement smoother
      s.webkitTransition = "none";
      s.transition = "none";
      s.webkitTransform = "none";
      s.transform = "none";
      s.margin = "0";

      const rect = draggable.el.getBoundingClientRect();
      this.gripXY = Vector.subtract(this.drag.xy, [rect.left, rect.top]);
      this.gripRelative = Vector.divide(this.gripXY, [rect.width, rect.height])
      this.gripOffset = Vector.multiplyScalar(this.gripXY, -1);

      // set the layout offset and translation synchronously to avoid flickering
      // velocityJS will update these values asynchronously.
      Dom.topLeft(this.el, this.gripOffset);
      Dom.translate(this.el, this.drag.xy);

      document.body.appendChild(this.el);

      this.setPosition(this.drag.xy);
      this.setSizeAndScale(draggable.originalSize,
                           draggable.originalScale,
                           false);

      Animation.set(this.el, {
        left: this.gripOffset[0],
        top: this.gripOffset[1],
        transformOriginX: 0,
        transformOriginY: 0
      });

      this.el.focus()
      this._pickUp();
    }


    setAction(action:DragAction):void {
      let opacity = 1;
      switch (action) {
        case DragAction.Revert: opacity = 0.50; break;
        case DragAction.Delete: opacity = 0.25; break;
      }
      Animation.set(this.el, { opacity }, { duration: 200 });
    }


    setPosition(xy:[number,number]):void {
      if (Vector.equals(this.xy, xy)) return;
      Animation.set(this.el, {
        translateX: xy[0],
        translateY: xy[1]
      });
      this.xy = xy;
    }


    setSizeAndScale(
      size:[number,number],
      scale:[number,number],
      animate:boolean = true):void {

      if (Vector.equals(this.size, size) && Vector.equals(this.scale, scale))
        return;

      this.size = size;
      this.scale = scale;
      this.gripXY = Vector.multiply(this.gripRelative, size);
      this.gripOffset = Vector.multiplyScalar(this.gripXY, -1);

      Animation.set(this.el, {
        width: size[0],
        height: size[1],
        left: this.gripOffset[0],
        top: this.gripOffset[1],
        scaleX: scale[0],
        scaleY: scale[1]
      }, animate ? this.drag.options.resizeAnimation : undefined);
    }


    animateToElementAndPutDown(el:HTMLElement, complete:Function):void {
      Animation.stop(this.el);

      const rect = el.getBoundingClientRect();
      // prevent velocity from immediately applying the new value, when the
      // new and old values are equal. This causes flickering in some
      // circumstances
      const minimalDelta = 0.0001;
      Animation.set(this.el, {
        rotateZ: 0,
        boxShadowBlur: 0,
        top: [0, 0 + minimalDelta],
        left: [0, 0 + minimalDelta],
        translateX: [rect.left, this.xy[0] - this.gripRelative[0] * el.offsetWidth + minimalDelta],
        translateY: [rect.top, this.xy[1] - this.gripRelative[1] * el.offsetHeight + minimalDelta],
        width: el.offsetWidth,
        height: el.offsetHeight
      }, this.drag.options.dropAnimation, complete);
    }


    animateDelete(complete:Function):void {
      Animation.stop(this.el);
      Animation.set(this.el, { opacity: 0 }, this.drag.options.deleteAnimation, complete);
    }


    dispose():void {
      this.el.remove();
    }


    private _pickUp():void {
      Animation.set(this.el, {
        rotateZ: [this.drag.options.helperRotation, 0],
        boxShadowBlur: this.drag.options.helperShadowSize
      }, this.drag.options.pickUpAnimation);
    }
  }
}
