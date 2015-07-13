export function animateDomMutation(el, mutationFunction, options) {
  const startIndex = options.startIndex || 0;
  const endIndex   = Math.min(options.endIndex || el.children.length,
                              startIndex + options.maxElementsToAnimate);
  const easing     = options.easing     || 'ease-in-out';
  const duration   = options.duration   || 400;
  let originalStyleHeight = null,
      originalStyleWidth = null,
      oldSize = null,
      newSize = null;

  const oldOffsets = childOffsetMap(el, startIndex, endIndex);
  if (options.animateParentSize) {
    originalStyleHeight = '';
    originalStyleWidth = '';
    el.style.width = '';
    el.style.height = '';
    oldSize = [el.offsetWidth, el.offsetHeight];
  }
  mutationFunction();
  const newOffsets = childOffsetMap(el, startIndex, endIndex);
  if (options.animateParentSize) {
    newSize = [el.offsetWidth, el.offsetHeight];
  }

  animateBetweenOffsets(
    el,
    oldOffsets,
    newOffsets,
    startIndex,
    endIndex,
    duration,
    easing);

  if (options.animateParentSize) {
    animateSize(
      el,
      oldSize,
      newSize,
      originalStyleWidth,
      originalStyleHeight,
      duration,
      easing);
  }
}

function animateSize(el, oldSize, newSize, originalStyleWidth, originalStyleHeight, duration, easing) {
  function onComplete() {
    console.log("COMPLETE")
    el.style.width = originalStyleWidth;
    el.style.height = originalStyleHeight;
  }
  Velocity(el, {
    width: [newSize[0], oldSize[0]],
    height: [newSize[1], oldSize[1]],
  }, {
    duration: duration,
    easing: easing,
    queue: false,
    complete: onComplete
  });
}


function animateBetweenOffsets(el, oldOffsets, newOffsets, startIndex, endIndex, duration, easing) {
  for (let i = startIndex; i < endIndex + 1; i++) {
    let childEl = el.children[i];
    if (!childEl) continue;

    //if (childEl.matches('[data-drag-placeholder]')) continue;

    let oldOffset = oldOffsets.get(childEl);
    let newOffset = newOffsets.get(childEl);
    if (!oldOffset || !newOffset || (oldOffset[0] === newOffset[0] && oldOffset[1] === newOffset[1]))
      continue;

    // the following line makes the animations smoother in safari
    //childEl.style.webkitTransform = 'translate3d(0,' + (oldOffset.top - newOffset.top) + 'px,0)';

    Velocity(childEl, {
      translateX: '+=' + (oldOffset[0] - newOffset[0]) + 'px',
      translateY: '+=' + (oldOffset[1] - newOffset[1]) + 'px',
      translateZ: 0
    }, { duration: 0 });

    Velocity(childEl, {
      translateX: 0,
      translateY: 0
    }, {
      duration: duration,
      easing: easing,
      queue: false
    });
  }
}


function childOffsetMap(el, startIndex, endIndex) {
  const map = new Map();
  for (let i = startIndex; i < endIndex; i++) {
    let childEl = el.children[i];
    if (childEl) map.set(childEl, [childEl.offsetLeft, childEl.offsetTop]);
  }
  return map;
}
