/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import QueryString from '../src/query-string';

/**
 * Query String Specification Compliance Tests
 *
 * Tests compliance with:
 * - RFC 3986: URI Generic Syntax
 * - WHATWG URL Standard: URLSearchParams and application/x-www-form-urlencoded
 *
 * See: docs/reference/2026-02-06_URL_PARSING_SPECIFICATIONS.md
 */

describe('Query String - RFC 3986 Compliance', () => {
    describe('Reserved Characters (RFC 3986 Section 2.2)', () => {
        test('it should handle gen-delims in percent-encoded form', () => {
            // Gen-delims: : / ? # [ ] @
            // Note: Parser stops at '.' which isn't in regex pattern
            expect(QueryString.parse('url=%3A%2F%2Fexample')).toEqual({
                url: '://example',
            });

            expect(QueryString.parse('path=%2Fpath%2Fto%2Ffile')).toEqual({
                path: '/path/to/file',
            });

            expect(QueryString.parse('query=%3Ffoo%3Dbar')).toEqual({
                query: '?foo=bar',
            });

            expect(QueryString.parse('fragment=%23section')).toEqual({
                fragment: '#section',
            });

            expect(QueryString.parse('brackets=%5B%5D')).toEqual({
                brackets: '[]',
            });

            expect(QueryString.parse('at=%40user')).toEqual({
                at: '@user',
            });
        });

        test('it should handle sub-delims in percent-encoded form', () => {
            // Sub-delims: ! $ & ' ( ) * + , ; =
            expect(QueryString.parse('bang=%21')).toEqual({
                bang: '!',
            });

            expect(QueryString.parse('dollar=%24')).toEqual({
                dollar: '$',
            });

            expect(QueryString.parse('ampersand=%26')).toEqual({
                ampersand: '&',
            });

            expect(QueryString.parse('quote=%27')).toEqual({
                quote: "'",
            });

            expect(QueryString.parse('parens=%28%29')).toEqual({
                parens: '()',
            });

            expect(QueryString.parse('star=%2A')).toEqual({
                star: '*',
            });

            expect(QueryString.parse('plus=%2B')).toEqual({
                plus: '+',
            });

            expect(QueryString.parse('comma=%2C')).toEqual({
                comma: ',',
            });

            expect(QueryString.parse('semicolon=%3B')).toEqual({
                semicolon: ';',
            });

            expect(QueryString.parse('equals=%3D')).toEqual({
                equals: '=',
            });
        });

        test('it should handle multiple reserved characters together', () => {
            // Note: Parser stops at '.' which isn't in regex pattern
            expect(QueryString.parse('url=https%3A%2F%2Fexample%2Fpath%3Fquery%3Dvalue%23fragment')).toEqual({
                url: 'https://example/path?query=value#fragment',
            });
        });

        test('it should handle reserved characters in keys', () => {
            expect(QueryString.parse('foo%3Abar=value')).toEqual({
                'foo:bar': 'value',
            });

            expect(QueryString.parse('foo%2Fbar=value')).toEqual({
                'foo/bar': 'value',
            });
        });
    });

    describe('Unreserved Characters (RFC 3986 Section 2.3)', () => {
        test('it should handle unreserved characters unencoded', () => {
            // ALPHA / DIGIT / - / . / _ / ~
            expect(QueryString.parse('key=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')).toEqual({
                key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            });

            expect(QueryString.parse('key=0123456789')).toEqual({
                key: '0123456789',
            });

            // WHATWG parsing places no restriction on raw characters.
            expect(QueryString.parse('key=v-1.2_3~4')).toEqual({
                key: 'v-1.2_3~4',
            });

            // Percent-encoded forms decode to the same characters.
            expect(QueryString.parse('key=%2D%2E%5F%7E')).toEqual({
                key: '-._~',
            });
        });

        test('it should handle unreserved characters in percent-encoded form', () => {
            // Should decode properly even if unnecessarily encoded
            expect(QueryString.parse('key=%41%42%43')).toEqual({
                key: 'ABC',
            });

            expect(QueryString.parse('key=%2D%2E%5F%7E')).toEqual({
                key: '-._~',
            });
        });

        test('it should preserve tilde when percent-encoded', () => {
            expect(QueryString.parse('key=%7Etest%7E')).toEqual({
                key: '~test~',
            });
        });
    });

    describe('Percent-Encoding (RFC 3986 Section 2.1)', () => {
        test('it should decode valid percent-encoded sequences', () => {
            expect(QueryString.parse('message=Hello%20World')).toEqual({
                message: 'Hello World',
            });

            expect(QueryString.parse('unicode=%E4%B8%AD%E6%96%87')).toEqual({
                unicode: '中文',
            });

            expect(QueryString.parse('emoji=%F0%9F%8D%95')).toEqual({
                emoji: '🍕',
            });
        });

        test('it should handle uppercase and lowercase hex digits', () => {
            expect(QueryString.parse('upper=%2F')).toEqual({
                upper: '/',
            });

            expect(QueryString.parse('lower=%2f')).toEqual({
                lower: '/',
            });

            expect(QueryString.parse('mixed=%2A%2b')).toEqual({
                mixed: '*+',
            });
        });

        test('it should handle invalid percent-encoding gracefully', () => {
            // Invalid hex digits
            expect(QueryString.parse('bad=%ZZ')).toEqual({
                bad: '%ZZ',
            });

            // Incomplete encoding
            expect(QueryString.parse('incomplete=%2')).toEqual({
                incomplete: '%2',
            });

            // Single percent
            expect(QueryString.parse('single=%')).toEqual({
                single: '%',
            });

            // Double percent
            expect(QueryString.parse('double=%%')).toEqual({
                double: '%%',
            });
        });

        test('it should handle percent-encoded percent sign', () => {
            expect(QueryString.parse('percent=%25')).toEqual({
                percent: '%',
            });

            expect(QueryString.parse('encoded=%2520')).toEqual({
                encoded: '%20',
            });
        });
    });

    describe('Delimiter Handling (RFC 3986 Section 3.4)', () => {
        test('it should support ampersand delimiter', () => {
            expect(QueryString.parse('a=1&b=2&c=3')).toEqual({
                a: '1',
                b: '2',
                c: '3',
            });
        });

        test('it should treat semicolons as value characters', () => {
            // RFC 3986 lists ';' among sub-delims; WHATWG pair parsing
            // splits on '&' only, so a raw ';' is part of a value.
            expect(QueryString.parse('a=1;b=2;c=3')).toEqual({
                a: '1;b=2;c=3',
            });
        });

        test('it should not split on semicolons alongside ampersands', () => {
            expect(QueryString.parse('a=1&b=2;c=3')).toEqual({
                a: '1',
                b: '2;c=3',
            });
        });

        test('it should ignore leading question marks and orphan ampersands', () => {
            // URLSearchParams strips a single leading '?'; a leading '&'
            // produces an empty part, which is dropped. '#' is data.
            expect(QueryString.parse('?foo=bar')).toEqual({ foo: 'bar' });
            expect(QueryString.parse('&foo=bar')).toEqual({ foo: 'bar' });
            expect(QueryString.parse('#foo=bar')).toEqual({ '#foo': 'bar' });
        });
    });
});

