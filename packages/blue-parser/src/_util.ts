/**
 * @author Jeff Rose
 */

import { __, join, lt, propSatisfies } from '@blue/util';

export {
    always,
    both,
    cond,
    comparator,
    complement,
    compose,
    curryN,
    decodeURIComponent,
    defaultTo,
    either,
    encodeURIComponent,
    equals,
    filter,
    flatten,
    forEachObjIndexed,
    head,
    identity,
    ifElse,
    isEmpty,
    isNil,
    isString,
    join,
    keys,
    last,
    length,
    lt,
    map,
    of,
    pipe,
    prop,
    propSatisfies,
    rangeN,
    replace,
    sort,
    split,
    T,
    test,
    trailingJoin,
    trailingSplit,
    when,
    xprod,
} from '@blue/util';

export const joinOnEmptyString = join('');

export const lengthLessThanN = (n: number) => propSatisfies(lt(__, n), 'length');
