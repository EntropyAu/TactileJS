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


  export function raise(source:Element, eventName:string, eventData:any):boolean {
    var event = new CustomEvent(eventName, eventData);
    source.dispatchEvent(event);
    return !event.defaultPrevented;
  }


  export function pointerEventXY(e:MouseEvent|TouchEvent):[number, number] {
    if (e instanceof TouchEvent) {
      return [e.touches[0].clientX, e.touches[0].clientY];
    }
    if (e instanceof MouseEvent) {
      return [e.clientX, e.clientY];
    }
  }


  export function pointerEventId(e:MouseEvent|TouchEvent):number {
    // TODO: Fix up
    if (e instanceof TouchEvent) {
      return 0;
    }
    if (e instanceof MouseEvent) {
      return 0;
    }
  }
}
