import * as dom from "./lib/dom.js";
import * as attr from "./lib/attr.js";

export default class Container {

  static matches(el) {
    return el ? el.matches(this.selector) : false;
  }

  constructor(el, drag) {
    this.el = el;
    this.drag = drag;
    this.options = drag.options;
    this.placeholder = null;
    this.placeholderSize = null;
    this.placeholderScale = 1;

    this.accepts = el.hasAttribute('data-drag-accepts')
                 ? attr.getAttributeSet(el, 'data-drag-accepts')
                 : attr.getAttributeSet(el, 'data-drag-tag');

    this.dragOutAction = attr.getAttributeWithDefaults(el, 'data-drag-out-action', 'move', 'move');
  }


  willAccept(draggable) {
    if (this.el === draggable.originalParentEl) return true;
    if (this.el.hasAttribute('data-drag-disabled')) return false;
    return this.accepts.has('*')
        || Array.from(draggable.tags).some(t => this.accepts.has(t));
  }


  enter() {
    this.el.classList.add(this.options.containerHoverClass);
  }

  leave() {
    this.el.classList.remove(this.options.containerHoverClass);
  }

  dispose() {
    this.el.classList.remove(this.options.containerHoverClass);
  }
}
