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
// TODO: Animated destroy (drop elsewhere)
// TODO: Animated pickup

// TODO: Scroll only if scrollable is an ancestor of the target element
// TODO: Scroll does not propagate if target element is constrained

// TODO: Scroll slow down as you approach extremity
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
    this.knownTargets = new WeakMap();
    this.revertOnCancel = true;

    this.initialize();
  }


  initialize() {
    this.helper = new Helper(this);
    this.updateConstrainedPosition();
    this.pointerEl = dom.elementFromPoint(this.pointerXY);
    this.updateTargetContainer(true);
    events.raiseEvent(this.draggable.el, 'dragstart', this)
  }


  move(pointerXY) {
    this.pointerXY = pointerXY;
    this.updateConstrainedPosition();

    if (!this.scroller || !this.scroller.updateVelocity(this.pointerXY)) {
      this.pointerEl = dom.elementFromPoint(pointerXY);
      this.updateTargetContainer();
      if (this.target) this.target.setPointerXY(this.constrainedXY);
      events.raiseEvent(this.draggable.el, 'drag', this);
      this.updateScroll();
    }
    this.helper.setPosition(this.constrainedXY);

  }


  updateScroll() {
    this.scroller = false;
    var scrollEls = dom.ancestors(this.pointerEl, Scrollable.selector);
    scrollEls.every(function(scrollEl) {
      let scrollable = new Scrollable(this, scrollEl);
      if (scrollable.tryScroll(this.pointerXY)) {
        this.scroller = scrollable;
        return false;
      }
      return true;
    }.bind(this));
  }


  end() {
    if (this.target) this.drop(); else this.cancel();
    if (this.scroller) this.scroller.cancelScroll();
    events.raiseEvent(this.draggable.el, 'dragend', this)
    this.dispose()
  }


  drop() {
    events.raiseEvent(this.draggable.el, 'drop', this)
    let placeholderRect = this.target.placeholder.el.getBoundingClientRect();
    this.helper.animateToRect(placeholderRect, function() {
      this.target.dropDraggable(this.draggable);
    }.bind(this));
  }

  cancel() {
    this.draggable.restoreOriginal();
  }

  dispose() {
    if (this.target) {
      this.target.el.classList.remove('dd-drag-over');
    }

    this.helper.dispose();
    this.helper = null;
  }


  applyDirectionConstraint(drag) {
    switch (drag.orientation) {
      case "vertical": adjustedX = drag.originalOffsetLeft; break;
      case "horizontal": adjustedY = drag.originalOffsetTop; break;
      case "both": break;
    }
  }


  updateConstrainedPosition() {
    if (this.target && this.target.captures(this.draggable)) {
      let constrained = [this.pointerXY[0] - this.helper.gripOffset[0] * this.helper.size[0],
                         this.pointerXY[1] - this.helper.gripOffset[1] * this.helper.size[1]];
      let rect = this.target.el.getBoundingClientRect();
      constrained[0] = math.coerce(constrained[0], rect.left, rect.right - this.helper.size[0]);
      constrained[1] = math.coerce(constrained[1], rect.top, rect.bottom - this.helper.size[1]);
      this.constrainedXY = [constrained[0] + this.helper.gripOffset[0] * this.helper.size[0],
                            constrained[1] + this.helper.gripOffset[1] * this.helper.size[1]];
    } else {
      this.constrainedXY = this.pointerXY;
    }
  }

  updateTargetContainer(removeOriginal = false) {
    if (this.target && this.target.captures(this.draggable)) return;
    let placeholderEl = Placeholder.closest(this.pointerEl);
    let containerEl = ContainerFactory.closest(placeholderEl ? placeholderEl.parentElement : this.pointerEl);
    if (containerEl === (this.target ? this.target.el : null)) return;

    if (this.target) this._leaveTarget(this.target);

    if (containerEl) {
      let container = this.knownTargets.get(containerEl);
      if (!container) {
        container = ContainerFactory.makeContainer(containerEl, this);
        this.knownTargets.set(containerEl, container);
      }
      if (container.accepts(this.draggable)) this._enterTarget(container, removeOriginal);
    }
  }

  _enterTarget(container, removeOriginal) {
    container.updatePosition(this.constrainedXY)
    container.insertPlaceholder(removeOriginal ? this.draggable.el : null);
    events.raiseEvent(container.el, 'dragenter', this);
    if (this.options.helperResize) {
      this.helper.setSizeAndScale(
        container.placeholderSize,
        container.placeholderScale);
    }
    container.el.classList.add(this.options.containerHoverClass);
    this.target = container;
  }

  _leaveTarget(container) {
    container.removePlaceholder();
    events.raiseEvent(container.el, 'dragleave', this);
    container.el.classList.remove(this.options.containerHoverClass);
    this.target = null;
  }
}
