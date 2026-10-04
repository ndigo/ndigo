/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { JSONObject, Parser, Stringifier, stringComparator } from '@blue/core';
import { decodeURIComponent as decode, encodeURIComponent as encodeValue } from '@blue/util/string';

/**
 * Parses a raw matrix-parameter segment into a key→value(s) record.
 *
 * Rules:
 * - Leading `;` is optional and skipped.
 * - Parameters are separated by `;`.
 * - `key=value` pairs: value may contain any character except `;`.
 * - Key-only params produce `[key, null]`.
 * - `+` is decoded to a space (via {@link decode}).
 * - Comma-separated values produce an array; empty segments become `null`.
 * - Empty values (`key=`) produce `null`.
 */
function parseMatrix(input: string): Record<string, unknown> {
    let pos = 0;
    const len = input.length;

    // Skip optional leading ';'
    if (pos < len && input[pos] === ';') pos++;

    const pairs: [string, unknown][] = [];

    while (pos < len) {
        // Parse key: /^[^=;]+/
        const keyStart = pos;
        while (pos < len && input[pos] !== '=' && input[pos] !== ';') pos++;

        const rawKey = input.slice(keyStart, pos);
        if (!rawKey) {
            // Empty key — skip the stray '=' and its value (if any), then any trailing ';'
            if (pos < len && input[pos] === '=') {
                pos++; // skip '='
                while (pos < len && input[pos] !== ';') pos++; // skip value
            }
            if (pos < len && input[pos] === ';') pos++; // skip separator
            continue;
        }

        // Replace + with space before decoding (avoids regex-escape issues in the decode fallback path)
        const key = decode(rawKey.replace(/\+/g, ' '));

        let value: unknown = null;

        if (pos < len && input[pos] === '=') {
            pos++; // consume '='
            // Parse value: /^[^;]*/ — may be empty
            const valueStart = pos;
            while (pos < len && input[pos] !== ';') pos++;
            const decoded = decode(input.slice(valueStart, pos).replace(/\+/g, ' '));

            if (decoded.includes(',')) {
                value = decoded.split(',').map((v) => (v === '' ? null : v));
            } else if (decoded === '') {
                value = null;
            } else {
                value = decoded;
            }
        }

        pairs.push([key, value]);

        // Consume the ';' separator before the next parameter
        if (pos < len && input[pos] === ';') pos++;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of pairs) {
        if (!Object.prototype.hasOwnProperty.call(result, key)) {
            result[key] = value;
        } else if (Array.isArray(result[key])) {
            result[key].push(value);
        } else {
            result[key] = [result[key], value];
        }
    }
    return result;
}

const isNull = (value: unknown): boolean => value === null,
    isUndefined = (value: unknown): boolean => value === undefined,
    isDefined = (value: unknown): boolean => value !== undefined,
    // ["a","b","c","#"] -> ["a","b","c","%23"]
    encodeValues = (arr: string[]): string[] => arr.map(encodeValue),
    // ["a","b","c"] ->  "a,b,c"
    joinOnComma = (arr: string[]): string => arr.join(','),
    // ["a","b","c"] ->  "a=b=c"
    joinOnEqual = (arr: string[]): string => arr.join('='),
    // ["a",undefined,"b","c",undefined,"#"] -> "a,b,c,%23"
    encodeList = (arr: unknown[]): string => joinOnComma(encodeValues(arr.filter(isDefined) as string[])),
    encodeParam =
        (object: Record<string, unknown>) =>
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
            return joinOnEqual([encodeValue(key), encodeValue(String(value))]);
        },
    toMatrixString = (value: unknown): string => {
        if (!value) {
            return '';
        }
        const object = value as Record<string, unknown>;
        const encode = encodeParam(object);
        const sortedKeys = Object.keys(object).sort(stringComparator.compare);
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
        // Values are strings, nulls, or arrays thereof — all JSON values.
        return parseMatrix(trimmed) as JSONObject;
    }
    /**
     * Serializes a JSON-like value to a matrix string.
     *
     * @param value - The value to serialize.
     * @returns The encoded matrix string.
     */
    stringify(value: unknown): string {
        return toMatrixString(value);
    }
}

/**
 * Matrix-string parser and serializer singleton.
 */
export default new MatrixString();
