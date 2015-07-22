module Tactile {

  // use es6 map where it is available. we also check to ensure the iterator function
  // returned by Map.prototype.values implements next() to avoid a bug in Safari 7/8
  // and the lack of a values() function in internet explorer 9/10
  // https://github.com/paulmillr/es6-shim/issues/326
  const _useMap:boolean = <Function>window['Map'] !== undefined
                        && (new Map().values !== undefined
                        && new Map().values().next !== undefined);

  export class Cache {

    _id:string;
    _els:HTMLElement[];
    _cache:Map<HTMLElement,any>;

    constructor() {
      if (_useMap) {
        this._cache = new Map();
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
      if (_useMap) {
        this._cache = new Map();
      } else {
        this._els.forEach((el:HTMLElement) => delete <any>el[this._id]);
        this._els = [];
      }
    }


    dispose():void {
      if (_useMap) {
        this._cache = null;
      } else {
        this._els.forEach((el:HTMLElement) => delete el[this._id]);
        this._els = [];
      }
    }


    getElements():HTMLElement[] {
      if (_useMap) {
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
        elCache = <any>el[this._id];
        if (!elCache) {
          this._els.push(el);
          el[this._id] = elCache = {};
        }
      }
      return elCache;
    }
  }
}
