/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import MatrixString from '../src/matrix-string';

describe('MatrixString', () => {
    describe('parse', () => {
        test('it should parse matrix strings starting with a `;`', () => {
            expect(MatrixString.parse(';foo=bar')).toEqual({ foo: 'bar' });
        });

        test('it should parse a matrix string', () => {
            expect(MatrixString.parse('foo=bar')).toEqual({ foo: 'bar' });
        });

        test('it should parse multiple matrix strings', () => {
            expect(MatrixString.parse('foo=bar;key=val')).toEqual({
                foo: 'bar',
                key: 'val',
            });
        });

        test('it should parse matrix strings without a value', () => {
            expect(MatrixString.parse('foo')).toEqual({ foo: null });
            expect(MatrixString.parse('foo;key')).toEqual({
                foo: null,
                key: null,
            });
            expect(MatrixString.parse('foo=bar;key')).toEqual({
                foo: 'bar',
                key: null,
            });
            expect(MatrixString.parse('a=,')).toEqual({ a: [null, null] }); // Changed from router test: ['', ''] -> [null, null]
        });

        test('it should return empty object if no matrix string can be found', () => {
            expect(MatrixString.parse(';')).toEqual({});
            expect(MatrixString.parse(' ')).toEqual({});
        });

        test('it should handle `+` correctly', () => {
            expect(MatrixString.parse('foo+faz=bar+baz++')).toEqual({ 'foo faz': 'bar baz  ' });
        });

        test('it should parse matrix strings params including embedded `=`', () => {
            expect(MatrixString.parse(';param=http%3A%2F%2Fsomeurl%3Fid%3D2837')).toEqual({
                param: 'http://someurl?id=2837',
            });
        });

        test('it should parse matrix strings params including raw `=`', () => {
            expect(MatrixString.parse(';param=http://someurl?id=2837')).toEqual({ param: 'http://someurl?id=2837' });
        });

        test('it should parse object properties', () => {
            expect(MatrixString.parse('hasOwnProperty=foo')).toEqual({ hasOwnProperty: 'foo' });
        });

        test('it should parse matrix strings not having a bracketed value and format option as `bracket`', () => {
            expect(MatrixString.parse('foo=bar')).toEqual({ foo: 'bar' });
        });

        test('it should parse decode keys and values', () => {
            expect(MatrixString.parse('st%C3%A5le=foo')).toEqual({ ståle: 'foo' });
            expect(MatrixString.parse('foo=%7B%ab%%7C%de%%7D+%%7Bst%C3%A5le%7D%')).toEqual({
                foo: '{%ab%|%de%} %{ståle}%',
            });
        });
    });

    describe('stringify', () => {
        test('it should stringify', () => {
            expect(MatrixString.stringify({ foo: 'bar' })).toBe('foo=bar');
            expect(MatrixString.stringify({ foo: 'bar', bar: 'baz' })).toBe('bar=baz;foo=bar');
        });

        test('it should handle encoding', () => {
            expect(MatrixString.stringify({ 'foo bar': 'baz faz' })).toBe('foo%20bar=baz%20faz');
            expect(MatrixString.stringify({ 'foo bar': "baz'faz" })).toBe('foo%20bar=baz%27faz');
        });

        test('it should handle array values', () => {
            expect(MatrixString.stringify({ abc: 'abc', foo: ['bar', 'baz'] })).toBe('abc=abc;foo=bar,baz');
        });

        test('it should maintain array value order', () => {
            expect(MatrixString.stringify({ abc: 'abc', foo: ['baz', 'bar'] })).toBe('abc=abc;foo=baz,bar');
        });

        test('it should handle empty array values', () => {
            expect(MatrixString.stringify({ abc: 'abc', foo: [] })).toBe('abc=abc;foo=');
        });

        test('it should not encode undefined values', () => {
            expect(MatrixString.stringify({ abc: undefined, foo: 'baz' })).toBe('foo=baz');
        });

        test('it should encode null values as just a key', () => {
            expect(MatrixString.stringify({ 'x y z': null, abc: null, foo: 'baz' })).toBe('abc;foo=baz;x%20y%20z');
        });

        test('it should handle null values in array', () => {
            expect(MatrixString.stringify({ foo: null, bar: [null, 'baz'] })).toBe('bar=null,baz;foo');
        });

        test('it should handle undefined values in array', () => {
            expect(MatrixString.stringify({ foo: null, bar: [undefined, 'baz'] })).toBe('bar=baz;foo');
        });

        test('it should handle undefined and null values in array', () => {
            expect(MatrixString.stringify({ foo: null, bar: [undefined, null, 'baz'] })).toBe('bar=null,baz;foo');
        });

        test('it should handle strict encoding', () => {
            expect(MatrixString.stringify({ foo: "'bar'" })).toBe('foo=%27bar%27');
            expect(MatrixString.stringify({ foo: ["'bar'", '!baz'] })).toBe('foo=%27bar%27,%21baz');
        });

        test('it should handle array formatting', () => {
            expect(MatrixString.stringify({ foo: null, bar: ['one', 'two'] })).toBe('bar=one,two;foo');
        });

        test('it should handle sparse array formatting', () => {
            const array: string[] = ['one', 'two'];
            array[10] = 'three';
            expect(MatrixString.stringify({ bar: array })).toBe('bar=one,two,three');
        });

        test('it should sort objects by key', () => {
            expect(MatrixString.stringify({ zar: 'zargle', bar: 'bargle' })).toBe('bar=bargle;zar=zargle');
        });

        test('sorts raw keys case-sensitively before encoding, retaining array value order', () => {
            expect(MatrixString.stringify({ z: ['second', 'first'], a: 'lower', Z: 'upper', é: 'accent' })).toBe(
                'Z=upper;a=lower;z=second,first;%C3%A9=accent'
            );
        });
    });
});
