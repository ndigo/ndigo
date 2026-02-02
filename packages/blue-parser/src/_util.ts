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
export { both, complement, cond, defaultTo, either, ifElse, isEmpty, when } from '@blue/util/logic';
export { forEachObjIndexed, keys, prop } from '@blue/util/object';
export { equals, lt } from '@blue/util/relation';
export { decodeURIComponent, encodeURIComponent, replace, split, test, trailingSplit } from '@blue/util/string';
export { isNil, isString } from '@blue/util/types';
export { propSatisfies } from '@blue/util/logic';

// Export custom list functions from default export
export const rangeN = list.rangeN;
export const trailingJoin = list.trailingJoin;
export const xprod = list.xprod;

export const joinOnEmptyString = join('');

export const lengthLessThanN = (n: number) => propSatisfies(lt(__, n), 'length');

// Cross-product utilities for brace expression expansion
export const xprodAndJoinOnString = (list1: any[], list2: any[]): string[] =>
    pipe(xprod(list1), map(joinOnEmptyString))(list2);

export const xprodAll = cond([
    [isEmpty, () => []],
    [lengthLessThanN(2), (lists) => lists[0]],
    [T, (lists) => {
        const [list1, list2, ...rest] = lists;
        return xprodAll([xprodAndJoinOnString(list1, list2), ...rest]);
    }],
]);

export const xprod3 = ([prefix, expression, suffix]) =>
    prefix.length ? xprodAll([prefix, expression, suffix]) : suffix.length ? xprodAll([expression, suffix]) : expression;
