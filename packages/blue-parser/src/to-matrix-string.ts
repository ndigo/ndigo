/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import {
    always,
    complement,
    cond,
    curryN,
    equals,
    filter,
    isEmpty,
    join,
    keys,
    map,
    pipe,
    T,
    encodeURIComponent as encodeValue,
    comparator,
    sort,
} from './_util';

const isNull = equals(null),
    isUndefined = equals(undefined),
    isDefined = complement(isUndefined),
    isNotEmpty = complement(isEmpty),
    // ["a","b","c","#"] -> ["a","b","c","%23"]
    encodeValues = map(encodeValue),
    // ["a","",{},"b",[],"c"] -> ["a","b","c"]
    filterEmpty = filter(isNotEmpty),
    // ["a",undefined,"b","c",undefined] -> ["a","b","c"]
    filterUndefined = filter(isDefined),
    // ["a","b","c"] -> "a,b,c"
    joinOnComma = join(','),
    // ["a","b","c"] -> "a=b=c"
    joinOnEqual = join('='),
    // ["a","b","c"] -> "a;b;c"
    joinOnSemicolon = join(';'),
    // ["a",undefined,"b","c",undefined,"#"] -> "a,b,c,%23"
    encodeList = pipe(filterUndefined, encodeValues, joinOnComma),
    encodeParam = curryN(2, (object, key: string): string =>
        cond([
            [isUndefined, () => ''],
            [isNull, always(encodeValue(key))],
            [Array.isArray, (list) => joinOnEqual([encodeValue(key), encodeList(list)])],
            [T, (value: string) => joinOnEqual([encodeValue(key), encodeValue(value)])],
        ])(object[key])
    ),
    naturalComparator = comparator<any>((a, b): boolean => a < b),
    naturalSort = sort(naturalComparator),
    toMatrixString = (object): string => {
        const encodeParams = map(encodeParam(object));
        return object ? pipe(keys, naturalSort, encodeParams, filterEmpty, joinOnSemicolon)(object) : '';
    };

/**
 * Parses an object to matrix string.
 * @category Object
 * @param {Object} object
 * @returns {string}
 * @example
 * toMatrixString( { e:6, a:1, b:2, c:[ 3,4 ], d:5 } );
 * //=> "a=1;b=2;c=3,4;d=5;e=6"
 */
export default toMatrixString;
