import CanvasContainer from './CanvasContainer.js';
import DroppableContainer from './DroppableContainer.js';
import SortableContainer from './SortableContainer.js';
import * as dom from "./lib/dom.js";

export default class ContainerFactory {

  static get selector() { return '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]'; }

  static closest(el) {
    return dom.closest(el, this.selector);
  }

  static makeContainer(el, drag) {
    if (CanvasContainer.matches(el)) return new CanvasContainer(el, drag);
    if (DroppableContainer.matches(el)) return new DroppableContainer(el, drag);
    if (SortableContainer.matches(el)) return new SortableContainer(el, drag);
    return null;
  }
}
