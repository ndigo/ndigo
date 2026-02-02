/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { always, comparator, curryN, pipe, T } from '@blue/util/function';
import { filter, join, map, sort } from '@blue/util/list';
import { cond, complement, isEmpty, isNotEmpty } from '@blue/util/logic';
import { keys } from '@blue/util/object';
import { equals } from '@blue/util/relation';
import { encodeURIComponent as encodeValue } from '@blue/util/string';

const alwaysEmptyString = always(''),
    isNull = equals(null),
    isUndefined = equals(undefined),
    isDefined = complement(isUndefined),
    // ["a","b","c","#"] -> ["a","b","c","%23"]
    encodeValues = map(encodeValue),
    // ["a","",{},"b",[],"c"] -> ["a","b","c"]
    filterEmpty = filter(isNotEmpty),
    // ["a",undefined,"b","c",undefined] -> ["a","b","c"]
    filterUndefined = filter(isDefined),
    // ["a","b","c"] ->  "a,b,c"
    joinOnComma = join(','),
    // ["a","b","c"] ->  "a=b=c"
    joinOnEqual = join('='),
    // ["a","b","c"] ->  "a;b;c"
    joinOnSemicolon = join(';'),
    // ["a",undefined,"b","c",undefined,"#"] -> "a,b,c,%23"
    encodeList = pipe(filterUndefined, encodeValues, joinOnComma),
    encodeParam = curryN(2, (object: any, key: string): string =>
        cond([
            [isUndefined, alwaysEmptyString],
            [isNull, always(encodeValue(key))],
            [Array.isArray, (list) => joinOnEqual([encodeValue(key), encodeList(list)])],
            [T, (value: string) => joinOnEqual([encodeValue(key), encodeValue(value)])],
        ])(object[key])
    ),
    naturalComparator = comparator<any>((a, b): boolean => a < b),
    naturalSort = sort(naturalComparator),
    toMatrixString = (object): string => {
        // @ts-ignore: ¯\_(ツ)_/¯
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
