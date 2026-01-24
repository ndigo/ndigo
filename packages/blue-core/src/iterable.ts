/**
 * @author Jeff Rose
 */

import { cond, complement, isNil, likeArray, T, invoker, pipe, propIs } from '@blue/util';

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

export type Entry<Value> =
    Value extends Map<unknown, unknown>
        ? MapEntry<Value>
        : Value extends Set<unknown>
          ? SetEntry<Value>
          : Value extends unknown[]
            ? ArrayEntry<Value>
            : Value extends object
              ? ObjectEntry<Value>
              : never;

export type Entries<Value> =
    Value extends Map<unknown, unknown>
        ? MapEntries<Value>
        : Value extends Set<unknown>
          ? SetEntries<Value>
          : Value extends unknown[]
            ? ArrayEntries<Value>
            : Value extends object
              ? ObjectEntries<Value>
              : never;

const { isArray } = Array,
    { entries, keys, values } = Object,
    hasFunction = propIs(Function),
    hasEntries = hasFunction('entries'),
    hasKeys = hasFunction('keys'),
    hasValues = hasFunction('values'),
    invokeEntries = invoker(0, 'entries') as <T>(value: object) => ObjectEntries<T>,
    invokeKeys = invoker(0, 'keys'),
    invokeValues = invoker(0, 'values');

/**
 * @function module:core.isEntry
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is an entry
 */
export const isEntry = (value: any): value is Entry<any> => isArray(value) && value.length === 2;

/**
 * @function module:core.isEntries
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is a list of entries
 */
export const isEntries = (value: any): value is Entry<any> =>
    isArray(value) && (value.length ? isEntry(value[0]) : true);

/**
 * @function module:core.likeIterable
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is iterable
 */
export const likeIterable = (value: any): value is Iterable<any> =>
    complement(isNil)(value) && value[Symbol.iterator] !== undefined;

/**
 * @class module:core.IndexedIterator
 * @implements {external:IterableIterator}
 * @param {external:ArrayLike} indexed An indexed collection
 */
export class IndexedIterator<T = any> implements IterableIterator<T> {
    #indexed: ArrayLike<T>;
    #index: number;

    [Symbol.iterator](): IterableIterator<T> {
        return this;
    }

    constructor(indexed: ArrayLike<T>) {
        this.#indexed = indexed;
        this.#index = 0;
    }

    next(): IteratorResult<T> {
        if (this.#index < this.#indexed.length) {
            return { done: false, value: this.#indexed[this.#index++] };
        } else {
            return { done: true } as IteratorResult<T>;
        }
    }
}

/**
 * @function module:core.indexedIterator
 * @param {external:ArrayLike} indexed An indexed collection
 * @returns {external:IndexedIterator} An indexed iterator
 */
export const indexedIterator = <T = any>(indexed: ArrayLike<T>): IterableIterator<T> => new IndexedIterator<T>(indexed);

/**
 * @class module:core.EntriesIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
 */
export class EntriesIterator<T = any> implements IterableIterator<Entry<T>> {
    #iterator: Iterator<Entry<T>>;

    constructor(target: object) {
        this.#iterator = cond([
            [hasEntries, invokeEntries],
            [T, pipe(entries, indexedIterator)],
        ])(target);
    }

    [Symbol.iterator](): IterableIterator<Entry<T>> {
        return this;
    }

    next(): IteratorResult<Entry<T>> {
        return this.#iterator.next();
    }
}

/**
 * @function module:core.entriesIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.EntriesIterator} An entries iterator
 */
export const entriesIterator = <T = any>(target: object): IterableIterator<Entry<T>> => new EntriesIterator<T>(target);

/**
 * @class module:core.KeysIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
 */
export class KeysIterator implements IterableIterator<PropertyKey> {
    #iterator: Iterator<PropertyKey>;

    constructor(target: object) {
        this.#iterator = cond([
            [hasKeys, invokeKeys],
            [T, pipe(keys, indexedIterator)],
        ])(target);
    }

    [Symbol.iterator](): IterableIterator<PropertyKey> {
        return this;
    }

    next(): IteratorResult<PropertyKey> {
        return this.#iterator.next();
    }
}

/**
 * @function module:core.keysIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.KeysIterator} A keys iterator
 */
export const keysIterator = (target: object): IterableIterator<PropertyKey> => new KeysIterator(target);

/**
 * @class module:core.ValuesIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
 */
export class ValuesIterator<T = any> implements IterableIterator<T> {
    #iterator: Iterator<T>;

    constructor(target: object) {
        this.#iterator = cond([
            [hasValues, invokeValues],
            [T, pipe(values, indexedIterator)],
        ])(target);
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this;
    }

    next(): IteratorResult<T> {
        return this.#iterator.next();
    }
}

/**
 * @function module:core.valuesIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.ValuesIterator} A values iterator
 */
export const valuesIterator = <T = any>(target: object): IterableIterator<T> => new ValuesIterator<T>(target);

/**
 * @class module:core.RangeIterator
 * @implements {external:IterableIterator}
 * @param {external:number} startOrEnd The start or end of the range
 * @param {external:number} [end] The end of the range
 * @param {external:number} [step=1] The amount by which values are incremented
 */
export class RangeIterator implements IterableIterator<number> {
    #end: number;
    #step: number;
    #index: number;

    [Symbol.iterator](): IterableIterator<number> {
        return this;
    }

    constructor(startOrEnd: number, end?: number, step?: number) {
        if (step === 0) {
            throw new RangeError('"step" cannot be 0');
        } else if (typeof end === 'undefined') {
            this.#index = 0;
            this.#end = startOrEnd;
            this.#step = 1;
        } else if (typeof step === 'undefined') {
            this.#index = startOrEnd;
            this.#end = end;
            this.#step = 1;
        } else {
            this.#index = startOrEnd;
            this.#end = end;
            this.#step = step;
        }
    }

    next(): IteratorResult<number> {
        const end = this.#end,
            index = this.#index,
            step = this.#step;
        if ((step > 0 && index < end) || (step < 0 && index > end)) {
            const result = { done: false, value: index };
            this.#index += step;
            return result;
        } else {
            return { done: true } as any;
        }
    }
}

/**
 * @function module:core.rangeIterator
 * @param {external:number} startOrEnd The start or end of the range
 * @param {external:number} [end] The end of the range
 * @param {external:number} [step=1] The amount by which values are incremented
 * @returns {module:core.RangeIterator} An range iterator
 */
export const rangeIterator = (startOrEnd: number, end?: number, step?: number): IterableIterator<number> =>
    new RangeIterator(startOrEnd, end, step);

/**
 * @function module:core.getIterator
 * @param {external:Iterable} collection An iterable collection
 * @returns {external:Iterator} An iterator created from the collection
 */
export const getIterator = cond([
    [likeIterable, (iterable) => iterable[Symbol.iterator]()],
    [likeArray, indexedIterator],
    [
        T,
        () => {
            throw new TypeError('"collection" is not iterable.');
        },
    ],
]) as <T = any>(value) => Iterator<T>;
