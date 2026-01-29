/**
 * @author Jeff Rose
 */
import { T, invoker, pipe } from '@blue/util/function';
import { complement, cond } from '@blue/util/logic';
import { prop } from '@blue/util/object';
import { likeArray, isNil, is } from '@blue/util/types';
const { isArray } = Array, { entries, keys, values } = Object, propIs = (type) => (name) => (obj) => is(type, prop(name, obj)), hasFunction = propIs(Function), hasEntries = hasFunction('entries'), hasKeys = hasFunction('keys'), hasValues = hasFunction('values'), invokeEntries = invoker(0, 'entries'), invokeKeys = invoker(0, 'keys'), invokeValues = invoker(0, 'values');
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is an entry
 */
export const isEntry = (value) => isArray(value) && value.length === 2;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is a list of entries
 */
export const isEntries = (value) => isArray(value) && (value.length ? isEntry(value[0]) : true);
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is iterable
 */
export const likeIterable = (value) => complement(isNil)(value) && value[Symbol.iterator] !== undefined;
/**
 * @implements {IterableIterator}
 * @param {ArrayLike} indexed An indexed collection
 */
export class IndexedIterator {
    #indexed;
    #index;
    [Symbol.iterator]() {
        return this;
    }
    constructor(indexed) {
        this.#indexed = indexed;
        this.#index = 0;
    }
    next() {
        if (this.#index < this.#indexed.length) {
            return { done: false, value: this.#indexed[this.#index++] };
        }
        else {
            return { done: true };
        }
    }
}
/**
 * @param {ArrayLike} indexed An indexed collection
 * @returns {IndexedIterator} An indexed iterator
 */
export const indexedIterator = (indexed) => new IndexedIterator(indexed);
/**
 * @implements external:IterableIterator
 * @param {Object} target A non-primitive value
 */
export class EntriesIterator {
    #iterator;
    constructor(target) {
        this.#iterator = cond([
            [hasEntries, invokeEntries],
            [T, pipe(entries, indexedIterator)],
        ])(target);
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        return this.#iterator.next();
    }
}
/**
 * @param {Object} target A non-primitive value
 * @returns {module:core.EntriesIterator} An entries iterator
 */
export const entriesIterator = (target) => new EntriesIterator(target);
/**
 * @implements external:IterableIterator
 * @param {Object} target A non-primitive value
 */
export class KeysIterator {
    #iterator;
    constructor(target) {
        this.#iterator = cond([
            [hasKeys, invokeKeys],
            [T, pipe(keys, indexedIterator)],
        ])(target);
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        return this.#iterator.next();
    }
}
/**
 * @param {Object} target A non-primitive value
 * @returns {module:core.KeysIterator} A keys iterator
 */
export const keysIterator = (target) => new KeysIterator(target);
/**
 * @implements external:IterableIterator
 * @param {Object} target A non-primitive value
 */
export class ValuesIterator {
    #iterator;
    constructor(target) {
        this.#iterator = cond([
            [hasValues, invokeValues],
            [T, pipe(values, indexedIterator)],
        ])(target);
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        return this.#iterator.next();
    }
}
/**
 * @param {Object} target A non-primitive value
 * @returns {module:core.ValuesIterator} A values iterator
 */
export const valuesIterator = (target) => new ValuesIterator(target);
/**
 * @implements {IterableIterator}
 * @param {number} startOrEnd The start or end of the range
 * @param {number} [end] The end of the range
 * @param {number} [step=1] The amount by which values are incremented
 */
export class RangeIterator {
    #end;
    #step;
    #index;
    [Symbol.iterator]() {
        return this;
    }
    constructor(startOrEnd, end, step) {
        if (step === 0) {
            throw new RangeError('"step" cannot be 0');
        }
        else if (typeof end === 'undefined') {
            this.#index = 0;
            this.#end = startOrEnd;
            this.#step = 1;
        }
        else if (typeof step === 'undefined') {
            this.#index = startOrEnd;
            this.#end = end;
            this.#step = 1;
        }
        else {
            this.#index = startOrEnd;
            this.#end = end;
            this.#step = step;
        }
    }
    next() {
        const end = this.#end, index = this.#index, step = this.#step;
        if ((step > 0 && index < end) || (step < 0 && index > end)) {
            const result = { done: false, value: index };
            this.#index += step;
            return result;
        }
        else {
            return { done: true };
        }
    }
}
/**
 * @param {number} startOrEnd The start or end of the range
 * @param {number} [end] The end of the range
 * @param {number} [step=1] The amount by which values are incremented
 * @returns {module:core.RangeIterator} An range iterator
 */
export const rangeIterator = (startOrEnd, end, step) => new RangeIterator(startOrEnd, end, step);
/**
 * @param {Iterable} collection An iterable collection
 * @returns {Iterator} An iterator created from the collection
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
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaXRlcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQTRDeEQsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssRUFDckIsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDbEMsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUMvRCxXQUFXLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUM5QixVQUFVLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUNuQyxPQUFPLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUM3QixTQUFTLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUNqQyxhQUFhLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsRUFDckMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQy9CLFlBQVksR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBRXhDOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FB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