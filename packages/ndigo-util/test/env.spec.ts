/**
 */
import { describe, test, expect, afterEach } from 'vitest';
import { getEnv, isDevMode } from '@ndigo/util';

describe('getEnv', function () {
    const TEST_VAR = 'C14_ENV_HELPER_TEST';

    afterEach(function () {
        delete process.env[TEST_VAR];
    });

    test('returns the variable value when set', function () {
        process.env[TEST_VAR] = 'value';
        expect(getEnv(TEST_VAR)).toBe('value');
    });

    test('returns the fallback when the variable is unset', function () {
        expect(getEnv(TEST_VAR, 'fallback')).toBe('fallback');
    });

    test('returns undefined when unset and no fallback given', function () {
        expect(getEnv(TEST_VAR)).toBeUndefined();
    });

    test('preserves an empty-string value over the fallback', function () {
        process.env[TEST_VAR] = '';
        expect(getEnv(TEST_VAR, 'fallback')).toBe('');
    });
});

describe('isDevMode', function () {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(function () {
        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = originalNodeEnv;
        }
    });

    test('is false for an explicit production build', function () {
        process.env.NODE_ENV = 'production';
        expect(isDevMode()).toBe(false);
    });

    test('is true for any non-production NODE_ENV', function () {
        process.env.NODE_ENV = 'development';
        expect(isDevMode()).toBe(true);
    });

    test('is true when NODE_ENV is unset (dev default)', function () {
        delete process.env.NODE_ENV;
        expect(isDevMode()).toBe(true);
    });
});
