module Tactile {

  export class Canvas extends Tactile.Container {

    private offset:[number,number] = [0,0];
    private _grid:[number,number] = null;

    constructor(el:HTMLElement, drag:Drag) {
      super(el, drag);
      this._initializeGrid();
    }


    enter(xy:[number,number]):void {
      if (!this.placeholder) {
        this._insertPlaceholder();
        this.placeholderSize = this.placeholder.size;
        this.placeholderScale = this.placeholder.scale;
      }
      this.move(xy); // calculate the initial position of items
    }


    move(xy:[number,number]):void {
      const rect = this.drag.scrollCache.get(this.el, 'clientRect', () => this.el.getBoundingClientRect());
      const scrollOffset = this.drag.scrollCache.get(this.el, 'scrollOffset', () => [this.el.scrollLeft, this.el.scrollTop]);

      let localOffset:[number,number] =
        [xy[0] - rect.left + scrollOffset[0] + this.drag.helper.gripOffset[0],
         xy[1] - rect.top  + scrollOffset[1] + this.drag.helper.gripOffset[1]];

      localOffset = Vector.divide(localOffset, this.placeholderScale);
      if (this._grid) {
        localOffset = [Math.round(localOffset[0] / this._grid[0]) * this._grid[0],
                       Math.round(localOffset[1] / this._grid[1]) * this._grid[1]];
      }
      this.offset = localOffset;
      Dom.translate(this.placeholder.el, this.offset);
    }


    leave() {
      if (this.leaveAction === "copy" && this.placeholder.isOriginalEl) {
        // TODO animate placeholder back to it's original position
        this.placeholder.setState("materialized");
      }
    }


    finalizeDrop(draggable:Draggable) {
      let el = this.placeholder.el;
      Dom.topLeft(el, this.offset);
    }


    private _initializeGrid() {
      let gridAttribute = Attributes.get(this.el, 'data-drag-grid', '10,10');
      if (gridAttribute !== null) {
        let tokens = gridAttribute.split(',');
        this._grid = [parseInt(tokens[0], 10) || 1,
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
      this.placeholder.setState("hidden");
    }

    dispose():void {
      this.placeholder.setState("materialized", false);
      if (this.placeholder) this.placeholder.dispose()
    }
  }
}
