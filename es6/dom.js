export function closest(el, selector) {
  if (el === null) return;
  do { if (el.matches && el.matches(selector)) return el; }
  while (el = el.parentNode)
  return null;
}

export function cancelEvent(e) {
  e.stopPropagation();
  e.preventDefault();
  e.cancelBubble = true;
  e.returnValue = false;
}

export function raiseEvent(source, eventName, eventData) {
  let event = new CustomEvent(eventName, eventData);
  if (window['_' + eventName]) window['_' + eventName](source, event);
  source.dispatchEvent(event);
  //console.log(eventName, eventData, source);
}
