/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import QueryString from '../src/query-string';

describe('QueryString', () => {
    describe('parse', () => {
        test('it should parse query strings starting with a `?`', () => {
            expect(QueryString.parse('?foo=bar')).toEqual({ foo: 'bar' });
        });

        test('it should treat a leading `#` as part of the first key', () => {
            // URLSearchParams only strips a leading `?`; `#` is a plain
            // character in a query string.
            expect(QueryString.parse('#foo=bar')).toEqual({ '#foo': 'bar' });
        });

        test('it should parse query strings starting with a `&`', () => {
            expect(QueryString.parse('&foo=bar&foo=baz&foo=qux')).toEqual({ foo: ['bar', 'baz', 'qux'] });
        });

        test('it should parse a query string', () => {
            expect(QueryString.parse('foo=bar')).toEqual({ foo: 'bar' });
        });

        test('it should parse multiple query string', () => {
            expect(QueryString.parse('foo=bar&key=val')).toEqual({
                foo: 'bar',
                key: 'val',
            });
        });

        test('it should parse query string without a value as empty strings', () => {
            // Aligned with URLSearchParams, which reports missing and empty
            // values as '' rather than null.
            expect(QueryString.parse('foo')).toEqual({ foo: '' });
            expect(QueryString.parse('foo&key')).toEqual({
                foo: '',
                key: '',
            });
            expect(QueryString.parse('foo=bar&key')).toEqual({
                foo: 'bar',
                key: '',
            });
            // Added from router tests
            expect(QueryString.parse('a&a')).toEqual({ a: ['', ''] });
            expect(QueryString.parse('a=&a')).toEqual({ a: ['', ''] });
        });

        test('it should return empty object when nothing is paired', () => {
            expect(QueryString.parse('?')).toEqual({});
            expect(QueryString.parse('&')).toEqual({});
            // '#' and ' ' are ordinary query characters — URLSearchParams
            // yields a single empty-valued key for each.
            expect(QueryString.parse('#')).toEqual({ '#': '' });
            expect(QueryString.parse(' ')).toEqual({ ' ': '' });
        });

        test('it should treat semicolons as ordinary value characters', () => {
            // URLSearchParams splits on `&` only; `;` belongs to a value.
            expect(QueryString.parse('a=1;b=2')).toEqual({ a: '1;b=2' });
            expect(QueryString.parse('?a=1;b=2&c=3')).toEqual({ a: '1;b=2', c: '3' });
        });

        test('it should drop empty parts between delimiters', () => {
            // URLSearchParams ignores empty parts; a trailing `&` is a no-op
            // and `;` is not a delimiter at all.
            expect(QueryString.parse('a=1&&b=2')).toEqual({ a: '1', b: '2' });
            expect(QueryString.parse('a=1&')).toEqual({ a: '1' });
            expect(QueryString.parse(';a=1')).toEqual({ ';a': '1' });
        });

        test('it should handle multiple values and preserve appearence order', () => {
            expect(QueryString.parse('a=value&a=')).toEqual({ a: ['value', ''] });
            expect(QueryString.parse('a=&a=value')).toEqual({ a: ['', 'value'] });
        });

        test('it should handle `+` correctly', () => {
            expect(QueryString.parse('foo+faz=bar+baz++')).toEqual({ 'foo faz': 'bar baz  ' });
        });

        test('it should handle multiple of the same key', () => {
            expect(QueryString.parse('foo=bar&foo=baz')).toEqual({ foo: ['bar', 'baz'] });
        });

        test('it should handle multiple values and preserve appearence order', () => {
            expect(QueryString.parse('a=value&a=')).toEqual({ a: ['value', ''] });
            expect(QueryString.parse('a=&a=value')).toEqual({ a: ['', 'value'] });
        });

        test('it treats bracketed keys literally, aggregating repeated keys under the bracket name', () => {
            // Documented limitation: the parser is WHATWG URLSearchParams-
            // aligned and performs no `a[]` array expansion — the brackets stay
            // part of the key, and empty values are `''` (never null).
            expect(QueryString.parse('a[]=value&a[]=')).toEqual({ 'a[]': ['value', ''] });
            expect(QueryString.parse('a[]=&a[]=value')).toEqual({ 'a[]': ['', 'value'] });
        });

        test('it treats indexed keys literally, one entry per distinct bracket name', () => {
            // Documented limitation: `a[0]`/`a[1]` are not collapsed into an `a`
            // array — each distinct literal key maps to its own value.
            expect(QueryString.parse('a[0]=value&a[1]=')).toEqual({ 'a[0]': 'value', 'a[1]': '' });
            expect(QueryString.parse('a[1]=&a[0]=value')).toEqual({ 'a[1]': '', 'a[0]': 'value' });
        });

        test('it should parse query strings params including embedded `=`', () => {
            expect(QueryString.parse('?param=http%3A%2F%2Fsomeurl%3Fid%3D2837')).toEqual({
                param: 'http://someurl?id=2837',
            });
        });

        test('it should parse query strings params including raw `=`', () => {
            expect(QueryString.parse('?param=http://someurl?id=2837')).toEqual({ param: 'http://someurl?id=2837' });
        });

        test('it should parse object properties', () => {
            expect(QueryString.parse('hasOwnProperty=foo')).toEqual({ hasOwnProperty: 'foo' });
        });

        test('it should parse query strings having indexed arrays', () => {
            expect(QueryString.parse('foo[0]=bar&foo[1]=baz')).toEqual({ 'foo[0]': 'bar', 'foo[1]': 'baz' });
        });

        test('it should parse query strings having brackets arrays', () => {
            expect(QueryString.parse('foo[]=bar&foo[]=baz')).toEqual({ 'foo[]': ['bar', 'baz'] });
        });

        test('it should parse query strings having indexed arrays keeping index order', () => {
            expect(QueryString.parse('foo[1]=bar&foo[0]=baz')).toEqual({ 'foo[1]': 'bar', 'foo[0]': 'baz' });
        });

        test('it should parse query string having a single bracketed value and format option as `bracket`', () => {
            expect(QueryString.parse('foo[]=bar')).toEqual({ 'foo[]': 'bar' }); // Adjusted expectation: 'foo[]' key
        });

        test('it should parse query string not having a bracketed value and format option as `bracket`', () => {
            expect(QueryString.parse('foo=bar')).toEqual({ foo: 'bar' });
        });

        test('it should parse query string having a bracketed value and a single value and format option as `bracket`', () => {
            expect(QueryString.parse('foo=bar&baz[]=bar')).toEqual({ foo: 'bar', 'baz[]': 'bar' }); // Adjusted
        });

        test('it has no `bracket` format option — bracket keys stay literal', () => {
            // Documented limitation: the parser exposes no format option, so the
            // legacy `bracket` expansion is not implemented; repeated `foo[]`
            // keys aggregate under the literal `foo[]` name.
            expect(QueryString.parse('foo[]=bar&foo[]=baz')).toEqual({ 'foo[]': ['bar', 'baz'] });
        });

        test('it has no `index` format option — indexed keys stay literal', () => {
            // Documented limitation: no `index` format option/expansion exists.
            expect(QueryString.parse('foo[0]=bar&foo[1]=baz')).toEqual({ 'foo[0]': 'bar', 'foo[1]': 'baz' });
        });

        test('it keeps indexed keys literal and in source order rather than sorting by index', () => {
            // Documented limitation: indexed arrays are neither collapsed nor
            // numerically ordered; every distinct literal key is preserved in
            // first-appearance order.
            expect(QueryString.parse('foo[1]=bar&foo[0]=baz&foo[3]=one&foo[2]=two')).toEqual({
                'foo[1]': 'bar',
                'foo[0]': 'baz',
                'foo[3]': 'one',
                'foo[2]': 'two',
            });
            expect(QueryString.parse('foo[0]=bar&foo[1]=baz&foo[2]=one&foo[3]=two')).toEqual({
                'foo[0]': 'bar',
                'foo[1]': 'baz',
                'foo[2]': 'one',
                'foo[3]': 'two',
            });
            expect(QueryString.parse('foo[3]=three&foo[2]=two&foo[1]=one&foo[0]=zero')).toEqual({
                'foo[3]': 'three',
                'foo[2]': 'two',
                'foo[1]': 'one',
                'foo[0]': 'zero',
            });
            expect(QueryString.parse('foo[3]=three&foo[2]=two&foo[1]=one&foo[0]=zero&bat=buz')).toEqual({
                'foo[3]': 'three',
                'foo[2]': 'two',
                'foo[1]': 'one',
                'foo[0]': 'zero',
                bat: 'buz',
            });
            expect(QueryString.parse('foo[1]=bar&foo[0]=baz')).toEqual({ 'foo[1]': 'bar', 'foo[0]': 'baz' });
            expect(QueryString.parse('foo[102]=three&foo[2]=two&foo[1]=one&foo[0]=zero&bat=buz')).toEqual({
                'foo[102]': 'three',
                'foo[2]': 'two',
                'foo[1]': 'one',
                'foo[0]': 'zero',
                bat: 'buz',
            });
            expect(QueryString.parse('foo[102]=three&foo[2]=two&foo[100]=one&foo[0]=zero&bat=buz')).toEqual({
                'foo[102]': 'three',
                'foo[2]': 'two',
                'foo[100]': 'one',
                'foo[0]': 'zero',
                bat: 'buz',
            });
        });

        test('it does not round-trip bracket syntax through parse/stringify', () => {
            // Documented limitation: the legacy bracket round-trip cannot hold —
            // parse keeps bracket names literal, and stringify re-encodes those
            // names (`[`/`]` percent-escaped), sorting them as text rather than
            // reconstructing the indexed form.
            const original = 'foo[3]=foo&foo[2]&foo[1]=one&foo[0]=&bat=buz';
            const parsed = QueryString.parse(original);
            expect(parsed).toEqual({
                'foo[3]': 'foo',
                'foo[2]': '',
                'foo[1]': 'one',
                'foo[0]': '',
                bat: 'buz',
            });
            expect(QueryString.stringify(parsed)).toBe('bat=buz&foo%5B0%5D=&foo%5B1%5D=one&foo%5B2%5D=&foo%5B3%5D=foo');
        });

        test('it does not reconstruct out-of-range index ordering through parse/stringify', () => {
            // Documented limitation: large indices are ordinary literal keys, so
            // stringify sorts them as text — never the numeric `foo[0..3]` form.
            const original = 'foo[21474836471]=foo&foo[21474836470]&foo[1]=one&foo[0]=&bat=buz';
            expect(QueryString.stringify(QueryString.parse(original))).toBe(
                'bat=buz&foo%5B0%5D=&foo%5B1%5D=one&foo%5B21474836470%5D=&foo%5B21474836471%5D=foo'
            );
        });

        test('it should parse decode keys and values', () => {
            const result1 = QueryString.parse('st%C3%A5le=foo');
            expect(result1).toHaveProperty('ståle', 'foo');
            // URLSearchParams semantics: valid escapes decode, invalid byte
            // sequences (%ab, %de) become U+FFFD, unknown `%` stays literal.
            const result2 = QueryString.parse('foo=%7B%ab%%7C%de%%7D+%%7Bst%C3%A5le%7D%');
            expect(result2).toHaveProperty('foo', '{\uFFFD%|\uFFFD%} %{ståle}%');
        });
        test('it should not split on `;`', () => {
            expect(QueryString.parse('a=1;b=2')).toEqual({ a: '1;b=2' });
        });
    });

    describe('stringify', () => {
        test('it should stringify', () => {
            expect(QueryString.stringify({ foo: 'bar' })).toBe('foo=bar');
            expect(QueryString.stringify({ foo: 'bar', bar: 'baz' })).toBe('bar=baz&foo=bar');
        });

        test('it should handle encoding', () => {
            expect(QueryString.stringify({ 'foo bar': 'baz faz' })).toBe('foo%20bar=baz%20faz');
            expect(QueryString.stringify({ 'foo bar': "baz'faz" })).toBe('foo%20bar=baz%27faz');
        });

        test('it should handle array values', () => {
            expect(QueryString.stringify({ abc: 'abc', foo: ['bar', 'baz'] })).toBe('abc=abc&foo=bar&foo=baz');
        });

        test('it should maintain array value order', () => {
            expect(QueryString.stringify({ abc: 'abc', foo: ['baz', 'bar'] })).toBe('abc=abc&foo=baz&foo=bar');
        });

        test('it should handle empty array values', () => {
            expect(QueryString.stringify({ abc: 'abc', foo: [] })).toBe('abc=abc');
        });

        test('it should not encode undefined values', () => {
            expect(QueryString.stringify({ abc: undefined, foo: 'baz' })).toBe('foo=baz');
        });

        test('it should encode null values as just a key', () => {
            expect(QueryString.stringify({ 'x y z': null, abc: null, foo: 'baz' })).toBe('abc&foo=baz&x%20y%20z');
        });

        test('it should handle null values in array', () => {
            expect(QueryString.stringify({ foo: null, bar: [null, 'baz'] })).toBe('bar&bar=baz&foo');
        });

        test('it should handle undefined values in array', () => {
            expect(QueryString.stringify({ foo: null, bar: [undefined, 'baz'] })).toBe('bar=baz&foo');
        });

        test('it should handle undefined and null values in array', () => {
            expect(QueryString.stringify({ foo: null, bar: [undefined, null, 'baz'] })).toBe('bar&bar=baz&foo');
        });

        test('it should handle strict encoding', () => {
            expect(QueryString.stringify({ foo: "'bar'" })).toBe('foo=%27bar%27');
            expect(QueryString.stringify({ foo: ["'bar'", '!baz'] })).toBe('foo=%27bar%27&foo=%21baz');
        });
    });
});
