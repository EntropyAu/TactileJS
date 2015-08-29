module Tactile.Events {
  export var pointerDownEvent = document['ontouchstart'] !== undefined
                              ? 'touchstart'
                              : 'mousedown';
  export var pointerMoveEvent = document['ontouchmove'] !== undefined
                              ? 'touchmove'
                              : 'mousemove';
  export var pointerUpEvent = document['ontouchend'] !== undefined
                            ? 'touchend'
                            : 'mouseup';


  export function cancel(e:Event) {
    e.stopPropagation();
    e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;
  }


  export function raise(source:Element, eventName:string, eventData:any):CustomEvent {
    let event = null;
    if (typeof CustomEvent === 'function') {
      event = new CustomEvent(eventName, eventData);
    } else {
      // internet explorer 9/10/11
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(event, true, true, eventData);
    }
    source.dispatchEvent(event);
    return event;
  }


  export interface NormalizedPointerEvent {
    id: number;
    target: HTMLElement;
    xy: [number,number];
    xyEl: HTMLElement;
  }


  export function normalizePointerEvent(e:MouseEvent|TouchEvent):NormalizedPointerEvent[] {
    if (e['changedTouches']) return _normalizeTouchEvent(<TouchEvent>e);
    if (e['clientX']) return _normalizeMouseEvent(<MouseEvent>e);
  }


  function _normalizeTouchEvent(e:TouchEvent):NormalizedPointerEvent[] {
    let pointers:NormalizedPointerEvent[] = [];
    for (let i = 0; i < e.changedTouches.length; i++) {
      let touch = e.changedTouches[i];
      pointers.push({
        id: touch.identifier,
        target: <HTMLElement>touch.target,
        xy: [touch.clientX, touch.clientY],
        xyEl: e.type === 'touchstart' ? <HTMLElement>touch.target : null
      });
    }
    return pointers;
  }


  function _normalizeMouseEvent(e:MouseEvent):NormalizedPointerEvent[] {
    return [{ id: 0, target: <HTMLElement>e.target, xy: [e.clientX, e.clientY], xyEl: <HTMLElement>e.target }];
  }
}
