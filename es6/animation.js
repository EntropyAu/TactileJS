import * as constants from "./constants.js";

export function animateElementsBetweenSavedOffsets(context, el, hints) {
  let animatedItemCount = 0;
  for (let childEl of el.children) {
    if (childEl.matches(constants.placeholderSelector)) continue;

    let [oldOffset, newOffset] = [childEl._old, childEl._new];
    if (!oldOffset || !newOffset || (oldOffset.top === newOffset.top && oldOffset.left === newOffset.left)) continue;

    if (++animatedItemCount > hints.animatedElementLimit) break;

    // the following line makes the animations smoother in safari
    //childEl.style.webkitTransform = 'translate3d(0,' + (oldOffset.top - newOffset.top) + 'px,0)';

    Velocity(childEl, {
      translateX: '+=' + (oldOffset.left - newOffset.left) + 'px',
      translateY: '+=' + (oldOffset.top - newOffset.top) + 'px',
      translateZ: 1
    }, { duration: 0 });

    Velocity(childEl, {
      translateX: 0,
      translateY: 0
    }, {
      duration: context.options.duration,
      easing: context.options.easing,
      queue: false
    });
  }
}
