// selectors

export function indexOf(el) {
  return Array.prototype.indexOf.call(el.parentElement.children, el);
}

export function isChild(el, childEl) {
  return Array.prototype.indexOf.call(el.children, childEl) !== -1;
}

export function closest(el, selector) {
  if (el === null) return;
  do { if (el.matches && el.matches(selector)) return el; }
  while (el = el.parentNode)
  return null;
}

export function ancestors(el, selector) {
  if (el === null) return [];
  let ancestors = [];
  do {
    if (el.matches && el.matches(selector))
      ancestors.push(el);
  }
  while (el = el.parentNode)
  return ancestors;
}

export function clientScale(el) {
  let rect = el.getBoundingClientRect();
  return [rect.width / el.offsetWidth, rect.height / el.offsetHeight];
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

export function transformOrigin(el, [t, l]) {
  el.style.transformOrigin = `${l}px ${t}px`;
}

export function elementFromPoint(xy) {
  return document.elementFromPoint(xy[0], xy[1]);
}

export function elementFromPointViaSelection(xy) {
  let node = null;
  // webkit
  if (document.caretRangeFromPoint) {
    let range = document.caretRangeFromPoint(xy[0],xy[1]);
    if (range) node = range.startContainer;
  }
  // mozilla
  if (document.caretPositionFromPoint) {
    let range = document.caretPositionFromPoint(xy[0],xy[1]);
    if (range) node = range.offsetNode;
  }
  // internet explorer
  if (document.createTextRange) {
    let range = document.createTextRange();
    range.moveToPoint(xy[0],xy[1]);
    return node = range.parentElement();
  }
  if (node && node.parentElement && !(node instanceof Element))
    node = node.parentElement;
  return node;
}

export function clearSelection() {
  if (window.getSelection) {
    if (window.getSelection().empty) {  // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {  // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {  // IE?
    document.selection.empty();
  }
}

// utilities

export function canScrollDown(el) {
  return el.scrollTop < el.scrollHeight - el.clientHeight;
}

export function canScrollUp(el) {
  return el.scrollTop > 0;
}

export function canScrollRight(el) {
  return el.scrollLeft < el.scrollWidth - el.clientWidth;
}

export function canScrollLeft(el) {
  return el.scrollLeft > 0;
}

export function canScrollVertical(el) {
  return el.scrollHeight > el.clientHeight;
}

export function canScrollHorizontal(el) {
  return el.scrollWidth > el.clientWidth;
}