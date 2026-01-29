/**
 * @author Jeff Rose
 * @module list
 */
import { addIndex, addIndexRight, adjust, all, any, aperture, append, chain, collectBy, concat, count, drop, dropLast, dropLastWhile, dropRepeats, dropRepeatsBy, dropRepeatsWith, dropWhile, endsWith, filter, find, findIndex, findLast, findLastIndex, flatten, forEach, fromPairs, groupBy, groupWith, head, includes, indexBy, indexOf, init, insert, insertAll, intersperse, into, join, last, lastIndexOf, length, map, mapAccum, mapAccumRight, mergeAll, none, nth, pair, partition, pluck, prepend, reduce, reduceBy, reduceRight, reduceWhile, reduced, reject, remove, repeat, reverse, scan, 
// @ts-ignore
sequence, slice, sort, splitAt, splitEvery, splitWhen, startsWith, tail, take, takeLast, takeLastWhile, takeWhile, times, transduce, transpose, traverse, unfold, uniq, uniqBy, uniqWith, unnest, update, without, xprod, zip, zipObj, zipWith, } from 'ramda';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGlzdC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQ0gsUUFBUSxFQUNSLGFBQWEsRUFDYixNQUFNLEVBQ04sR0FBRyxFQUNILEdBQUcsRUFDSCxRQUFRLEVBQ1IsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsTUFBTSxFQUNOLEtBQUssRUFDTCxJQUFJLEVBQ0osUUFBUSxFQUNSLGFBQWEsRUFDYixXQUFXLEVBQ1gsYUFBYSxFQUNiLGVBQWUsRUFDZixTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFDTixJQUFJLEVBQ0osU0FBUyxFQUNULFFBQVEsRUFDUixhQUFhLEVBQ2IsT0FBTyxFQUNQLE9BQU8sRUFDUCxTQUFTLEVBQ1QsT0FBTyxFQUNQLFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQUNSLE9BQU8sRUFDUCxPQUFPLEVBQ1AsSUFBSSxFQUNKLE1BQU0sRUFDTixTQUFTLEVBQ1QsV0FBVyxFQUNYLElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxFQUNKLFdBQVcsRUFDWCxNQUFNLEVBQ04sR0FBRyxFQUNILFFBQVEsRUFDUixhQUFhLEVBQ2IsUUFBUSxFQUNSLElBQUksRUFDSixHQUFHLEVBQ0gsSUFBSSxFQUNKLFNBQVMsRUFDVCxLQUFLLEVBQ0wsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsV0FBVyxFQUNYLFdBQVcsRUFDWCxPQUFPLEVBQ1AsTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sT0FBTyxFQUNQLElBQUk7QUFDSixhQUFhO0FBQ2IsUUFBUSxFQUNSLEtBQUssRUFDTCxJQUFJLEVBQ0osT0FBTyxFQUNQLFVBQVUsRUFDVixTQUFTLEVBQ1QsVUFBVSxFQUNWLElBQUksRUFDSixJQUFJLEVBQ0osUUFBUSxFQUNSLGFBQWEsRUFDYixTQUFTLEVBQ1QsS0FBSyxFQUNMLFNBQVMs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