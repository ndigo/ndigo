/**
 */
import { describe, test, expect } from 'vitest';
import QueryString from '../src/query-string';

/**
 * URLSearchParams Compatibility Tests
 *
 * `QueryString.parse` delegates to the WHATWG `URLSearchParams` parser, so
 * every input yields exactly the pairs the platform parser produces. The only
 * difference is representation: repeated keys aggregate into arrays (a record
 * cannot hold duplicate pairs), and values are never null.
 *
 * See: docs/reference/2026-02-06_URL_PARSING_SPECIFICATIONS.md
 */

const corpus = [
    'foo=bar',
    '?foo=bar&baz=qux',
    'a=1&b=2&c=3',
    '?search=hello%20world&lang=en',
    'foo=bar&foo=baz',
    'foo=bar&foo=baz&foo=qux',
    'num=3&num=1&num=2',
    'key',
    'key=',
    'a=value&a=',
    'a=&a',
    'a=1&&b=2',
    'a=1&',
    '&a=1',
    'foo+faz=bar+baz++',
    'message=Hello+World',
    'text=foo+bar+baz',
    'mixed=foo+bar%20baz',
    'math=1%2B1',
    'st%C3%A5le=foo',
    'text=中文',
    'emoji=🍕',
    '?param=http%3A%2F%2Fsomeurl%3Fid%3D2837',
    'url=http://example.com/path?q=1',
    'bad=%ZZ',
    'incomplete=%2',
    'single=%',
    'double=%%',
    'a=b=c',
    'a=1;b=2',
    '#frag=1',
    '=x',
    '==value',
    'a=hello world',
    'a=1.2',
    'k=v-2_3~4',
    'hasOwnProperty=foo',
    'toString=bar',
    'constructor=baz',
    '__proto__=evil',
    'foo[0]=bar&foo[1]=baz',
    'foo[]=bar&foo[]=baz',
];

/** The array-aggregated record URLSearchParams would produce for an input. */
function groupedNative(input: string): Record<string, string | string[]> {
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

describe('QueryString.parse vs URLSearchParams parity', () => {
    for (const input of corpus) {
        test(JSON.stringify(input), () => {
            expect(QueryString.parse(input)).toEqual(groupedNative(input));
        });
    }
});
