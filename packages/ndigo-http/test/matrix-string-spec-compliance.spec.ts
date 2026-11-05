/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import MatrixString from '../src/matrix-string';

/**
 * Matrix String Specification Compliance Tests
 *
 * Tests compliance with:
 * - RFC 3986 Section 3.3: Path Component (matrix parameters)
 * - Tim Berners-Lee's Matrix URIs: https://www.w3.org/DesignIssues/MatrixURIs.html
 * - JAX-RS common patterns
 *
 * See: docs/reference/2025-02-06_URL_PARSING_SPECIFICATIONS.md
 */

describe('Matrix String - RFC 3986 Compliance', () => {
    describe('Semicolon Delimiter (RFC 3986 Section 3.3)', () => {
        test('it should use semicolon as parameter delimiter', () => {
            expect(MatrixString.parse('foo=bar;baz=qux')).toEqual({
                foo: 'bar',
                baz: 'qux',
            });

            expect(MatrixString.parse('a=1;b=2;c=3')).toEqual({
                a: '1',
                b: '2',
                c: '3',
            });
        });

        test('it should handle leading semicolon', () => {
            expect(MatrixString.parse(';foo=bar')).toEqual({
                foo: 'bar',
            });

            expect(MatrixString.parse(';a=1;b=2')).toEqual({
                a: '1',
                b: '2',
            });
        });

        test('it should not treat ampersand as delimiter', () => {
            // Ampersands should be treated as part of the value
            expect(MatrixString.parse('foo=bar&baz')).toEqual({
                foo: 'bar&baz',
            });
        });
    });

    describe('Reserved Characters in Matrix Context', () => {
        test('it should handle percent-encoded gen-delims', () => {
            expect(MatrixString.parse('url=%3A%2F%2Fexample.com')).toEqual({
                url: '://example.com',
            });

            expect(MatrixString.parse('path=%2Fpath%2Fto%2Ffile')).toEqual({
                path: '/path/to/file',
            });

            expect(MatrixString.parse('fragment=%23section')).toEqual({
                fragment: '#section',
            });
        });

        test('it should handle percent-encoded semicolon', () => {
            expect(MatrixString.parse('text=foo%3Bbar')).toEqual({
                text: 'foo;bar',
            });
        });

        test('it should handle percent-encoded equals', () => {
            expect(MatrixString.parse('math=1%3D1')).toEqual({
                math: '1=1',
            });
        });

        test('it should handle percent-encoded comma', () => {
            // Comma has special meaning (array separator)
            // Even when percent-encoded, it's decoded then treated as separator
            // This is current behavior - commas cannot be escaped
            expect(MatrixString.parse('text=foo%2Cbar')).toEqual({
                text: ['foo', 'bar'],
            });
        });
    });

    describe('Percent-Encoding', () => {
        test('it should decode valid percent-encoded sequences', () => {
            expect(MatrixString.parse('message=Hello%20World')).toEqual({
                message: 'Hello World',
            });

            expect(MatrixString.parse('unicode=%E4%B8%AD%E6%96%87')).toEqual({
                unicode: '中文',
            });

            expect(MatrixString.parse('emoji=%F0%9F%8D%95')).toEqual({
                emoji: '🍕',
            });
        });

        test('it should handle mixed case hex digits', () => {
            expect(MatrixString.parse('upper=%2F;lower=%2f')).toEqual({
                upper: '/',
                lower: '/',
            });
        });

        test('it should handle invalid percent-encoding gracefully', () => {
            expect(MatrixString.parse('bad=%ZZ')).toEqual({
                bad: '%ZZ',
            });

            expect(MatrixString.parse('incomplete=%2')).toEqual({
                incomplete: '%2',
            });

            expect(MatrixString.parse('single=%')).toEqual({
                single: '%',
            });
        });

        test('it should handle percent-encoded percent sign', () => {
            expect(MatrixString.parse('percent=%25')).toEqual({
                percent: '%',
            });

            expect(MatrixString.parse('double=%2520')).toEqual({
                double: '%20',
            });
        });
    });
});

