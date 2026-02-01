import { joinOnEmptyString, map, pipe, xprod } from './_util.js';

export const xprodAndJoinOnString = (list1: any[], list2: any[]): string[] =>
    pipe(xprod(list1), map(joinOnEmptyString))(list2);

export const xprodAll = (list1: any[], list2?: any[], ...lists: any[][]): string[] =>
    list2 && list2.length ? xprodAll(xprodAndJoinOnString(list1, list2), ...lists) : list1;

export const xprod3 = ([prefix, expression, suffix]) =>
    prefix.length ? xprodAll(prefix, expression, suffix) : suffix.length ? xprodAll(expression, suffix) : expression;
