/**
 */
import { describe, test, expect } from 'vitest';
import { getErrorMessage, toError } from '@ndigo/util';

describe('getErrorMessage', function () {
    test('returns the message of an Error instance', function () {
        expect(getErrorMessage(new Error('boom'))).toBe('boom');
    });

    test('returns the message of an Error subclass', function () {
        class CustomError extends Error {}
        expect(getErrorMessage(new CustomError('custom'))).toBe('custom');
    });

    test('returns an empty string for an Error without a message', function () {
        expect(getErrorMessage(new Error())).toBe('');
    });

    test('stringifies a thrown string', function () {
        expect(getErrorMessage('plain')).toBe('plain');
    });

    test('stringifies null and undefined', function () {
        expect(getErrorMessage(null)).toBe('null');
        expect(getErrorMessage(undefined)).toBe('undefined');
    });

    test('stringifies non-Error thrown values', function () {
        expect(getErrorMessage(42)).toBe('42');
        expect(getErrorMessage(Symbol('sym'))).toBe('Symbol(sym)');
        expect(getErrorMessage({ message: 'not an Error' })).toBe('[object Object]');
    });
});

describe('toError', function () {
    test('returns the same Error instance', function () {
        const err = new Error('boom');
        expect(toError(err)).toBe(err);
    });

    test('returns the same Error subclass instance', function () {
        class CustomError extends Error {}
        const err = new CustomError('custom');
        expect(toError(err)).toBe(err);
    });

    test('wraps a thrown string', function () {
        const result = toError('plain');
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe('plain');
    });

    test('wraps null and undefined', function () {
        expect(toError(null).message).toBe('null');
        expect(toError(undefined).message).toBe('undefined');
    });

    test('wraps non-Error thrown values', function () {
        expect(toError(42).message).toBe('42');
        expect(toError({ message: 'not an Error' }).message).toBe('[object Object]');
    });
});
