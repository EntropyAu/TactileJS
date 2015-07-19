import * as dom from "./lib/dom.js";
import * as animation from "./lib/animation.js";

export default class Helper {

  constructor(drag, draggable) {
    this.options = drag.options;
    this._drag = drag;
    this._el = null;
    this.grip = null;
    this.size = [0,0];
    this.scale = [1,1];
    this._position = [0,0];
    this._initialize(draggable);
  }

  _initialize(draggable) {
    this._el = draggable.el.cloneNode(true);
    this._el.removeAttribute("id");
    this._el.setAttribute("data-drag-helper", "");

    const s = this._el.style;
    if (this.options.helperCloneStyles) {
      dom.copyComputedStyles(draggable.el, this._el);
      dom.stripClasses(this._el);
      s.setProperty('position', 'fixed', 'important');
      s.setProperty('display', 'block', 'important');
      s.setProperty('zIndex', '100000', 'important');
      s.top = '';
      s.left = '';
      s.webkitTransform = '';
      s.mozTransform = '';
      s.msTransform = '';
      s.transform = '';
      s.webkitTransition = '';
      s.mozTransition = '';
      s.msTransition = '';
      s.transition = '';
      s.boxShadow = '';
    };

    // any existing transitions may screw up velocity"s work
    // TODO: deal with iOS where a 10ms transition makes movement smoother
    s.webkitTransition = "none";
    s.mozTransition = "none";
    s.msTransition = "none";
    s.transition = "none";
    s.margin = "0";

    const rect = draggable.el.getBoundingClientRect();
    this.grip = [(this._drag.xy[0] - rect.left) / rect.width,
                 (this._drag.xy[1] - rect.top) / rect.height];

    // set the layout offset and translation synchronously to avoid flickering
    // velocityJS will update these values asynchronously.
    dom.topLeft(this._el, [-this.grip[0] * this.size[0], -this.grip[1] * this.size[1]]);
    dom.translate(this._el, this._drag.xy);
    document.body.appendChild(this._el);

    this._offsetGrip();
    this.setPosition(this._drag.xy);
    this.setSizeAndScale(draggable.originalSize,
                         draggable.originalScale,
                         false);
    this._el.focus()
    this._pickUp();
  }


  setAction(action) {
    let opacity = 1;
    switch (action) {
      case "revert": opacity = 0.50; break;
      case "delete": opacity = 0.25; break;
    }
    animation.set(this._el, { opacity }, { duration: 200 });
  }


  setPosition(positionXY) {
    if (this._position[0] === positionXY[0]
     && this._position[1] === positionXY[1]) return;
    animation.set(this._el, {
      translateX: positionXY[0],
      translateY: positionXY[1]
    });
    this._position = positionXY;
  }


  setSizeAndScale(size, scale, animate = true) {
    if (this.size[0] === size[0]
     && this.size[1] === size[1]
     && this.scale[0] === scale[0]
     && this.scale[1] === scale[1]) return;

    animation.set(this._el, {
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
    animation.stop(this._el);

    const rect = el.getBoundingClientRect();
    // prevent velocity from immediately applying the new value, when the
    // new and old values are equal. This causes flickering in some
    // circumstances
    const minimalDelta = 0.0001;
    animation.set(this._el, {
      rotateZ: 0,
      boxShadowBlur: 0,
      top: [0, 0 + minimalDelta],
      left: [0, 0 + minimalDelta],
      translateX: [rect.left, this._position[0] - this.grip[0] * el.offsetWidth + minimalDelta],
      translateY: [rect.top, this._position[1] - this.grip[1] * el.offsetHeight + minimalDelta],
      width: el.offsetWidth,
      height: el.offsetHeight
    }, this.options.dropAnimation, complete);
  }


  animateDelete(complete) {
    animation.stop(this._el);
    animation.set(this._el, { opacity: 0 }, this.options.deleteAnimation, complete);
  }


  dispose() {
    this._el.remove();
  }


  _pickUp() {
    animation.set(this._el, {
      rotateZ: [this.options.helperRotation, 0],
      boxShadowBlur: this.options.helperShadowSize
    }, this.options.pickUpAnimation);
  }


  _offsetGrip() {
    animation.set(this._el, {
      left: (-this.grip[0] * this.size[0]),
      top: (-this.grip[1] * this.size[1]),
    });
  }
}
