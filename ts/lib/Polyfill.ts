module Tactile.Polyfill {
  // internet explorer 9
  var timeLast = 0;
  export function requestAnimationFrame(callback:FrameRequestCallback):number
  {
    if (window['requestAnimationFrame']) return window.requestAnimationFrame(callback);
    if (window['mozRequestAnimationFrame']) return window['mozRequestAnimationFrame'](callback);
    if (window['webkitRequestAnimationFrame']) return window['webkitRequestAnimationFrame'](callback);

    var timeCurrent = (new Date()).getTime(),
        timeDelta;

    // Dynamically set delay on a per-tick basis to match 60fps.
    // Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671
    timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
    timeLast = timeCurrent + timeDelta;
    return setTimeout(function() { callback(timeCurrent + timeDelta); }, timeDelta);
  };


  // internet explorer 9
  export function cancelAnimationFrame(handle:number):void {
    if (window['cancelAnimationFrame']) return window.cancelAnimationFrame(handle);
    if (window['mozCancelAnimationFrame']) return window['mozCancelAnimationFrame'](handle);
    if (window['webkitCancelAnimationFrame']) return window['webkitCancelAnimationFrame'](handle);
    clearTimeout(handle);
  };


  export function addClass(el:HTMLElement, className:string):void {
    if (el.classList !== undefined) {
      el.classList.add(className);
    } else {
      // internet explorer 9
      let classes:string[] = (el.getAttribute('class') || '').split(/\s+/);
      if (classes.indexOf(className) === -1) {
        classes.push(className);
        el.setAttribute('class', classes.join(' '));
      }
    }
  }


  export function removeClass(el:HTMLElement, className:string):void {
    if (el.classList !== undefined) {
      el.classList.remove(className);
    } else {
      // internet explorer 9
      let classes:string[] = (el.getAttribute('class') || '').split(/\s+/);
      let index = classes.indexOf(className);
      if (index !== -1) {
        classes.splice(index, 1);
        el.setAttribute('class', classes.join(' '));
      }
    }
  }


  export function remove(el:HTMLElement) {
    if (typeof el.remove === 'function') {
      el.remove();
    } else {
      // internet explorer 9/10/11
      el.parentNode.removeChild(el);
    }
  }
}
