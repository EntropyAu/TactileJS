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
    let grid = this.el.getAttribute('data-drag-grid') || '';
    let cellSizeTokens = grid.split(',');
    this.grid = [parseInt(cellSizeTokens[0], 10) || 1,
                 parseInt(cellSizeTokens[1], 10) || parseInt(cellSizeTokens[0], 10) || 1];
    this.insertPlaceholder();
  }


  insertPlaceholder(originalEl) {
    this.placeholder = new Placeholder(this.drag, originalEl);
    if (!originalEl) {
      this.el.appendChild(this.placeholder.el);
    }
    this.placeholderSize = this.placeholder.size;
    this.placeholderScale = this.placeholder.scale;
    this.placeholder.setState("hidden");
  }


  updatePosition(xy) {
    // TODO cache if possible
    const rect = this.el.getBoundingClientRect();
    let l = xy[0] - rect.left + this.el.scrollLeft - this.drag.helper.grip[0] * this.drag.helper.size[0],
        t = xy[1] - rect.top  + this.el.scrollTop - this.drag.helper.grip[1] * this.drag.helper.size[1];
    t = Math.round((t - rect.top ) / this.grid[1]) * this.grid[1] + rect.top;
    l = Math.round((l - rect.left) / this.grid[0]) * this.grid[0] + rect.left;
    this.offset = [l,t];
    dom.translate(this.placeholder.el, this.offset[0], this.offset[1]);
  }



  enter() {
    this.placeholder.setState("ghosted");
  }


  leave() {
    if (this.dragOutAction === 'copy' && this.placeholder.isOriginal) {
      this.placeholder.setState("materialized");
    } else {
      this.placeholder.setState("hidden");
    }
  }


  finalizeDrop(draggable) {
    this.placeholder.dispose();
    dom.topLeft(draggable.el, this.offset);
    this.el.appendChild(draggable.el);
  }
}
