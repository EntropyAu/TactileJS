import * as constants from "./constants.js";
import * as helpers from "./helpers.js";
import * as dom from "./dom.js";

export default class DragDropScrolling {
  constructor() {
    this.options = {
      scrollDelay: 1000,
      scrollDistance: 40,
      scrollSpeed: 3
    }
  }

  dragStart(context) {
    context.scrollAnimationFrame = null;
    context.scrollEl = null;
    context.scrollDx = null;
    context.scrollDy = null;
  }

  // scroll event handlers

  dragMove(context) {
    this.updateAutoScroll(context);
  }

  dragEnd(context) {
    this.stopAutoScroll(context);
  }

  // internal methods

  updateAutoScroll(context) {
    [context.scrollEl, context.scrollDx, context.scrollDy] = this.getScrollZoneUnderPointer(context);
    if (context.scrollEl) this.startAutoScroll(context);
    if (!context.scrollEl) this.stopAutoScroll(context);
  }

  startAutoScroll(context) {
    var self = this;
    context.scrollAnimationFrame = requestAnimationFrame(function() { self.continueAutoScroll(context) });
  }

  stopAutoScroll(context) {
    if (context.scrollAnimationFrame) {
      cancelAnimationFrame(context.scrollAnimationFrame);
      context.scrollAnimationFrame = null;
    }
  }

  continueAutoScroll(context) {
    if (context && context.scrollEl) {
      context.scrollEl.scrollTop += context.scrollDy;
      context.scrollEl.scrollLeft += context.scrollDx;
      this.updateAutoScroll(context);
    }
  }


  getScrollZoneUnderPointer(context) {
    var scrollableAncestorEls = dom.ancestors(context.parentEl, constants.scrollableSelector);

    for (let i = 0; i < scrollableAncestorEls.length; i++) {
      let scrollEl = scrollableAncestorEls[i];
      let scrollableRect = scrollEl.getBoundingClientRect();  // cache this
      let sx = 0;
      let sy = 0;

      if (scrollEl.getAttribute(constants.scrollAttribute) !== 'vertical') {
        let hScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.width / 3);
        if (context.pointerX > scrollableRect.right  - hScrollDistance && dom.canScrollRight(scrollEl)) sx = +this.options.scrollSpeed;
        if (context.pointerX < scrollableRect.left   + hScrollDistance && dom.canScrollLeft(scrollEl)) sx = -this.options.scrollSpeed;
      }

      if (scrollEl.getAttribute(constants.scrollAttribute) !== 'horizontal') {
        let vScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.height / 3);
        if (context.pointerY < scrollableRect.top    + vScrollDistance && dom.canScrollUp(scrollEl)) sy = -this.options.scrollSpeed;
        if (context.pointerY > scrollableRect.bottom - vScrollDistance && dom.canScrollDown(scrollEl)) sy = +this.options.scrollSpeed;
      }

      if (sx !== 0 || sy !== 0) {
        return [scrollEl, sx, sy];
      }
    }
    return [null, null, null];
  }
}