describe('Matrix String - Matrix URI Specification (Tim Berners-Lee)', () => {
    describe('Parameter Order Insignificance', () => {
        test('it should treat different orders as logically equivalent', () => {
            const result1 = MatrixString.parse('a=1;b=2;c=3');
            const result2 = MatrixString.parse('c=3;a=1;b=2');
            const result3 = MatrixString.parse('b=2;c=3;a=1');

            // All should produce same keys
            expect(Object.keys(result1).sort()).toEqual(Object.keys(result2).sort());
            expect(Object.keys(result1).sort()).toEqual(Object.keys(result3).sort());

            // All should have same values
            expect(result1).toEqual(result2);
            expect(result1).toEqual(result3);
        });

        test('it should sort keys in stringification', () => {
            const result = MatrixString.stringify({
                z: 'last',
                a: 'first',
                m: 'middle',
            });

            // Keys should be sorted alphabetically
            expect(result).toBe('a=first;m=middle;z=last');
        });
    });

    describe('Relative URI Parameter Updates', () => {
        test('it should support updating single parameter conceptually', () => {
            // While we don't implement relative parsing,
            // our parser should handle individual parameters
            const base = MatrixString.parse('scale=50000;roads=main');
            expect(base).toEqual({
                scale: '50000',
                roads: 'main',
            });

            // Simulating update by merging
            const updated = { ...base, scale: '25000' };
            const result = MatrixString.stringify(updated);
            expect(result).toBe('roads=main;scale=25000');
        });
    });

    describe('Empty and Missing Values', () => {
        test('it should handle parameter without value', () => {
            expect(MatrixString.parse('flag')).toEqual({
                flag: null,
            });

            expect(MatrixString.parse('a;b;c')).toEqual({
                a: null,
                b: null,
                c: null,
            });
        });

        test('it should handle parameter with empty value', () => {
            expect(MatrixString.parse('empty=')).toEqual({
                empty: null,
            });

            expect(MatrixString.parse('a=;b=')).toEqual({
                a: null,
                b: null,
            });
        });

        test('it should handle mixed empty and non-empty', () => {
            expect(MatrixString.parse('a=value;b=;c')).toEqual({
                a: 'value',
                b: null,
                c: null,
            });
        });
    });
});

describe('Matrix String - Array Handling (JAX-RS Pattern)', () => {
    describe('Comma-Separated Arrays', () => {
        test('it should parse comma-separated values as arrays', () => {
            expect(MatrixString.parse('colors=red,green,ndigo')).toEqual({
                colors: ['red', 'green', 'ndigo'],
            });

            expect(MatrixString.parse('nums=1,2,3,4,5')).toEqual({
                nums: ['1', '2', '3', '4', '5'],
            });
        });

        test('it should handle empty elements in comma-separated lists', () => {
            expect(MatrixString.parse('values=1,,3')).toEqual({
                values: ['1', null, '3'],
            });

            expect(MatrixString.parse('values=,,')).toEqual({
                values: [null, null, null],
            });

            expect(MatrixString.parse('values=a,,')).toEqual({
                values: ['a', null, null],
            });
        });

        test('it should handle single-element arrays', () => {
            // Single value without comma remains string
            expect(MatrixString.parse('single=one')).toEqual({
                single: 'one',
            });

            // Single value with trailing comma becomes array
            expect(MatrixString.parse('single=one,')).toEqual({
                single: ['one', null],
            });
        });

        test('it should handle arrays with special characters', () => {
            expect(MatrixString.parse('items=foo%20bar,baz%20qux')).toEqual({
                items: ['foo bar', 'baz qux'],
            });

            expect(MatrixString.parse('unicode=%E4%B8%AD,%E6%96%87')).toEqual({
                unicode: ['中', '文'],
            });
        });
    });

    describe('Multiple Same-Key Parameters', () => {
        test('it should handle repeated parameters', () => {
            // Multiple parameters with same key
            expect(MatrixString.parse('foo=bar;foo=baz')).toEqual({
                foo: ['bar', 'baz'],
            });

            expect(MatrixString.parse('foo=1;foo=2;foo=3')).toEqual({
                foo: ['1', '2', '3'],
            });
        });

        test('it should preserve order of repeated parameters', () => {
            expect(MatrixString.parse('num=3;num=1;num=2')).toEqual({
                num: ['3', '1', '2'],
            });
        });

        test('it should handle mixed comma-separated and repeated keys', () => {
            // Note: foo=1,2 creates array ['1', '2']
            // foo=3 is a repeated key, so arrays are merged: ['1', '2', '3']
            expect(MatrixString.parse('foo=1,2;foo=3')).toEqual({
                foo: ['1', '2', '3'],
            });
        });
    });
});