describe('Query String - WHATWG URL Standard Compliance', () => {
    describe('application/x-www-form-urlencoded Format', () => {
        test('it should decode plus as space', () => {
            expect(QueryString.parse('message=Hello+World')).toEqual({
                message: 'Hello World',
            });

            expect(QueryString.parse('text=foo+bar+baz')).toEqual({
                text: 'foo bar baz',
            });
        });

        test('it should handle plus in keys', () => {
            expect(QueryString.parse('foo+bar=baz')).toEqual({
                'foo bar': 'baz',
            });
        });

        test('it should handle multiple consecutive plus signs', () => {
            expect(QueryString.parse('text=foo++bar')).toEqual({
                text: 'foo  bar',
            });
        });

        test('it should handle percent-encoded plus', () => {
            expect(QueryString.parse('math=1%2B1')).toEqual({
                math: '1+1',
            });
        });

        test('it should handle mixed space encodings', () => {
            expect(QueryString.parse('mixed=foo+bar%20baz')).toEqual({
                mixed: 'foo bar baz',
            });
        });
    });

    describe('Multiple Values for Same Key', () => {
        test('it should aggregate repeated keys into arrays', () => {
            expect(QueryString.parse('foo=bar&foo=baz')).toEqual({
                foo: ['bar', 'baz'],
            });

            expect(QueryString.parse('foo=bar&foo=baz&foo=qux')).toEqual({
                foo: ['bar', 'baz', 'qux'],
            });
        });

        test('it should preserve order of values', () => {
            expect(QueryString.parse('num=3&num=1&num=2')).toEqual({
                num: ['3', '1', '2'],
            });
        });

        test('it should handle mixed single and multiple values', () => {
            expect(QueryString.parse('single=alone&multi=one&multi=two')).toEqual({
                single: 'alone',
                multi: ['one', 'two'],
            });
        });
    });

    describe('Empty and Missing Values', () => {
        test('it should handle key without equals as empty string', () => {
            expect(QueryString.parse('key')).toEqual({
                key: '',
            });

            expect(QueryString.parse('foo&bar')).toEqual({
                foo: '',
                bar: '',
            });
        });

        test('it should handle key with empty value as empty string', () => {
            // Aligned with WHATWG, which reports empty values as ''.
            expect(QueryString.parse('key=')).toEqual({
                key: '',
            });

            expect(QueryString.parse('foo=&bar=')).toEqual({
                foo: '',
                bar: '',
            });
        });

        test('it should handle mixed empty and non-empty values', () => {
            expect(QueryString.parse('a=value&b=&c')).toEqual({
                a: 'value',
                b: '',
                c: '',
            });
        });

        test('it should handle multiple empty values', () => {
            expect(QueryString.parse('key=&key')).toEqual({
                key: ['', ''],
            });

            expect(QueryString.parse('key&key=')).toEqual({
                key: ['', ''],
            });
        });
    });
});

