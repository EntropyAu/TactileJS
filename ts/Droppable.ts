module Tactile {
  export class Droppable extends Container {

    constructor(el:HTMLElement, drag:Drag) {
      super(el, drag);
    }


    public enter(xy:[number,number]):void {
      // do nothing
    }


    public move(xy:[number,number]):void {
      // do nothing
    }


    public leave():void {
      // do nothing
    }


    public finalizePosition(el:HTMLElement):void {
      Polyfill.remove(el);
    }
  }
}
