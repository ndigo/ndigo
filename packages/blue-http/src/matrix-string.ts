/**
 * @author Jeff Rose
 */
import { JSONObject, Parser, Stringifier } from '@blue/core';
import matrixExpression from './parsers/matrix-expression';
import { always, comparator, pipe, T } from '@blue/util/function';
import { filter, join, map, sort } from '@blue/util/list';
import { cond, complement, isNotEmpty } from '@blue/util/logic';
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
    encodeParam =
        (object: any) =>
        (key: string): string =>
            cond([
                [isUndefined, alwaysEmptyString],
                [isNull, always(encodeValue(key))],
                [Array.isArray, (list) => joinOnEqual([encodeValue(key), encodeList(list)])],
                [T, (value: string) => joinOnEqual([encodeValue(key), encodeValue(value)])],
            ])(object[key]),
    naturalComparator = comparator<any>((a, b): boolean => a < b),
    naturalSort = sort(naturalComparator),
    toMatrixString = (object): string => {
        // @ts-ignore: ¯\\_(ツ)_/¯
        const encodeParams = map(encodeParam(object));
        return object ? pipe(keys, naturalSort, encodeParams, filterEmpty, joinOnSemicolon)(object) : '';
    };

/**
 * Parses and serializes matrix parameters.
 */
class MatrixString implements Parser, Stringifier {
    /**
     * Parses a matrix string into a JSON object.
     *
     * @param value - The matrix string to parse.
     * @returns A plain object representation of the matrix parameters.
     */
    parse(value: string): JSONObject {
        const trimmed = (value || '').trim();
        if (!trimmed || trimmed === ';') {
            return {};
        }
        const parseResult = matrixExpression.run(trimmed);
        if (!parseResult.isError) {
            return (parseResult as { isError: false; result: JSONObject; index: number; data: string }).result;
        }
        return {};
    }
    /**
     * Serializes a JSON-like value to a matrix string.
     *
     * @param value - The value to serialize.
     * @returns The encoded matrix string.
     */
    stringify(value: any): string {
        return toMatrixString(value);
    }
}

/**
 * Matrix-string parser and serializer singleton.
 */
export default new MatrixString();
