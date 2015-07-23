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

  export function animateDomMutation(el:HTMLElement, mutationFunction:Function, options:any):void {
    const startIndex = options.startIndex || 0;
    const endIndex   = Math.min(options.endIndex || el.children.length + 1,
                                startIndex + options.elementLimit || Number.MAX_VALUE);

    const cache = new Cache();
    const oldOffsets = childOffsetMap(cache, 'old', el, startIndex, endIndex);
    mutationFunction();
    const newOffsets = childOffsetMap(cache, 'new', el, startIndex, endIndex);

    animateBetweenOffsets(
      cache,
      el,
      startIndex,
      endIndex,
      options.animationOptions);
  }



  function animateBetweenOffsets(
    cache:Cache,
    el:HTMLElement,
    startIndex:number,
    endIndex:number,
    animationOptions:any) {


    let translatedEls = [];
    let startXValues = [];
    let endXValues = [];
    let startYValues = [];
    let endYValues = [];
    for (let childEl of cache.getElements()) {

      if (Dom.matches(childEl, '[data-drag-placeholder]'))
        continue;

      let oldOffset = cache.get(childEl, 'old');
      let newOffset = cache.get(childEl, 'new');
      if (!oldOffset || !newOffset || (oldOffset[0] === newOffset[0] && oldOffset[1] === newOffset[1]))
        continue;

      translatedEls.push(childEl);
      startXValues.push((oldOffset[0] - newOffset[0]) + 'px');
      startYValues.push((oldOffset[1] - newOffset[1]) + 'px');
      endXValues.push(0);
      endYValues.push(0);
    }
    window['Velocity'](translatedEls, {
      translateX: [i => endXValues[i], i => startXValues[i]],
      translateY: [i => endYValues[i], i => startYValues[i]],
    }, {
      duration: animationOptions.duration,
      easing: animationOptions.easing,
      queue: false
    });
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
