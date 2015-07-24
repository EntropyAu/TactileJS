var Tactile;
(function (Tactile) {
    var uuid = 1;
    var _useMap = window['Map'] !== undefined
        && (new exports.Map().values !== undefined
            && new exports.Map().values().next !== undefined);
    var Cache = (function () {
        function Cache() {
            if (_useMap) {
                this._cache = new exports.Map();
            }
            else {
                this._id = "__tactile" + uuid++;
                this._els = [];
            }
        }
        Cache.prototype.get = function (el, key, fn) {
            var elCache = this._getElementCache(el);
            if (elCache[key] !== undefined) {
                return elCache[key];
            }
            else {
                return fn ? elCache[key] = fn() : null;
            }
        };
        Cache.prototype.set = function (el, key, value) {
            var elCache = this._getElementCache(el);
            return elCache[key] = value;
        };
        Cache.prototype.clear = function () {
            var _this = this;
            if (_useMap) {
                this._cache = new exports.Map();
            }
            else {
                this._els.forEach(function (el) { return delete el[_this._id]; });
                this._els = [];
            }
        };
        Cache.prototype.dispose = function () {
            var _this = this;
            if (_useMap) {
                this._cache = null;
            }
            else {
                this._els.forEach(function (el) { return delete el[_this._id]; });
                this._els = [];
            }
        };
        Cache.prototype.getElements = function () {
            if (_useMap) {
                var els = [];
                var iterator = this._cache.keys();
                var result = iterator.next();
                while (!result.done) {
                    els.push(result.value);
                    result = iterator.next();
                }
                return els;
            }
            else {
                return this._els;
            }
        };
        Cache.prototype._getElementCache = function (el) {
            var elCache = null;
            if (this._cache) {
                elCache = this._cache.get(el);
                if (!elCache) {
                    elCache = {};
                    this._cache.set(el, elCache);
                }
            }
            else {
                elCache = el[this._id];
                if (!elCache) {
                    this._els.push(el);
                    el[this._id] = elCache = {};
                }
            }
            return elCache;
        };
        return Cache;
    })();
    Tactile.Cache = Cache;
})(Tactile || (Tactile = {}));
//# sourceMappingURL=Cache.js.map