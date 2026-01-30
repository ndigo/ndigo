import { describe, it, expect, test } from 'vitest';
import { expectSuccess, expectFailure } from './_expect';
import matrixString from '../src/matrix-string';

describe('matrixString', function () {
    test('it should parse matrix strings starting with a `;`', function () {
        expectSuccess(matrixString, ';foo=bar', { foo: 'bar' });
});

    test('it should parse a matrix string', function () {
        expectSuccess(matrixString, 'foo=bar', { foo: 'bar' });
    });

    test('it should parse multiple matrix strings', function () {
        expectSuccess(matrixString, 'foo=bar;key=val', {
            foo: 'bar',
            key: 'val',
        });
        expectSuccess(matrixString, 'a=b,c', { a: ['b', 'c'] });
    });

    test('it should parse matrix strings without a value', function () {
        expectSuccess(matrixString, 'foo', { foo: null });
        expectSuccess(matrixString, 'foo;key', {
            foo: null,
            key: null,
        });
        expectSuccess(matrixString, 'foo=bar;key', {
            foo: 'bar',
            key: null,
        });
        expectSuccess(matrixString, 'a=,', { a: ['', ''] });
    });

    test('it should return empty object if no matrix string can be found', function () {
        expectSuccess(matrixString, ';', {});
        expectSuccess(matrixString, ' ', {});
    });

    test('it should handle `+` correctly', function () {
        expect(matrixString.parse('foo+faz=bar+baz++')).toEqual({ 'foo faz': 'bar baz  ' });
    });

    test('it should parse matrix strings params including embedded `=`', function () {
        expect(matrixString.parse(';param=http%3A%2F%2Fsomeurl%3Fid%3D2837')).toEqual({
            param: 'http://someurl?id=2837',
        });
    });

    test('it should parse matrix strings params including raw `=`', function () {
        expect(matrixString.parse(';param=http://someurl?id=2837')).toEqual({ param: 'http://someurl?id=2837' });
    });
});
