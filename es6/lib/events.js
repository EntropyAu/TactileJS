
export const pointerDownEvent = document['ontouchstart'] !== undefined ? 'touchstart' : 'mousedown';
export const pointerMoveEvent = document['ontouchmove'] !== undefined ? 'touchmove' : 'mousemove';
export const pointerUpEvent   = document['ontouchend'] !== undefined ? 'touchend' : 'mouseup';

export function cancelEvent(e) {
  e.stopPropagation();
  e.preventDefault();
  e.cancelBubble = true;
  e.returnValue = false;
}

export function raiseEvent(source, eventName, eventData) {
  let event = new CustomEvent(eventName, eventData);
  source.dispatchEvent(event);
  return event;
}

export function pointerEventXY(e) {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return [clientX, clientY];
}

export function pointerEventId(e) {
  return e.touchId ? e.touchId : 0;
}