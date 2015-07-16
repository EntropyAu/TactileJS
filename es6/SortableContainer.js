import Container from "./Container.js";
import Placeholder from "./Placeholder.js";
import * as dom from "./lib/dom.js";
import * as animation from "./lib/animation.js";

export default class SortableContainer extends Container {

  static get selector() { return '[data-drag-sortable]'; }

  constructor(el, drag) {
    super(el, drag);
    this.index = 0;
    this.direction = 'vertical';
    this.siblingEls = null;
    this.siblingMeasures = new WeakMap();
    this.placeholderIndex = 0;
    this.style = null;
    this.initializeSortable();
  }


  initializeSortable() {
    this.style = getComputedStyle(this.el);
    this.direction = this.el.getAttribute('data-drag-sortable') || 'vertical';
    this.initializePlaceholder();
    this.initializeSiblingEls();
  }


  initializePlaceholder() {
    if (this.drag.draggable.originalParentEl === this.el) {
      this.placeholder = new Placeholder(this.drag, this.drag.draggable.el);
    } else {
      this.placeholder = new Placeholder(this.drag);
      this.el.appendChild(this.placeholder.el);
    }
    this.placeholderIndex = dom.indexOf(this.placeholder.el);
  }


  initializeSiblingEls() {
    this.siblingEls = Array.prototype.splice.call(this.el.children, 0);
    let draggableElIndex = this.siblingEls.indexOf(this.drag.draggable.el);
    if (draggableElIndex !== -1) {
      this.siblingEls.splice(draggableElIndex, 1);
      this.index = draggableElIndex;
    }
    let offset = 0;
    for (let el of this.siblingEls) {
      let measure = this.direction === "vertical" ? dom.outerHeight(el, true) : dom.outerWidth(el, true);
      this.siblingMeasures.set(el, {
        offset: el.offsetTop,
        measure: measure
      });
      offset += measure;
    }
  }


  updatePosition(xy) {
    let localXY = [xy[0] - this.el.scrollLeft,
                   xy[1] - this.el.scrollTop];
    if (this.siblingEls.length === 0) return this.index = 0;
    this.siblingEls.forEach(function(el, index) {
      let measures = this.siblingMeasures.get(el);
      if (xy[1] >= measures.offset && xy[1] <= measures.offset + measures.measure)
        this.index = index;
    }.bind(this));
    /*
    // we'll use selection APIs rather than elementAtPoint,
    // as it returns the closest sibling to the area being selected
    // TODO - do performance comparison between "viaSelection" and normal elementFromPoint
    // find the closest direct descendant of this sortable container
    let closestEl = dom.elementFromPointViaSelection(xy);
    while (closestEl && this.siblingEls.indexOf(closestEl) === -1) {
      closestEl = closestEl.parentElement;
    }

    if (closestEl) {
      if (this.placeholder && closestEl === this.placeholder.el) return;
      this.index = this.siblingEls.indexOf(closestEl);
      let closestRect = closestEl.getBoundingClientRect();
      switch (this.direction) {
        case 'vertical':
          if (xy[1] > closestRect.top + closestRect.height / 2) this.index++;
          break;
        case 'horizontal':
        case 'wrap':
          if (xy[0] > closestRect.left + closestRect.width / 2) this.index++;
          break;
      }
    }
    */
  }


  insertPlaceholder() {
    /*
    function mutation() {
      if (originalEl) originalEl.remove();
      self.el.insertBefore(self.placeholder.el, self.el.children[self.index]);
    }
    if (this.options.animation)
      animation.animateDomMutation(this.el, mutation.bind(this),
      {
        duration: this.options.animation.duration,
        easing: this.options.animation.easing,
        startIndex: this.index,
        elementLimit: this.options.animation.elementLimit,
        animateParentSize: this.options.animation.animateSortableResize
      });
    else mutation();
    */
    this.placeholderSize = this.placeholder.size;
    this.placeholderOuterSize = this.placeholder.outerSize;
    this.placeholderScale = this.placeholder.scale;
    this.placeholder.setState("ghosted");
    this.updateChildOffsets();
  }


