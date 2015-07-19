function unwrapVelocityPropertyValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function applyStyleProperties(el, properties) {
  const cssProperties = {
    "top": "px",
    "left": "px",
    "opacity": "",
    "width": "px",
    "height": "px"
  };

  for (let property in properties) {
    if (cssProperties[property]) {
      let value = unwrapVelocityPropertyValue(properties[property]);
      el.style[property] = value + cssProperties[property];
    }
  }
}


function applyTransformProperties(el, properties) {
  const transformProperties = {
    "translateX": "px",
    "translateY": "px",
    "scaleX": "",
    "scaleY": "",
    "rotateZ": "deg"
  };

  // follow the same transform order as Velocity.js to ensure consistent results
  const transformOrder = ["translateX","translateY","scaleX","scaleY","rotateZ"];

  // cache the transform values on the element. This avoids us having
  // to parse the transform string when we do a partial update
  let transformHash = el.__tactile_transform || {};
  for (let property in properties) {
    if (transformProperties[property]) {
      let value = unwrapVelocityPropertyValue(properties[property]);
      transformHash[property] = value + transformProperties[property];
    }
  }

  // build the transform string
  let transformValues = [];
  transformOrder.forEach(function(property) {
    if (transformHash[property]) {
      transformValues.push(`${property}(${transformHash[property]})`)
    }
  });
  const value = transformValues.join(' ');

  el.__tactile_transform = transformHash;
  if (el.style.webkitTransform !== undefined) el.style.webkitTransform = value;
  if (el.style.mozTransform !== undefined) el.style.mozTransform = value;
  if (el.style.msTransform !== undefined) el.style.msTransform = value;
  if (el.style.transform !== undefined) el.style.transform = value;
}


export function set(el, target, options = { duration: 0 }, complete = null) {
  if (window["Velocity"]) {
    options.complete = complete;
    options.queue = false;
    Velocity(el, target, options);
  } else {
    applyStyleProperties(el, target);
    applyTransformProperties(el, target);
    if (complete) complete();
  }
}

export function stop(el) {
  if (window["Velocity"]) {
    Velocity(el, 'stop');
  }
}


export function animateDomMutation(el, mutationFunction, options) {
  const startIndex = options.startIndex || 0;
  const endIndex   = Math.min(options.endIndex || el.children.length + 1,
                              startIndex + options.elementLimit);
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
  const map = new WeakMap();
  for (let i = startIndex; i < endIndex; i++) {
    let childEl = el.children[i];
    if (childEl) map.set(childEl, [childEl.offsetLeft, childEl.offsetTop]);
  }
  return map;
}
