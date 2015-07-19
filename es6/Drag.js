import Cache from './Cache.js';
import Container from './Container.js';
import ContainerFactory from './ContainerFactory.js';
import Helper from './Helper.js';
import Placeholder from './Placeholder.js';
import Scrollable from './Scrollable.js';
import Fence from './Fence.js';
import * as events from './lib/events.js';
import * as math from './lib/math.js';
import * as dom from './lib/dom.js';
import * as rect from './lib/rect.js';

// TODO: Animated destroy (_beginDrop elsewhere)
// TODO: Event properties
// TODO: Fade helper when drop will cancel

// TODO: Fix scaling behaviour
// TODO: Scroll adjust scroll maxV based on number of items
// TODO: Scroll trigger placeholder update when scroll stops
// TODO: Copy behaviour

export default class Drag {
  constructor(draggable, xy, options) {
    this.options = options;
    this.xy = xy;
    this.pointerEl = null;

    this.helper = new Helper(this, draggable);
    this.draggable = draggable;
    this.source = null;
    this.target = null;
    this.fence = null;
    this.action = null;
    this.copy = false;

    this.cache = new Cache();
    this.revertPosition = "last"; // "remove", "last"
    this._knownTargets = new Map();
    this._start(xy);
  }


  _start(xy) {
    this.pointerEl = dom.elementFromPoint(xy);
    this._updateTarget();
    this.source = this.target;
    this.fence = Fence.closestForDraggable(this, this.draggable);
    events.raiseEvent(this.draggable.el, 'dragstart', this)
  }


  move(xy) {
    this.xy = this.fence ? this.fence.getConstrainedXY(xy) : xy;

    if (!this.scroller || !this.scroller._updateVelocity(this.xy)) {
      this.pointerEl = dom.elementFromPoint(this.xy);
      this._updateTarget();
      // check first to see if the we are in the target bounds
      // note this would be calling for the second time.. FIX THIS
      if (this.target && rect.contains(this.target.el.getBoundingClientRect(), this.xy)) {
        this.target.updatePosition(this.xy);
      }
      this._checkForScrolling(this.xy);
      events.raiseEvent(this.draggable.el, 'drag', this);
    }
    this.helper.setPosition(this.xy);
  }


  end() {
    if (this.target) this._beginDrop(); else this._beginCancel();
    if (this.scroller) this.scroller.stopScroll();
    events.raiseEvent(this.draggable.el, 'dragend', this)
  }


  dispose() {
    this._knownTargets.forEach((t) => t.dispose());
    this.helper.dispose();
    this.cache.dispose();
  }


  _checkForScrolling(xy) {
    this.scroller = false;
    var scrollEls = dom.ancestors(this.target ? this.target.el : document.body, Scrollable.selector);
    scrollEls.every(function(scrollEl) {
      let scrollable = new Scrollable(this, scrollEl);
      if (scrollable.tryScroll(xy)) {
        this.scroller = scrollable;
        return false;
      }
      return true;
    }.bind(this));
  }


  _beginDrop() {
    events.raiseEvent(this.draggable.el, 'beginDrop', this)
    if (this.target.placeholder && (this.action === 'copy' || this.action === 'move')) {
      this.helper.animateToElementAndPutDown(this.target.placeholder.el, function() {
        requestAnimationFrame(function() {
          this.target.finalizeDrop(this.draggable);
          this.dispose();
        }.bind(this));
      }.bind(this));
    }
    if (this.action === 'delete') {
      this.helper.animateDelete(function() {
        this.dispose();
      }.bind(this));
    }
  }


  _beginCancel() {
    this.draggable.finalizeRevert();
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


  _updateTarget() {
    const oldTarget = this.target;
    let newTarget = this.source && this.source.leaveAction === 'delete'
                  ? null
                  : this._findAcceptingTarget(this.pointerEl);
    if (newTarget === oldTarget) return;

    if (newTarget || this.revertPosition !== 'last') {
      if (oldTarget) this._leaveTarget(oldTarget);
      if (newTarget) this._enterTarget(newTarget);
      let [action, copy] = this._computeAction(this.source, newTarget);
      this._setAction(action, copy);
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
    let container = this._knownTargets.get(el);
    if (!container) {
      container = ContainerFactory.makeContainer(el, this);
      this._knownTargets.set(el, container);
    }
    return container;
  }


  _enterTarget(container) {
    if (events.raiseEvent(container.el, 'dragenter', this)) {
      container.updatePosition(this.xy);
      container.enter();
      if (container.placeholderSize && this.options.helperResize) {
        this.helper.setSizeAndScale(
          container.placeholderSize,
          container.placeholderScale);
      }
      this.target = container;
    }
  }


  // SOURCE | TARGET | ACTION | DRAGGABLE
  // NULL   | NULL   | revert | original
  // NULL   | move   | move   | original
  // NULL   | copy   | copy   | copy
  // NULL   | delete | delete | original
  // move   | NULL   | revert | original
  // move   | move   | move   | original
  // move   | copy   | copy   | copy
  // move   | delete | delete | original
  // copy   | NULL   | delete | copy
  // copy   | move   | copy   | copy
  // copy   | copy   | copy   | copy
  // copy   | delete | delete | copy
  // delete | *      | delete | original
  _computeAction(source, target) {
    if (source === target) return ['move', 'original'];
    let [action, copy] = ['move', false];
    const leave = this.source ? this.source.leaveAction : 'move';
    const enter = this.target ? this.target.enterAction : 'revert';
    if (leave === 'copy' || enter === 'copy') {
      action = 'copy';
      copy = true;
    }
    if (enter === 'revert') action = 'revert';
    if (leave === 'delete' || enter === 'delete') action = 'delete';
    return [action, copy];
  }


  _setAction(action, copy) {
    if (this.action === action) return;
    this.helper.setAction(action);
    this.action = action;
    this.copy = copy;
  }


  _leaveTarget(container) {
    if (events.raiseEvent(container.el, 'dragleave', this)) {
      container.leave();
      this.target = null;
    }
  }
}
