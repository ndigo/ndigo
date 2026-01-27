/**
 * @author Jeff Rose
 */

import { comparator, isBefore, like } from '@blue/util';

export type comparison<T> = (value1: T, value2: T) => number;

export type predicate<T> = (value1: T, value2: T) => boolean;

export interface Comparable<T> {
    compareTo(value: T): number;
}

export interface StringComparable<T> extends Comparable<T> {
    compareToIgnoreCase(value: T): number;
}

export interface Comparator<T> {
    compare: comparison<T>;
}

/**
 * Compares its two arguments for order. Returns a negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 * @template T
 * @callback module:core.comparison
 * @param {T} value1
 * @param {T} value2
 * @returns {number} A negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 */

/**
 */

/**
 * Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 * @returns {number} A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 */

/**
 * @extends module:core.Comparable
 */

/**
 * Compares this string-based object with the specified string-based object for order, ignoring case. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 * @returns {number} A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 */

/**
 * @property {module:core.comparison} compare
 */

const { defineProperty } = Reflect,
    naturalPredicate = <T>(value1: T, value2: T): boolean => value1 < value2;

export abstract class AbstractValueComparator implements Comparator<string> {
    readonly value: string;

    get [Symbol.toStringTag](): string {
        return 'ValueComparator';
    }

    constructor(value: string) {
        defineProperty(this, 'value', {
            value: value,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    abstract compare(pattern1: string, pattern2: string): number;
}

/**
 * @abstract
 * @implements module:core.Comparator<external:string>
 */

/**
 */
export const likeComparable = like({ compareTo: Function }) as (value) => value is Comparable<any>;

/**
 */
export const likeComparator = like({ compare: Function }) as (value) => value is Comparator<any>;

/**
 */
export const naturalComparison = comparator(naturalPredicate);

/**
 * @param {module:core.comparison} compare The comparison to invert
 * @returns {module:core.comparison} The inverted comparison
 */
export const invertComparison =
    <T>(compare: comparison<T>): comparison<T> =>
    (value1: T, value2: T) =>
        -compare(value1, value2);

/**
 * @implements module:core.Comparator
 */
class PredicateComparator<T> implements Comparator<T> {
    get [Symbol.toStringTag](): string {
        return 'PredicateComparator';
    }

    compare: comparison<T>;

    constructor(pred: predicate<T>) {
        defineProperty(this, 'compare', {
            value: comparator<T>(pred),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}

/**
 * @extends module:core~PredicateComparator
 */
class NaturalComparator<T> extends PredicateComparator<T> {
    constructor() {
        super(naturalPredicate);
    }
}

/**
 * Comparator that adapts Comparables to the Comparator interface. Mainly for internal use in other Comparators, when supposed to work on Comparables.
 * @implements module:core.Comparator
 */
class ComparableComparator<T extends Comparable<T>> implements Comparator<T> {
    compare(value1: T, value2: T): number {
        return value1.compareTo(value2);
    }
}

/**
 * @extends module:core~PredicateComparator
 */
class DateComparator extends PredicateComparator<Date> {
    constructor() {
        super(isBefore);
    }
}

/**
 * @extends module:core~NaturalComparator
 */
class NumberComparator extends NaturalComparator<number> {}

/**
 * @extends module:core~NaturalComparator
 */
class StringComparator extends NaturalComparator<string> {
    compareIgnoreCase(value1: string, value2: string): number {
        return (
            typeof value1 === 'string' &&
            typeof value2 === 'string' &&
            this.compare(value1.toLowerCase(), value2.toLowerCase())
        );
    }
}

/**
 */
export const comparableComparator = new ComparableComparator();

/**
 */
export const dateComparator = new DateComparator();

/**
 */
export const numberComparator = new NumberComparator();

/**
 */
export const stringComparator = new StringComparator();
