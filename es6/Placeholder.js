import * as dom from './lib/dom.js';

export default class Placeholder {

  static closest(el) {
    return dom.closest(el, '[data-drag-placeholder]');
  }

  get size() {
    return [this.el.offsetWidth, this.el.offsetHeight];
  }

  get scale() {
    return dom.clientScale(this.el);
  }

  constructor(drag, draggableEl = null) {
    this.drag = drag;
    this.isDraggableEl = !!draggableEl;
    this.el = draggableEl;
    this.initialize();
  }

  initialize(draggable) {
    if (!this.isDraggableEl) {
      this.el = this.drag.draggable.el.cloneNode(true);
      this.el.removeAttribute('id');
    }
    this.el.classList.add(this.drag.options.css.placeholder);
    this.el.setAttribute('data-drag-placeholder', '');
    dom.translate(this.el,0,0);
    dom.topLeft(this.el,[0,0]);
  }

  dispose() {
    if (!this.isDraggableEl) {
      this.el.remove();
      this.el = null;
    } else {
      // restore the original draggable element settings
      this.el.removeAttribute('data-drag-placeholder');
      this.el.classList.remove('dd-drag-placeholder');
      this.el.style.webkitTransform = '';
      this.el.style.transform = '';
      this.el.style.visibility = 'visible';
      this.el = null;
    }
  }
}