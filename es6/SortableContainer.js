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
    this.propertiesForDimension = null;
    this.initializeSortable();
  }


  initializeSortable() {
    this.style = getComputedStyle(this.el);
    this.initializeDirection();
    this.initializePlaceholder();
    this.initializeChildAndSiblingEls();
  }


  initializeDirection() {
    this.direction = this.el.getAttribute('data-drag-sortable') || 'vertical';
    this.directionProperties = this.direction === 'vertical'
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


  initializeChildAndSiblingEls() {
    this.childEls = dom.childElementArray(this.el);
    this.siblingEls = this.childEls.slice(0);
    let placeholderElIndex = this.childEls.indexOf(this.placeholder.el);
    if (placeholderElIndex !== -1) {
      this.siblingEls.splice(placeholderElIndex, 1);
    }
  }


  enter() {
    this.placeholder.setState("ghosted");
    this.placeholderSize = this.placeholder.size;
    this.placeholderScale = this.placeholder.scale;
    this._removeNegativeMarginFromLastChild();
    this.childMeasures = new WeakMap();
  }


  leave() {
    if (this.dragOutAction === 'copy' && this.placeholder.isDraggableEl) {
      this.placeholder.setState("materialized");
    } else {
      this.index = null;
      this.forceFeedClearRequired = true;
      this.childMeasures = new WeakMap();
      this.placeholder.setState("hidden");
      this._addNegativeMarginToLastChild();
      this.updateChildTranslations();
    }
  }


  _addNegativeMarginToLastChild() {
    if (this.el.children.length === 0) return;
    let lastChildEl = this.el.children[this.el.children.length - 1];
    let lastChildStyle = getComputedStyle(lastChildEl);
    let newMargin = parseInt(lastChildStyle[this.directionProperties.endMargin], 10) - this.placeholder.outerSize[this.directionProperties.index];
    lastChildEl.style[this.directionProperties.endMargin] = newMargin + 'px';
  }


  _removeNegativeMarginFromLastChild() {
    if (this.el.children.length === 0) return;
    let lastChildEl = this.el.children[this.el.children.length - 1];
    lastChildEl.style[this.directionProperties.endMargin] = '';
  }


  finalizeDrop(draggable) {
    this.clearChildTransforms();
    this.el.insertBefore(this.placeholder.el, this.siblingEls[this.index]);
    this.placeholder.dispose(this.drag.action === 'copy');
    this.placeholder = null;
  }


  getChildMeasure(el) {
    let measure = this.childMeasures.get(el);
    if (!measure) {
      measure = {
        offset: el[this.directionProperties.layoutOffset] - parseInt(this.style[this.directionProperties.paddingStart], 10),
        measure: dom[this.directionProperties.outerDimension](el, true),
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
        this.updateChildTranslations();
      }
      return;
    }

    this._removeNegativeMarginFromLastChild()

    const bounds = this.el.getBoundingClientRect();
    // calculate the position of the item relative to this container
    const innerXY = [xy[0] - bounds.left + this.el.scrollLeft - parseInt(this.style.paddingLeft, 10),
                     xy[1] - bounds.top  + this.el.scrollTop  - parseInt(this.style.paddingTop, 10)];
    const adjustedXY = [innerXY[0] - this.drag.helper.grip[0] * this.drag.helper.size[0],
                        innerXY[1] - this.drag.helper.grip[1] * this.drag.helper.size[1]];

    let naturalOffset = 0;
    let newIndex = 0;
    do {
      let measure = this.getChildMeasure(this.siblingEls[newIndex]);
      if (adjustedXY[this.directionProperties.index] < naturalOffset + measure.measure / 2) break;
      naturalOffset += measure.measure;
      newIndex++;
    }
    while (newIndex < this.siblingEls.length);

    if (this.index !== newIndex) {
      this.index = newIndex;
      this.updateChildTranslations();
    }
  }


  updateChildTranslations() {
    let offset = 0;
    let placeholderOffset = null;

    this.siblingEls.forEach(function (el, index) {
      if (this.placeholder.outerSize[this.directionProperties.index] === 0) {
        debugger
      }

      if (index === this.index) {
        placeholderOffset = offset;
        offset += this.placeholder.outerSize[this.directionProperties.index];
        console.log(this.placeholder.outerSize)
      }
      let measure = this.getChildMeasure(el);
      let newTranslation = offset - measure.offset
      if (measure.translation !== newTranslation || this.forceFeedClearRequired) {
        measure.translation = newTranslation;
        let props = this.forceFeedClearRequired
                  ? { [this.directionProperties.translate]: [measure.translation, Math.random() / 100] }
                  : { [this.directionProperties.translate]: measure.translation + Math.random() / 100 };
        animation.set(el, props, this.drag.options.reorderAnimation);
      }
      offset += measure.measure;
    }.bind(this));

    if (placeholderOffset === null)  placeholderOffset = offset;
    let placeholderMeasure = this.getChildMeasure(this.placeholder.el);
    let newPlaceholderTranslation = placeholderOffset - placeholderMeasure.offset;
    if (placeholderMeasure.translation !== newPlaceholderTranslation || this.forceFeedCleanRequired) {
      animation.set(this.placeholder.el, { [this.directionProperties.translate]: newPlaceholderTranslation });
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