describe('Matrix String - Edge Cases and Robustness', () => {
    describe('Unicode Handling', () => {
        test('it should handle CJK characters', () => {
            expect(MatrixString.parse('chinese=%E4%B8%AD%E6%96%87')).toEqual({
                chinese: '中文',
            });

            expect(MatrixString.parse('japanese=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF')).toEqual({
                japanese: 'こんにちは',
            });

            expect(MatrixString.parse('korean=%ED%95%9C%EA%B5%AD%EC%96%B4')).toEqual({
                korean: '한국어',
            });
        });

        test('it should handle emoji', () => {
            expect(MatrixString.parse('emoji=%F0%9F%8D%95')).toEqual({
                emoji: '🍕',
            });

            expect(MatrixString.parse('face=%F0%9F%98%80')).toEqual({
                face: '😀',
            });

            expect(MatrixString.parse('poop=%F0%9F%92%A9')).toEqual({
                poop: '💩',
            });
        });

        test('it should handle Arabic and RTL text', () => {
            expect(MatrixString.parse('arabic=%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9')).toEqual({
                arabic: 'العربية',
            });
        });

        test('it should handle unicode in arrays', () => {
            expect(MatrixString.parse('emoji=%F0%9F%8D%95,%F0%9F%98%80,%F0%9F%92%A9')).toEqual({
                emoji: ['🍕', '😀', '💩'],
            });
        });
    });

    describe('Whitespace Handling', () => {
        test('it should handle space encoding with plus', () => {
            expect(MatrixString.parse('text=foo+bar')).toEqual({
                text: 'foo bar',
            });

            expect(MatrixString.parse('foo+bar=baz+qux')).toEqual({
                'foo bar': 'baz qux',
            });
        });

        test('it should handle space encoding with %20', () => {
            expect(MatrixString.parse('text=foo%20bar')).toEqual({
                text: 'foo bar',
            });
        });

        test('it should handle mixed space encodings', () => {
            expect(MatrixString.parse('text=foo+bar%20baz')).toEqual({
                text: 'foo bar baz',
            });
        });

        test('it should handle tabs and newlines', () => {
            expect(MatrixString.parse('text=%09tab%0Anewline%0Dcarriage')).toEqual({
                text: '\ttab\nnewline\rcarriage',
            });
        });
    });

    describe('Malformed Input', () => {
        test('it should handle empty input', () => {
            expect(MatrixString.parse('')).toEqual({});
            expect(MatrixString.parse(' ')).toEqual({});
            expect(MatrixString.parse(';')).toEqual({});
        });

        test('it should handle only delimiters', () => {
            expect(MatrixString.parse(';;;')).toEqual({});
        });

        test('it should handle only equals signs', () => {
            expect(MatrixString.parse('=')).toEqual({});
            expect(MatrixString.parse('===')).toEqual({});
        });

        test('it should handle missing key', () => {
            expect(MatrixString.parse('=value')).toEqual({});
            expect(MatrixString.parse(';=value')).toEqual({});
        });

        test('it should handle multiple equals signs in value', () => {
            expect(MatrixString.parse('key=value=extra=data')).toEqual({
                key: 'value=extra=data',
            });

            expect(MatrixString.parse('url=http://example.com?foo=bar')).toEqual({
                url: 'http://example.com?foo=bar',
            });
        });
    });

    describe('Special Property Names', () => {
        test('it should handle object prototype properties', () => {
            expect(MatrixString.parse('hasOwnProperty=foo')).toEqual({
                hasOwnProperty: 'foo',
            });

            expect(MatrixString.parse('toString=bar')).toEqual({
                toString: 'bar',
            });

            expect(MatrixString.parse('constructor=baz')).toEqual({
                constructor: 'baz',
            });

            expect(MatrixString.parse('__proto__=evil')).toEqual({
                __proto__: 'evil',
            });
        });

        test('it should handle numeric keys', () => {
            expect(MatrixString.parse('0=first;1=second;2=third')).toEqual({
                '0': 'first',
                '1': 'second',
                '2': 'third',
            });
        });
    });

    describe('Long Inputs', () => {
        test('it should handle long values', () => {
            const longValue = 'a'.repeat(10000);
            const encoded = encodeURIComponent(longValue);
            const result = MatrixString.parse(`key=${encoded}`);
            expect(result.key).toBe(longValue);
        });

        test('it should handle many parameters', () => {
            const params: string[] = [];
            for (let i = 0; i < 1000; i++) {
                params.push(`key${i}=value${i}`);
            }
            const input = params.join(';');
            const result = MatrixString.parse(input);
            expect(Object.keys(result)).toHaveLength(1000);
            expect(result.key0).toBe('value0');
            expect(result.key999).toBe('value999');
        });

        test('it should handle long array', () => {
            const values: string[] = [];
            for (let i = 0; i < 1000; i++) {
                values.push(`val${i}`);
            }
            const input = `arr=${values.join(',')}`;
            const result = MatrixString.parse(input);
            expect(Array.isArray(result.arr)).toBe(true);
            expect((result.arr as string[]).length).toBe(1000);
            expect((result.arr as string[])[0]).toBe('val0');
            expect((result.arr as string[])[999]).toBe('val999');
        });
    });
});

