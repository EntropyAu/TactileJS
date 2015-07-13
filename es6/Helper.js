import * as dom from "./lib/dom.js";

export default class Helper {

  constructor(drag) {
    this.drag = drag;
    this.el = null;
    this.overlayEl = null;
    this.gripOffset = null;
    this.size = null;
    this.initialize();
  }


  initialize() {
    this.overlayEl = document.createElement('div');
    this.overlayEl.setAttribute('data-drag-overlay', '');

    this.el = this.drag.draggable.el.cloneNode(true);
    this.el.removeAttribute('id');
    this.el.setAttribute('data-drag-helper', '');

    let rect = this.drag.draggable.el.getBoundingClientRect();
    this.gripOffset = [(this.drag.pointerXY[0] - rect.left) / rect.width,
                       (this.drag.pointerXY[1] - rect.top) / rect.height];

    this.overlayEl.appendChild(this.el);
    document.body.appendChild(this.overlayEl);

    this.setPosition(this.drag.pointerXY);
    this.setSizeAndScale(this.drag.draggable.originalSize,
                         this.drag.draggable.originalScale,
                         false);

    this.el.focus()

    if (window['Velocity']) {
      Velocity(this.el, {
        rotateZ: -1,
        boxShadowBlur: this.drag.options.helper.shadowSize
      }, {
        duration: this.drag.options.animation.duration,
        easing: this.drag.options.animation.easing
      });
    }
  }


  setPosition(positionXY) {
    if (window['Velocity']) {
      Velocity(this.el, {
        translateX: positionXY[0],
        translateY: positionXY[1],
        translateZ: 0
      }, {
        duration: 0,
        queue: false
      });
    } else {
      dom.translate(this.el, positionXY[0], positionXY[1]);
    }
  }



  setSizeAndScale(size, scale, animate = true) {
    if (this.size && this.scale
      && this.size[0] === size[0]
      && this.size[1] === size[1]
      && this.scale[0] === scale[0]
      && this.scale[1] === scale[1]) return;

    if (window['Velocity']) {
      const velocityOptions = animate && this.drag.options.animation.animateResize
                            ? {
                                duration: this.drag.options.animation.duration,
                                easing: 'linear',
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
        transformOriginX: this.gripOffset[0] * size[0],
        transformOriginY: this.gripOffset[1] * size[1],
        scaleX: scale[0],
        scaleY: scale[1]
      }, velocityOptions);
    } else {
      this.el.style.width = size[0] + 'px';
      this.el.style.height = size[1] + 'px';
      this.el.style.left = (-this.gripOffset[0] * size[0]) + 'px';
      this.el.style.top = (-this.gripOffset[1] * size[1]) + 'px';
      dom.transformOrigin(this.el, [(-this.gripOffset[0] * size[0]), (-this.gripOffset[1] * size[1])]);
    }
    this.size = size;
  }



  animateToRect(rect, callback) {
    let targetProps = {
      translateX: [rect.left, 'ease-out'],
      translateY: [rect.top, 'ease-out'],
      top: [0, 'ease-out'],
      left: [0, 'ease-out'],
      rotateZ: 0,
      boxShadowBlur: 0
    };
    if (this.drag.options.animation.animateResize) {
      targetProps.width = [rect.width, 'ease-out'];
      targetProps.height = [rect.height, 'ease-out'];
    }
    Velocity(this.el, targetProps, {
      duration: this.drag.options.animation.duration,
      easing: this.drag.options.animation.easing,
      complete: callback
    });
  }


  dispose(drag) {
    this.overlayEl.remove();
    this.el.remove();
  }
}
