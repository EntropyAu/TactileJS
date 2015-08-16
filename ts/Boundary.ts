module Tactile {

  export class Boundary {

    static closestForDraggable(drag:Drag, draggable:Draggable):Boundary {
      let el = draggable.el;
      while (el = Dom.closest(el.parentElement, '[data-drag-bounds]')) {
        let candidateBound = new Boundary(el, drag);
        if (candidateBound.constrains(draggable.tags)) {
          return candidateBound;
        }
      }
      return null;
    }


    public tags:string[];


    constructor(public el:HTMLElement, public drag:Drag) {
      this.tags = Attributes.getTags(el, 'data-drag-bounds', ['*']);
    }


    public constrains(tags:string[]):boolean {
      return this.tags.indexOf('*') !== -1 || tags.some(t => this.tags.indexOf(t) !== -1);
    }


    public getConstrainedXY(xy:[number,number]):[number,number] {
      const gripOffset = this.drag.helper.gripOffset;
      const helperSize = this.drag.helper.size;

      // adjust for helper grip offset
      let tl = [xy[0] + gripOffset[0], xy[1] + gripOffset[1]];

      // coerce the top-left coordinates to fit within the Boundary element bounds
      let rect = this.drag.geometryCache.get(this.el, 'cb', () => Dom.getContentBoxClientRect(this.el));
      tl[0] = Maths.coerce(tl[0], rect.left, rect.right - helperSize[0]);
      tl[1] = Maths.coerce(tl[1], rect.top, rect.bottom - helperSize[1]);

      // return the coerced values, restoring the helper grip offset
      return [tl[0] - gripOffset[0], tl[1] - gripOffset[1]];
    }
  }
}
