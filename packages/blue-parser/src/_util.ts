/**
 * @author Jeff Rose
 */

// @ts-ignore - Module resolution issue with monorepo paths
import { __, pipe, T } from '@blue/util/function';
import { join, map } from '@blue/util/list';
import { lt } from '@blue/util/relation';
import { cond, isEmpty, propSatisfies } from '@blue/util/logic';
import list from '@blue/util/list';

// @ts-ignore - Module resolution issue with monorepo paths
export { always, comparator, compose, curryN, identity, of, pipe, T } from '@blue/util/function';
export { filter, flatten, head, join, last, length, map, sort } from '@blue/util/list';
export { both, complement, cond, defaultTo, either, ifElse, isEmpty, isNotEmpty, when } from '@blue/util/logic';
export { forEachObjIndexed, keys, prop } from '@blue/util/object';
export { equals, lt } from '@blue/util/relation';
export { decodeURIComponent, encodeURIComponent, replace, split, test, trailingSplit } from '@blue/util/string';
export { isNil, isString } from '@blue/util/types';
export { propSatisfies } from '@blue/util/logic';

// Export custom list functions from default export
/** Creates a numeric range parser helper used by repetition utilities. */
export const rangeN = list.rangeN;
/** Joins list items while preserving a trailing delimiter. */
export const trailingJoin = list.trailingJoin;
/** Creates a cross-product of list values. */
export const xprod = list.xprod;

/** Joins values with an empty-string separator. */
export const joinOnEmptyString = join('');

/** Returns whether a collection length is less than the given threshold. */
export const lengthLessThanN = (n: number) => propSatisfies(lt(__, n), 'length');

// Cross-product utilities for brace expression expansion
/** Cross-products two lists and joins each pair as a string. */
export const xprodAndJoinOnString = (list1: any[], list2: any[]): string[] =>
    pipe(xprod(list1), map(joinOnEmptyString))(list2);

/** Cross-products a nested list structure until one list remains. */
export const xprodAll = cond([
    [isEmpty, () => []],
    [lengthLessThanN(2), (lists) => lists[0]],
    [
        T,
        (lists) => {
            const [list1, list2, ...rest] = lists;
            return xprodAll([xprodAndJoinOnString(list1, list2), ...rest]);
        },
    ],
]);

/** Expands prefix, expression, and suffix lists into all combinations. */
export const xprod3 = ([prefix, expression, suffix]) =>
    prefix.length
        ? xprodAll([prefix, expression, suffix])
        : suffix.length
          ? xprodAll([expression, suffix])
          : expression;
