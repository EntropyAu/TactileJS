import * as dom from "./lib/dom.js";

export default class Helper {
  /* members */

  constructor(drag) {
    this.drag = drag;
    this.el = null;
    this.overlayEl = null;
    this.gripOffset = null;
    this.size = [0,0];
    this.scale = [1,1];
    this.position = [0,0];
    this.initialize();
  }


  initialize() {
    this.overlayEl = document.createElement('div');
    this.overlayEl.setAttribute('data-drag-overlay', '');

    this.el = this.drag.draggable.el.cloneNode(true);
    this.el.removeAttribute('id');
    this.el.setAttribute('data-drag-helper', '');

    const rect = this.drag.draggable.el.getBoundingClientRect();
    this.gripOffset = [(this.drag.pointerXY[0] - rect.left) / rect.width,
                       (this.drag.pointerXY[1] - rect.top) / rect.height];

    this.overlayEl.appendChild(this.el);
    document.body.appendChild(this.overlayEl);

    this.setPosition(this.drag.pointerXY);
    this.setSizeAndScale(this.drag.draggable.originalSize,
                         this.drag.draggable.originalScale,
                         false);
    this.el.focus()

    const o = this.drag.options;
    if (o.pickupAnimation && window['Velocity']) {
      Velocity(this.el, {
        rotateZ: 0,
        boxShadowBlur: 0
      }, { duration: 0 })
      Velocity(this.el, {
        rotateZ: o.helperRotation,
        boxShadowBlur: o.helperShadowSize
      }, {
        duration: o.pickupAnimation.duration,
        easing: o.pickupAnimation.easing
      });
    }
  }


  setPosition(positionXY) {
    this.position = positionXY;
    this.updateTransform();
  }


  setSizeAndScale(size, scale, animate = true) {
    if (this.size && this.scale
     && this.size[0] === size[0]
     && this.size[1] === size[1]
     && this.scale[0] === scale[0]
     && this.scale[1] === scale[1]) return;

    if (window['Velocity'] && this.drag.options.resizeAnimation) {
      const velocityOptions = animate
                            ? {
                                duration: this.drag.options.resizeAnimation.duration,
                                easing: this.drag.options.resizeAnimation.easing,
                                queue: false
                              }
                            : {
                                duration: 0,
                                queue: false
                              };
      Velocity(this.el, {
        width: size[0],
        height: size[1],
        left: -this.gripOffset[0] * size[0],
        top: -this.gripOffset[1] * size[1],
        scaleX: scale[0],
        scaleY: scale[1]
      }, velocityOptions);
    } else {
      this.el.style.width = size[0] + 'px';
      this.el.style.height = size[1] + 'px';
      this.el.style.left = (-this.gripOffset[0] * size[0]) + 'px';
      this.el.style.top = (-this.gripOffset[1] * size[1]) + 'px';
      dom.transformOrigin(this.el, [this.gripOffset[0] * 100, this.gripOffset[1] * 100]);
      this.scale = scale;
      this.updateTransform();
    }
    this.size = size;
    this.scale = scale;
  }


  updateTransform() {
    if (window["Velocity"] && this.drag.options.pickupAnimation) {
      Velocity(this.el, {
        translateX: this.position[0],
        translateY: this.position[1]
      }, { duration: 0, queue: false });
    } else {
      dom.transform(this.el, {
        translateX: this.position[0],
        translateY: this.position[1],
        translateZ: 0,
        scaleX: this.scale[0],
        scaleY: this.scale[1],
        rotateZ: -1
      });
    }
  }


  animateToElement(el, callback) {
    const rect = el.getBoundingClientRect();
    const o = this.drag.options;
    if (o.dropAnimation) {
      let targetProps = {
        translateX: rect.left,
        translateY: rect.top,
        top: 0,
        left: 0,
        rotateZ: 0,
        boxShadowBlur: 0,
        width: rect.width,
        height: rect.height
      }
      Velocity(this.el, targetProps, {
        duration: o.dropAnimation.duration,
        easing: o.dropAnimation.easing,
        complete: callback
      });
    } else {
      return callback();
    }
  }


  dispose(drag) {
    this.overlayEl.remove();
    this.el.remove();
  }
}
