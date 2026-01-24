/**
 * @author Jeff Rose
 */
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
export declare abstract class AbstractValueComparator implements Comparator<string> {
    readonly value: string;
    get [Symbol.toStringTag](): string;
    constructor(value: string);
    abstract compare(pattern1: string, pattern2: string): number;
}
/**
 * @abstract
 * @class module:core.AbstractValueComparator
 * @implements module:core.Comparator<external:string>
 */
/**
 * @function module:core.likeComparable
 */
export declare const likeComparable: (value: any) => value is Comparable<any>;
/**
 * @function module:core.likeComparator
 */
export declare const likeComparator: (value: any) => value is Comparator<any>;
/**
 * @const {module:core.comparison} module:core.naturalComparison
 */
export declare const naturalComparison: any;
/**
 * @const {external:Function} module:core.invertComparison
 * @param {module:core.comparison} compare The comparison to invert
 * @returns {module:core.comparison} The inverted comparison
 */
export declare const invertComparison: <T>(compare: comparison<T>) => comparison<T>;
/**
 * @class module:core~PredicateComparator
 * @implements module:core.Comparator
 */
declare class PredicateComparator<T> implements Comparator<T> {
    get [Symbol.toStringTag](): string;
    compare: comparison<T>;
    constructor(pred: predicate<T>);
}
/**
 * @class module:core~NaturalComparator
 * @extends module:core~PredicateComparator
 */
declare class NaturalComparator<T> extends PredicateComparator<T> {
    constructor();
}
/**
 * Comparator that adapts Comparables to the Comparator interface. Mainly for internal use in other Comparators, when supposed to work on Comparables.
 * @class module:core.ComparableComparator
 * @implements module:core.Comparator
 */
declare class ComparableComparator<T extends Comparable<T>> implements Comparator<T> {
    compare(value1: T, value2: T): number;
}
/**
 * @class module:core~DateComparator
 * @extends module:core~PredicateComparator
 */
declare class DateComparator extends PredicateComparator<Date> {
    constructor();
}
/**
 * @class module:core~NumberComparator
 * @extends module:core~NaturalComparator
 */
declare class NumberComparator extends NaturalComparator<number> {}
/**
 * @class module:core~StringComparator
 * @extends module:core~NaturalComparator
 */
declare class StringComparator extends NaturalComparator<string> {
    compareIgnoreCase(value1: string, value2: string): number;
}
/**
 * @const {module:core~ComparableComparator} module:core.comparableComparator
 */
export declare const comparableComparator: ComparableComparator<Comparable<unknown>>;
/**
 * @const {module:core~DateComparator} module:core.dateComparator
 */
export declare const dateComparator: DateComparator;
/**
 * @const {module:core~NumberComparator} module:core.numberComparator
 */
export declare const numberComparator: NumberComparator;
/**
 * @const {module:core~StringComparator} module:core.stringComparator
 */
export declare const stringComparator: StringComparator;
export {};
//# sourceMappingURL=comparable.d.ts.map
