export default class Cache {
  constructor() {
    this._cache = new WeakMap();
    this._scrollCache = new WeakMap();
    this.initialize();
  }


  initialize() {
    this._scrollListener = this._onScroll.bind(this);
    document.addEventListener('scroll', this._scrollListener, false)
  }


  cache(el, key, fn) {
    return this._getFromCache(this._cache, el, key, fn);
  }


  scrollInvalidatedCache(el, key, fn) {
    return this._getFromCache(this._scrollCache, el, key, fn);
  }


  _getFromCache(cache, el, key, fn) {
    let properties = cache.get(el);
    if (!properties) {
      properties = new Map();
      cache.set(el, properties);
    }
    if (properties.has(key)) {
      return properties.get(key);
    } else {
      let value = fn();
      properties.set(key, value);
      return value;
    }
  }


  _onScroll() {
    this._scrollCache = new WeakMap();
  }


  dispose() {
    document.removeEventListener('scroll', this._scrollListener, false)
  }
}
