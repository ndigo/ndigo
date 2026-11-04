/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { JSONObject, Parser, Stringifier } from '@ndigo/core';
import { encodeURIComponent as encode } from '@ndigo/util/string';

const arrayStringifier = (key: string, value: string, index?: number): string =>
        value === null ? encode(key) : `${encode(key)}=${encode(value)}`,
    toQueryString = (input: unknown): string => {
        if (!input) {
            return '';
        }
        const object = input as Record<string, unknown>;
        return Object.keys(object)
            .sort()
            .map(function (key: string): string {
                const value = object[key];

                if (value === undefined) {
                    return '';
                }

                if (value === null) {
                    return encode(key);
                }

                if (Array.isArray(value)) {
                    const result: string[] = [];

                    value.slice().forEach(function (val: string): void {
                        if (val === undefined) {
                            return;
                        }
                        result.push(arrayStringifier(key, val, result.length));
                    });

                    return result.join('&');
                }

                return `${encode(key)}=${encode(String(value))}`;
            })
            .filter((s) => s.length > 0)
            .join('&');
    };

/**
 * Parses a URL query string into a key→value(s) record.
 *
 * Semantics are aligned with the WHATWG `URLSearchParams` parser:
 * - a single leading `?` is stripped (the standard does this itself)
 * - pairs split on `&` only; empty parts are dropped
 * - `+` decodes to space in keys and values
 * - keys without `=` and keys with an empty value both yield `''`
 * - invalid percent-escapes are preserved literally, with invalid
 *   byte sequences substituted as `U+FFFD`
 * - repeated keys aggregate into arrays, preserving appearance order
 *
 * The only representation-level difference from `URLSearchParams` is that
 * repeated keys aggregate into arrays rather than surviving as duplicate
 * pairs (a plain record cannot hold duplicates). The record is created with
 * a null prototype so keys like `__proto__` are preserved as ordinary data.
 */
function parseQueryString(input: string): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = Object.create(null);
    for (const [key, value] of new URLSearchParams(input)) {
        const existing = result[key];
        if (existing === undefined) {
            result[key] = value;
        } else if (Array.isArray(existing)) {
            existing.push(value);
        } else {
            result[key] = [existing, value];
        }
    }
    return result;
}

/**
 * Parses and serializes query strings using stable key ordering.
 */
class QueryString implements Parser, Stringifier {
    /**
     * Parses a query string into a JSON object.
     *
     * @param value - The query string to parse.
     * @returns A plain object representation of the query string.
     */
    parse(value: string): JSONObject {
        return parseQueryString(value) as JSONObject;
    }
    /**
     * Serializes a JSON-like value to a query string.
     *
     * @param value - The value to serialize.
     * @returns The encoded query string.
     */
    stringify(value: unknown): string {
        return toQueryString(value);
    }
}

/**
 * Query-string parser and serializer singleton.
 */
export default new QueryString();
