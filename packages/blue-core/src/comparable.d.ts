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
export declare abstract class AbstractValueComparator implements Comparator<string> {
    /**
     * The string value being compared.
     */
    readonly value: string;
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string;
    /**
     * Creates an instance of AbstractValueComparator.
     * @param value - The string value to be used for comparison.
     */
    constructor(value: string);
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
export declare const likeComparable: (value: unknown) => value is Comparable<any>;
/**
 * Type guard to check if a value implements the `Comparator` interface.
 * @param value - The value to check.
 * @returns `true` if the value is `Comparator`, `false` otherwise.
 */
export declare const likeComparator: (value: unknown) => value is Comparator<any>;
/**
 * A comparison function that uses natural ordering (less than operator).
 * @template T - The type of values being compared.
 * @param value1 - The first value.
 * @param value2 - The second value.
 * @returns A negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 */
export declare const naturalComparison: <T>(value1: T, value2: T) => number;
/**
 * Inverts the order of a given comparison function.
 * @template T - The type of values being compared.
 * @param compare - The comparison function to invert.
 * @returns A new comparison function with inverted order.
 */
export declare const invertComparison: <T>(compare: comparison<T>) => comparison<T>;
/**
 * A comparator that uses a predicate function to determine order.
 * @template T - The type of values being compared.
 */
declare class PredicateComparator<T> implements Comparator<T> {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string;
    /**
     * The comparison function used by this comparator.
     */
    compare: comparison<T>;
    /**
     * Creates an instance of PredicateComparator.
     * @param pred - The predicate function to use for comparison.
     */
    constructor(pred: predicate<T>);
}
/**
 * A comparator that uses natural ordering for comparison.
 * @template T - The type of values being compared.
 * @extends PredicateComparator
 */
declare class NaturalComparator<T> extends PredicateComparator<T> {
    /**
     * Creates an instance of NaturalComparator.
     */
    constructor();
}
/**
 * A comparator for `number` objects.
 * @extends NaturalComparator
 */
declare class NumberComparator extends NaturalComparator<number> {
}
/**
 * A comparator for `string` objects, with a method for case-insensitive comparison.
 * @extends NaturalComparator
 */
declare class StringComparator extends NaturalComparator<string> {
    /**
     * Compares two strings ignoring case.
     * @param value1 - The first string.
     * @param value2 - The second string.
     * @returns A negative integer, zero, or a positive integer as the first string is less than, equal to, or greater than the second (case-insensitive).
     */
    compareIgnoreCase(value1: string, value2: string): number;
}
/**
 * A `Comparator` instance for `number` objects.
 */
export declare const numberComparator: NumberComparator;
/**
 * A `Comparator` instance for `string` objects.
 */
export declare const stringComparator: StringComparator;
export {};
