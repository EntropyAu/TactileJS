import * as dom from './lib/dom.js';

export default class Placeholder {

  static closest(el) {
    return dom.closest(el, '[data-drag-placeholder]');
  }

  get size() {
    return [this.el.offsetWidth, this.el.offsetHeight];
  }

  get sizeWithMargins() {
    return [dom.outerWidth(this.el), dom.outerHeight(this.el)];
  }

  get scale() {
    return dom.clientScale(this.el);
  }

  constructor(drag, draggableEl = null) {
    this.drag = drag;
    this.isDraggableEl = !!draggableEl;
    this.el = draggableEl;
    this.visible = true;
    this.initialize();
  }

  initialize(draggable) {
    if (!this.isDraggableEl) {
      this.el = this.drag.draggable.el.cloneNode(true);
      this.el.removeAttribute('id');
    }
    this.el.classList.add(this.drag.options.placeholderClass);
    this.el.setAttribute('data-drag-placeholder', '');
    dom.translate(this.el,0,0);
    dom.topLeft(this.el,[0,0]);
    this.visible = true;
  }

  hide() {
    this.el.style.top = -99999;
    this.el.style.visibility = 'hidden';
    this.visible = false;
  }

  show() {
    this.el.style.top = 0;
    this.el.style.visibility = '';
    this.visible = true;
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
      this.el.style.top = 0;
      this.el = null;
    }
  }
}