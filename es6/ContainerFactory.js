import CanvasContainer from './CanvasContainer.js';
import DroppableContainer from './DroppableContainer.js';
import SortableContainer from './SortableContainer.js';
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
    if (CanvasContainer.matches(el)) return new CanvasContainer(el, drag);
    if (DroppableContainer.matches(el)) return new DroppableContainer(el, drag);
    if (SortableContainer.matches(el)) return new SortableContainer(el, drag);
    return null;
  }
}
