import { describe, test } from 'vitest';
import QueryString from '../src/query-string';

describe('QueryString', () => {
    describe.skip('parse', () => {
        test.skip('it should parse query strings starting with a `?`', () => {
            expect(QueryString.parse('?foo=bar')).toEqual({ foo: 'bar' });
        });

        test.skip('it should parse query strings starting with a `#`', () => {
            expect(QueryString.parse('#foo=bar')).toEqual({ foo: 'bar' });
        });

        test.skip('it should parse query strings starting with a `&`', () => {
            expect(QueryString.parse('&foo=bar&foo=baz&foo=qux')).toEqual({ foo: ['bar', 'baz', 'qux'] });
        });

        test.skip('it should parse a query string', () => {
            expect(QueryString.parse('foo=bar')).toEqual({ foo: 'bar' });
        });

        test.skip('it should parse multiple query string', () => {
            expect(QueryString.parse('foo=bar&key=val')).toEqual({
                foo: 'bar',
                key: 'val',
            });
        });

        test('it should parse query string without a value', () => {
            expect(QueryString.parse('foo')).toEqual({ foo: null });
            expect(QueryString.parse('foo&key')).toEqual({
                foo: null,
                key: null,
            });
            expect(QueryString.parse('foo=bar&key')).toEqual({
                foo: 'bar',
                key: null,
            });
            expect(QueryString.parse('a&a')).toEqual({ a: [null, null] });
            expect(QueryString.parse('a=&a')).toEqual({ a: [null, null] });
        });

        test('it should return empty object if no query string can be found', () => {
            expect(QueryString.parse('?')).toEqual({});
            expect(QueryString.parse('&')).toEqual({});
            expect(QueryString.parse('#')).toEqual({});
            expect(QueryString.parse(' ')).toEqual({});
        });

        test('it should handle `+` correctly', () => {
            expect(QueryString.parse('foo+faz=bar+baz++')).toEqual({ 'foo faz': 'bar baz  ' });
        });

        test('it should handle multiple of the same key', () => {
            expect(QueryString.parse('foo=bar&foo=baz')).toEqual({ foo: ['bar', 'baz'] });
        });

        test('it should handle multiple values and preserve appearence order', () => {
            expect(QueryString.parse('a=value&a=')).toEqual({ a: ['value', null] });
            expect(QueryString.parse('a=&a=value')).toEqual({ a: [null, 'value'] });
        });

        test.skip('it should handle multiple values and preserve appearance order with brackets', () => {
            expect(QueryString.parse('a[]=value&a[]=')).toEqual({ a: ['value', null] });
            expect(QueryString.parse('a[]=&a[]=value')).toEqual({ a: [null, 'value'] });
        });

        test.skip('it should handle multiple values and preserve appearance order with indexes', () => {
            expect(QueryString.parse('a[0]=value&a[1]=')).toEqual({ a: ['value', null] });
            expect(QueryString.parse('a[1]=&a[0]=value')).toEqual({ a: ['value', null] });
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

        test.skip('it should parse query strings having brackets arrays', () => {
            expect(QueryString.parse('foo[]=bar&foo[]=baz')).toEqual({ 'foo[]': ['bar', 'baz'] });
        });

        test.skip('it should parse query strings having indexed arrays keeping index order', () => {
            expect(QueryString.parse('foo[1]=bar&foo[0]=baz')).toEqual({ 'foo[1]': 'bar', 'foo[0]': 'baz' });
        });

        test.skip('it should parse query string having a single bracketed value and format option as `bracket`', () => {
            expect(QueryString.parse('foo[]=bar')).toEqual({ foo: ['bar'] });
        });

        test.skip('it should parse query string not having a bracketed value and format option as `bracket`', () => {
            expect(QueryString.parse('foo=bar')).toEqual({ foo: 'bar' });
        });

        test.skip('it should parse query string having a bracketed value and a single value and format option as `bracket`', () => {
            expect(QueryString.parse('foo=bar&baz[]=bar')).toEqual({ foo: 'bar', baz: ['bar'] });
        });

        test.skip('it should parse query strings having brackets arrays and format option as `bracket`', () => {
            expect(QueryString.parse('foo[]=bar&foo[]=baz')).toEqual({ foo: ['bar', 'baz'] });
        });

        test.skip('it should parse query strings having indexed arrays and format option as `index`', () => {
            expect(QueryString.parse('foo[0]=bar&foo[1]=baz')).toEqual({ foo: ['bar', 'baz'] });
        });

        test.skip('it should parse query strings having ordered index arrays and format option as `index`', () => {
            expect(QueryString.parse('foo[1]=bar&foo[0]=baz&foo[3]=one&foo[2]=two')).toEqual({
                foo: ['baz', 'bar', 'two', 'one'],
            });
            expect(QueryString.parse('foo[0]=bar&foo[1]=baz&foo[2]=one&foo[3]=two')).toEqual({
                foo: ['bar', 'baz', 'one', 'two'],
            });
            expect(QueryString.parse('foo[3]=three&foo[2]=two&foo[1]=one&foo[0]=zero')).toEqual({
                foo: ['zero', 'one', 'two', 'three'],
            });
            expect(QueryString.parse('foo[3]=three&foo[2]=two&foo[1]=one&foo[0]=zero&bat=buz')).toEqual({
                foo: ['zero', 'one', 'two', 'three'],
                bat: 'buz',
            });
            expect(QueryString.parse('foo[1]=bar&foo[0]=baz')).toEqual({ foo: ['baz', 'bar'] });
            expect(QueryString.parse('foo[102]=three&foo[2]=two&foo[1]=one&foo[0]=zero&bat=buz')).toEqual({
                bat: 'buz',
                foo: ['zero', 'one', 'two', 'three'],
            });
            expect(QueryString.parse('foo[102]=three&foo[2]=two&foo[100]=one&foo[0]=zero&bat=buz')).toEqual({
                bat: 'buz',
                foo: ['zero', 'two', 'one', 'three'],
            });
        });

        test.skip('it should parse circuit QueryString.parse -> stringify', () => {
            const original = 'foo[3]=foo&foo[2]&foo[1]=one&foo[0]=&bat=buz';
            const sortedOriginal = 'bat=buz&foo[0]=&foo[1]=one&foo[2]&foo[3]=foo';
            const expected = { bat: 'buz', foo: ['', 'one', null, 'foo'] };

            expect(QueryString.parse(original)).toEqual(expected);
            expect(QueryString.stringify(expected)).toBe(sortedOriginal);
        });

        test.skip('it should parse circuit original -> QueryString.parse - > stringify -> sorted original', () => {
            const original = 'foo[21474836471]=foo&foo[21474836470]&foo[1]=one&foo[0]=&bat=buz';
            const sortedOriginal = 'bat=buz&foo[0]=&foo[1]=one&foo[2]&foo[3]=foo';
            const options = {};

            expect(QueryString.stringify(QueryString.parse(original, options), options), sortedOriginal);
        });

        test('it should parse decode keys and values', () => {
            const result1 = QueryString.parse('st%C3%A5le=foo');
            expect(result1).toHaveProperty('ståle', 'foo');
            const result2 = QueryString.parse('foo=%7B%ab%%7C%de%%7D+%%7Bst%C3%A5le%7D%');
            expect(result2).toHaveProperty('foo', '{%ab%|%de%} %{ståle}%');
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
