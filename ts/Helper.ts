module Tactile {
  export class Helper {

    el:HTMLElement;
    xy:[number,number];
    gripXY:[number,number];
    gripRelative:[number,number];
    gripOffset:[number,number];
    size:[number,number];
    scale:[number,number] = [1,1];


    constructor(public drag:Drag, draggable:Draggable) {
      this.xy = [0,0];
      this._initialize(draggable);
    }


    private _initialize(draggable:Draggable):void {
      this.el = <HTMLElement>draggable.el.cloneNode(true);
      this.el.removeAttribute("id");
      this.el.setAttribute("data-drag-helper", "");
      this.el.removeAttribute("data-drag-placeholder");

      const s = this.el.style;
      if (this.drag.options.helperCloneStyles) {
        Dom.copyComputedStyles(draggable.el, this.el);
        Dom.stripClasses(this.el);
        s.setProperty('position', 'fixed', 'important');
        s.setProperty('display', 'block', 'important');
        s.setProperty('zIndex', '100000', 'important');
        s.opacity = '1';
        s.cursor = '';
        s.transform = '';
        s.transformOrigin = '';
        s.boxShadow = '';
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

      // set the initial helper element size before appending to the dom,
      // to avoid flickering before Velocity animation kicks in
      this.el.style.width = rect.width + 'px';
      this.el.style.height = rect.height + 'px';

      document.body.appendChild(this.el);

      this.setPosition(this.drag.xy);
      this.setSizeAndScale(draggable.originalSize,
                           draggable.originalScale,
                           false);

      Animation.set(this.el, {
        left: this.gripOffset[0],
        top: this.gripOffset[1],
        transformOriginX: this.gripXY[0],
        transformOriginY: this.gripXY[1]
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
        translateX: [xy[0], xy[0]],
        translateY: [xy[1], xy[1]],
        translateZ: [1, 1]
      });
      this.xy = xy;
    }


    setSizeAndScale(
      size:[number,number],
      scale:[number,number],
      animate:boolean = true):void {

      if (Vector.equals(this.size, size) && Vector.equals(this.scale, scale))
        return;

      this.gripXY = Vector.multiply(this.gripRelative, size);
      this.gripOffset = Vector.multiplyScalar(this.gripXY, -1);

      const minimalDelta = 0.0001;
      Animation.set(this.el, {
        width: size[0],
        height: size[1],
        left: this.gripOffset[0],
        top: this.gripOffset[1],
        transformOriginX: this.gripXY[0],
        transformOriginY: this.gripXY[1],
        scaleX: [scale[0], this.scale[0] + minimalDelta],
        scaleY: [scale[1], this.scale[1] + minimalDelta]
      },
      animate ? this.drag.options.resizeAnimation : undefined);

      this.size = size;
      this.scale = scale;
    }


    animateToElementAndPutDown(el:HTMLElement, complete?:() => void):void {
      Animation.stop(this.el);

      const rect = el.getBoundingClientRect();
      // prevent velocity from immediately applying the new value, when the
      // new and old values are equal. This causes flickering in some
      // circumstances
      const minimalDelta = 0.0001;
      Animation.set(this.el, {
        rotateZ: 0,
        boxShadowBlur: 0,
        translateX: rect.left - this.gripOffset[0] * this.scale[0],
        translateY: rect.top - this.gripOffset[1] * this.scale[1],
        width: el.offsetWidth,
        height: el.offsetHeight
      }, this.drag.options.dropAnimation, complete);
    }


    animateDelete(complete?:() => void):void {
      Animation.stop(this.el);
      Animation.set(this.el, {
        opacity: 0,
        scaleX: 0,
        scaleY: 0
      }, this.drag.options.deleteAnimation, complete);
    }


    dispose():void {
      Polyfill.remove(this.el);
    }


    private _pickUp():void {
      Animation.set(this.el, {
        rotateZ: [this.drag.options.helperRotation, 0],
        boxShadowBlur: [this.drag.options.helperShadowSize, 'easeOutBack']
      }, this.drag.options.pickUpAnimation);
    }
  }
}
