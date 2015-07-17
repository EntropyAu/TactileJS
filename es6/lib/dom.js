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

export function getPaddingClientRect(el) {
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  let l = parseInt(style.borderLeftWidth,   10);
  let t = parseInt(style.borderTopWidth,    10);
  let r = parseInt(style.borderRightWidth,  10);
  let b = parseInt(style.borderBottomWidth, 10);
  return {
    top:    rect.top    + t,
    left:   rect.left   + l,
    right:  rect.right  - r,
    bottom: rect.bottom - b,
    width:  rect.width  - l - r,
    height: rect.height - t - b
  }
}

export function childElementArray(el) {
  let childEls = [];
  let childNodeList = el.children;
  for (let i = 0; i < childNodeList.length; i++) {
    if (childNodeList.item(i).nodeType === 1)
      childEls.push(childNodeList.item(i));
  }
  return childEls;
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

export function outerHeight(el, includeMargins = false) {
  if (!includeMargins) return el.offsetHeight;
  const style = getComputedStyle(el);
  return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
}

export function outerWidth(el, includeMargins = false) {
  if (!includeMargins) return el.offsetWidth;
  const style = getComputedStyle(el);
  return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
}


let vendorTransform = null;
setTimeout(function() {
  if (document.body.style.webkitTransform !== undefined) vendorTransform = 'webkitTransform';
  if (document.body.style.mozTransform !== undefined) vendorTransform = 'mozTransform';
  if (document.body.style.msTransform !== undefined) vendorTransform = 'msTransform';
  if (document.body.style.transform !== undefined) vendorTransform = 'transform';
  var iOS = (navigator.userAgent.match(/iPad|iPhone|iPod/g) ? true : false );
  document.body.classList.toggle('ios', iOS);
  document.body.classList.toggle('not-ios', !iOS);
});

export function translate(el, [x, y]) {
  el.style[vendorTransform] = `translateX(${x}px) translateY(${y}px) translateZ(0)`;
}

export function transform(el, options) {
  let transform = [];
  if (options.translateX) transform.push(`translateX(${options.translateX}px)`);
  if (options.translateY) transform.push(`translateY(${options.translateY}px)`);
  if (options.translateZ) transform.push(`translateZ(${options.translateZ}px)`);
  if (options.scaleX) transform.push(`scaleX(${options.scaleX})`);
  if (options.scaleY) transform.push(`scaleY(${options.scaleY})`);
  if (options.rotateZ) transform.push(`rotateZ(${options.rotateZ}deg)`);
  el.style[vendorTransform] = transform.join(' ');
}

export function topLeft(el, [l, t]) {
  el.style.top = `${t}px`;
  el.style.left = `${l}px`;
}

export function transformOrigin(el, [l, t]) {
  el.style.transformOrigin = `${l}% ${t}%`;
  el.style.webkitTransformOrigin = `${l}% ${t}%`;
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
