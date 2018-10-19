module Tactile.Attributes {

  export function set(
    el:Element,
    attrName:string,
    value:string = '') {
    el.setAttribute(attrName, value);
  }

  export function remove(
    el:Element,
    attrName:string) {
    el.removeAttribute(attrName);
  }

  export function get(
    el:Element,
    attrName:string,
    defaultIfPresent:string = '',
    defaultIfNotPresent:string = null):string {

    if (el.hasAttribute(attrName)) {
      return el.getAttribute(attrName) || defaultIfPresent;
    } else {
      return defaultIfNotPresent;
    }
  }


  export function getTags(
    el:Element,
    attrName:string,
    defaultIfPresent:string[]=[],
    defaultIfNotPresent:string[]=[]):string[] {

    if (el.hasAttribute(attrName)) {
      const attributeValue = el.getAttribute(attrName);
      if (attributeValue && attributeValue.length > 0) {
        return attributeValue.split(/[\ ,]/g);
      } else {
        return defaultIfPresent;
      }
    } else {
      return defaultIfNotPresent;
    }
  }
}
