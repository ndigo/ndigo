/**
 * @author Jeff Rose
 */
type MapKey<Value> = Value extends Map<infer KeyType, unknown> ? KeyType : unknown;
type MapValue<Value> = Value extends Map<unknown, infer ValueType> ? ValueType : unknown;
type ArrayEntries<Value extends readonly unknown[]> = Array<ArrayEntry<Value>>;
type MapEntries<Value> = Array<MapEntry<Value>>;
type ObjectEntries<Value> = Array<ObjectEntry<Value>>;
type SetEntries<Value extends Set<unknown>> = Array<SetEntry<Value>>;
export type ArrayEntry<Value extends readonly unknown[]> = [number, Value[number]];
export type MapEntry<Value> = [MapKey<Value>, MapValue<Value>];
export type ObjectEntry<Value> = [keyof Value, Value[keyof Value]];
export type SetEntry<Value> = Value extends Set<infer ValueType> ? [ValueType, ValueType] : never;
export type Entry<Value> = Value extends Map<unknown, unknown> ? MapEntry<Value> : Value extends Set<unknown> ? SetEntry<Value> : Value extends unknown[] ? ArrayEntry<Value> : Value extends object ? ObjectEntry<Value> : never;
export type Entries<Value> = Value extends Map<unknown, unknown> ? MapEntries<Value> : Value extends Set<unknown> ? SetEntries<Value> : Value extends unknown[] ? ArrayEntries<Value> : Value extends object ? ObjectEntries<Value> : never;
/**
 * @function module:core.isEntry
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is an entry
 */
export declare const isEntry: (value: any) => value is Entry<any>;
/**
 * @function module:core.isEntries
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is a list of entries
 */
export declare const isEntries: (value: any) => value is Entry<any>;
/**
 * @function module:core.likeIterable
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is iterable
 */
export declare const likeIterable: (value: any) => value is Iterable<any>;
/**
 * @class module:core.IndexedIterator
 * @implements {external:IterableIterator}
 * @param {external:ArrayLike} indexed An indexed collection
 */
export declare class IndexedIterator<T = any> implements IterableIterator<T> {
    #private;
    [Symbol.iterator](): IterableIterator<T>;
    constructor(indexed: ArrayLike<T>);
    next(): IteratorResult<T>;
}
/**
 * @function module:core.indexedIterator
 * @param {external:ArrayLike} indexed An indexed collection
 * @returns {external:IndexedIterator} An indexed iterator
 */
export declare const indexedIterator: <T = any>(indexed: ArrayLike<T>) => IterableIterator<T>;
/**
 * @class module:core.EntriesIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
 */
export declare class EntriesIterator<T = any> implements IterableIterator<Entry<T>> {
    #private;
    constructor(target: object);
    [Symbol.iterator](): IterableIterator<Entry<T>>;
    next(): IteratorResult<Entry<T>>;
}
/**
 * @function module:core.entriesIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.EntriesIterator} An entries iterator
 */
export declare const entriesIterator: <T = any>(target: object) => IterableIterator<Entry<T>>;
/**
 * @class module:core.KeysIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
 */
export declare class KeysIterator implements IterableIterator<PropertyKey> {
    #private;
    constructor(target: object);
    [Symbol.iterator](): IterableIterator<PropertyKey>;
    next(): IteratorResult<PropertyKey>;
}
/**
 * @function module:core.keysIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.KeysIterator} A keys iterator
 */
export declare const keysIterator: (target: object) => IterableIterator<PropertyKey>;
/**
 * @class module:core.ValuesIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
 */
export declare class ValuesIterator<T = any> implements IterableIterator<T> {
    #private;
    constructor(target: object);
    [Symbol.iterator](): IterableIterator<T>;
    next(): IteratorResult<T>;
}
/**
 * @function module:core.valuesIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.ValuesIterator} A values iterator
 */
export declare const valuesIterator: <T = any>(target: object) => IterableIterator<T>;
/**
 * @class module:core.RangeIterator
 * @implements {external:IterableIterator}
 * @param {external:number} startOrEnd The start or end of the range
 * @param {external:number} [end] The end of the range
 * @param {external:number} [step=1] The amount by which values are incremented
 */
export declare class RangeIterator implements IterableIterator<number> {
    #private;
    [Symbol.iterator](): IterableIterator<number>;
    constructor(startOrEnd: number, end?: number, step?: number);
    next(): IteratorResult<number>;
}
/**
 * @function module:core.rangeIterator
 * @param {external:number} startOrEnd The start or end of the range
 * @param {external:number} [end] The end of the range
 * @param {external:number} [step=1] The amount by which values are incremented
 * @returns {module:core.RangeIterator} An range iterator
 */
export declare const rangeIterator: (startOrEnd: number, end?: number, step?: number) => IterableIterator<number>;
/**
 * @function module:core.getIterator
 * @param {external:Iterable} collection An iterable collection
 * @returns {external:Iterator} An iterator created from the collection
 */
export declare const getIterator: <T = any>(value: any) => Iterator<T>;
export {};
//# sourceMappingURL=iterable.d.ts.map