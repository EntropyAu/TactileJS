import Container from './Container.js';
import ContainerFactory from './ContainerFactory.js';
import Helper from './Helper.js';
import * as events from './lib/events.js';
import * as math from './lib/math.js';
import * as dom from './lib/dom.js';

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

    this.initialize();
  }


  initialize() {
    this.helper = new Helper(this);
    this.pointerEl = dom.elementFromPoint(this.pointerXY);
    this.draggable.removeOriginal();
    this.updateConstrainedPosition();
    this.helper.setPosition(this.constrainedXY);
    this.updateTargetContainer();
    if (this.target) {
      this.target.setPointerXY(this.constrainedXY);
      this.target.updatePlaceholder();
    }
    events.raiseEvent(this.draggable.el, 'dragstart', this)
  }


  move(pointerXY) {
    this.pointerXY = pointerXY;

    this.updateConstrainedPosition();
    this.helper.setPosition(this.constrainedXY);

    function asyncTargetUpdate() {
      this.pointerEl = dom.elementFromPoint(pointerXY);
      this.updateTargetContainer();
      if (this.target) {
        this.target.setPointerXY(this.constrainedXY);
        this.target.updatePlaceholder();
      }
      events.raiseEvent(this.draggable.el, 'drag', this);
    }
    setTimeout(asyncTargetUpdate.bind(this), 0);
    //scroll.autoScroll(drag);
  }


  end() {
    if (this.target) this.drop(); else this.cancel();
    events.raiseEvent(this.draggable.el, 'dragend', this)
    this.dispose()
  }


  drop() {
    events.raiseEvent(this.draggable.el, 'drop', this)

    let placeholderRect = this.target.placeholder.el.getBoundingClientRect();
    this.helper.animateToRect(placeholderRect, function() {});
  }

  cancel() {
    this.draggable.restoreOriginal();
  }

  dispose() {
    if (this.target) this.target.dragLeave();

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
    if (this.target && this.target.contains(this.draggable)) {
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

  updateTargetContainer() {
    let containerEl = ContainerFactory.closest(this.pointerEl);
    if (containerEl === (this.target ? this.target.el : null)) return;
    let container = ContainerFactory.makeContainer(containerEl, this);

    if (this.target) this._leaveTarget(this.target);
    if (container && container.accepts(this.draggable)) this._enterTarget(container);
  }

  _leaveTarget(container) {
    container.dragLeave();
    events.raiseEvent(container.el, 'dragleave', this);
    this.target = null;
  }

  _enterTarget(container) {
    container.dragEnter();
    events.raiseEvent(container.el, 'dragenter', this);
    this.helper.setSizeAndScale(
      container.placeholderSize,
      container.placeholderScale);
    this.target = container;
  }
}
