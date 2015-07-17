import Container from './Container.js';
import ContainerFactory from './ContainerFactory.js';
import Helper from './Helper.js';
import Placeholder from './Placeholder.js';
import Scrollable from './Scrollable.js';
import * as events from './lib/events.js';
import * as math from './lib/math.js';
import * as dom from './lib/dom.js';


// TODO: Animated revert
// TODO: Animated resize
// TODO: Animated destroy (_beginDrop elsewhere)
// TODO: Animated pickUp

// TODO: Scroll only if scrollable is an ancestor of the target element
// TODO: Scroll does not propagate if target element is tl
// TODO: Scroll adjust scroll maxV based on number of items
// TODO: Scroll trigger placeholder update when scroll stops
// TODO: Copy behaviour

export default class Drag {
  constructor(draggable, pointerXY, options) {
    this.options = options;
    this.pointerXY = pointerXY;
    this.constrainedXY = null;
    this.pointerEl = null;
    this.helper = null;
    this.draggable = draggable;
    this.target = null;
    this.source = null;
    this.revertOnCancel = true;
    this.dropAction = "move"; // "copy"
    this.cancelAction = "last"; // "remove", "last"

    this._knownContainers = new Map();
    this._start();
  }


  move(pointerXY) {
    this.pointerXY = pointerXY;
    this._updateConstrainedPosition();

    if (!this.scroller || !this.scroller.updateVelocity(this.pointerXY)) {
      this.pointerEl = dom.elementFromPoint(pointerXY);
      if (!this.target || !this.target.willCapture(this.draggable))
        this._updateTarget();
      // check first to see if the we are in the target bounds
      if (this.target) this.target.updatePosition(this.constrainedXY);
      this._checkForScrolling();
      events.raiseEvent(this.draggable.el, 'drag', this);
    }
    this.helper.setPosition(this.constrainedXY);
  }


  end() {
    if (this.target) this._beginDrop(); else this._beginCancel();
    if (this.scroller) this.scroller.stopScroll();
    events.raiseEvent(this.draggable.el, 'dragend', this)
  }


  dispose() {
    this._knownContainers.forEach((t) => t.dispose());
    this.helper.dispose();
    this.helper = null;
  }


  _checkForScrolling() {
    this.scroller = false;
    var scrollEls = dom.ancestors(this.target ? this.target.el : document.body, Scrollable.selector);
    scrollEls.every(function(scrollEl) {
      let scrollable = new Scrollable(this, scrollEl);
      if (scrollable.tryScroll(this.pointerXY)) {
        this.scroller = scrollable;
        return false;
      }
      return true;
    }.bind(this));
  }


  _beginDrop() {
    events.raiseEvent(this.draggable.el, 'beginDrop', this)
    if (this.target.placeholder) {
      this.helper.animateToElementAndPutDown(this.target.placeholder.el, function() {
        requestAnimationFrame(function() {
          this.target.finalizeDrop(this.draggable);
          this.dispose();
        }.bind(this));
      }.bind(this));
    }
  }


  _beginCancel() {
    this.draggable.restoreOriginal();
    // restore draggable to original position
    this.dispose();
  }


  _applyDirectionConstraint(drag) {
    switch (drag.orientation) {
      case "vertical": adjustedX = drag.originalOffsetLeft; break;
      case "horizontal": adjustedY = drag.originalOffsetTop; break;
      case "both": break;
    }
  }


  _updateConstrainedPosition() {
    const grip = this.helper.grip;
    const size = this.helper.size;

    if (this.target && this.target.willCapture(this.draggable)) {
      let tl = [this.pointerXY[0] - grip[0] * size[0],
                this.pointerXY[1] - grip[1] * size[1]];
      let rect = dom.getPaddingClientRect(this.target.el);
      tl[0] = math.coerce(tl[0], rect.left, rect.right - size[0]);
      tl[1] = math.coerce(tl[1], rect.top, rect.bottom - size[1]);
      this.constrainedXY = [tl[0] + grip[0] * size[0],
                            tl[1] + grip[1] * size[1]];
    } else {
      this.constrainedXY = this.pointerXY;
    }
  }


  _updateTarget() {
    const oldTarget = this.target;
    let newTarget = this._findAcceptingTarget(this.pointerEl);
    if (newTarget === oldTarget) return;

    if (newTarget || this.cancelAction !== 'last') {
      if (oldTarget) this._leaveTarget(oldTarget);
      if (newTarget) this._enterTarget(newTarget);
    }
  }


  _findAcceptingTarget(el) {
    let targetEl = ContainerFactory.closest(el);
    while (targetEl) {
      let target = this._getContainer(targetEl);
      if (target.willAccept(this.draggable)) return target;
      targetEl = ContainerFactory.closest(targetEl.parentElement);
    }
    return null;
  }


  _getContainer(el) {
    let container = this._knownContainers.get(el);
    if (!container) {
      container = ContainerFactory.makeContainer(el, this);
      this._knownContainers.set(el, container);
    }
    return container;
  }


  _enterTarget(container) {
    if (events.raiseEvent(container.el, 'dragenter', this)) {
      container.updatePosition(this.constrainedXY);
      container.enter();
      if (container.placeholderSize && this.options.helperResize) {
        this.helper.setSizeAndScale(
          container.placeholderSize,
          container.placeholderScale);
      }
      this.target = container;
    }
  }


  _leaveTarget(container) {
    if (events.raiseEvent(container.el, 'dragleave', this)) {
      container.leave();
      this.target = null;
    }
  }


  _start() {
    this.helper = new Helper(this);
    this._updateConstrainedPosition();
    this.pointerEl = dom.elementFromPoint(this.pointerXY);
    this._updateTarget();
    events.raiseEvent(this.draggable.el, 'dragstart', this)
  }
}
