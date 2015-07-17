import Canvas from './Canvas.js';
import Droppable from './Droppable.js';
import Sortable from './Sortable.js';
import * as dom from "./lib/dom.js";

const containerSelector = '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]';

export default class ContainerFactory {

  static closest(el) {
    el = dom.closest(el, containerSelector);
    while (el && dom.closest(el, '[data-drag-placeholder]'))
      el = dom.closest(el.parentElement, containerSelector)
    return el;
  }

  static makeContainer(el, drag) {
    if (Canvas.matches(el)) return new Canvas(el, drag);
    if (Droppable.matches(el)) return new Droppable(el, drag);
    if (Sortable.matches(el)) return new Sortable(el, drag);
    return null;
  }
}
