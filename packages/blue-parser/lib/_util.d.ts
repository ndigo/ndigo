/**
 * @author Jeff Rose
 */
export { always, comparator, compose, curryN, identity, of, pipe, T } from '@blue/util/function';
export { filter, flatten, head, join, last, length, map, sort } from '@blue/util/list';
export { both, complement, cond, defaultTo, either, ifElse, isEmpty, when } from '@blue/util/logic';
export { forEachObjIndexed, keys, prop } from '@blue/util/object';
export { equals, lt } from '@blue/util/relation';
export { decodeURIComponent, encodeURIComponent, replace, split, test, trailingSplit } from '@blue/util/string';
export { isNil, isString } from '@blue/util/types';
export { propSatisfies } from 'ramda';
export declare const rangeN: {
    (step: number, from: number, to?: number): number[];
    (step: number): (from: number, to?: number) => number[];
    (step: number, from: number): (to?: number) => number[];
};
export declare const trailingJoin: {
    (separator: string, list: any[]): string;
    (separator: string): (list: any[]) => string;
};
export declare const xprod: typeof import("ramda").xprod;
export declare const joinOnEmptyString: (xs: readonly any[]) => string;
export declare const lengthLessThanN: (n: number) => (obj: any) => boolean;
//# sourceMappingURL=_util.d.ts.map