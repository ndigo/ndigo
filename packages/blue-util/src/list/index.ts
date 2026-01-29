/**
 * @author Jeff Rose
 * @module list
 */

import {
    addIndex,
    addIndexRight,
    adjust,
    all,
    any,
    aperture,
    append,
    chain,
    collectBy,
    concat,
    count,
    drop,
    dropLast,
    dropLastWhile,
    dropRepeats,
    dropRepeatsBy,
    dropRepeatsWith,
    dropWhile,
    endsWith,
    filter,
    find,
    findIndex,
    findLast,
    findLastIndex,
    flatten,
    forEach,
    fromPairs,
    groupBy,
    groupWith,
    head,
    includes,
    indexBy,
    indexOf,
    init,
    insert,
    insertAll,
    intersperse,
    into,
    join,
    last,
    lastIndexOf,
    length,
    map,
    mapAccum,
    mapAccumRight,
    mergeAll,
    none,
    nth,
    pair,
    partition,
    pluck,
    prepend,
    reduce,
    reduceBy,
    reduceRight,
    reduceWhile,
    reduced,
    reject,
    remove,
    repeat,
    reverse,
    scan,
    // @ts-ignore
    sequence,
    slice,
    sort,
    splitAt,
    splitEvery,
    splitWhen,
    startsWith,
    tail,
    take,
    takeLast,
    takeLastWhile,
    takeWhile,
    times,
    transduce,
    transpose,
    traverse,
    unfold,
    uniq,
    uniqBy,
    uniqWith,
    unnest,
    update,
    without,
    xprod,
    zip,
    zipObj,
    zipWith,
} from 'ramda';

import fromRepeatedPairs from './from-repeated-pairs.js';
import range from './range.js';
import rangeN from './range-n.js';
import regExpRange from './reg-exp-range.js';
import sample from './sample.js';
import shuffle from './shuffle.js';
import trailingJoin from './trailing-join.js';

/** @category Function @category List */
export { addIndex };
/** @category Function @category List */
export { addIndexRight };
/** @category List */
export { adjust };
/** @category List */
export { all };
/** @category List */
export { any };
/** @category List */
export { aperture };
/** @category List */
export { append };
/** @category List */
export { chain };
/** @category List */
export { collectBy };
/** @category List */
export { concat };
/** @category List */
export { count };
/** @category List */
export { drop };
/** @category List */
export { dropLast };
/** @category List */
export { dropLastWhile };
/** @category List */
export { dropRepeats };
/** @category List */
export { dropRepeatsBy };
/** @category List */
export { dropRepeatsWith };
/** @category List */
export { dropWhile };
/** @category List */
export { endsWith };
/** @category List */
export { filter };
/** @category List */
export { find };
/** @category List */
export { findIndex };
/** @category List */
export { findLast };
/** @category List */
export { findLastIndex };
/** @category List */
export { flatten };
/** @category List */
export { forEach };
/** @category List */
export { fromPairs };
/** @category List */
export { groupBy };
/** @category List */
export { groupWith };
/** @category List */
export { head };
/** @category List */
export { includes };
/** @category List */
export { indexBy };
/** @category List */
export { indexOf };
/** @category List */
export { init };
/** @category List */
export { insert };
/** @category List */
export { insertAll };
/** @category List */
export { intersperse };
/** @category List */
export { into };
/** @category List */
export { join };
/** @category List */
export { last };
/** @category List */
export { lastIndexOf };
/** @category List */
export { length };
/** @category List */
export { map };
/** @category List */
export { mapAccum };
/** @category List */
export { mapAccumRight };
/** @category List */
export { mergeAll };
/** @category List */
export { none };
/** @category List */
export { nth };
/** @category List */
export { pair };
/** @category List */
export { partition };
/** @category List */
export { pluck };
/** @category List */
export { prepend };
/** @category List */
export { reduce };
/** @category List */
export { reduceBy };
/** @category List */
export { reduceRight };
/** @category List */
export { reduceWhile };
/** @category List */
export { reduced };
/** @category List */
export { reject };
/** @category List */
export { remove };
/** @category List */
export { repeat };
/** @category List */
export { reverse };
/** @category List */
export { scan };
/** @category List */
export { sequence };
/** @category List */
export { slice };
/** @category List */
export { sort };
/** @category List */
export { splitAt };
/** @category List */
export { splitEvery };
/** @category List */
export { splitWhen };
/** @category List */
export { startsWith };
/** @category List */
export { tail };
/** @category List */
export { take };
/** @category List */
export { takeLast };
/** @category List */
export { takeLastWhile };
/** @category List */
export { takeWhile };
/** @category List */
export { times };
/** @category List */
export { transduce };
/** @category List */
export { transpose };
/** @category List */
export { traverse };
/** @category List */
export { unfold };
/** @category List */
export { uniq };
/** @category List */
export { uniqBy };
/** @category List */
export { uniqWith };
/** @category List */
export { unnest };
/** @category List */
export { update };
/** @category List */
export { without };
/** @category List */
export { xprod };
/** @category List */
export { zip };
/** @category List */
export { zipObj };
/** @category List */
export { zipWith };

export { fromRepeatedPairs, range, rangeN, regExpRange, sample, shuffle, trailingJoin };

export default {
    addIndex,
    addIndexRight,
    adjust,
    all,
    any,
    aperture,
    append,
    chain,
    collectBy,
    concat,
    count,
    drop,
    dropLast,
    dropLastWhile,
    dropRepeats,
    dropRepeatsBy,
    dropRepeatsWith,
    dropWhile,
    endsWith,
    filter,
    find,
    findIndex,
    findLast,
    findLastIndex,
    flatten,
    forEach,
    fromPairs,
    fromRepeatedPairs,
    groupBy,
    groupWith,
    head,
    includes,
    indexBy,
    indexOf,
    init,
    insert,
    insertAll,
    intersperse,
    into,
    join,
    last,
    lastIndexOf,
    length,
    map,
    mapAccum,
    mapAccumRight,
    mergeAll,
    none,
    nth,
    pair,
    partition,
    pluck,
    prepend,
    range,
    rangeN,
    reduce,
    reduceBy,
    reduceRight,
    reduceWhile,
    reduced,
    regExpRange,
    reject,
    remove,
    repeat,
    reverse,
    sample,
    scan,
    sequence,
    shuffle,
    slice,
    sort,
    splitAt,
    splitEvery,
    splitWhen,
    startsWith,
    tail,
    take,
    takeLast,
    takeLastWhile,
    takeWhile,
    times,
    trailingJoin,
    transduce,
    transpose,
    traverse,
    unfold,
    uniq,
    uniqBy,
    uniqWith,
    unnest,
    update,
    without,
    xprod,
    zip,
    zipObj,
    zipWith,
};