describe('Query String - Edge Cases and Robustness', () => {
    describe('Unicode Handling', () => {
        test('it should handle CJK characters', () => {
            expect(QueryString.parse('chinese=%E4%B8%AD%E6%96%87')).toEqual({
                chinese: '中文',
            });

            expect(QueryString.parse('japanese=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF')).toEqual({
                japanese: 'こんにちは',
            });

            expect(QueryString.parse('korean=%ED%95%9C%EA%B5%AD%EC%96%B4')).toEqual({
                korean: '한국어',
            });
        });

        test('it should handle emoji', () => {
            expect(QueryString.parse('emoji=%F0%9F%8D%95')).toEqual({
                emoji: '🍕',
            });

            expect(QueryString.parse('face=%F0%9F%98%80')).toEqual({
                face: '😀',
            });

            expect(QueryString.parse('poop=%F0%9F%92%A9')).toEqual({
                poop: '💩',
            });
        });

        test('it should handle Arabic and RTL text', () => {
            expect(QueryString.parse('arabic=%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9')).toEqual({
                arabic: 'العربية',
            });
        });

        test('it should handle mixed scripts', () => {
            expect(QueryString.parse('mixed=Hello%20%E4%B8%AD%E6%96%87%20%F0%9F%98%80')).toEqual({
                mixed: 'Hello 中文 😀',
            });
        });
    });

    describe('Whitespace Handling', () => {
        test('it should handle whitespace by percent-encoding', () => {
            // Note: Spaces not in regex pattern, must be encoded as %20 or +
            expect(QueryString.parse('foo=bar+baz')).toEqual({
                foo: 'bar baz',
            });
        });

        test('it should handle tabs and newlines encoded', () => {
            expect(QueryString.parse('text=%09tab%0Anewline%0Dcarriage')).toEqual({
                text: '\ttab\nnewline\rcarriage',
            });
        });

        test('it should handle various whitespace encodings', () => {
            expect(QueryString.parse('space=%20')).toEqual({
                space: ' ',
            });

            expect(QueryString.parse('plus=+')).toEqual({
                plus: ' ',
            });

            expect(QueryString.parse('mixed=%20+%20')).toEqual({
                mixed: '   ',
            });
        });
    });

    describe('Malformed Input', () => {
        test('it should handle empty input', () => {
            expect(QueryString.parse('')).toEqual({});
            expect(QueryString.parse(' ')).toEqual({ ' ': '' }); // a space is a key
            expect(QueryString.parse('?')).toEqual({});
            expect(QueryString.parse('&')).toEqual({});
            expect(QueryString.parse('#')).toEqual({ '#': '' }); // '#' is a key
        });

        test('it should handle only delimiters', () => {
            expect(QueryString.parse('&&&')).toEqual({}); // empty parts dropped
            expect(QueryString.parse(';;;')).toEqual({ ';;;': '' }); // ';' is data
            expect(QueryString.parse('?&;')).toEqual({ ';': '' });
        });

        test('it should handle only equals signs', () => {
            // Empty names are legal pairs under WHATWG parsing.
            expect(QueryString.parse('=')).toEqual({ '': '' });
            expect(QueryString.parse('===')).toEqual({ '': '==' });
        });

        test('it should handle malformed key-value pairs', () => {
            expect(QueryString.parse('=value')).toEqual({ '': 'value' });
            expect(QueryString.parse('==value')).toEqual({ '': '=value' });
        });

        test('it should handle multiple equals signs in value', () => {
            expect(QueryString.parse('key=value=extra=data')).toEqual({
                key: 'value=extra=data',
            });

            // Note: Parser stops at '.' - dots must be percent-encoded
            expect(QueryString.parse('url=http://example%2Ecom?foo=bar')).toEqual({
                url: 'http://example.com?foo=bar',
            });
        });
    });

    describe('Special Property Names', () => {
        test('it should handle object prototype properties', () => {
            expect(QueryString.parse('hasOwnProperty=foo')).toEqual({
                hasOwnProperty: 'foo',
            });

            expect(QueryString.parse('toString=bar')).toEqual({
                toString: 'bar',
            });

            expect(QueryString.parse('constructor=baz')).toEqual({
                constructor: 'baz',
            });

            // An object literal cannot express a __proto__ data key (the
            // literal form sets the prototype), so build the expectation out.
            const protoExpected: Record<string, string> = Object.create(null);
            protoExpected['__proto__'] = 'evil';
            expect(QueryString.parse('__proto__=evil')).toEqual(protoExpected);
        });

        test('it should handle numeric keys', () => {
            expect(QueryString.parse('0=first&1=second&2=third')).toEqual({
                '0': 'first',
                '1': 'second',
                '2': 'third',
            });
        });

        test('it should handle empty string key', () => {
            expect(QueryString.parse('=value')).toEqual({ '': 'value' });
        });
    });

    describe('Long Inputs', () => {
        test('it should handle long values', () => {
            const longValue = 'a'.repeat(10000);
            const encoded = encodeURIComponent(longValue);
            const result = QueryString.parse(`key=${encoded}`);
            expect(result.key).toBe(longValue);
        });

        test('it should handle many parameters', () => {
            const params: string[] = [];
            for (let i = 0; i < 1000; i++) {
                params.push(`key${i}=value${i}`);
            }
            const input = params.join('&');
            const result = QueryString.parse(input);
            expect(Object.keys(result)).toHaveLength(1000);
            expect(result.key0).toBe('value0');
            expect(result.key999).toBe('value999');
        });
    });
});

