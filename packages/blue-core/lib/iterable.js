/**
 * @author Jeff Rose
 */
import { cond, complement, isNil, likeArray, T, invoker, pipe, propIs } from '@blue/util';
const { isArray } = Array, { entries, keys, values } = Object, hasFunction = propIs(Function), hasEntries = hasFunction('entries'), hasKeys = hasFunction('keys'), hasValues = hasFunction('values'), invokeEntries = invoker(0, 'entries'), invokeKeys = invoker(0, 'keys'), invokeValues = invoker(0, 'values');
/**
 * @function module:core.isEntry
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is an entry
 */
export const isEntry = (value) => isArray(value) && value.length === 2;
/**
 * @function module:core.isEntries
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is a list of entries
 */
export const isEntries = (value) => isArray(value) && (value.length ? isEntry(value[0]) : true);
/**
 * @function module:core.likeIterable
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is iterable
 */
export const likeIterable = (value) => complement(isNil)(value) && value[Symbol.iterator] !== undefined;
/**
 * @class module:core.IndexedIterator
 * @implements {external:IterableIterator}
 * @param {external:ArrayLike} indexed An indexed collection
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
 * @function module:core.indexedIterator
 * @param {external:ArrayLike} indexed An indexed collection
 * @returns {external:IndexedIterator} An indexed iterator
 */
export const indexedIterator = (indexed) => new IndexedIterator(indexed);
/**
 * @class module:core.EntriesIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
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
 * @function module:core.entriesIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.EntriesIterator} An entries iterator
 */
export const entriesIterator = (target) => new EntriesIterator(target);
/**
 * @class module:core.KeysIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
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
 * @function module:core.keysIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.KeysIterator} A keys iterator
 */
export const keysIterator = (target) => new KeysIterator(target);
/**
 * @class module:core.ValuesIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
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
 * @function module:core.valuesIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.ValuesIterator} A values iterator
 */
export const valuesIterator = (target) => new ValuesIterator(target);
/**
 * @class module:core.RangeIterator
 * @implements {external:IterableIterator}
 * @param {external:number} startOrEnd The start or end of the range
 * @param {external:number} [end] The end of the range
 * @param {external:number} [step=1] The amount by which values are incremented
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
 * @function module:core.rangeIterator
 * @param {external:number} startOrEnd The start or end of the range
 * @param {external:number} [end] The end of the range
 * @param {external:number} [step=1] The amount by which values are incremented
 * @returns {module:core.RangeIterator} An range iterator
 */
export const rangeIterator = (startOrEnd, end, step) => new RangeIterator(startOrEnd, end, step);
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
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaXRlcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLFlBQVksQ0FBQztBQTRDMUYsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssRUFDckIsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDbEMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFDOUIsVUFBVSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFDbkMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFDN0IsU0FBUyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFDakMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQ3JDLFVBQVUsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUMvQixZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUV4Qzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBVSxFQUF1QixFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBRWpHOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxLQUFVLEVBQXVCLEVBQUUsQ0FDekQsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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