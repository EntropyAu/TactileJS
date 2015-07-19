import * as dom from "./lib/dom.js";
import * as rect from "./lib/rect.js";

export default class Scrollable {

  static get selector() { return '[data-drag-scrollable]'; }

  static closest(el) { return dom.closest(el, this.selector); }

  static scale(v, d, r) { return (v-d[0]) / (d[1]-d[0]) * (r[1]-r[0]) + r[0]; }

  constructor(drag, el) {
    this.el = el;
    this._drag = drag;
    this.options = drag.options;
    this._bounds = null;
    this._offset = null;
    this._velocity = [0,0];
    this._hEnabled = false;
    this._vEnabled = false;
    this._hSensitivity = 0;
    this._vSensitivity = 0;
    this._requestId = null;
    this._lastUpdate = null;

    this._initializeDirections();
    this._initializeBounds();
    this._initializeSensitivity();
  }

  _initializeDirections() {
    const style = getComputedStyle(this.el);
    this._hEnabled = style.overflowX === 'auto' || style.overflowX === 'scroll';
    this._vEnabled = style.overflowY === 'auto' || style.overflowY === 'scroll';
  }

  _initializeBounds() {
    if (this.el.tagName === 'BODY') {
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      this._bounds = { left: 0, top: 0, width: w, height: h, right: w, bottom: h };
    } else {
      this._bounds = this.el.getBoundingClientRect();
    }
  }


  _initializeSensitivity() {
    const sensitivity = this.options.scrollSensitivity;
    const percent = sensitivity.toString().indexOf('%') !== -1
                  ? parseInt(sensitivity, 10) / 100
                  : null;
    this._hSensitivity = Math.min(percent ? percent * this._bounds.width  : parseInt(sensitivity, 10), this._bounds.width / 3);
    this._vSensitivity = Math.min(percent ? percent * this._bounds.height : parseInt(sensitivity, 10), this._bounds.height / 3);
  }


  tryScroll(xy) {
    this._updateVelocity(xy);
    if (this._velocity[0] !== 0 || this._velocity[1] !== 0) {
      this._offset = [this.el.scrollLeft, this.el.scrollTop];
      this._requestId = requestAnimationFrame(this.continueScroll.bind(this));
      return true;
    }
    return false;
  }


  continueScroll() {
    this._requestId = null;
    // calculate the amount we want to scroll
    let currentUpdate = new Date();
    let elapsedTimeMs = this._lastUpdate ? currentUpdate - this._lastUpdate : 16;
    this._offset = [this._offset[0] + this._velocity[0] * elapsedTimeMs,
                   this._offset[1] + this._velocity[1] * elapsedTimeMs];

    // scroll the scrollable
    if (this._velocity[0] !== 0) this.el.scrollLeft = this._offset[0];
    if (this._velocity[1] !== 0) this.el.scrollTop  = this._offset[1];
    this._lastUpdate = currentUpdate;

    // schedule the next scroll update
    if (this._velocity[0] !== 0 || this._velocity[1] !== 0)
      this._requestId = requestAnimationFrame(this.continueScroll.bind(this));
  }


  stopScroll() {
    cancelAnimationFrame(this._requestId);
    this._requestId = null;
    this._lastUpdate = null;
  }


  _updateVelocity(xy) {
    const maxV = this.options.scrollSpeed;
    const b = this._bounds;

    let v = [0,0];
    if (rect.contains(b, xy)) {
      if (this._hEnabled) {
        if (xy[0] > b.right - this._hSensitivity && dom.canScrollRight(this.el)) v[0] = Scrollable.scale(xy[0], [b.right-this._hSensitivity, b.right], [0, +maxV]);
        if (xy[0] < b.left + this._hSensitivity && dom.canScrollLeft(this.el)) v[0] = Scrollable.scale(xy[0], [b.left+this._hSensitivity, b.left], [0, -maxV]);
      }
      if (this._vEnabled) {
        if (xy[1] > b.bottom - this._vSensitivity && dom.canScrollDown(this.el)) v[1] = Scrollable.scale(xy[1], [b.bottom-this._vSensitivity, b.bottom], [0, +maxV]);
        if (xy[1] < b.top + this._vSensitivity && dom.canScrollUp(this.el)) v[1] = Scrollable.scale(xy[1], [b.top+this._vSensitivity, b.top], [0, -maxV]);
      }
    }
    this._velocity = v;
    return this._velocity[0] !== 0 || this._velocity[1] !== 0;
  }
}
