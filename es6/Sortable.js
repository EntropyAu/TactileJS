import Container from "./Container.js";
import Placeholder from "./Placeholder.js";
import * as animation from "./lib/animation.js";
import * as attr from "./lib/attr.js";
import * as dom from "./lib/dom.js";

export default class Sortable extends Container {

  static get selector() { return '[data-drag-sortable]'; }

  constructor(el, drag) {
    super(el, drag);
    this._index = null;
    this._drag = drag;
    this._direction = null;
    this._directionProperties = null;
    this._childEls = null;
    this._siblingEls = null;
    this._childMeasures = new WeakMap();
    this._style = getComputedStyle(this.el);
    this._forceFeedRequired = true;

    this._initializeDirection();
    this._initializePlaceholder();
    this._initializeChildAndSiblingEls();
  }


  _initializeDirection() {
    this._direction = this.el.getAttribute('data-drag-sortable') || 'vertical';
    this._directionProperties = this._direction === 'vertical'
                              ? {
                                  index: 1,
                                  translate: 'translateY',
                                  paddingStart: 'paddingTop',
                                  endMargin: 'marginBottom',
                                  layoutOffset: 'offsetTop',
                                  outerDimension: 'outerHeight'
                                }
                              : {
                                  index: 0,
                                  translate: 'translateX',
                                  paddingStart: 'paddingLeft',
                                  endMargin: 'marginRight',
                                  layoutOffset: 'offsetLeft',
                                  outerDimension: 'outerWidth'
                                };
  }


  _initializePlaceholder() {
    if (this._drag.draggable.originalParentEl === this.el) {
      this.placeholder = new Placeholder(this._drag, this._drag.draggable.el);
    } else {
      this.placeholder = new Placeholder(this._drag);
      this.el.appendChild(this.placeholder.el);
    }
    this.placeholder.setState("hidden");
    this._addNegativeMarginToLastChild();
  }


  _initializeChildAndSiblingEls() {
    this._childEls = dom.childElementArray(this.el);
    this._siblingEls = this._childEls.slice(0);
    let placeholderElIndex = this._childEls.indexOf(this.placeholder.el);
    if (placeholderElIndex !== -1) {
      this._siblingEls.splice(placeholderElIndex, 1);
    }
  }


  enter() {
    super();
    this.placeholder.setState("ghosted");
    this.placeholderSize = this.placeholder.size;
    this.placeholderScale = this.placeholder.scale;
    this._removeNegativeMarginFromLastChild();
    this._childMeasures = new WeakMap();
  }


  leave() {
    super();
    if (this.leaveAction === 'copy' && this.placeholder.isDraggableEl) {
      this.placeholder.setState("materialized");
    } else {
      this._index = null;
      this._forceFeedRequired = true;
      this._childMeasures = new WeakMap();
      this.placeholder.setState("hidden");
      this._addNegativeMarginToLastChild();
      this._updateChildTranslations();
    }
  }


  _addNegativeMarginToLastChild() {
    if (this.el.children.length === 0) return;
    let lastChildEl = this.el.children[this.el.children.length - 1];
    let lastChildStyle = getComputedStyle(lastChildEl);
    let newMargin = parseInt(lastChildStyle[this._directionProperties.endMargin], 10) - this.placeholder.outerSize[this._directionProperties.index];
    lastChildEl.style[this._directionProperties.endMargin] = newMargin + 'px';
  }


  _removeNegativeMarginFromLastChild() {
    if (this.el.children.length === 0) return;
    let lastChildEl = this.el.children[this.el.children.length - 1];
    lastChildEl.style[this._directionProperties.endMargin] = '';
  }


  finalizeDrop(draggable) {
    this._clearChildTranslations();
    this.el.insertBefore(this.placeholder.el, this._siblingEls[this._index]);
    this.placeholder.dispose(this._drag.action === 'copy');
    this.placeholder = null;
  }


  _getChildMeasure(el) {
    let measure = this._childMeasures.get(el);
    if (!measure) {
      measure = {
        offset: el[this._directionProperties.layoutOffset] - parseInt(this._style[this._directionProperties.paddingStart], 10),
        measure: dom[this._directionProperties.outerDimension](el, true),
        translation: null
      };
      this._childMeasures.set(el, measure);
    }
    return measure;
  }


  updatePosition(xy) {
    super(xy);
    // if it's empty, answer is simple
    if (this._siblingEls.length === 0) {
      if (this._index !== 0) {
        this._index = 0;
        this._updateChildTranslations();
      }
      return;
    }

    const bounds = this._drag.cache.scrollInvalidatedCache(this.el, 'cr', () => this.el.getBoundingClientRect());
    const sl = this._drag.cache.scrollInvalidatedCache(this.el, 'sl', () => this.el.scrollLeft);
    const st = this._drag.cache.scrollInvalidatedCache(this.el, 'st', () => this.el.scrollTop);
    // calculate the position of the item relative to this container
    const innerXY = [xy[0] - bounds.left + sl - parseInt(this._style.paddingLeft, 10),
                     xy[1] - bounds.top  + st - parseInt(this._style.paddingTop, 10)];
    const adjustedXY = [innerXY[0] - this._drag.helper.grip[0] * this._drag.helper.size[0],
                        innerXY[1] - this._drag.helper.grip[1] * this._drag.helper.size[1]];

    let naturalOffset = 0;
    let newIndex = 0;
    do {
      let measure = this._getChildMeasure(this._siblingEls[newIndex]);
      if (adjustedXY[this._directionProperties.index] < naturalOffset + measure.measure / 2) break;
      naturalOffset += measure.measure;
      newIndex++;
    }
    while (newIndex < this._siblingEls.length);

    if (this._index !== newIndex) {
      this._index = newIndex;
      this._updateChildTranslations();
    }
  }


  _updateChildTranslations() {
    let offset = 0;
    let placeholderOffset = null;

    this._siblingEls.forEach(function (el, index) {
      if (index === this._index) {
        placeholderOffset = offset;
        offset += this.placeholder.outerSize[this._directionProperties.index];
      }
      let measure = this._getChildMeasure(el);
      let newTranslation = offset - measure.offset
      if (measure.translation !== newTranslation || this._forceFeedRequired) {
        measure.translation = newTranslation;
        let props = this._forceFeedRequired
                  ? { [this._directionProperties.translate]: [measure.translation, Math.random() / 100] }
                  : { [this._directionProperties.translate]: measure.translation + Math.random() / 100 };
        animation.set(el, props, this._drag.options.reorderAnimation);
      }
      offset += measure.measure;
    }.bind(this));

    if (placeholderOffset === null)  placeholderOffset = offset;
    let placeholderMeasure = this._getChildMeasure(this.placeholder.el);
    let newPlaceholderTranslation = placeholderOffset - placeholderMeasure.offset;
    if (placeholderMeasure.translation !== newPlaceholderTranslation || this._forceFeedRequired) {
      animation.set(this.placeholder.el, { [this._directionProperties.translate]: newPlaceholderTranslation });
      placeholderMeasure.translation = newPlaceholderTranslation;
    }
    this._forceFeedRequired = false;
  }


  _clearChildTranslations() {
    // synchronously clear the transform styles (rather than calling
    // velocity.js) to avoid flickering when the dom elements are reordered
    this._siblingEls.forEach(function(el) {
      animation.stop(el);
      el.setAttribute('style', '');
    });
    this._forceFeedRequired = true;
  }


  dispose() {
    this._clearChildTranslations();
    if (this.placeholder) this.placeholder.dispose()
    super();
  }
}
