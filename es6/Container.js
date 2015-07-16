import * as dom from "./lib/dom.js";

export default class Container {

  static matches(el) {
    return el ? el.matches(this.selector) : false;
  }

  constructor(el, drag) {
    this.el = el;
    this.drag = drag;
    this.placeholder = null;
    this.placeholderSize = null;
    this.placeholderScale = 1;
    this.options = drag.options;
    this.dragOutAction = null;
    this.initialize();
  }

  initialize() {
    this.dragOutAction = this.el.getAttribute('data-drag-out-action') || 'move';
  }

  setPointerXY(constrainedXY) {
    this.updatePosition(constrainedXY)
    this.updatePlaceholder();
  }

  accepts(draggable) {
    if (draggable.originalContainer === this) return true;
    if (this.el.hasAttribute('data-drag-disabled')) return false;
    let acceptsSelector = this.el.getAttribute('data-drag-accepts');
    return acceptsSelector ? draggable.el.matches(acceptsSelector)
                           : draggable.originalParentEl === this.el;
  }

  enter() { }
  leave() { }

  captures(draggable) {
    if (this.el.hasAttribute('data-drag-capture')) return true;
    if (draggable.el.hasAttribute('data-drag-containment')) {
      let containmentSelector = draggable.el.getAttribute('data-drag-containment');
      return containmentSelector ? this.el.matches(containmentSelector) : true;
    }
    if (this.el.hasAttribute('data-drag-containment')) {
      let containmentSelector = this.el.getAttribute('data-drag-containment');
      return containmentSelector ? draggable.el.matches(containmentSelector) : true;
    }
    return false;
  }

  dispose() {

  }
}
