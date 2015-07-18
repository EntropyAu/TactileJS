export function getAttributeWithDefaults(element,
                                         attributeName,
                                         defaultIfPresent = '',
                                         defaultIfNotPresent = null) {
  if (element.hasAttribute(attributeName)) {
    return element.getAttribute(attributeName) || defaultIfPresent;
  } else {
    return defaultIfNotPresent;
  }
}


export function getAttributeSetWithDefaults(element,
                                            attributeName,
                                            defaultIfPresent,
                                            defaultIfNotPresent) {
  if (element.hasAttribute(attributeName)) {
    const attributeValue = element.getAttribute(attributeName);
    if (attributeValue && attributeValue.length > 0) {
      return new Set(attributeValue.split(/[\ ,]/g));
    } else {
      return new Set(defaultIfPresent);
    }
  } else {
    return new Set(defaultIfNotPresent);
  }
}


export function getAttributeSet(element, attributeName) {
  return getAttributeSetWithDefaults(element, attributeName, [], []);
}


export function overrideOptions(el) {
  for (let option of el.attributes) {

  }
}
