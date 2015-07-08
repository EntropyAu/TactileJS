// selectors

export function closest(el, selector) {
  if (el === null) return;
  do { if (el.matches && el.matches(selector)) return el; }
  while (el = el.parentNode)
  return null;
}

// vendor

let vendorTransform = null;
setTimeout(function() {
  if (document.body.style.webkitTransform !== undefined) vendorTransform = 'webkitTransform';
  if (document.body.style.mozTransform !== undefined) vendorTransform = 'mozTransform';
  if (document.body.style.msTransform !== undefined) vendorTransform = 'msTransform';
  if (document.body.style.transform !== undefined) vendorTransform = 'transform';
});

export function translate(el, x, y) {
  el.style[vendorTransform] = `translateX(${x}px) translateY(${y}px) translateZ(0)`;
}

export function topLeft(el, t, l) {
  el.style.top = `${t}px`;
  el.style.left = `${l}px`;
}

// utilities

export function canScrollVertical(el) {
  return el.scrollHeight > el.clientHeight;
}

export function canScrollHorizontal(el) {
  return el.scrollWidth > el.clientWidth;
}

// events

export function cancelEvent(e) {
  e.stopPropagation();
  e.preventDefault();
  e.cancelBubble = true;
  e.returnValue = false;
}

export function raiseEvent(source, eventName, eventData) {
  let event = new CustomEvent(eventName, eventData);
  source.dispatchEvent(event);
}

