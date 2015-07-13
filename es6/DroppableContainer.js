import Container from "./Container.js";

export default class DroppableContainer extends Container {

  static get selector() { return '[data-drag-droppable]'; }


  updateTarget(drag) {

  }
}