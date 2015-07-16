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
    this.initializeSortable();
  }


  initializeSortable() {
    this.style = getComputedStyle(this.el);
    this.direction = this.el.getAttribute('data-drag-sortable') || 'vertical';
    this.initializeSiblingEls();
    this.initializePlaceholder();
  }


  initializePlaceholder() {
    if (this.drag.draggable.originalParentEl === this.el) {
      this.placeholder = new Placeholder(this.drag, this.drag.draggable.el);
    } else {
      this.placeholder = new Placeholder(this.drag);
      this.el.appendChild(this.placeholder.el);
    }
    this.placeholder.setState("hidden");
  }


  initializeSiblingEls() {
    this.siblingEls = this.childEls = Array.prototype.splice.call(this.el.children, 0);
    let draggableElIndex = this.siblingEls.indexOf(this.drag.draggable.el);
    if (draggableElIndex !== -1) {
      this.siblingEls.splice(draggableElIndex, 1);
      this.index = draggableElIndex;
    }
  }


  enter() {
    this.placeholder.setState("ghosted");
    this.placeholderSize = this.placeholder.size;
    this.placeholderScale = this.placeholder.scale;
    this.childMeasures = new WeakMap();
    this.updateChildTranslations(true);
  }

  leave() {
    if (this.dragOutAction === 'copy' && this.placeholder.isDraggableEl) {
      this.placeholder.setState("materialized");
    } else {
      this.index = null;
      this.placeholder.setState("hidden");
      this.childMeasures = new WeakMap();
      this.updateChildTranslations();
    }
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
        offset: el.offsetTop - parseInt(this.style.paddingTop, 10),
        measure: this.direction === "vertical" ? dom.outerHeight(el, true) : dom.outerWidth(el, true),
        translation: null
      };
      this.childMeasures.set(el, measure);
    }
    return measure;
  }


  updatePosition(xy) {
    // if it's empty, answer is simple
    if (this.siblingEls.length === 0) return this.index = 0;

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
      if (adjustedXY[1] < naturalOffset + measure.measure / 2) break;
      naturalOffset += measure.measure;
      newIndex++;
    }
    while (newIndex < this.childEls.length)
    if (this.index !== newIndex) {
      this.index = newIndex;
      this.updateChildTranslations();
    }
  }



  updateChildTranslations(firstTime = false) {
    let offset = 0;
    let placeholderOffset = null;
    this.siblingEls.forEach(function (el, index) {
      if (index === this.index) {
        placeholderOffset = offset;
        offset += this.placeholder.outerSize[1];
      }
      let measure = this.getChildMeasure(el);
      let newTranslation = offset - measure.offset
      if (measure.translation !== newTranslation || firstTime) {
        measure.translation = newTranslation;
        let props = firstTime
                  ? { translateX: [0, 0], translateY: [measure.translation, 0] }
                  : { translateX: 0, translateY: measure.translation };
        animation.set(el, props, this.drag.options.reorderAnimation);
      }
      offset += measure.measure;
    }.bind(this));
    if (placeholderOffset === null)  placeholderOffset = offset;
    let placeholderMeasure = this.getChildMeasure(this.placeholder.el);
    let newPlaceholderTranslation = placeholderOffset - placeholderMeasure.offset;
    if (placeholderMeasure.translation !== newPlaceholderTranslation || firstTime) {
      animation.set(this.placeholder.el, { translateX: 0, translateY: newPlaceholderTranslation });
      placeholderMeasure.translation = newPlaceholderTranslation;
    }
  }

  clearChildTransforms() {
    // synchronously clear the transform styles (rather than calling
    // velocity.js) to avoid flickering when the dom elements are reordered
    this.siblingEls.forEach(function(el) {
      el.style.transform = '';
      el.style.msTransform = '';
      el.style.mozTransform = '';
      el.style.webkitTransform = '';
    });
  }

  dispose() {
    this.clearChildTransforms();
    console.log("dispose")
    if (this.placeholder) this.placeholder.dispose()
    super();
  }
}
