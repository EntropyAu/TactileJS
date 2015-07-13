import Container from "./Container.js";
import Placeholder from "./Placeholder.js";
import * as dom from "./lib/dom.js";

export default class CanvasContainer extends Container {

  static get selector() { return '[data-drag-canvas]'; }

  constructor(el, drag) {
    super(el, drag);
    this.offset = [0,0];
    this.grid = null;
    this.initialize();
  }

  initialize() {
    let snapToGrid = this.el.getAttribute('data-drag-canvas-snap-to-grid') || '';
    let cellSizeTokens = snapToGrid.split(',');
    this.grid = [parseInt(cellSizeTokens[0], 10) || 1,
                 parseInt(cellSizeTokens[1], 10) || parseInt(cellSizeTokens[0], 10) || 1];
  }


  updatePosition(constrainedXY) {
    // TODO cache if possible
    const rect = this.el.getBoundingClientRect();
    let l = constrainedXY[0] - rect.left + this.el.scrollLeft - this.drag.helper.gripOffset[0] * this.drag.helper.size[0],
        t = constrainedXY[1] - rect.top + this.el.scrollTop - this.drag.helper.gripOffset[1] * this.drag.helper.size[1];

    t = Math.round((t - rect.top ) / this.grid[1]) * this.grid[1] + rect.top;
    l = Math.round((l - rect.left) / this.grid[0]) * this.grid[0] + rect.left;
    this.offset = [l,t];
  }


  insertPlaceholder() {
    if (!this.placeholder) {
      this.placeholder = new Placeholder(this.drag);
      dom.translate(this.placeholder.el, this.offset[0], this.offset[1]);
      this.el.appendChild(this.placeholder.el);
      this.placeholderSize = this.placeholder.size;
      this.placeholderScale = this.placeholder.scale;
    }
  }


  updatePlaceholder() {
    dom.translate(this.placeholder.el, this.offset[0], this.offset[1]);
  }


  removePlaceholder() {
    this.placeholder.el.remove();
    this.placeholder = null;
  }
}
