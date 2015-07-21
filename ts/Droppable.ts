module Tactile {
  export class Droppable extends Container {

    constructor(el:HTMLElement, drag:Drag) {
      super(el, drag);
    }

    enter(xy:[number,number]):void {
      // do nothing
    }

    move(xy:[number,number]):void {
      // do nothing
    }

    leave():void {
      // do nothing
    }

    finalizeDrop(draggable:Draggable):void {}
  }
}
