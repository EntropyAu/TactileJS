
interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    entries(): any;
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V;
    has(key: K): boolean;
    keys(): any;
    set(key: K, value?: V): Map<K, V>;
    size: number;
    values(): any;
}

interface MapConstructor {
    new (): Map<any, any>;
    new <K, V>(): Map<K, V>;
    prototype: Map<any, any>;
}
declare var Map: MapConstructor;
