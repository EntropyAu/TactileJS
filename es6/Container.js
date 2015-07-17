import * as dom from "./lib/dom.js";
import * as attr from "./lib/attr.js";

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

    this.accepts = el.hasAttribute('data-drag-accepts')
                 ? attr.getTokenSet(el, 'data-drag-accepts')
                 : attr.getTokenSet(el, 'data-drag-tag');

    this.captures = attr.getTokenSet(el, 'data-drag-capture')

    this.dragOutAction = this.el.getAttribute('data-drag-out-action') || 'move';
  }


  willAccept(draggable) {
    if (this.el === draggable.originalParentEl) return true;
    if (this.el.hasAttribute('data-drag-disabled')) return false;
    return this.accepts.has('*') || [...draggable.tags].some(t => this.accepts.has(t));
  }


  willCapture(draggable) {
    return this.captures.has('*') || [...draggable.tags].some(t => this.captures.has(t));
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
