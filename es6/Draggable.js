import * as dom from "./lib/dom.js";

export default class Draggable {

  static get handleSelector() {
    return '[data-drag-handle]';
  }

  static get draggableSelector() {
    return '[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
  }

  static get handleOrDraggableSelector() {
    return '[data-drag-handle],[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
  }

  static closest(el) {
    let handleOrDragEl = dom.closest(el, Draggable.handleOrDraggableSelector);
    if (!handleOrDragEl) {
      return null;
    }

    // if the pointer is over a handle element, ascend the DOM to find the
    // associated draggable item
    if (handleOrDragEl.hasAttribute('data-drag-handle')) {
      let dragEl = dom.closest(handleOrDragEl, this.draggableSelector);
      return dragEl ? new Draggable(dragEl) : null;
    }

    // if the item contains a handle (which was not the the pointer down spot)
    // then ignore
    if (handleOrDragEl.querySelectorAll(this.handleSelector).length >
        handleOrDragEl.querySelectorAll(this.handleOrDraggableSelector).length) {
      return null;
    }

    let dragEl = handleOrDragEl;
    return dragEl ? new Draggable(dragEl) : null;
  }


  get enabled() {
    return !(this.el.hasAttribute('data-drag-disabled')
          || this.el.parentElement && this.el.parentElement.hasAttribute('data-drag-disabled'));
  }

  constructor(el) {
    this.el = el;
    this.originalParentEl = el.parentElement;
    this.originalIndex = dom.indexOf(el);
    this.originalSize = [this.el.offsetWidth, this.el.offsetHeight];
    this.originalOffset = [this.el.offsetLeft, this.el.offsetTop];
    this.originalScale = dom.clientScale(el);
  }

  removeOriginal() {
    this.el.remove();
  }

  restoreOriginal() {
    dom.topLeft(this.el, this.originalOffset[1], this.originalOffset[0]);
    this.originalParentEl.insertBefore(this.el, this.originalParentEl.children[this.originalIndex]);
  }

}
