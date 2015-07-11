import * as constants from "./constants.js";
import * as dom from "./dom.js";

// TODO: suspend placeholder updates while scrolling is in progress
// TODO: slow down as you approach extremity
// TODO: adjust scroll speed based on number of items
// TODO: lock scroll height
// TODO: refactor: clearer scroll start, scroll finish
// TODO: refactor: rename ancestors (it's inclusive of this generation)
// TODO: trigger placeholder update when scroll stops
export default class DragDropScrolling {
  constructor() {
    this.options = {
      scrollDelay: 1000,
      scrollDistance: 40,
      scrollSpeed: 2
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
      const scrollEl = context.scrollEl;
      scrollEl.scrollTopF = scrollEl.scrollTopF !== undefined
                          ? scrollEl.scrollTopF + context.scrollDy
                          : scrollEl.scrollTop + context.scrollDy;
      scrollEl.scrollLeftF = scrollEl.scrollLeftF !== undefined
                           ? scrollEl.scrollLeftF + context.scrollDx
                           : scrollEl.scrollLeft + context.scrollDx;
      scrollEl.scrollTop = scrollEl.scrollTopF;
      scrollEl.scrollLeft = scrollEl.scrollLeftF;
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
    var scrollEls = Array.prototype.reverse.apply(dom.ancestors(context.parentEl, constants.scrollableSelector));

    for (let i = 0; i < scrollEls.length; i++) {
      let scrollEl = scrollEls[i];
      let scrollableRect = scrollEl.getBoundingClientRect();  // cache this
      let dx = 0;
      let dy = 0;

      if (scrollEl.getAttribute(constants.scrollableAttribute) !== 'vertical') {
        let hScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.width / 3);
        if (context.pointerX > scrollableRect.right - hScrollDistance && dom.canScrollRight(scrollEl))
          dx = this.calculateScrollSpeed(context.pointerX,
                                         [ scrollableRect.right - hScrollDistance, scrollableRect.right ],
                                         [ 0, +this.options.scrollSpeed ]);
        if (context.pointerX < scrollableRect.left + hScrollDistance && dom.canScrollLeft(scrollEl))
          dx = this.calculateScrollSpeed(context.pointerX,
                                         [ scrollableRect.left + hScrollDistance, scrollableRect.left ],
                                         [ 0, -this.options.scrollSpeed ]);
      }

      if (scrollEl.getAttribute(constants.scrollableAttribute) !== 'horizontal') {
        let vScrollDistance = Math.min(this.options.scrollDistance, scrollableRect.height / 3);
        if (context.pointerY > scrollableRect.bottom - vScrollDistance && dom.canScrollDown(scrollEl))
          dy = this.calculateScrollSpeed(context.pointerY,
                                         [ scrollableRect.bottom - vScrollDistance, scrollableRect.bottom ],
                                         [ 0, +this.options.scrollSpeed ]);
        if (context.pointerY < scrollableRect.top + vScrollDistance && dom.canScrollUp(scrollEl))
          dy = this.calculateScrollSpeed(context.pointerY,
                                         [ scrollableRect.top + vScrollDistance, scrollableRect.top ],
                                         [ 0, -this.options.scrollSpeed ]);
      }

      if (dx !== 0 || dy !== 0) {
        return [scrollEl, dx, dy];
      }
    }
    return [null, null, null];
  }

  calculateScrollSpeed(pointer, domain, range) {
    let a = (pointer - domain[0]) / (domain[1] - domain[0]);
    return a * (range[1] - range[0]) + range[0];
  }
}