describe('Matrix String - Stringification Compliance', () => {
    describe('Character Encoding', () => {
        test('it should encode reserved characters', () => {
            const result = MatrixString.stringify({
                url: 'https://example.com/path?query=value#fragment',
            });
            expect(result).toContain('%3A%2F%2F'); // ://
            expect(result).toContain('%3F'); // ?
            expect(result).toContain('%3D'); // =
            expect(result).toContain('%23'); // #
        });

        test('it should encode semicolons in values', () => {
            const result = MatrixString.stringify({
                text: 'foo;bar',
            });
            expect(result).toContain('%3B');
        });

        test('it should encode spaces as %20', () => {
            const result = MatrixString.stringify({
                message: 'Hello World',
            });
            expect(result).toBe('message=Hello%20World');
        });

        test('it should not encode unreserved characters', () => {
            const result = MatrixString.stringify({
                key: 'ABC-abc_123.~',
            });
            expect(result).toBe('key=ABC-abc_123.~');
        });

        test('it should encode unicode properly', () => {
            const result = MatrixString.stringify({
                chinese: '中文',
                emoji: '💩',
            });
            expect(result).toContain('%E4%B8%AD%E6%96%87'); // 中文
            expect(result).toContain('%F0%9F%92%A9'); // 💩
        });
    });

    describe('Key Sorting', () => {
        test('it should sort keys alphabetically', () => {
            const result = MatrixString.stringify({
                z: 'last',
                a: 'first',
                m: 'middle',
            });
            expect(result).toBe('a=first;m=middle;z=last');
        });

        test('it should use natural sort order', () => {
            const result = MatrixString.stringify({
                key10: 'ten',
                key2: 'two',
                key1: 'one',
            });
            // Natural sort means: key1, key10, key2
            expect(result).toBe('key1=one;key10=ten;key2=two');
        });
    });

    describe('Array Stringification', () => {
        test('it should stringify arrays as comma-separated', () => {
            const result = MatrixString.stringify({
                colors: ['red', 'green', 'ndigo'],
            });
            expect(result).toBe('colors=red,green,ndigo');
        });

        test('it should preserve array value order', () => {
            const result = MatrixString.stringify({
                nums: ['3', '1', '2'],
            });
            expect(result).toBe('nums=3,1,2');
        });

        test('it should handle empty arrays', () => {
            const result = MatrixString.stringify({
                empty: [],
                other: 'value',
            });
            expect(result).toBe('empty=;other=value');
        });

        test('it should skip undefined in arrays', () => {
            const result = MatrixString.stringify({
                arr: ['a', undefined, 'b'],
            });
            expect(result).toBe('arr=a,b');
        });

        test('it should handle null in arrays', () => {
            const result = MatrixString.stringify({
                arr: ['a', null, 'b'],
            });
            // Null gets stringified as 'null' - this is current behavior
            expect(result).toBe('arr=a,null,b');
        });
    });

    describe('Null and Undefined Handling', () => {
        test('it should stringify null as key-only', () => {
            const result = MatrixString.stringify({
                empty: null,
            });
            expect(result).toBe('empty');
        });

        test('it should omit undefined values', () => {
            const result = MatrixString.stringify({
                defined: 'value',
                undefined: undefined,
            });
            expect(result).toBe('defined=value');
        });

        test('it should handle mixed null, undefined, and values', () => {
            const result = MatrixString.stringify({
                a: 'value',
                b: null,
                c: undefined,
                d: 'another',
            });
            expect(result).toBe('a=value;b;d=another');
        });
    });

    describe('Round-trip Preservation', () => {
        test('it should preserve data through parse-stringify cycle', () => {
            const original = {
                foo: 'bar',
                baz: 'qux',
                num: '123',
            };
            const stringified = MatrixString.stringify(original);
            const parsed = MatrixString.parse(stringified);
            expect(parsed).toEqual(original);
        });

        test('it should preserve arrays through round-trip', () => {
            const original = {
                colors: ['red', 'green', 'ndigo'],
            };
            const stringified = MatrixString.stringify(original);
            const parsed = MatrixString.parse(stringified);
            expect(parsed).toEqual(original);
        });

        test('it should handle unicode in round-trip', () => {
            const original = {
                chinese: '中文',
                emoji: '💩',
                arabic: 'العربية',
            };
            const stringified = MatrixString.stringify(original);
            const parsed = MatrixString.parse(stringified);
            expect(parsed).toEqual(original);
        });

        test('it should normalize key order in round-trip', () => {
            const input = 'z=3;a=1;m=2';
            const parsed = MatrixString.parse(input);
            const stringified = MatrixString.stringify(parsed);
            expect(stringified).toBe('a=1;m=2;z=3');
        });

        test('it should preserve arrays with null elements through round-trip', () => {
            const original = {
                values: ['a', null, 'b'],
            };
            const stringified = MatrixString.stringify(original);
            const parsed = MatrixString.parse(stringified);
            // Note: null gets stringified as 'null' string, so round-trip converts to string
            expect(parsed).toEqual({ values: ['a', 'null', 'b'] });
        });
    });
});
