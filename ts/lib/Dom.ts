module Tactile.Dom {

  export function matches(el:HTMLElement, selector:string):boolean {
    if (el['matches']) return el['matches'](selector);
    if (el['msMatchesSelector']) return el['msMatchesSelector'](selector);
    if (el['mozMatchesSelector']) return el['mozMatchesSelector'](selector);
    if (el['webkitMatchesSelector']) return el['webkitMatchesSelector'](selector);
  }

  export function indexOf(el:HTMLElement):number {
    return Array.prototype.indexOf.call(el.parentElement.children, el);
  }


  export function isChild(el:HTMLElement, childEl:Element):boolean {
    return Array.prototype.indexOf.call(el.children, childEl) !== -1;
  }


  export function isDescendant(el:HTMLElement, descendantEl:Element):boolean {
    do {
      descendantEl = descendantEl.parentElement;
    } while (descendantEl && descendantEl !== el);
    return descendantEl === el;
  }

  export function closest(el:HTMLElement, selector:string):HTMLElement {
    if (el === null) return;
    do {
      if (matches(el, selector)) return el;
    }
    while (el = <HTMLElement>el.parentNode)
    return null;
  }


  export function parents(el:HTMLElement, selector:string):HTMLElement[] {
    const parents:HTMLElement[] = [];
    while (el = <HTMLElement>el.parentNode) {
      if (matches(el, selector)) parents.push(el);
    }
    return parents;
  }

  export function ancestors(el:HTMLElement, selector:string):HTMLElement[] {
    if (el === null) return [];
    let ancestors:HTMLElement[] = [];
    do {
      if (matches(el, selector)) ancestors.push(el);
    }
    while (el = <HTMLElement>el.parentNode)
    return ancestors;
  }



  export function copyComputedStyles(sourceEl:HTMLElement, targetEl:HTMLElement):void {
    targetEl.style.cssText = getComputedStyle(sourceEl).cssText;
    const targetChildren = children(targetEl);
    children(sourceEl).forEach((el:HTMLElement,i:number) => copyComputedStyles(el, targetChildren[i]));
  }


  export function stripClasses(el:HTMLElement):void {
    el.className = '';
    children(el).forEach((el:HTMLElement) => stripClasses(el));
  }


  export function getPaddingClientRect(el:Element) {
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


  export function children(el:HTMLElement):HTMLElement[] {
    return [].slice.call(el.children);
  }


  export function clientScale(el:HTMLElement):[number,number] {
    let rect = el.getBoundingClientRect();
    return [rect.width / el.offsetWidth, rect.height / el.offsetHeight];
  }

  // vendor

  export function outerHeight(el:HTMLElement, includeMargins:boolean = false):number {
    if (!includeMargins) return el.offsetHeight;
    const style = getComputedStyle(el);
    return el.offsetHeight + parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
  }

  export function outerWidth(el:HTMLElement, includeMargins:boolean = false):number {
    if (!includeMargins) return el.offsetWidth;
    const style = getComputedStyle(el);
    return el.offsetWidth + parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);
  }


  let vendorTransform:string = null;
  if (document.documentElement.style.webkitTransform !== undefined) vendorTransform = 'webkitTransform';
  if (document.documentElement.style.transform !== undefined) vendorTransform = 'transform';


  export function translate(el:HTMLElement, xy:[number,number]):void {
    el.style[vendorTransform] = `translateX(${xy[0]}px) translateY(${xy[1]}px) translateZ(0)`;
  }


  export function transform(el:HTMLElement, options:any):void {
    let transform:string[] = [];
    if (options.translateX) transform.push(`translateX(${options.translateX}px)`);
    if (options.translateY) transform.push(`translateY(${options.translateY}px)`);
    if (options.translateZ) transform.push(`translateZ(${options.translateZ}px)`);
    if (options.scaleX) transform.push(`scaleX(${options.scaleX})`);
    if (options.scaleY) transform.push(`scaleY(${options.scaleY})`);
    if (options.rotateZ) transform.push(`rotateZ(${options.rotateZ}deg)`);
    el.style[vendorTransform] = transform.join(' ');
  }


  export function topLeft(el:HTMLElement, xy:[number,number]):void {
    el.style.left = `${xy[0]}px`;
    el.style.top = `${xy[1]}px`;
  }


  export function transformOrigin(el:HTMLElement, xy:[number,number]):void {
    el.style.transformOrigin = `${xy[0]}% ${xy[1]}%`;
    el.style.webkitTransformOrigin = `${xy[0]}% ${xy[1]}%`;
  }


  export function elementFromPoint(xy:[number,number]):HTMLElement {
    return <HTMLElement>document.elementFromPoint(xy[0], xy[1]);
  }


  export function elementFromPointViaSelection(xy:[number,number]):HTMLElement {
    let node:Element = null;
    // webkit
    if (document['caretRangeFromPoint']) {
      let range = document['caretRangeFromPoint'](xy[0],xy[1]);
      if (range) node = range.startContainer;
    }
    // mozilla
    if (document['caretPositionFromPoint']) {
      let range = document['caretPositionFromPoint'](xy[0],xy[1]);
      if (range) node = range.offsetNode;
    }
    // internet explorer
    if (document['createTextRange']) {
      let range = document['createTextRange']();
      range.moveToPoint(xy[0],xy[1]);
      return node = range.parentElement();
    }
    if (node && node.parentElement && !(node instanceof Element))
      node = node.parentElement;
    return <HTMLElement>node;
  }


  export function clearSelection():void {
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document['selection']) {  // IE?
      document['selection'].empty();
    }
  }


  export function scrollDirections(el:Element):any {
    const style = getComputedStyle(this.el);
    let he = style.overflowX === 'auto' || style.overflowX === 'scroll',
        ve = style.overflowY === 'auto' || style.overflowY === 'scroll',
        st = el.scrollTop,
        sl = el.scrollLeft;
    return {
      up: ve ? st : 0,
      left: he ? sl : 0,
      down: ve ? (el.scrollHeight - el.clientHeight) - st : 0,
      right: he ? (el.scrollWidth - el.clientWidth) - sl : 0
    }
  }


  export function canScrollDown(el:Element):boolean {
    return el.scrollTop < el.scrollHeight - el.clientHeight;
  }


  export function canScrollUp(el:Element):boolean {
    return el.scrollTop > 0;
  }


  export function canScrollRight(el:Element):boolean {
    return el.scrollLeft < el.scrollWidth - el.clientWidth;
  }


  export function canScrollLeft(el:Element):boolean {
    return el.scrollLeft > 0;
  }
}
