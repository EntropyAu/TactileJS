module Tactile {

  export class Cache {

    _id:string;
    _els:HTMLElement[];
    _cache:any;
    _useMap:boolean = window['Map'] !== undefined;

    constructor() {
      if (this._useMap) {
        this._cache = new window['Map']();
      } else {
        this._id = "__tactile" + Math.random().toString().replace('.', '')
        this._els = [];
      }
    }


    get(el:HTMLElement, key:string, fn:Function = function(){}):any {
      let elCache = this._getElementCache(el);
      if (elCache[key] !== undefined) {
        return elCache[key];
      } else {
        return elCache[key] = fn();
      }
    }


    clear():void {
      if (this._useMap) {
        this._cache = new window['Map']();
      } else {
        this._els.forEach(el => delete el[this._id]);
        this._els = [];
      }
    }


    dispose():void {
      if (this._useMap) {
        this._cache = null;
      } else {
        this._els.forEach(el => delete el[this._id]);
        this._els = [];
      }
    }


    getElements():HTMLElement[] {
      if (this._useMap) {
        let els:HTMLElement[] = [];
        let iterator = this._cache.keys();
        let result = iterator.next();
        while (!result.done) {
          els.push(result.value);
          result = iterator.next();
        }
        return els;
      } else {
        return this._els;
      }
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
        elCache = el[this._id];
        if (!elCache) {
          this._els.push(el);
          el[this._id] = elCache = {};
        }
      }
      return elCache;
    }
  }
}
