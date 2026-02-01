import { describe, it, expect } from 'vitest';
import { expectSuccess } from './_expect';
import matrixString from '../src/matrix-string';

describe('matrixString', () => {
    it('should parse matrix strings starting with a `;`', () => {
        expectSuccess(matrixString, ';foo=bar', { foo: 'bar' });
    });

    it('should parse a matrix string', () => {
        expectSuccess(matrixString, 'foo=bar', { foo: 'bar' });
    });

    it('should parse multiple matrix strings', () => {
        expectSuccess(matrixString, 'foo=bar;key=val', {
            foo: 'bar',
            key: 'val',
        });
        expectSuccess(matrixString, 'a=b,c', { a: ['b', 'c'] });
    });

    it('should parse matrix strings without a value', () => {
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

    it('should return empty object if no matrix string can be found', () => {
        expectSuccess(matrixString, ';', {});
        expectSuccess(matrixString, ' ', {});
    });

    it('should handle `+` correctly', () => {
        expectSuccess(matrixString, 'foo+faz=bar+baz++', { 'foo faz': 'bar baz  ' });
    });

    it('should parse matrix strings params including embedded `=`', () => {
        expectSuccess(matrixString, ';param=http%3A%2F%2Fsomeurl%3Fid%3D2837', {
            param: 'http://someurl?id=2837',
        });
    });

    it('should parse matrix strings params including raw `=`', () => {
        expectSuccess(matrixString, ';param=http://someurl?id=2837', { param: 'http://someurl?id=2837' });
    });
});