  updatePlaceholder() {
    //let newIndex = this.index,
    //    oldIndex = dom.indexOf(this.placeholder.el);
    //if (oldIndex !== newIndex && oldIndex !== newIndex - 1) {
      /*
      let self = this;
      function mutation() {
        //self.el.insertBefore(self.placeholder.el, self.el.children[newIndex]);
      }
      if (this.options.animation)
        animation.animateDomMutation(this.el, mutation,
        {
          duration: this.options.animation.duration,
          easing: this.options.animation.easing,
          startIndex: Math.min(oldIndex, newIndex) - 1,
          endIndex: Math.max(oldIndex, newIndex) + 1,
          elementLimit: this.options.animation.elementLimit
        });
      else mutation();
      */
      this.updateChildOffsets();
  }


  removePlaceholder() {
    // we'll keep the placeholder around in case the user
    // re-enters this sortable container; preventing expensive
    // dom updates later
    this.placeholder.setState("hidden");
    /*
    function mutation() {
      self.placeholder.el.remove();
    }
    if (this.options.animation)
      animation.animateDomMutation(this.el, mutation,
      {
        duration: this.options.animation.duration,
        easing: this.options.animation.easing,
        startIndex: this.index,
        elementLimit: this.options.animation.elementLimit,
        animateParentSize: this.options.animation.animateSortableResize
      });
    else mutation();
    this.placeholder.dispose();
    this.placeholder = null;
    */
    this.index == null;
    this.updateChildOffsets();
  }


  updateChildOffsets() {
    let offset = 0;
    this.siblingEls.forEach(function (el, index) {
      if (index === this.index) offset += this.placeholderOuterSize[1];
      let measures = this.siblingMeasures.get(el);
      let newTranslation = offset - measures.offset
      if (measures.translation !== newTranslation) {
        measures.translation = newTranslation;
        animation.set(el, { translateX: 0, translateY: measures.translation }, this.drag.options.reorderAnimation);
      }
      offset += measures.measure;
    }.bind(this));
    /*
    // initialize the expected offset to the padding value
    let expectedOffset = 0;
    if (this.siblingEls.length > 0) expectedOffset = (this.direction === 'vertical' ? parseInt(this.style.paddingTop) : parseInt(this.style.paddingLeft));

    let placeholderOffset = null;
    this.siblingEls.forEach(function(el, index) {
      if (index === this.index && this.placeholder.visible) {
        // leave room for the placeholder
        placeholderOffset = expectedOffset;
        expectedOffset += this.direction === 'vertical' ? this.placeholderOuterSize[1] : this.placeholderOuterSize[0];
      }
      let offset = expectedOffset - (this.direction === 'vertical' ? el.offsetTop : el.offsetLeft);
      if (el._offset !== offset && !(offset === 0 && el._offset === undefined)) {
        el.style.webkitTransform = this.direction === 'vertical'
                                 ? 'translate(0,' + offset + 'px)'
                                 : 'translate(' + offset + 'px,0)';
        el._offset = offset;
      }
      expectedOffset += this.direction === 'vertical' ? dom.outerHeight(el) : dom.outerWidth(el);
    }.bind(this));
    placeholderOffset = placeholderOffset || expectedOffset;
    let placeholderTranslation = placeholderOffset - (this.direction === 'vertical' ? this.placeholder.el.offsetTop : this.placeholder.el.offsetLeft);
    this.placeholder.el.style.webkitTransform = this.direction === 'vertical'
                                 ? 'translate(0,' + placeholderTranslation + 'px)'
                                 : 'translate(' + placeholderTranslation + 'px,0)';
                                 */
  }

  clearChildTranslations() {
    this.siblingEls.forEach(function(el) {
      animation.set(el, { translateX: 0, translateY: 0 });
    });
  }

  enter() {
    this.insertPlaceholder();
  }

  leave() {
    if (this.dragOutAction === 'copy' && this.placeholder.isDraggableEl) {
      this.placeholder.setState("materialized");
    } else {
      this.placeholder.setState("hidden");
    }
  }

  finalizeDrop(draggable) {
    draggable.clean();
    this.el.insertBefore(this.placeholder.el, this.siblingEls[this.index]);
    this.clearChildTranslations();
  }

  dispose() {
    this.clearChildTranslations();
    if (this.placeholder) this.placeholder.dispose();
    super();
  }
}
