module Tactile.Animation {

  export function set(
    els:HTMLElement|HTMLElement[],
    target:any,
    options:AnimationOptions = { duration: 0 },
    complete:Function = null) {

    if (window['Velocity']) {
      let velocityOptions = {
        duration: options.duration,
        easing: options.easing,
        complete: complete,
        queue: false
      }
      window['Velocity'](els, target, velocityOptions);
    } else {
      for (let el of [].concat(els)) {
        applyStyleProperties(el, target);
        applyTransformProperties(el, target);
      }
      if (complete) complete();
    }
  }

  export function stop(els:HTMLElement|HTMLElement[]):void {
    if (window["Velocity"]) {
      window['Velocity'](els, 'stop');
    }
  }

  export function animateDomMutation(el:HTMLElement, mutationFunction:Function, options:any = {}):void {
    const startIndex = options.startIndex || 0;
    const endIndex   = Math.min(options.endIndex || el.children.length + 1,
                                startIndex + options.elementLimit);
    const easing     = options.easing;
    const duration   = options.duration;
    let originalStyleHeight:string = null,
        originalStyleWidth:string = null,
        oldSize:[number,number] = null,
        newSize:[number,number] = null;

    const cache = new Cache();
    const oldOffsets = childOffsetMap(cache, 'old', el, startIndex, endIndex);
    if (options.animateParentSize) {
      originalStyleHeight = '';
      originalStyleWidth = '';
      el.style.width = '';
      el.style.height = '';
      oldSize = [el.offsetWidth, el.offsetHeight];
    }
    mutationFunction();
    const newOffsets = childOffsetMap(cache, 'new', el, startIndex, endIndex);
    if (options.animateParentSize) {
      newSize = [el.offsetWidth, el.offsetHeight];
    }

    animateBetweenOffsets(
      cache,
      el,
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

  function animateSize(
    el:HTMLElement,
    oldSize:[number,number],
    newSize:[number,number],
    originalStyleWidth:string,
    originalStyleHeight:string,
    duration:number,
    easing:string) {
    function complete() {
      el.style.width = originalStyleWidth;
      el.style.height = originalStyleHeight;
    }
    window['Velocity'](el, {
      width: [newSize[0], oldSize[0]],
      height: [newSize[1], oldSize[1]],
    }, {
      duration: duration,
      easing: easing,
      queue: false,
      complete: complete
    });
  }


  function animateBetweenOffsets(
    cache:Cache,
    el:HTMLElement,
    startIndex:number,
    endIndex:number,
    duration:number,
    easing:string) {
    for (let i = startIndex; i < endIndex + 1; i++) {
      let childEl = <HTMLElement>el.children[i];
      if (!childEl) continue;

      //if (childEl.matches('[data-drag-placeholder]')) continue;

      let oldOffset = cache.get(childEl, 'old');
      let newOffset = cache.get(childEl, 'new');
      if (!oldOffset || !newOffset || (oldOffset[0] === newOffset[0] && oldOffset[1] === newOffset[1]))
        continue;

      // the following line makes the animations smoother in safari
      //childEl.style.webkitTransform = 'translate3d(0,' + (oldOffset.top - newOffset.top) + 'px,0)';

      window['Velocity'](childEl, {
        translateX: '+=' + (oldOffset[0] - newOffset[0]) + 'px',
        translateY: '+=' + (oldOffset[1] - newOffset[1]) + 'px',
        translateZ: 0
      }, { duration: 0 });

      window['Velocity'](childEl, {
        translateX: 0,
        translateY: 0
      }, {
        duration: duration,
        easing: easing,
        queue: false
      });
    }
  }


  function childOffsetMap(cache:Cache, key:string, el:HTMLElement, startIndex:number, endIndex:number):void {
    for (let i = startIndex; i < endIndex; i++) {
      let childEl = <HTMLElement>el.children[i];
      if (childEl) cache.set(childEl, key, [childEl.offsetLeft, childEl.offsetTop]);
    }
  }


  function unwrapVelocityPropertyValue(value:any):any {
    return Array.isArray(value) ? value[0] : value;
  }

  function applyStyleProperties(el:HTMLElement, properties:any):void {
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


  function applyTransformProperties(el:HTMLElement, properties:any):void {
    const transformProperties = {
      "translateX": "px",
      "translateY": "px",
      "translateZ": "px",
      "scaleX": "",
      "scaleY": "",
      "rotateZ": "deg"
    };

    // follow the same transform order as Velocity.js to ensure consistent results
    const transformOrder = ["translateX","translateY","translateZ","scaleX","scaleY","rotateZ"];

    // cache the transform values on the element. This avoids us having
    // to parse the transform string when we do a partial update
    let transformHash = el['__tactile_transform'] || {};
    for (let property in properties) {
      if (transformProperties[property]) {
        let value = unwrapVelocityPropertyValue(properties[property]);
        transformHash[property] = value + transformProperties[property];
      }
    }

    // build the transform string
    let transformValues:string[] = [];
    transformOrder.forEach(function(property) {
      if (transformHash[property]) {
        transformValues.push(`${property}(${transformHash[property]})`)
      }
    });
    const value = transformValues.join(' ');

    el['__tactile_transform'] = transformHash;
    if (el.style.webkitTransform !== undefined) el.style.webkitTransform = value;
    if (el.style.transform !== undefined) el.style.transform = value;
  }
}
