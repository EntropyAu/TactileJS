import * as constants from "./constants.js";
import * as dom from "./dom.js";

export default class DragDropScrolling {
  constructor() {
    this.options = {
      scrollDelay: 1000,
      scrollDistance: 40,
      scrollSpeed: 1
    }
  }

  // event handlers

  dragStart(context) {
    context.scrollAnimationFrame = null;
    context.scrollEl = null;
    context.scrollDx = null;
    context.scrollDy = null;
  }

  dragMove(context) {
    this.tryScroll(context);
  }

  dragEnd(context) {
    this.stopScroll(context);
  }

  // internal methods

  tryScroll(context) {
    [context.scrollEl, context.scrollDx, context.scrollDy] = this.getScrollZoneUnderPointer(context);
    if (context.scrollEl) this.startScroll(context);
    if (!context.scrollEl) this.stopScroll(context);
  }

  startScroll(context) {
    var self = this;
    context.scrollAnimationFrame = requestAnimationFrame(function() { self.continueScroll(context) });
  }

  continueScroll(context) {
    if (context && context.scrollEl) {
      context.scrollEl.scrollTop += context.scrollDy;
      context.scrollEl.scrollLeft += context.scrollDx;
      this.tryScroll(context);
    }
  }

  stopScroll(context) {
    if (context.scrollAnimationFrame) {
      cancelAnimationFrame(context.scrollAnimationFrame);
      context.scrollAnimationFrame = null;
    }
  }


  getScrollZoneUnderPointer(context) {
    var scrollAncestorEls = dom.ancestors(context.parentEl, constants.scrollableSelector);

    for (let i = 0; i < scrollAncestorEls.length; i++) {
      let scrollEl = scrollAncestorEls[i];
      let scrollableRect = scrollEl.getBoundingClientRect();  // cache this
      let dx = 0;
      let dy = 0;

      if (scrollEl.getAttribute(constants.scrollableAttribute) !== 'vertical') {
        let hScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.width / 3);
        if (context.pointerX > scrollableRect.right  - hScrollDistance && dom.canScrollRight(scrollEl)) dx = +this.options.scrollSpeed;
        if (context.pointerX < scrollableRect.left   + hScrollDistance && dom.canScrollLeft(scrollEl)) dx = -this.options.scrollSpeed;
      }

      if (scrollEl.getAttribute(constants.scrollableAttribute) !== 'horizontal') {
        let vScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.height / 3);
        if (context.pointerY < scrollableRect.top    + vScrollDistance && dom.canScrollUp(scrollEl)) dy = -this.options.scrollSpeed;
        if (context.pointerY > scrollableRect.bottom - vScrollDistance && dom.canScrollDown(scrollEl)) dy = +this.options.scrollSpeed;
      }

      if (dx !== 0 || dy !== 0) {
        return [scrollEl, dx, dy];
      }
    }
    return [null, null, null];
  }
}
