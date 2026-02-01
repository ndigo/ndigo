import { cond, isEmpty, joinOnEmptyString, lengthLessThanN, map, pipe, T, xprod } from './_util.js';

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
