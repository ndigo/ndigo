/**
 * @author Jeff Rose
 */
import { JSONObject, Parser, Stringifier } from '@blue/core';
import matrixExpression from './parsers/matrix-expression';
import { encodeURIComponent as encodeValue } from '@blue/util/string';

const isNull = (value: unknown): boolean => value === null,
    isUndefined = (value: unknown): boolean => value === undefined,
    isDefined = (value: unknown): boolean => value !== undefined,
    // ["a","b","c","#"] -> ["a","b","c","%23"]
    encodeValues = (arr: string[]): string[] => arr.map(encodeValue),
    // ["a","",{},"b",[],"c"] -> ["a","b","c"]
    filterEmpty = (arr: unknown[]): unknown[] =>
        arr.filter((v) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)),
    // ["a","b","c"] ->  "a,b,c"
    joinOnComma = (arr: string[]): string => arr.join(','),
    // ["a","b","c"] ->  "a=b=c"
    joinOnEqual = (arr: string[]): string => arr.join('='),
    // ["a","b","c"] ->  "a;b;c"
    joinOnSemicolon = (arr: string[]): string => arr.join(';'),
    // ["a",undefined,"b","c",undefined,"#"] -> "a,b,c,%23"
    encodeList = (arr: unknown[]): string => joinOnComma(encodeValues(arr.filter(isDefined) as string[])),
    encodeParam =
        (object: any) =>
        (key: string): string => {
            const value = object[key];
            if (isUndefined(value)) {
                return '';
            }
            if (isNull(value)) {
                return encodeValue(key);
            }
            if (Array.isArray(value)) {
                return joinOnEqual([encodeValue(key), encodeList(value)]);
            }
            return joinOnEqual([encodeValue(key), encodeValue(value as string)]);
        },
    toMatrixString = (object: any): string => {
        if (!object) {
            return '';
        }
        const encode = encodeParam(object);
        const sortedKeys = Object.keys(object).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
        return sortedKeys
            .map(encode)
            .filter((s) => s.length > 0)
            .join(';');
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
