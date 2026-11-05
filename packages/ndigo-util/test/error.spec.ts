/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { getErrorMessage } from '@ndigo/util';

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
