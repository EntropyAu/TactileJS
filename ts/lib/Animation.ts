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
      //for (let el of [].concat(els)) Velocity.Utilities.removeData(els, ["velocity"]);
    }
  }

export function clear(els:HTMLElement|HTMLElement[]):void {
  if (window["Velocity"]) {
    for (let el of [].concat(els)) Velocity.Utilities.removeData(el, ["velocity"]);
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

  export function animateDomMutationLayoutSize(el:HTMLElement, mutationFunction:Function, options:any):void {
    let oldScrollSize = [el.scrollWidth, el.scrollHeight];
    let oldOffsetSize = [el.offsetWidth, el.offsetHeight];
    let oldWidthStyle = el.style.width;
    let oldHeightStyle = el.style.height;
    el.style.width = `${oldOffsetSize[0]}px`;
    el.style.height = `${oldOffsetSize[1]}px`;

    mutationFunction();
    let newScrollSize = [el.scrollWidth, el.scrollHeight];

    function complete() {
      el.style.width = oldWidthStyle;
      el.style.height = oldHeightStyle;
    }
    Velocity(el, {
      width: oldOffsetSize[0] + (newScrollSize[0] - oldScrollSize[0]),
      height: oldOffsetSize[1] + (newScrollSize[1] - oldScrollSize[1])
    }, {
      duration: 3000,
      easing: 'ease-in-out',
      complete: complete
    });
  };





  function animateBetweenOffsets(
    cache:Cache,
    el:HTMLElement,
    startIndex:number,
    endIndex:number,
    animationOptions:any) {

    let els:HTMLElement[] = [];
    let elOffsets:[number,number][] = [];

    for (let childEl of cache.getElements()) {

      if (Dom.matches(childEl, '[data-drag-placeholder]')) continue;
      let oldOffset = cache.get(childEl, 'old');
      let newOffset = cache.get(childEl, 'new');
      if (!oldOffset || !newOffset || Vector.equals(oldOffset, newOffset)) continue;

      els.push(childEl);
      elOffsets.push(Vector.subtract(oldOffset, newOffset));

      // immediately set the start offset to avoid flickering (velocity appears
      // to start the animation only on the next animation frame cycle)
      Dom.translate(childEl, Vector.subtract(oldOffset, newOffset));
    }
    Velocity(els, {
      translateX: [0, i => elOffsets[i][0]],
      translateY: [0, i => elOffsets[i][1]],
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
