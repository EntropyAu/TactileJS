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
    this.childEls = [];
    this.placeholderIndex = 0;
    this.style = null;
    this.initialize();
  }


  initialize() {
    this.style = getComputedStyle(this.el);
    this.direction = this.el.getAttribute('data-drag-sortable') || 'vertical';
    this.childEls = Array.prototype.splice.call(this.el.children, 0);

    // remove the draggable element from the child array
    let draggableElIndex = this.childEls.indexOf(this.drag.draggable.el);
    if (draggableElIndex !== -1) {
      this.childEls.splice(draggableElIndex, 1);
      this.index = draggableElIndex;
    }
  }


  updatePosition(xy) {
    if (this.childEls.length === 0) return this.index = 0;

    // we'll use selection APIs rather than elementAtPoint,
    // as it returns the closest sibling to the area being selected
    // TODO - do performance comparison between "viaSelection" and normal elementFromPoint
    // find the closest direct descendant of this sortable container
    let closestEl = dom.elementFromPointViaSelection(xy);
    while (closestEl && this.childEls.indexOf(closestEl) === -1) {
      closestEl = closestEl.parentElement;
    }

    if (closestEl) {
      if (this.placeholder && closestEl === this.placeholder.el) return;
      this.index = this.childEls.indexOf(closestEl);
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
  }


  //var end = new Date();
  //var start = new Date();
  //if (new Date() % 100 === 0) document.querySelector(".header.item").innerHTML = "<p>" + (end - start) + "ms</p>";

  insertPlaceholder(originalEl) {
    if (!this.placeholder) {
      this.placeholder = new Placeholder(this.drag, originalEl);
      if (!originalEl) this.el.appendChild(this.placeholder.el);
      this.placeholderIndex = dom.indexOf(this.placeholder.el);
    }
    this.el.setAttribute('data-drag-animate', '');
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
    this.placeholderSizeWithMargins = this.placeholder.sizeWithMargins;
    this.placeholderScale = this.placeholder.scale;
    this.placeholder.show();
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
    this.placeholder.hide();
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
    // initialize the expected offset to the padding value
    let expectedOffset = 0;
    if (this.childEls.length > 0) expectedOffset = (this.direction === 'vertical' ? parseInt(this.style.paddingTop) : parseInt(this.style.paddingLeft));

    let placeholderOffset = null;
    this.childEls.forEach(function(el, index) {
      if (index === this.index && this.placeholder.visible) {
        // leave room for the placeholder
        placeholderOffset = expectedOffset;
        expectedOffset += this.direction === 'vertical' ? this.placeholderSizeWithMargins[1] : this.placeholderSizeWithMargins[0];
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
  }

  clearChildTranslations() {
    this.childEls.forEach(function(el) {
      el.style.webkitTransform = '';
      el.style.transform = '';
    });
  }


  finalizeDrop(draggable) {
    this.el.removeAttribute('data-drag-animate');
    draggable.clean();
    this.el.insertBefore(draggable.el, this.childEls[this.index]);
    this.clearChildTranslations();
  }

  dispose() {
    this.clearChildTranslations();
    if (this.placeholder) this.placeholder.dispose();
    super();
  }
}