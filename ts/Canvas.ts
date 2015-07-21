module Tactile {

  export class Canvas extends Tactile.Container {

    placeholderSize:[number,number] = null;
    placeholderScale:[number,number] = null;


    private _offset:[number,number] = [0,0];
    private _grid:[number,number] = null;


    constructor(el:HTMLElement, drag:Drag) {
      super(el, drag);
      this._initializeGrid();
    }


    enter(xy:[number,number]):void {
      if (!this.placeholder) {
        this._insertPlaceholder();
      }
      this.placeholder.setState("ghost");
      this.placeholderSize = this.placeholder.size;
      this.placeholderScale = this.placeholder.scale;
      this.move(xy);
    }


    move(xy:[number,number]):void {
      const rect = this.drag.scrollCache.get(this.el, 'cr', () => this.el.getBoundingClientRect());
      const sl = this.drag.scrollCache.get(this.el, 'sl', () => this.el.scrollLeft);
      const st = this.drag.scrollCache.get(this.el, 'st', () => this.el.scrollTop);
      let l = xy[0] - rect.left + sl + this.drag.helper.gripOffset[0],
          t = xy[1] - rect.top  + st + this.drag.helper.gripOffset[1];
      l = l / this.placeholderScale[0];
      t = t / this.placeholderScale[1];
      if (this._grid) {
        t = Math.round((t - rect.top ) / this._grid[1]) * this._grid[1] + rect.top;
        l = Math.round((l - rect.left) / this._grid[0]) * this._grid[0] + rect.left;
      }
      this._offset = [l,t];
      Dom.translate(this.placeholder.el, this._offset);
    }


    leave() {
      if (this.leaveAction === "copy" && this.placeholder.isOriginalEl) {
        this.placeholder.setState("materialized");
      } else {
        this.placeholder.setState("hidden");
      }
    }


    finalizeDrop(draggable:Draggable) {
      let el = this.placeholder.el;
      this.placeholder.dispose();
      Dom.topLeft(el, this._offset);
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
      this.placeholder.el.style.position = 'absolute';
      Dom.topLeft(this.placeholder.el, [0,0]);
      this.placeholder.setState("hidden");
    }

  }
}
