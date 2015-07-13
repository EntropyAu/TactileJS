import * as dom from "./lib/dom.js";

// TODO: suspend placeholder updates while scrolling is in progress
// TODO: slow down as you approach extremity
// TODO: adjust scroll speed based on number of items
// TODO: lock scroll height
// TODO: refactor: clearer scroll start, scroll finish
// TODO: refactor: rename ancestors (it's inclusive of this generation)
// TODO: trigger placeholder update when scroll stops

export default class Scrollable {

  static get selector() { return '[data-drag-scrollable]'; }

  constructor(drag) {
    drag.scroll = {
      el: null,
      offset: null,
      velocity: null,
      requestId: null
    }
  }

  autoScroll(drag) {
    [drag.scroll.el, drag.scroll.velocity] = getScrollZoneUnderPointer(drag);
    if (drag.scroll.el) startScroll(drag);
    else cancelScroll(drag);
  }


  cancelScroll(drag) {
    if (!drag.scroll.requestId) return;
    cancelAnimationFrame(drag.scroll.requestId);
    drag.scroll.requestId = null;
    drag.scroll.offset = null;
  }


  function startScroll(drag) {
    if (drag.scroll.requestId) return;
    const self = this;
    drag.scroll.requestId = requestAnimationFrame(function() { self.continueScroll(drag) });
    drag.scroll.offset = [drag.scroll.el.scrollLeft, drag.scroll.el.scrollTop];
  }


  function continueScroll(drag) {
    if (!drag.scroll.el) return;

    const scroll = drag.scroll;
    scroll.offset = [scroll.offset[0] + scroll.velocity[0],
                     scroll.offset[1] + scroll.velocity[1]];

    if (scroll.velocity[0] !== 0) scroll.el.scrollLeft = scroll.offset[0];
    if (scroll.velocity[1] !== 0) scroll.el.scrollTop  = scroll.offset[1];
    autoScroll(drag);
  }


  function getScrollZoneUnderPointer(drag) {
    var scrollEls = Array.prototype.reverse.apply(dom.ancestors(drag.target.containerEl, '[data-drag-scrollable]'));

    for (let i = 0; i < scrollEls.length; i++) {
      let scrollEl = scrollEls[i];
      let rect = scrollEl.getBoundingClientRect();  // cache this
      let dx = 0;
      let dy = 0;
      let scrollable = scrollEl.getAttribute('data-drag-scrollable')

      if (scrollable !== 'vertical') {
        let hSensitivity = Math.min(this.options.scroll.sensitivity, rect.width / 3);
        if (drag.pointer[0] > rect.right - hSensitivity && dom.canScrollRight(scrollEl))
          dx = calculateScrollSpeed(drag.pointer[0],
                                   [ rect.right - hSensitivity, rect.right ],
                                   [ 0, +this.options.scroll.speed ]);
        if (drag.pointer[0] < rect.left + hSensitivity && dom.canScrollLeft(scrollEl))
          dx = calculateScrollSpeed(drag.pointer[0],
                                   [ rect.left + hSensitivity, rect.left ],
                                   [ 0, -this.options.scroll.speed ]);
      }

      if (scrollable !== 'horizontal') {
        let vSensitivity = Math.min(this.options.scroll.sensitivity, rect.height / 3);
        if (drag.pointer[1] > rect.bottom - vSensitivity && dom.canScrollDown(scrollEl))
          dy = calculateScrollSpeed(drag.pointer[1],
                                   [ rect.bottom - vSensitivity, rect.bottom ],
                                   [ 0, +this.options.scroll.speed ]);
        if (drag.pointer[1] < rect.top + vSensitivity && dom.canScrollUp(scrollEl))
          dy = calculateScrollSpeed(drag.pointer[1],
                                   [ rect.top + vSensitivity, rect.top ],
                                   [ 0, -this.options.scroll.speed ]);
      }

      if (dx !== 0 || dy !== 0) {
        return [scrollEl, [dx, dy]];
      }
    }
    return [null, null, null];
  }


  function calculateScrollSpeed(pointer, domain, range) {
    let a = (pointer - domain[0]) / (domain[1] - domain[0]);
    return a * (range[1] - range[0]) + range[0];
  }
}