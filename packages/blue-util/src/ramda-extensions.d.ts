/**
 * Type definitions for Ramda 0.32.0 functions not yet in @types/ramda@0.31.1
 * These augment the existing ramda module definitions
 */

declare module 'ramda' {
    /**
     * As with addIndex, addIndexRight creates a new list iteration function from an existing one
     * by adding two new parameters to its callback function: the current index, and the entire list.
     * Unlike addIndex, addIndexRight iterates from the right to the left.
     */
    function addIndexRight<T, U>(
        fn: (f: (item: T, idx: number, list: readonly T[]) => U) => (list: readonly T[]) => U[]
    ): (f: (item: T, idx: number, list: readonly T[]) => U) => (list: readonly T[]) => U[];

    /**
     * Makes an ascending comparator function out of a function that returns a value
     * that can be compared with natural sorting using localeCompare.
     */
    function ascendNatural<T>(locales: string | string[]): (fn: (obj: T) => string) => (a: T, b: T) => number;
    function ascendNatural<T>(locales: string | string[], fn: (obj: T) => string): (a: T, b: T) => number;
    function ascendNatural<T>(locales: string | string[], fn: (obj: T) => string, a: T): (b: T) => number;
    function ascendNatural<T>(locales: string | string[], fn: (obj: T) => string, a: T, b: T): number;

    /**
     * Splits a list into sub-lists, based on the result of calling a key-returning function
     * on each element, and grouping the results according to values returned.
     */
    function collectBy<T, K extends PropertyKey>(fn: (item: T) => K): (list: readonly T[]) => T[][];
    function collectBy<T, K extends PropertyKey>(fn: (item: T) => K, list: readonly T[]): T[][];

    /**
     * Returns the number of items in a given list matching the predicate.
     */
    function count<T>(predicate: (item: T) => boolean): (list: readonly T[]) => number;
    function count<T>(predicate: (item: T) => boolean, list: readonly T[]): number;

    /**
     * Makes a descending comparator function out of a function that returns a value
     * that can be compared with natural sorting using localeCompare.
     */
    function descendNatural<T>(locales: string | string[]): (fn: (obj: T) => string) => (a: T, b: T) => number;
    function descendNatural<T>(locales: string | string[], fn: (obj: T) => string): (a: T, b: T) => number;
    function descendNatural<T>(locales: string | string[], fn: (obj: T) => string, a: T): (b: T) => number;
    function descendNatural<T>(locales: string | string[], fn: (obj: T) => string, a: T, b: T): number;

    /**
     * Returns a new list without any consecutively repeating elements.
     * Equality is determined by applying the supplied function to each pair of consecutive elements.
     */
    function dropRepeatsBy<T, U>(fn: (item: T) => U): (list: readonly T[]) => T[];
    function dropRepeatsBy<T, U>(fn: (item: T) => U, list: readonly T[]): T[];

    /**
     * Like partial, but for object-based parameter lists.
     */
    function partialObject<T, R>(fn: (obj: T) => R, partial: Partial<T>): (obj: Partial<T>) => R;
    function partialObject<T, R>(fn: (obj: T) => R): (partial: Partial<T>) => (obj: Partial<T>) => R;

    /**
     * Profunctor map - contramap and map in one operation.
     */
    function promap<A, B, C, D>(f: (a: A) => B, g: (c: C) => D): (fn: (b: B) => C) => (a: A) => D;
    function promap<A, B, C, D>(f: (a: A) => B): (g: (c: C) => D) => (fn: (b: B) => C) => (a: A) => D;
    function promap<A, B, C, D>(f: (a: A) => B, g: (c: C) => D, fn: (b: B) => C): (a: A) => D;

    /**
     * Builds a list from a seed value using an unfold function.
     */
    function rebuild<T, R>(fn: (acc: R, item: T) => R): (seed: R) => (list: readonly T[]) => R[];
    function rebuild<T, R>(fn: (acc: R, item: T) => R, seed: R): (list: readonly T[]) => R[];
    function rebuild<T, R>(fn: (acc: R, item: T) => R, seed: R, list: readonly T[]): R[];

    /**
     * Splits a list into sub-lists, splitting at each element where the predicate returns true.
     */
    function splitWhenever<T>(predicate: (item: T) => boolean): (list: readonly T[]) => T[][];
    function splitWhenever<T>(predicate: (item: T) => boolean, list: readonly T[]): T[][];

    /**
     * Swaps the positions of two elements in a list.
     */
    function swap<T>(indexA: number): (indexB: number) => (list: readonly T[]) => T[];
    function swap<T>(indexA: number, indexB: number): (list: readonly T[]) => T[];
    function swap<T>(indexA: number, indexB: number, list: readonly T[]): T[];

    /**
     * Wraps a function in a thunk - a function that takes no arguments and returns the result
     * of calling the original function with the provided arguments.
     */
    function thunkify<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => () => ReturnType<T>;

    /**
     * Transforms a [Traversable](https://github.com/fantasyland/fantasy-land#traversable)
     * of [Applicative](https://github.com/fantasyland/fantasy-land#applicative)
     * into an Applicative of Traversable.
     *
     * Dispatches to the `sequence` method of the second argument, if present.
     */
    function sequence<A>(of: (a: A) => A[]): (traversable: A[][]) => A[][];
    function sequence<A>(of: (a: A) => A[], traversable: A[][]): A[][];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function sequence(of: (...args: any[]) => any): (traversable: any) => any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function sequence(of: (...args: any[]) => any, traversable: any): any;

    /**
     * Takes a spec object and a test object; returns true if the test satisfies any of the spec properties.
     */
    function whereAny<T>(spec: Partial<T>): (testObj: T) => boolean;
    function whereAny<T>(spec: Partial<T>, testObj: T): boolean;
}
