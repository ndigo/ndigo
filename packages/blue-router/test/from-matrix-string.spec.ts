import { describe, test, expect } from 'vitest';
import fromMatrixString from '../src/from-matrix-string';

describe('fromMatrixString', () => {
    test('it should parse matrix strings starting with a `;`', () => {
        expect(fromMatrixString(';foo=bar')).toEqual({ foo: 'bar' });
    });

    test('it should parse a matrix string', () => {
        expect(fromMatrixString('foo=bar')).toEqual({ foo: 'bar' });
    });

    test('it should parse multiple matrix strings', () => {
        expect(fromMatrixString('foo=bar;key=val')).toEqual({
            foo: 'bar',
            key: 'val',
        });
    });

    test('it should parse matrix strings without a value', () => {
        expect(fromMatrixString('foo')).toEqual({ foo: null });
        expect(fromMatrixString('foo;key')).toEqual({
            foo: null,
            key: null,
        });
        expect(fromMatrixString('foo=bar;key')).toEqual({
            foo: 'bar',
            key: null,
        });
        expect(fromMatrixString('a=,')).toEqual({ a: ['', ''] });
    });

    test('it should return empty object if no matrix string can be found', () => {
        expect(fromMatrixString(';')).toEqual({});
        expect(fromMatrixString(' ')).toEqual({});
    });

    test('it should handle `+` correctly', () => {
        expect(fromMatrixString('foo+faz=bar+baz++')).toEqual({ 'foo faz': 'bar baz  ' });
    });

    test('it should parse matrix strings params including embedded `=`', () => {
        expect(fromMatrixString(';param=http%3A%2F%2Fsomeurl%3Fid%3D2837')).toEqual({
            param: 'http://someurl?id=2837',
        });
    });

    test('it should parse matrix strings params including raw `=`', () => {
        expect(fromMatrixString(';param=http://someurl?id=2837')).toEqual({ param: 'http://someurl?id=2837' });
    });

    test('it should parse object properties', () => {
        // expect( fromMatrixString().prototype ).toBeUndefined();
        expect(fromMatrixString('hasOwnProperty=foo')).toEqual({ hasOwnProperty: 'foo' });
    });

    test('it should parse matrix strings not having a bracketed value and format option as `bracket`', () => {
        expect(fromMatrixString('foo=bar')).toEqual({ foo: 'bar' });
    });

    test('it should parse decode keys and values', () => {
        expect(fromMatrixString('st%C3%A5le=foo')).toEqual({ ståle: 'foo' });
        expect(fromMatrixString('foo=%7B%ab%%7C%de%%7D+%%7Bst%C3%A5le%7D%')).toEqual({ foo: '{%ab%|%de%} %{ståle}%' });
    });
});
