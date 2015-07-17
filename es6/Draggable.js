import * as dom from "./lib/dom.js";
import * as attr from "./lib/attr.js";

const handleSelector = '[data-drag-handle]';
const draggableSelector = '[data-drag-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
const handleOrDraggableSelector = `${handleSelector},${draggableSelector}`;

export default class Draggable {

  static closest(el) {
    el = dom.closest(el, handleOrDraggableSelector);
    if (!el) return null;

    // if the pointer is over a handle element, ascend the DOM to find the
    // associated draggable item
    if (el.hasAttribute('data-drag-handle')) {
      el = dom.closest(el, draggableSelector);
      return el ? new Draggable(el) : null;
    }

    // check all of the drag handles underneath this draggable element,
    // and make sure they all belong to other (child) draggables
    for (let handleEl of el.querySelectorAll(handleSelector)) {
      if (dom.closest(handleEl, draggableSelector) === el)
        return null;
    }

    return el ? new Draggable(el) : null;
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
    this.tags = el.hasAttribute('data-drag-tag')
              ? attr.getTokenSet(el, 'data-drag-tag')
              : attr.getTokenSet(el.parentElement, 'data-drag-tag');
  }


  restoreOriginal() {
    this.originalParentEl.insertBefore(this.el, this.originalParentEl.children[this.originalIndex]);
  }

}
