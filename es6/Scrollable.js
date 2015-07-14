import * as dom from "./lib/dom.js";

// TODO: suspend placeholder updates while scrolling is in progress
// TODO: slow down as you approach extremity
// TODO: adjust scroll maxV based on number of items
// TODO: lock scroll height
// TODO: refactor: clearer scroll start, scroll finish
// TODO: refactor: rename ancestors (it's inclusive of this generation)
// TODO: trigger placeholder update when scroll stops

export default class Scrollable {

  static get selector() { return '[data-drag-scrollable]'; }

  static get closest(el) { return dom.closest(el, selector()); }

  static scale(v, d, r) { return (v-d[0]) / (d[1]-d[0]) * (r[1]-r[0]) + r[0]; }

  constructor(drag, el) {
    this.el = el;
    this.velocity = [0,0];
    this.offset = [0,0];
    this.direction = 'both';
    this.options = drag.options;
    this.initialize();
  }

  initialize() {
    this.direction = scrollEl.getAttribute('data-drag-scrollable') || 'both';
    this.bounds = this.el.getBoundingClientRect();
  }


  startScroll() {
    this.requestId = requestAnimationFrame(this.continueScroll.bind(this));
    this.offset = [this.el.scrollLeft, this.el.scrollTop];
  }


  continueScroll() {
    this.offset = [this.offset[0] + this.velocity[0],
                   this.offset[1] + this.velocity[1]];

    if (this.velocity[0] !== 0) this.el.scrollLeft = this.offset[0];
    if (this.velocity[1] !== 0) this.el.scrollTop  = this.offset[1];
    this.continueScroll();
  }


  cancelScroll(drag) {
    cancelAnimationFrame(this.requestId);
    this.requestId = null;
  }


  velocityForPoint(xy) {
    const sensitivity = this.options.scrollSensitivity;
    const maxV = this.options.scrollSpeed;
    const b = this.bounds;

    let v = [0,0];
    if (this.direction !== 'vertical') {
      const hs = Math.min(sensitivity, b.width / 3);
      if (xy[0] > b.right - hs && dom.canScrollRight(scrollEl)) v[0] = scale(xy[0], [b.right-hs, b.right], [0, +maxV]);
      if (xy[0] < b.left + hs && dom.canScrollLeft(scrollEl)) v[0] = scale(xy[0], [b.left+hs, b.left], [0, -maxV]);
    }

    if (this.direction !== 'horizontal') {
      const vs = Math.min(sensitivity, b.height / 3);
      if (xy[1] > b.bottom - vs && dom.canScrollDown(scrollEl)) v[1] = scale(xy[1], [b.bottom-vs, b.bottom], [0, +maxV]);
      if (xy[1] < b.top + vs && dom.canScrollUp(scrollEl)) v[1] = scale(xy[1], [b.top+vs, b.top], [0, -maxV]);
    }
    return v;
  }


}