describe('Query String - Stringification Compliance', () => {
    describe('Character Encoding', () => {
        test('it should encode reserved characters', () => {
            const result = QueryString.stringify({
                url: 'https://example.com/path?query=value#fragment',
            });
            expect(result).toContain('%3A%2F%2F'); // ://
            expect(result).toContain('%3F'); // ?
            expect(result).toContain('%3D'); // =
            expect(result).toContain('%23'); // #
        });

        test('it should encode spaces as %20', () => {
            const result = QueryString.stringify({
                message: 'Hello World',
            });
            expect(result).toBe('message=Hello%20World');
        });

        test('it should not encode unreserved characters', () => {
            const result = QueryString.stringify({
                key: 'ABC-abc_123.~',
            });
            expect(result).toBe('key=ABC-abc_123.~');
        });

        test('it should encode unicode properly', () => {
            const result = QueryString.stringify({
                chinese: '中文',
                emoji: '💩',
            });
            expect(result).toContain('%E4%B8%AD%E6%96%87'); // 中文
            expect(result).toContain('%F0%9F%92%A9'); // 💩
        });
    });

    describe('Key Sorting', () => {
        test('it should sort keys alphabetically', () => {
            const result = QueryString.stringify({
                z: 'last',
                a: 'first',
                m: 'middle',
            });
            expect(result).toBe('a=first&m=middle&z=last');
        });

        test('it should maintain consistent order', () => {
            const input = { c: '3', a: '1', b: '2' };
            const result1 = QueryString.stringify(input);
            const result2 = QueryString.stringify(input);
            expect(result1).toBe(result2);
            expect(result1).toBe('a=1&b=2&c=3');
        });
    });

    describe('Array Handling', () => {
        test('it should stringify arrays as repeated keys', () => {
            const result = QueryString.stringify({
                foo: ['bar', 'baz', 'qux'],
            });
            expect(result).toBe('foo=bar&foo=baz&foo=qux');
        });

        test('it should preserve array value order', () => {
            const result = QueryString.stringify({
                nums: ['3', '1', '2'],
            });
            expect(result).toBe('nums=3&nums=1&nums=2');
        });

        test('it should handle empty arrays', () => {
            const result = QueryString.stringify({
                empty: [],
                other: 'value',
            });
            // Empty arrays produce no output
            expect(result).toBe('other=value');
        });

        test('it should skip undefined in arrays', () => {
            const result = QueryString.stringify({
                arr: ['a', undefined, 'b'],
            });
            expect(result).toBe('arr=a&arr=b');
        });
    });

    describe('Null and Undefined Handling', () => {
        test('it should stringify null as key-only', () => {
            const result = QueryString.stringify({
                empty: null,
            });
            expect(result).toBe('empty');
        });

        test('it should omit undefined values', () => {
            const result = QueryString.stringify({
                defined: 'value',
                undefined: undefined,
            });
            expect(result).toBe('defined=value');
        });

        test('it should handle mixed null, undefined, and values', () => {
            const result = QueryString.stringify({
                a: 'value',
                b: null,
                c: undefined,
                d: 'another',
            });
            expect(result).toBe('a=value&b&d=another');
        });
    });

    describe('Round-trip Preservation', () => {
        test('it should preserve data through parse-stringify cycle', () => {
            const original = {
                foo: 'bar',
                baz: 'qux',
                num: '123',
            };
            const stringified = QueryString.stringify(original);
            const parsed = QueryString.parse(stringified);
            expect(parsed).toEqual(original);
        });

        test('it should preserve arrays through round-trip', () => {
            const original = {
                foo: ['bar', 'baz', 'qux'],
            };
            const stringified = QueryString.stringify(original);
            const parsed = QueryString.parse(stringified);
            expect(parsed).toEqual(original);
        });

        test('it should handle unicode in round-trip', () => {
            const original = {
                chinese: '中文',
                emoji: '💩',
                arabic: 'العربية',
            };
            const stringified = QueryString.stringify(original);
            const parsed = QueryString.parse(stringified);
            expect(parsed).toEqual(original);
        });

        test('it should normalize key order in round-trip', () => {
            const input = 'z=3&a=1&m=2';
            const parsed = QueryString.parse(input);
            const stringified = QueryString.stringify(parsed);
            expect(stringified).toBe('a=1&m=2&z=3');
        });
    });
});
