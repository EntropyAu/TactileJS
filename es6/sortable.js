import * as constants from "./constants.js";
import * as helpers from "./helpers.js";

export function isSortable(el) {
  return el && el.matches(constants.sortableSelector);
}


// TODO: optimisation, cache layout offsets
// TODO: optimisation, check immediate neighbours prior to binary search
// TODO: pay attention to
export function updateIndex(context) {
  let direction = context.parentEl.getAttribute(constants.sortableAttribute) || 'vertical';

  if (context.parentEl.children.length === 0) {
    context.parentIndex = 0;
    return;
  }

  let offsetParent = null
  for (let i = 0; i < context.parentEl.children.length; i++) {
    let childEl = context.parentEl.children[i];
    offsetParent = childEl.offsetParent;
    if (offsetParent !== null) break;
  }
  let offsetParentRect = offsetParent.getBoundingClientRect();
  let offsetPointerX = context.constrainedX - offsetParentRect.left + offsetParent.scrollLeft;
  let offsetPointerY = context.constrainedY - offsetParentRect.top + offsetParent.scrollTop;

  let newIndex = null;
  switch (direction) {
    case 'horizontal':
      newIndex = helpers.fuzzyBinarySearch(
        context.parentEl.children,
        offsetPointerX,
        el => el.offsetLeft + el.offsetWidth / 2);
      break;
    case 'vertical':
      newIndex = helpers.fuzzyBinarySearch(
        context.parentEl.children,
        offsetPointerY,
        el => el.offsetTop + el.offsetHeight / 2);
      break;
    case 'wrap':
      throw new Error("Not implemented");
  }
  // the parent index will be based on the set of children INCLUDING the placeholder element we need to compensate
  if (context.placeholderIndex && newIndex > context.placeholderIndex) newIndex++;
  context.parentIndex = newIndex;
}
