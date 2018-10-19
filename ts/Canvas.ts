module Tactile {

  export class Canvas extends Container {

    offset:[number,number] = [0,0];
    grid:[number,number] = null;
    domain:[number,number] = null;


    constructor(el:HTMLElement, drag:Drag) {
      super(el, drag);
      this._readDataAttributes();
    }


    public enter(xy:[number,number]):void {
      if (!this.placeholder) {
        this._insertPlaceholder();
        // TODO: move this logic, should not be cached
        this.helperSize = this.placeholder.size;
        this.helperScale = this.placeholder.scale;
      }
      this.placeholder.setState(PlaceholderState.Ghost);
      this.move(xy);
    }


    public move(xy:[number,number]):void {
      const gripOffset = this.drag.helper.gripOffset;
      const helperSize = this.drag.helper.size;

      // adjust for helper grip offset
      let tl = [xy[0] + gripOffset[0], xy[1] + gripOffset[1]];

      // coerce the top-left coordinates to fit within the canvas element bounds
      let rect = this.drag.geometryCache.get(this.el, 'content-box', () => Dom.getContentBoxClientRect(this.el));
      tl[0] = Maths.coerce(tl[0], rect.left, rect.right - helperSize[0]);
      tl[1] = Maths.coerce(tl[1], rect.top, rect.bottom - helperSize[1]);

      // return the coerced values, restoring the helper grip offset
      tl = [tl[0] - gripOffset[0], tl[1] - gripOffset[1]];

      const scrollOffset = this.drag.geometryCache.get(this.el, 'so', () => [this.el.scrollLeft, this.el.scrollTop]);

      let localOffset:[number,number] =
        [tl[0] - rect.left - (parseInt(this.el.style.paddingLeft, 10)||0) + scrollOffset[0] + this.drag.helper.gripOffset[0],
         tl[1] - rect.top -  (parseInt(this.el.style.paddingTop,  10)||0) + scrollOffset[1] + this.drag.helper.gripOffset[1]];

      localOffset = Vector.divide(localOffset, this.helperScale);
      if (this.grid) {
        localOffset = [Math.round(localOffset[0] / this.grid[0]) * this.grid[0],
                       Math.round(localOffset[1] / this.grid[1]) * this.grid[1]];
      }

      Dom.translate(this.placeholder.el, localOffset);
      this.offset = localOffset;
    }


    public leave():void {
      if (this.leaveAction === DragAction.Copy && this.placeholder.isOriginalEl) {
        // TODO: animate placeholder back to it's original position
        this.placeholder.setState(PlaceholderState.Materialized);
      } else {
        this.placeholder.setState(PlaceholderState.Hidden);
      }
    }


    public finalizePosition(el:HTMLElement):void {
      Dom.topLeft(el, this.offset);
      this.el.appendChild(el);
    }


    public dispose():void {
      if (this.placeholder) this.placeholder.dispose()
    }


    private _readDataAttributes() {
      this.grid = null;
      let gridAttribute = Attributes.get(this.el, 'data-drag-grid', '10,10');
      if (gridAttribute !== null) {
        let tokens = gridAttribute.split(',');
        this.grid = [parseInt(tokens[0], 10) || 1,
                     parseInt(tokens[1], 10) || parseInt(tokens[0], 10) || 1];
      }
    }


    private _insertPlaceholder():void {
      if (this.drag.draggable.originalParentEl === this.el) {
        this.placeholder = new Placeholder(this.drag.draggable.el, this.drag);
      } else {
        this.placeholder = Placeholder.buildPlaceholder(this.el, this.drag);
      }
      Dom.topLeft(this.placeholder.el, [0,0]);
      this.placeholder.setState(PlaceholderState.Hidden);
    }
  }
}
