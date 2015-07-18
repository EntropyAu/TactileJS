import * as dom from "./lib/dom.js";
import * as attr from "./lib/attr.js";
import * as math from "./lib/math.js";

const attribute = 'data-drag-fence'
const selector = '[data-drag-fence]';


export default class Fence {

  static closestForDraggable(drag, draggable) {
    let el = draggable.el;
    while (el = dom.closest(el.parentElement, selector)) {
      let candidateFence = new Fence(el, drag);
      if (candidateFence.willConstrain(draggable)) {
        return candidateFence;
      }
    }
    return null;
  }


  constructor(el, drag) {
    this.el = el;
    this._drag = drag;
    this._tags = attr.getAttributeSetWithDefaults(el, attribute, ['*']);
  }


  willConstrain(draggable) {
    return this._tags.has('*')
        || Array.from(draggable.tags).some(t => this._tags.has(t));
  }


  getConstrainedXY(xy) {
    const grip = this._drag.helper.grip;
    const size = this._drag.helper.size;

    // adjust for helper grip offset
    let tl = [xy[0] - grip[0] * size[0], xy[1] - grip[1] * size[1]];

    // coerce the top-left coordinates to fit within the fence element bounds
    let rect = this._drag.cache.scrollInvalidatedCache(this.el, 'pr', () => dom.getPaddingClientRect(this.el));
    tl[0] = math.coerce(tl[0], rect.left, rect.right - size[0]);
    tl[1] = math.coerce(tl[1], rect.top, rect.bottom - size[1]);

    // return the coerced values, restoring the helper grip offset
    return [tl[0] + grip[0] * size[0], tl[1] + grip[1] * size[1]];
  }
}
