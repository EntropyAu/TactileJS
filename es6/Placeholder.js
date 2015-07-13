import * as dom from './lib/dom.js';

export default class Placeholder {

  get size() {
    return [this.el.offsetWidth, this.el.offsetHeight];
  }

  get scale() {
    return dom.clientScale(this.el);
  }

  constructor(drag) {
    this.drag = drag;
    this.el = null;
    this.initialize();
  }

  initialize(draggable) {
    this.el = this.drag.draggable.el.cloneNode(true);
    this.el.removeAttribute('id');
    this.el.classList.add(this.drag.options.css.placeholder);
    this.el.setAttribute('data-drag-placeholder', '');
    dom.translate(this.el,0,0);
    dom.topLeft(this.el,0,0);
  }

  dispose() {
    this.el.remove();
    this.el = null;
  }
}