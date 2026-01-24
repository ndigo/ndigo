import { describe, test, expect } from 'vitest';
import fromQueryString from '../src/from-query-string';
import toQueryString from '../src/to-query-string';

describe('fromQueryString', () => {
    test('it should parse query strings starting with a `?`', () => {
        expect(fromQueryString('?foo=bar')).toEqual({ foo: 'bar' });
    });

    test('it should parse query strings starting with a `#`', () => {
        expect(fromQueryString('#foo=bar')).toEqual({ foo: 'bar' });
    });

    test('it should parse query strings starting with a `&`', () => {
        expect(fromQueryString('&foo=bar&foo=baz')).toEqual({ foo: ['bar', 'baz'] });
    });

    test('it should parse a query string', () => {
        expect(fromQueryString('foo=bar')).toEqual({ foo: 'bar' });
    });

    test('it should parse multiple query string', () => {
        expect(fromQueryString('foo=bar&key=val')).toEqual({
            foo: 'bar',
            key: 'val',
        });
    });

    test('it should parse query string without a value', () => {
        expect(fromQueryString('foo')).toEqual({ foo: null });
        expect(fromQueryString('foo&key')).toEqual({
            foo: null,
            key: null,
        });
        expect(fromQueryString('foo=bar&key')).toEqual({
            foo: 'bar',
            key: null,
        });
        expect(fromQueryString('a&a')).toEqual({ a: [null, null] });
        expect(fromQueryString('a=&a')).toEqual({ a: ['', null] });
    });

    test('it should return empty object if no query string can be found', () => {
        expect(fromQueryString('?')).toEqual({});
        expect(fromQueryString('&')).toEqual({});
        expect(fromQueryString('#')).toEqual({});
        expect(fromQueryString(' ')).toEqual({});
    });

    test('it should handle `+` correctly', () => {
        expect(fromQueryString('foo+faz=bar+baz++')).toEqual({ 'foo faz': 'bar baz  ' });
    });

    test('it should handle multiple of the same key', () => {
        expect(fromQueryString('foo=bar&foo=baz')).toEqual({ foo: ['bar', 'baz'] });
    });

    test('it should handle multiple values and preserve appearence order', () => {
        expect(fromQueryString('a=value&a=')).toEqual({ a: ['value', ''] });
        expect(fromQueryString('a=&a=value')).toEqual({ a: ['', 'value'] });
    });

    test.skip('it should handle multiple values and preserve appearance order with brackets', () => {
        expect(fromQueryString('a[]=value&a[]=')).toEqual({ a: ['value', ''] });
        expect(fromQueryString('a[]=&a[]=value')).toEqual({ a: ['', 'value'] });
    });

    test.skip('it should handle multiple values and preserve appearance order with indexes', () => {
        expect(fromQueryString('a[0]=value&a[1]=')).toEqual({ a: ['value', ''] });
        expect(fromQueryString('a[1]=&a[0]=value')).toEqual({ a: ['value', ''] });
    });

    test('it should parse query strings params including embedded `=`', () => {
        expect(fromQueryString('?param=http%3A%2F%2Fsomeurl%3Fid%3D2837')).toEqual({ param: 'http://someurl?id=2837' });
    });

    test('it should parse query strings params including raw `=`', () => {
        expect(fromQueryString('?param=http://someurl?id=2837')).toEqual({ param: 'http://someurl?id=2837' });
    });

    test('it should parse object properties', () => {
        // expect( fromQueryString().prototype ).toBeUndefined();
        expect(fromQueryString('hasOwnProperty=foo')).toEqual({ hasOwnProperty: 'foo' });
    });

    test('it should parse query strings having indexed arrays', () => {
        expect(fromQueryString('foo[0]=bar&foo[1]=baz')).toEqual({ 'foo[0]': 'bar', 'foo[1]': 'baz' });
    });

    test.skip('it should parse query strings having brackets arrays', () => {
        expect(fromQueryString('foo[]=bar&foo[]=baz')).toEqual({ 'foo[]': ['bar', 'baz'] });
    });

    test.skip('it should parse query strings having indexed arrays keeping index order', () => {
        expect(fromQueryString('foo[1]=bar&foo[0]=baz')).toEqual({ 'foo[1]': 'bar', 'foo[0]': 'baz' });
    });

    test.skip('it should parse query string having a single bracketed value and format option as `bracket`', () => {
        expect(fromQueryString('foo[]=bar')).toEqual({ foo: ['bar'] });
    });

    test.skip('it should parse query string not having a bracketed value and format option as `bracket`', () => {
        expect(fromQueryString('foo=bar')).toEqual({ foo: 'bar' });
    });

    test.skip('it should parse query string having a bracketed value and a single value and format option as `bracket`', () => {
        expect(fromQueryString('foo=bar&baz[]=bar')).toEqual({ foo: 'bar', baz: ['bar'] });
    });

    test.skip('it should parse query strings having brackets arrays and format option as `bracket`', () => {
        expect(fromQueryString('foo[]=bar&foo[]=baz')).toEqual({ foo: ['bar', 'baz'] });
    });

    test.skip('it should parse query strings having indexed arrays and format option as `index`', () => {
        expect(fromQueryString('foo[0]=bar&foo[1]=baz')).toEqual({ foo: ['bar', 'baz'] });
    });

    test.skip('it should parse query strings having ordered index arrays and format option as `index`', () => {
        expect(fromQueryString('foo[1]=bar&foo[0]=baz&foo[3]=one&foo[2]=two')).toEqual({
            foo: ['baz', 'bar', 'two', 'one'],
        });
        expect(fromQueryString('foo[0]=bar&foo[1]=baz&foo[2]=one&foo[3]=two')).toEqual({
            foo: ['bar', 'baz', 'one', 'two'],
        });
        expect(fromQueryString('foo[3]=three&foo[2]=two&foo[1]=one&foo[0]=zero')).toEqual({
            foo: ['zero', 'one', 'two', 'three'],
        });
        expect(fromQueryString('foo[3]=three&foo[2]=two&foo[1]=one&foo[0]=zero&bat=buz')).toEqual({
            foo: ['zero', 'one', 'two', 'three'],
            bat: 'buz',
        });
        expect(fromQueryString('foo[1]=bar&foo[0]=baz')).toEqual({ foo: ['baz', 'bar'] });
        expect(fromQueryString('foo[102]=three&foo[2]=two&foo[1]=one&foo[0]=zero&bat=buz')).toEqual({
            bat: 'buz',
            foo: ['zero', 'one', 'two', 'three'],
        });
        expect(fromQueryString('foo[102]=three&foo[2]=two&foo[100]=one&foo[0]=zero&bat=buz')).toEqual({
            bat: 'buz',
            foo: ['zero', 'two', 'one', 'three'],
        });
    });

    test.skip('it should parse circuit parse -> stringify', () => {
        const original = 'foo[3]=foo&foo[2]&foo[1]=one&foo[0]=&bat=buz';
        const sortedOriginal = 'bat=buz&foo[0]=&foo[1]=one&foo[2]&foo[3]=foo';
        const expected = { bat: 'buz', foo: ['', 'one', null, 'foo'] };

        expect(fromQueryString(original)).toEqual(expected);
        expect(toQueryString(expected)).toBe(sortedOriginal);
    });

    test.skip('it should parse circuit original -> parse - > stringify -> sorted original', () => {
        const original = 'foo[21474836471]=foo&foo[21474836470]&foo[1]=one&foo[0]=&bat=buz';
        const sortedOriginal = 'bat=buz&foo[0]=&foo[1]=one&foo[2]&foo[3]=foo';
        const options = {};

        expect(toQueryString(fromQueryString(original, options), options)).toBe(sortedOriginal);
    });

    test('it should parse decode keys and values', () => {
        expect(fromQueryString('st%C3%A5le=foo')).toEqual({ ståle: 'foo' });
        expect(fromQueryString('foo=%7B%ab%%7C%de%%7D+%%7Bst%C3%A5le%7D%')).toEqual({ foo: '{%ab%|%de%} %{ståle}%' });
    });
});
