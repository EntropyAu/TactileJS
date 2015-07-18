import * as dom from "./lib/dom.js";
import * as attr from "./lib/attr.js";
import * as math from "./lib/math.js";

const fenceAttribute = 'data-drag-fence'
const fenceSelector = '[data-drag-fence]';

export default class Fence {

  static closestForDraggable(draggable) {
    let el = draggable.el;
    while (el = dom.closest(el.parentElement, fenceSelector)) {
      let candidateFence = new Fence(el);
      if (candidateFence.willConstrain(draggable)) {
        return candidateFence;
      }
    }
    return null;
  }


  constructor(el) {
    this.el = el;
    this.constrains = attr.getAttributeSetWithDefaults(el, fenceAttribute, ['*'], []);
  }


  willConstrain(draggable) {
    return this.constrains.has('*')
        || Array.from(draggable.tags).some(t => this.captures.has(t));
  }


  getConstrainedXY(helper, xy) {
    const grip = helper.grip;
    const size = helper.size;

    // adjust for helper grip offset
    let tl = [xy[0] - grip[0] * size[0], xy[1] - grip[1] * size[1]];

    // coerce the top-left coordinates to fit within the fence element bounds
    // TODO cache this
    let rect = dom.getPaddingClientRect(this.el);
    tl[0] = math.coerce(tl[0], rect.left, rect.right - size[0]);
    tl[1] = math.coerce(tl[1], rect.top, rect.bottom - size[1]);

    // return the coerced values, restoring the helper grip offset
    return [tl[0] + grip[0] * size[0], tl[1] + grip[1] * size[1]];
  }
}
