import * as dom from "./lib/dom.js";

export default class Container {

  static matches(el) {
    return el ? el.matches(this.selector) : false;
  }

  constructor(el, drag) {
    this.el = el;
    this.drag = drag;
    this.placeholder = null;
    this.placeholderSize = [0,0];
    this.placeholderScale = 1;
    this.options = drag.options;
  }

  dragEnter() {
    this.el.classList.add('dd-drag-over');
    this.updatePosition(this.drag.constrainedXY)
    this.insertPlaceholder();
  }

  setPointerXY(constrainedXY) {
    this.updatePosition(constrainedXY)
    this.updatePlaceholder();
  }

  dragLeave() {
    this.el.classList.remove('dd-drag-over');
    this.removePlaceholder();
  }


  accepts(draggable) {
    if (this.el.hasAttribute('data-drag-disabled')) return false;
    let acceptsSelector = this.el.getAttribute('data-drag-accepts');
    return acceptsSelector ? draggable.el.matches(acceptsSelector) : true;
  }

  contains(draggable) {
    // draggable is contained by this
    if (draggable.el.hasAttribute('data-drag-containment')) {
      let containmentSelector = draggable.el.getAttribute('data-drag-containment');
      return containmentSelector ? this.el.matches(containmentSelector) : true;
    }
    // this contains draggable
    if (this.el.hasAttribute('data-drag-containment')) {
      let containmentSelector = this.el.getAttribute('data-drag-containment');
      return containmentSelector ? draggable.el.matches(containmentSelector) : true;
    }
    return false;
  }
}
