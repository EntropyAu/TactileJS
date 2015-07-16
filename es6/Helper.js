import * as dom from "./lib/dom.js";
import * as animation from "./lib/animation.js";

export default class Helper {
  /* members */

  constructor(drag) {
    this.options = drag.options;
    this.drag = drag;
    this.el = null;
    this.grip = null;
    this.size = [0,0];
    this.scale = [1,1];
    this.position = [0,0];
    this.initialize();
  }


  initialize() {
    this.el = this.drag.draggable.el.cloneNode(true);
    this.el.removeAttribute('id');
    this.el.setAttribute('data-drag-helper', '');
    this.el.style.position = "fixed";

    // any existing transitions may screw up velocity's work
    // TODO: deal with iOS where a 10ms transition makes movement smoother
    this.el.style.webkitTransition = 'none';
    this.el.style.mozTransition = 'none';
    this.el.style.msTransition = 'none';
    this.el.style.transition = 'none';

    const rect = this.drag.draggable.el.getBoundingClientRect();
    this.grip = [(this.drag.pointerXY[0] - rect.left) / rect.width,
                 (this.drag.pointerXY[1] - rect.top) / rect.height];

    document.body.appendChild(this.el);
    this.setPosition(this.drag.pointerXY);
    this.setSizeAndScale(this.drag.draggable.originalSize,
                         this.drag.draggable.originalScale,
                         false);
    this._applyGripOffset();
    this.el.focus()
    this.pickUp();
  }


  pickUp() {
    animation.set(this.el, {
      rotateZ: [this.options.helperRotation, 0],
      boxShadowBlur: this.options.helperShadowSize
    }, this.options.pickUpAnimation);
  }


  setPosition(positionXY) {
    if (this.position[0] === positionXY[0]
     && this.position[1] === positionXY[1]) return;
    animation.set(this.el, {
      translateX: positionXY[0],
      translateY: positionXY[1]
    });
    this.position = positionXY;
  }


  _applyGripOffset() {
    animation.set(this.el, {
      left: (-this.grip[0] * this.size[0]),
      top: (-this.grip[1] * this.size[1]),
    });
  }


  setSizeAndScale(size, scale, animate = true) {
    if (this.size[0] === size[0]
     && this.size[1] === size[1]
     && this.scale[0] === scale[0]
     && this.scale[1] === scale[1]) return;

    animation.set(this.el, {
      width: size[0],
      height: size[1],
      left: (-this.grip[0] * size[0]),
      top: (-this.grip[1] * size[1]),
      scaleX: scale[0],
      scaleY: scale[1]
    }, animate ? this.options.resizeAnimation : undefined);

    this.size = size;
    this.scale = scale;
  }


  animateToElementAndPutDown(el, complete) {
    const rect = el.getBoundingClientRect();
    // prevent velocity from immediately applying the new value, when the
    // new and old values are equal. This causes flickering in some
    // circumstances
    const minimalDelta = 0.001;
    animation.set(this.el, {
      rotateZ: 0,
      boxShadowBlur: 0,
      top: [0, 0 + minimalDelta],
      left: [0, 0 + minimalDelta],
      translateX: [rect.left, this.position[0] - this.grip[0] * this.size[0] + minimalDelta],
      translateY: [rect.top, this.position[1] - this.grip[1] * this.size[1] + minimalDelta],
      width: rect.width,
      height: rect.height
    }, this.options.dropAnimation, complete);
  }


  dispose(drag) {
    this.el.remove();
  }
}
