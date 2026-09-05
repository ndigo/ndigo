import { like } from '@blue/util';

/**
 * A function that compares two values for order. Returns a negative integer, zero, or a positive integer
 * as the first argument is less than, equal to, or greater than the second.
 * @template T - The type of values being compared.
 * @param value1 - The first value to compare.
 * @param value2 - The second value to compare.
 * @returns A negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 */
export type comparison<T> = (value1: T, value2: T) => number;

/**
 * A function that evaluates a condition between two values, returning a boolean.
 * @template T - The type of values being evaluated.
 * @param value1 - The first value.
 * @param value2 - The second value.
 * @returns `true` if the condition is met, `false` otherwise.
 */
export type predicate<T> = (value1: T, value2: T) => boolean;

/**
 * Interface for objects that can be compared to another object of the same type.
 * @template T - The type of the object being compared.
 */
export interface Comparable<T> {
    /**
     * Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer
     * as this object is less than, equal to, or greater than the specified object.
     * @param value - The object to be compared.
     * @returns A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
     */
    compareTo(value: T): number;
}

/**
 * Interface for string-based objects that can be compared to another object of the same type, with case-insensitive comparison.
 * @template T - The type of the string-based object being compared.
 */
export interface StringComparable<T> extends Comparable<T> {
    /**
     * Compares this string-based object with the specified string-based object for order, ignoring case.
     * Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
     * @param value - The object to be compared.
     * @returns A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
     */
    compareToIgnoreCase(value: T): number;
}

/**
 * Interface for objects that can compare two values of a specific type.
 * @template T - The type of values being compared.
 */
export interface Comparator<T> {
    /**
     * Compares its two arguments for order. Returns a negative integer, zero, or a positive integer
     * as the first argument is less than, equal to, or greater than the second.
     * @param value1 - The first value to compare.
     * @param value2 - The second value to compare.
     * @returns A negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
     */
    compare: comparison<T>;
}

const { defineProperty } = Reflect,
    naturalPredicate = <T>(value1: T, value2: T): boolean => value1 < value2,
    _comparator =
        <T>(pred: predicate<T>): comparison<T> =>
        (a: T, b: T): number =>
            pred(a, b) ? -1 : pred(b, a) ? 1 : 0;

export abstract class AbstractValueComparator implements Comparator<string> {
    /**
     * The string value being compared.
     */
    readonly value!: string;

    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'ValueComparator';
    }

    /**
     * Creates an instance of AbstractValueComparator.
     * @param value - The string value to be used for comparison.
     */
    constructor(value: string) {
        defineProperty(this, 'value', {
            value: value,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Compares two string patterns. This method must be implemented by subclasses.
     * @param pattern1 - The first string pattern.
     * @param pattern2 - The second string pattern.
     * @returns A negative integer, zero, or a positive integer as the first pattern is less than, equal to, or greater than the second.
     */
    abstract compare(pattern1: string, pattern2: string): number;
}

/**
 * Type guard to check if a value implements the `Comparable` interface.
 * @param value - The value to check.
 * @returns `true` if the value is `Comparable`, `false` otherwise.
 */
export const likeComparable = like({ compareTo: Function }) as (value: unknown) => value is Comparable<any>;

/**
 * Type guard to check if a value implements the `Comparator` interface.
 * @param value - The value to check.
 * @returns `true` if the value is `Comparator`, `false` otherwise.
 */
export const likeComparator = like({ compare: Function }) as (value: unknown) => value is Comparator<any>;

/**
 * A comparison function that uses natural ordering (less than operator).
 * @template T - The type of values being compared.
 * @param value1 - The first value.
 * @param value2 - The second value.
 * @returns A negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 */
export const naturalComparison = _comparator(naturalPredicate);

/**
 * Inverts the order of a given comparison function.
 * @template T - The type of values being compared.
 * @param compare - The comparison function to invert.
 * @returns A new comparison function with inverted order.
 */
export const invertComparison =
    <T>(compare: comparison<T>): comparison<T> =>
    (value1: T, value2: T) =>
        -compare(value1, value2);

/**
 * A comparator that uses a predicate function to determine order.
 * @template T - The type of values being compared.
 */
class PredicateComparator<T> implements Comparator<T> {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'PredicateComparator';
    }

    /**
     * The comparison function used by this comparator.
     */
    compare!: comparison<T>;

    /**
     * Creates an instance of PredicateComparator.
     * @param pred - The predicate function to use for comparison.
     */
    constructor(pred: predicate<T>) {
        defineProperty(this, 'compare', {
            value: _comparator<T>(pred),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}

/**
 * A comparator that uses natural ordering for comparison.
 * @template T - The type of values being compared.
 * @extends PredicateComparator
 */
class NaturalComparator<T> extends PredicateComparator<T> {
    /**
     * Creates an instance of NaturalComparator.
     */
    constructor() {
        super(naturalPredicate);
    }
}

/**
 * A comparator for `number` objects.
 * @extends NaturalComparator
 */
class NumberComparator extends NaturalComparator<number> {}

/**
 * A comparator for `string` objects, with a method for case-insensitive comparison.
 * @extends NaturalComparator
 */
class StringComparator extends NaturalComparator<string> {
    /**
     * Compares two strings ignoring case.
     * @param value1 - The first string.
     * @param value2 - The second string.
     * @returns A negative integer, zero, or a positive integer as the first string is less than, equal to, or greater than the second (case-insensitive).
     */
    compareIgnoreCase(value1: string, value2: string): number {
        const result =
            typeof value1 === 'string' &&
            typeof value2 === 'string' &&
            this.compare(value1.toLowerCase(), value2.toLowerCase());
        return typeof result === 'number' ? result : 0;
    }
}

/**
 * A `Comparator` instance for `number` objects.
 */
export const numberComparator = new NumberComparator();

/**
 * A `Comparator` instance for `string` objects.
 */
export const stringComparator = new StringComparator();
