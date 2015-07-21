module Tactile {

  export class Cache {

    _cache:any;
    _version:number;

    constructor() {
      this._version = 0;
      if (window['WeakMap']) {
        this._cache = new window['WeakMap']();
      }
    }


    get(el:HTMLElement, key:string, fn:Function = null):any {
      let elCache = this._getElementCache(el);
      if (elCache[key] !== undefined) {
        return elCache[key];
      } else {
        return elCache[key] = fn();
      }
    }


    set(el:HTMLElement, key:string, value:any):void {
      let elCache = this._getElementCache(el);
      elCache[key] = value;
    }


    clear():void {
      if (window['WeakMap']) {
        this._cache = new window['WeakMap']();
      } else {
        this._version += 1;
      }
    }


    dispose():void {
      this._cache = null;
    }


    private _getElementCache(el:HTMLElement):{ [id:string]:any } {
      let elCache:{ [id:string]:any } = null;
      if (this._cache) {
        elCache = this._cache.get(el);
        if (!elCache) {
          elCache = {};
          this._cache.set(el, elCache);
        }
      } else {
        elCache = el['__tactile'];
        let version = el['__tactileVersion'];
        if (!elCache || version < this._version) {
          el['__tactile'] = elCache = {};
          el['__tactileVersion'] = version;
        }
      }
      return elCache;
    }
  }
}
