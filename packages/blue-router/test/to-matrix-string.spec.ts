import { describe, test, expect } from 'vitest';
import toMatrixString from '../src/to-matrix-string';

describe('toMatrixString', () => {
    test('it should stringify', () => {
        expect(toMatrixString({ foo: 'bar' })).toBe('foo=bar');
        expect(toMatrixString({ foo: 'bar', bar: 'baz' })).toBe('bar=baz;foo=bar');
    });

    test('it should handle encoding', () => {
        expect(toMatrixString({ 'foo bar': 'baz faz' })).toBe('foo%20bar=baz%20faz');
        expect(toMatrixString({ 'foo bar': "baz'faz" })).toBe('foo%20bar=baz%27faz');
    });

    test('it should handle array values', () => {
        expect(toMatrixString({ abc: 'abc', foo: ['bar', 'baz'] })).toBe('abc=abc;foo=bar,baz');
    });

    test('it should maintain array value order', () => {
        expect(toMatrixString({ abc: 'abc', foo: ['baz', 'bar'] })).toBe('abc=abc;foo=baz,bar');
    });

    test('it should handle empty array values', () => {
        expect(toMatrixString({ abc: 'abc', foo: [] })).toBe('abc=abc;foo=');
    });

    test('it should not encode undefined values', () => {
        expect(toMatrixString({ abc: undefined, foo: 'baz' })).toBe('foo=baz');
    });

    test('it should encode null values as just a key', () => {
        expect(toMatrixString({ 'x y z': null, abc: null, foo: 'baz' })).toBe('abc;foo=baz;x%20y%20z');
    });

    test('it should handle null values in array', () => {
        expect(toMatrixString({ foo: null, bar: [null, 'baz'] })).toBe('bar=null,baz;foo');
    });

    test('it should handle undefined values in array', () => {
        expect(toMatrixString({ foo: null, bar: [undefined, 'baz'] })).toBe('bar=baz;foo');
    });

    test('it should handle undefined and null values in array', () => {
        expect(toMatrixString({ foo: null, bar: [undefined, null, 'baz'] })).toBe('bar=null,baz;foo');
    });

    test('it should handle strict encoding', () => {
        expect(toMatrixString({ foo: "'bar'" })).toBe('foo=%27bar%27');
        expect(toMatrixString({ foo: ["'bar'", '!baz'] })).toBe('foo=%27bar%27,%21baz');
    });

    test('it should handle array formatting', () => {
        expect(toMatrixString({ foo: null, bar: ['one', 'two'] })).toBe('bar=one,two;foo');
    });

    test('it should handle sparse array formatting', () => {
        const array: string[] = ['one', 'two'];
        array[10] = 'three';
        expect(toMatrixString({ bar: array })).toBe('bar=one,two,three');
    });

    test('it should sort objects by key', () => {
        expect(toMatrixString({ zar: 'zargle', bar: 'bargle' })).toBe('bar=bargle;zar=zargle');
    });
});
