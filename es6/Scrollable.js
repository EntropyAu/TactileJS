import * as dom from "./lib/dom.js";

export default class Scrollable {

  static get selector() { return '[data-drag-scrollable]'; }

  static closest(el) { return dom.closest(el, this.selector); }

  static scale(v, d, r) { return (v-d[0]) / (d[1]-d[0]) * (r[1]-r[0]) + r[0]; }

  constructor(drag, el) {
    this.el = el;
    this.velocity = [0,0];
    this.offset = [0,0];
    this.options = drag.options;
    this.horizontalEnabled = false;
    this.verticalEnabled = false;
    this.lastUpdate = null;
    this.initialize();
  }

  initialize() {
    this.initializeDirections();
    this.initializeBounds();
    this.initializeSensitivity();
  }

  initializeDirections() {
    let style = getComputedStyle(this.el);
    this.horizontalEnabled = (style.overflowX === 'auto' || style.overflowX === 'scroll')
    this.verticalEnabled = (style.overflowY === 'auto' || style.overflowY === 'scroll')
  }

  initializeBounds() {
    if (this.el.tagName === 'BODY') {
      this.bounds = {
        left: 0,
        top: 0,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        right: document.documentElement.clientWidth,
        bottom: document.documentElement.clientHeight
      }
    } else {
      this.bounds = this.el.getBoundingClientRect();
    }
  }

  initializeSensitivity() {
    const sensitivity = this.options.scrollSensitivity;
    const sensitivityPercent = sensitivity.toString().indexOf('%') !== -1
                             ? parseInt(sensitivity, 10) / 100
                             : null;
    this.sensitivityH = Math.min(sensitivityPercent ? sensitivityPercent * this.bounds.width : parseInt(sensitivity, 10), this.bounds.width / 3);
    this.sensitivityV = Math.min(sensitivityPercent ? sensitivityPercent * this.bounds.height : parseInt(sensitivity, 10), this.bounds.height / 3);
  }


  tryScroll(pointerXY) {
    this.updateVelocity(pointerXY);
    if (this.velocity[0] !== 0 || this.velocity[1] !== 0) {
      this.offset = [this.el.scrollLeft, this.el.scrollTop];
      this.requestId = requestAnimationFrame(this.continueScroll.bind(this));
      return true;
    }
    return false;
  }


  continueScroll() {
    this.requestId = null;
    // calculate the amount we want to scroll
    let currentUpdate = new Date();
    let elapsedTimeMs = this.lastUpdate ? currentUpdate - this.lastUpdate : 16;
    this.offset = [this.offset[0] + this.velocity[0] * elapsedTimeMs,
                   this.offset[1] + this.velocity[1] * elapsedTimeMs];

    // scroll the scrollable
    if (this.velocity[0] !== 0) this.el.scrollLeft = this.offset[0];
    if (this.velocity[1] !== 0) this.el.scrollTop  = this.offset[1];
    this.lastUpdate = currentUpdate;

    // schedule the next scroll update
    if (this.velocity[0] !== 0 || this.velocity[1] !== 0)
      this.requestId = requestAnimationFrame(this.continueScroll.bind(this));
  }


  stopScroll() {
    cancelAnimationFrame(this.requestId);
    this.requestId = null;
    this.lastUpdate = null;
  }


  updateVelocity(xy) {
    const maxV = this.options.scrollSpeed;
    const b = this.bounds;

    let v = [0,0];
    if (xy[0] >= this.bounds.left && xy[0] <= this.bounds.right
      && xy[1] >= this.bounds.top && xy[1] <= this.bounds.bottom) {

      if (this.horizontalEnabled) {
        if (xy[0] > b.right - this.sensitivityH && dom.canScrollRight(this.el)) v[0] = Scrollable.scale(xy[0], [b.right-this.sensitivityH, b.right], [0, +maxV]);
        if (xy[0] < b.left + this.sensitivityH && dom.canScrollLeft(this.el)) v[0] = Scrollable.scale(xy[0], [b.left+this.sensitivityH, b.left], [0, -maxV]);
      }

      if (this.verticalEnabled) {
        if (xy[1] > b.bottom - this.sensitivityV && dom.canScrollDown(this.el)) v[1] = Scrollable.scale(xy[1], [b.bottom-this.sensitivityV, b.bottom], [0, +maxV]);
        if (xy[1] < b.top + this.sensitivityV && dom.canScrollUp(this.el)) v[1] = Scrollable.scale(xy[1], [b.top+this.sensitivityV, b.top], [0, -maxV]);
      }
    }
    this.velocity = v;
    return this.velocity[0] !== 0 || this.velocity[1] !== 0;
  }


}
