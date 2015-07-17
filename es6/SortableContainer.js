import Container from "./Container.js";
import Placeholder from "./Placeholder.js";
import * as dom from "./lib/dom.js";
import * as animation from "./lib/animation.js";

export default class SortableContainer extends Container {

  static get selector() { return '[data-drag-sortable]'; }

  constructor(el, drag) {
    super(el, drag);
    this.index = null;
    this.direction = 'vertical';
    this.childEls = null;
    this.siblingEls = null;
    this.childMeasures = new WeakMap();
    this.style = null;
    this.forceFeedClearRequired = true;
    this.initializeSortable();
  }


  initializeSortable() {
    this.direction = this.el.getAttribute('data-drag-sortable') || 'vertical';
    this.initializeSiblingEls();
    this.initializePlaceholder();
    this.style = getComputedStyle(this.el);
  }


  initializePlaceholder() {
    if (this.drag.draggable.originalParentEl === this.el) {
      this.placeholder = new Placeholder(this.drag, this.drag.draggable.el);
    } else {
      this.placeholder = new Placeholder(this.drag);
      this.el.appendChild(this.placeholder.el);
    }
    this.placeholder.setState("hidden");
    this._addNegativeMarginToLastChild();
  }


  initializeSiblingEls() {
    this.childEls = dom.childElementArray(this.el);
    this.siblingEls = dom.childElementArray(this.el);
    let draggableElIndex = this.siblingEls.indexOf(this.drag.draggable.el);
    if (draggableElIndex !== -1) {
      this.siblingEls.splice(draggableElIndex, 1);
      this.index = draggableElIndex;
    }
  }


  enter() {
    this.placeholder.setState("ghosted");
    this._removeNegativeMarginFromLastChild();
    // clear any negative margins on the last child
    this.placeholderSize = this.placeholder.size;
    this.placeholderScale = this.placeholder.scale;
  }


  leave() {
    if (this.dragOutAction === 'copy' && this.placeholder.isDraggableEl) {
      this.placeholder.setState("materialized");
    } else {
      this.index = null;
      this.forceFeedClearRequired = true;
      this.placeholder.setState("hidden");
      this._addNegativeMarginToLastChild();
      // add negative margin to last child the outer width/height of the
      // placeholder - so as far as layout is concerned, it doesn't exist
      this.updateChildTranslations();
    }
  }


  _addNegativeMarginToLastChild() {
    if (this.el.children.length === 0) return;
    let lastChildEl = this.el.children[this.el.children.length - 1];
    let lastChildStyle = getComputedStyle(lastChildEl);
    let newMarginBottom = parseInt(lastChildStyle.marginBottom, 10) - this.placeholder.outerSize[1];
    lastChildEl.style.marginBottom = newMarginBottom + 'px';
  }

  _removeNegativeMarginFromLastChild() {
    if (this.el.children.length === 0) return;
    let lastChildEl = this.el.children[this.el.children.length - 1];
    lastChildEl.style.marginBottom = '';
  }


  finalizeDrop(draggable) {
    this.clearChildTransforms();
    this.el.insertBefore(this.placeholder.el, this.siblingEls[this.index]);
    this.placeholder.dispose(this.drag.action === 'copy');
    this.placeholder = null;
  }


  getChildMeasure(el) {
    let layoutOffsetProperty = this.direction === "vertical" ? "offsetTop" : "offsetLeft";
    let paddingTopOrLeftProperty = this.direction === "vertical" ? "paddingTop" : "paddingLeft";
    let outerWidthOrHeightProperty = this.direction === "vertical" ? "outerHeight" : "outerWidth";
    let measure = this.childMeasures.get(el);
    if (!measure) {
      measure = {
        offset: el[layoutOffsetProperty] - parseInt(this.style[paddingTopOrLeftProperty], 10),
        measure: dom[outerWidthOrHeightProperty](el, true),
        translation: null
      };
      this.childMeasures.set(el, measure);
    }
    return measure;
  }


  updatePosition(xy) {
    // if it's empty, answer is simple
    if (this.siblingEls.length === 0) {
      if (this.index !== 0) {
        this.index = 0;
        console.log(0);
        this.updateChildTranslations();
      }
      return;
    }

    let dimensionIndex = this.direction === 'vertical' ? 1 : 0;
    let translateProperty = this.direction === 'vertical' ? 'translateY' : 'translateX';

    const bounds = this.el.getBoundingClientRect();
    // calculate the position of the item relative to this container
    const innerXY = [xy[0] - bounds.left + this.el.scrollLeft - parseInt(this.style.paddingLeft, 10),
                     xy[1] - bounds.top  + this.el.scrollTop  - parseInt(this.style.paddingTop, 10)];
    const adjustedXY = [innerXY[0] - this.drag.helper.grip[0] * this.drag.helper.size[0],
                        innerXY[1] - this.drag.helper.grip[1] * this.drag.helper.size[1]];

    let naturalOffset = 0;
    let newIndex = 0;
    do {
      let measure = this.getChildMeasure(this.childEls[newIndex]);
      if (adjustedXY[dimensionIndex] < naturalOffset + measure.measure / 2) break;
      naturalOffset += measure.measure;
      newIndex++;
    }
    while (newIndex < this.childEls.length);

    if (this.index !== newIndex) {
      this.index = newIndex;
      console.log(newIndex);
      this.updateChildTranslations();
    }
  }


  updateChildTranslations() {
    let dimensionIndex = this.direction === 'vertical' ? 1 : 0;
    let translateProperty = this.direction === 'vertical' ? 'translateY' : 'translateX';

    let offset = 0;
    let placeholderOffset = null;

    this.siblingEls.forEach(function (el, index) {
      if (index === this.index) {
        placeholderOffset = offset;
        offset += this.placeholder.outerSize[dimensionIndex];
      }
      let measure = this.getChildMeasure(el);
      let newTranslation = offset - measure.offset
      if (measure.translation !== newTranslation || this.forceFeedClearRequired) {
        measure.translation = newTranslation;
        let props = this.forceFeedClearRequired
                  ? { [translateProperty]: [measure.translation, Math.random() / 100] }
                  : { [translateProperty]: measure.translation + Math.random() / 100 };
        animation.set(el, props, this.drag.options.reorderAnimation);
      }
      offset += measure.measure;
    }.bind(this));

    if (placeholderOffset === null)  placeholderOffset = offset;
    let placeholderMeasure = this.getChildMeasure(this.placeholder.el);
    let newPlaceholderTranslation = placeholderOffset - placeholderMeasure.offset;
    if (placeholderMeasure.translation !== newPlaceholderTranslation || this.forceFeedCleanRequired) {
      animation.set(this.placeholder.el, { [translateProperty]: newPlaceholderTranslation });
      placeholderMeasure.translation = newPlaceholderTranslation;
    }
    this.forceFeedClearRequired = false;
  }


  clearChildTransforms() {
    // synchronously clear the transform styles (rather than calling
    // velocity.js) to avoid flickering when the dom elements are reordered
    this.siblingEls.forEach(function(el) {
      Velocity(el, 'stop');
      el.setAttribute('style', '');
    });
    this.forceFeedCleanRequired = true;
  }


  dispose() {
    this.clearChildTransforms();
    if (this.placeholder) this.placeholder.dispose()
    super();
  }
}
