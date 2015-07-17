import * as dom from './lib/dom.js';
import * as animation from './lib/animation.js';

export default class Placeholder {

  static closest(el) {
    return dom.closest(el, '[data-drag-placeholder]');
  }

  get size() {
    return [this.el.offsetWidth, this.el.offsetHeight];
  }

  get outerSize() {
    return [dom.outerWidth(this.el, true), dom.outerHeight(this.el, true)];
  }

  get scale() {
    return dom.clientScale(this.el);
  }

  constructor(drag, draggableEl = null) {
    this.drag = drag;
    this.isDraggableEl = !!draggableEl;
    this.el = draggableEl;
    this.state = "none";
    this.initialize();
  }

  setState(state, animate = true) {
      if (this.state === state) return;
      let velocityOptions = animate
                          ? { duration: 200, queue: false }
                          : { duration:   0, queue: false };
      switch (state) {
        case "hidden": this._hide(); break;
        case "ghosted": this._show(); animation.set(this.el, { opacity: 0.1 }, velocityOptions); break;
        case "materialized": this._show(); animation.set(this.el, { opacity: 1.0 }, velocityOptions); break;
      }
      this.state = state;
  }

  _hide() {
    this.el.style.visibility = 'hidden';
  }

  _show() {
    this.el.style.visibility = '';
  }

  initialize(draggable) {
    if (!this.isDraggableEl) {
      this.el = this.drag.draggable.el.cloneNode(true);
      this.el.removeAttribute('id');
    }
    this.el.classList.add(this.drag.options.placeholderClass);
    this.el.setAttribute('data-drag-placeholder', '');
    this.setState("ghosted", false);
  }

  dispose() {
    switch (this.state) {
      case "hidden":
        this.el.remove();
        this.el = null;
        break;
      case "ghosted":
      case "materialized":
        // restore the original draggable element settings
        this.el.removeAttribute('data-drag-placeholder');
        this.el.classList.remove('dd-drag-placeholder');
        this.el.style.webkitTransform = '';
        this.el.style.mozTransform = '';
        this.el.style.msTransform = '';
        this.el.style.transform = '';
        this.el.style.visibility = '';
        this.el.style.opacity = '';
        this.el = null;
        break;
    }
  }
}
