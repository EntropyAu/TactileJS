import Container from "./Container.js";
import Placeholder from "./Placeholder.js";
import * as dom from "./lib/dom.js";
import * as attr from "./lib/attr.js";

export default class Canvas extends Container {

  static get selector() { return '[data-drag-canvas]'; }

  constructor(el, drag) {
    super(el, drag);
    this._drag = drag;
    this._offset = [0,0];
    this._grid = null;
    this._initializeGrid();
    this._insertPlaceholder();
  }


  _initializeGrid() {
    let gridAttribute = attr.getAttributeWithDefaults(this.el, 'data-drag-grid', '10,10', '1,1');
    let tokens = gridAttribute.split(',');
    this._grid = [parseInt(tokens[0], 10) || 1,
                  parseInt(tokens[1], 10) || parseInt(tokens[0], 10) || 1];
  }


  // TODO pass originalEl
  _insertPlaceholder(originalEl) {
    this.placeholder = new Placeholder(this.drag, originalEl);
    this.placeholder.el.style.position = 'absolute';
    this.placeholder.el.style.top = '0';
    this.placeholder.el.style.left = '0';
    if (!originalEl) {
      this.el.appendChild(this.placeholder.el);
    }
    this.placeholder.setState("hidden");
  }


  updatePosition(xy) {
    const rect = this._drag.cache.scrollInvalidatedCache(this.el, 'cr', () => this.el.getBoundingClientRect());
    const sl = this._drag.cache.scrollInvalidatedCache(this.el, 'sl', () => this.el.scrollLeft);
    const st = this._drag.cache.scrollInvalidatedCache(this.el, 'st', () => this.el.scrollTop);
    let l = xy[0] - rect.left + sl - this.drag.helper.grip[0] * this.drag.helper.size[0],
        t = xy[1] - rect.top  + st - this.drag.helper.grip[1] * this.drag.helper.size[1];
    t = Math.round((t - rect.top ) / this._grid[1]) * this._grid[1] + rect.top;
    l = Math.round((l - rect.left) / this._grid[0]) * this._grid[0] + rect.left;
    this._offset = [l,t];
    dom.translate(this.placeholder.el, this._offset);
  }


  enter() {
    super();
    this.placeholder.setState("ghosted");
    this.placeholderSize = this.placeholder.size;
    this.placeholderScale = this.placeholder.scale;
  }


  leave() {
    super();
    if (this.dragOutAction === 'copy' && this.placeholder.isOriginal) {
      this.placeholder.setState("materialized");
    } else {
      this.placeholder.setState("hidden");
    }
  }


  finalizeDrop(draggable) {
    this.placeholder.dispose();
    dom.topLeft(draggable.el, this._offset);
    this.el.appendChild(draggable.el);
  }
}
