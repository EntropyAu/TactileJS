import Container from "./Container.js";
import Placeholder from "./Placeholder.js";
import * as dom from "./lib/dom.js";
import * as animation from "./lib/animation.js";

export default class SortableContainer extends Container {

  static get selector() { return '[data-drag-sortable]'; }

  constructor(el, drag) {
    super(el, drag);
    this.index = 0;
    this.initialize();
  }

  initialize() {
    this.direction = this.el.getAttribute('data-drag-sortable') || 'vertical';
  }


  updatePosition(constrainedXY) {
    if (this.el.children.length === 0) {
      this.index = 0;
      return;
    }
    let newIndex = this.index;
    // we'll use selection APIs rather than elementAtPoint,
    // as it returns the closest sibling to the area being selected
    let closestChildEl = dom.elementFromPointViaSelection(constrainedXY);
    while (closestChildEl && !dom.isChild(this.el, closestChildEl)) closestChildEl = closestChildEl.parentElement;
    if (closestChildEl) {
      let closestChildRect = closestChildEl.getBoundingClientRect();
      newIndex = dom.indexOf(closestChildEl);

      if (this.direction === 'vertical'
          && constrainedXY[1] > closestChildRect.top + closestChildRect.height / 2)
        newIndex++;
      if ((this.direction === 'wrap' || this.direction === 'horizontal')
          && constrainedXY[0] > closestChildRect.left + closestChildRect.width / 2)
        newIndex++;
    }

    this.index = newIndex;
  }


  insertPlaceholder() {
    this.placeholder = new Placeholder(this.drag);
    let mutation = () => this.el.insertBefore(this.placeholder.el, this.el.children[this.index]);
    if (this.options.animation)
      animation.animateDomMutation(this.el, mutation,
      {
        duration: this.options.animation.duration,
        easing: this.options.animation.easing,
        startIndex: this.index,
        maxElementsToAnimate: this.options.animation.elementLimit,
        animateParentSize: true
      });
    else mutation();
    this.placeholderSize = this.placeholder.size;
    this.placeholderScale = this.placeholder.scale;
  }


  updatePlaceholder() {
    let newIndex = this.index,
        oldIndex = dom.indexOf(this.placeholder.el);
    if (oldIndex !== newIndex && oldIndex !== newIndex - 1) {
      let mutation = () => this.el.insertBefore(this.placeholder.el, this.el.children[newIndex]);
      if (this.options.animation)
        animation.animateDomMutation(this.el, mutation,
        {
          duration: this.options.animation.duration,
          easing: this.options.animation.easing,
          startIndex: Math.min(oldIndex, newIndex) - 1,
          endIndex: Math.max(oldIndex, newIndex) + 1,
          maxElementsToAnimate: this.options.animation.elementLimit
        });
      else mutation();
    }
  }


  removePlaceholder(drag) {
    let mutation = () => this.placeholder.el.remove();
    if (this.options.animation)
      animation.animateDomMutation(this.el, mutation,
      {
        duration: this.options.animation.duration,
        easing: this.options.animation.easing,
        startIndex: this.index,
        maxElementsToAnimate: this.options.animation.elementLimit,
        animateParentSize: true
      });
    else mutation();
    this.placeholder.dispose();
    this.placeholder = null;
  }
}