import * as dom from "./lib/dom.js";
import * as attr from "./lib/attr.js";

const captorSelector = '[data-drag-captures]';

export default class Captor {

  static closest(el) {
    el = dom.closest(el, captorSelector);
    return el ? new Captor(el) : null;
  }


  constructor(el) {
    this.el = el;
    this.captures = attr.getTokenSet(el, 'data-drag-capture', '*')
  }


  willCapture(draggable) {
    return this.captures.has('*') || [...draggable.tags].some(t => this.captures.has(t));
  }


  getConstrainedPosition(helper, xy) {
    const grip = helper.grip;
    const size = helper.size;

    let tl = [xy[0] - grip[0] * size[0], xy[1] - grip[1] * size[1]];
    let rect = dom.getPaddingClientRect(this.target.el);
    tl[0] = math.coerce(tl[0], rect.left, rect.right - size[0]);
    tl[1] = math.coerce(tl[1], rect.top, rect.bottom - size[1]);
    return [tl[0] + grip[0] * size[0], tl[1] + grip[1] * size[1]];
  }
}