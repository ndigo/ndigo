/**
 * @author Jeff Rose
 * @module list
 */
import { addIndex, addIndexRight, adjust, all, any, aperture, append, chain, collectBy, concat, count, drop, dropLast, dropLastWhile, dropRepeats, dropRepeatsBy, dropRepeatsWith, dropWhile, endsWith, filter, find, findIndex, findLast, findLastIndex, flatten, forEach, fromPairs, groupBy, groupWith, head, includes, indexBy, indexOf, init, insert, insertAll, intersperse, into, join, last, lastIndexOf, length, map, mapAccum, mapAccumRight, mergeAll, none, nth, pair, partition, pluck, prepend, reduce, reduceBy, reduceRight, reduceWhile, reduced, reject, remove, repeat, reverse, scan, sequence, slice, sort, splitAt, splitEvery, splitWhen, startsWith, tail, take, takeLast, takeLastWhile, takeWhile, times, transduce, transpose, traverse, unfold, uniq, uniqBy, uniqWith, unnest, update, without, xprod, zip, zipObj, zipWith } from 'ramda';
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
declare const _default: {
    addIndex: typeof addIndex;
    addIndexRight: typeof addIndexRight;
    adjust: typeof adjust;
    all: typeof all;
    any: typeof any;
    aperture: typeof aperture;
    append: typeof append;
    chain: typeof chain;
    collectBy: typeof collectBy;
    concat: typeof concat;
    count: typeof count;
    drop: typeof drop;
    dropLast: typeof dropLast;
    dropLastWhile: typeof dropLastWhile;
    dropRepeats: typeof dropRepeats;
    dropRepeatsBy: typeof dropRepeatsBy;
    dropRepeatsWith: typeof dropRepeatsWith;
    dropWhile: typeof dropWhile;
    endsWith: typeof endsWith;
    filter: typeof filter;
    find: typeof find;
    findIndex: typeof findIndex;
    findLast: typeof findLast;
    findLastIndex: typeof findLastIndex;
    flatten: typeof flatten;
    forEach: typeof forEach;
    fromPairs: typeof fromPairs;
    fromRepeatedPairs: (pairs: [any, any][]) => {
        any?: any | any[];
    };
    groupBy: typeof groupBy;
    groupWith: typeof groupWith;
    head: typeof head;
    includes: typeof includes;
    indexBy: typeof indexBy;
    indexOf: typeof indexOf;
    init: typeof init;
    insert: typeof insert;
    insertAll: typeof insertAll;
    intersperse: typeof intersperse;
    into: typeof into;
    join: typeof join;
    last: typeof last;
    lastIndexOf: typeof lastIndexOf;
    length: typeof length;
    map: typeof map;
    mapAccum: typeof mapAccum;
    mapAccumRight: typeof mapAccumRight;
    mergeAll: typeof mergeAll;
    none: typeof none;
    nth: typeof nth;
    pair: typeof pair;
    partition: typeof partition;
    pluck: typeof pluck;
    prepend: typeof prepend;
    range: (from: number, to?: number) => number[];
    rangeN: {
        (step: number, from: number, to?: number): number[];
        (step: number): (from: number, to?: number) => number[];
        (step: number, from: number): (to?: number) => number[];
    };
    reduce: typeof reduce;
    reduceBy: typeof reduceBy;
    reduceRight: typeof reduceRight;
    reduceWhile: typeof reduceWhile;
    reduced: typeof reduced;
    regExpRange: {
        (from: import("../type/is-numeric.js").Numeric, to?: import("../type/is-numeric.js").Numeric, init?: import("./reg-exp-range.js").RegExpRangeInit): string;
        cache: Map<string, {
            a: number;
            b: number;
            isPadded?: boolean;
            maxLen?: number;
            min: import("../type/is-numeric.js").Numeric;
            max: import("../type/is-numeric.js").Numeric;
            negatives?: {
                pattern: string;
                count: number[];
                digits: number;
                value?: string;
            }[];
            positives?: {
                pattern: string;
                count: number[];
                digits: number;
                value?: string;
            }[];
            result?: string;
        }>;
        clearCache(): void;
    };
    reject: typeof reject;
    remove: typeof remove;
    repeat: typeof repeat;
    reverse: typeof reverse;
    sample: {
        <T = any>(n: number, list: ArrayLike<T>): T[];
        <T = any>(n: number): (list: ArrayLike<T>) => T[];
    };
    scan: typeof scan;
    sequence: any;
    shuffle: typeof shuffle;
    slice: typeof slice;
    sort: typeof sort;
    splitAt: typeof splitAt;
    splitEvery: typeof splitEvery;
    splitWhen: typeof splitWhen;
    startsWith: typeof startsWith;
    tail: typeof tail;
    take: typeof take;
    takeLast: typeof takeLast;
    takeLastWhile: typeof takeLastWhile;
    takeWhile: typeof takeWhile;
    times: typeof times;
    trailingJoin: {
        (separator: string, list: any[]): string;
        (separator: string): (list: any[]) => string;
    };
    transduce: typeof transduce;
    transpose: typeof transpose;
    traverse: typeof traverse;
    unfold: typeof unfold;
    uniq: typeof uniq;
    uniqBy: typeof uniqBy;
    uniqWith: typeof uniqWith;
    unnest: typeof unnest;
    update: typeof update;
    without: typeof without;
    xprod: typeof xprod;
    zip: typeof zip;
    zipObj: typeof zipObj;
    zipWith: typeof zipWith;
};
export default _default;
//# sourceMappingURL=index.d.ts.map