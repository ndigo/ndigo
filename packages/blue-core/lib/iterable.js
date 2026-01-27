/**
 * @author Jeff Rose
 */
import { cond, complement, isNil, likeArray, T, invoker, pipe, propIs } from '@blue/util';
const { isArray } = Array, { entries, keys, values } = Object, hasFunction = propIs(Function), hasEntries = hasFunction('entries'), hasKeys = hasFunction('keys'), hasValues = hasFunction('values'), invokeEntries = invoker(0, 'entries'), invokeKeys = invoker(0, 'keys'), invokeValues = invoker(0, 'values');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaXRlcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLFlBQVksQ0FBQztBQTRDMUYsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssRUFDckIsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDbEMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFDOUIsVUFBVSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFDbkMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFDN0IsU0FBUyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFDakMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQ3JDLFVBQVUsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUMvQixZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUV4Qzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxLQUFVLEVBQXVCLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFFakc7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLENBQUMsS0FBVSxFQUF1QixFQUFFLENBQ3pELE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFD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