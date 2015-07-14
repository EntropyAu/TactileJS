class ScrollManager {
  constructor() {
    this.scrollable = null;
  }

  update(pointerXY, pointerEl) {
    let scrollableEl = Scrollable.closest(pointerEl);
  }

  getClosestScrollZone(pointerXY, pointerEl) {
    var scrollEls = Array.prototype.reverse.apply(dom.ancestors(drag.target.containerEl, Scrollable.selector()));
    scrollEls.forEach(function(scrollEl) {
      let scrollable = new Scrollable(scrollEl);
      let velocity = scrollable.velocityForPoint(pointerXY);
      if (velocity[0] !== 0 || velocity[1] !== 0) return false;
      return true;
    });
  }
}

export default new ScrollManager();