import * as dom from "./lib/dom.js";

export default class Container {

  static matches(el) {
    return el ? el.matches(this.selector) : false;
  }

  constructor(el, drag) {
    this.el = el;
    this.drag = drag;
    this.placeholder = null;
    this.placeholderSize = null;
    this.placeholderScale = 1;
    this.options = drag.options;
    this.dragOutAction = null;
    this.acceptsTags = [];
    this.initialize();
  }

  initialize() {
    this.dragOutAction = this.el.getAttribute('data-drag-out-action') || 'move';
    this.initializeAcceptsTags();
  }

  setPointerXY(constrainedXY) {
    this.updatePosition(constrainedXY)
  }

  initializeAcceptsTags() {
    if (!this.el.hasAttribute('data-drag-accepts')) {
      // by default, a container accepts the tag of items it contains
      this.acceptsTags = (this.el.getAttribute('data-drag-tag') || '').split(' ');
    } else {
      // however this can be overwritten by an explicit accepts attribute
      this.acceptsTags = (this.el.getAttribute('data-drag-accepts') || '').split(' ');
    }
  }

  accepts(draggable) {
    // a container always accepts it's own draggable children back
    if (draggable.originalParentEl === this.el) return true;
    if (this.el.hasAttribute('data-drag-disabled')) return false;

    if (this.acceptsTags.indexOf('*') !== -1) return true;

    for (let tag of draggable.tags) {
      if (this.acceptsTags.indexOf(tag) !== -1) return true;
    }
    return false;
  }

  captures(draggable) {
    if (this.el.hasAttribute('data-drag-capture')) return true;
    if (draggable.el.hasAttribute('data-drag-containment')) {
      let containmentSelector = draggable.el.getAttribute('data-drag-containment');
      return containmentSelector ? this.el.matches(containmentSelector) : true;
    }
    if (this.el.hasAttribute('data-drag-containment')) {
      let containmentSelector = this.el.getAttribute('data-drag-containment');
      return containmentSelector ? draggable.el.matches(containmentSelector) : true;
    }
    return false;
  }

  enter() { }
  leave() { }
  dispose() {}
}
