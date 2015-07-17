import Container from "./Container.js";

export default class Droppable extends Container {

  static get selector() { return '[data-drag-droppable]'; }

  constructor(el, drag) {
    super(el, drag);
  }


  updatePosition(xy) {
  }


  finalizeDrop(draggable) {
  }
}