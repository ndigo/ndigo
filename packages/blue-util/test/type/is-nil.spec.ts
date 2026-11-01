/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import { isNil, isNotNil } from '@blue/util/types';

describe('isNil', function () {
    test('it should identify null and undefined', function () {
        expect(isNil(null)).toBe(true);
        expect(isNil(undefined)).toBe(true);
    });

    test('it should reject other falsy values', function () {
        expect(isNil(0)).toBe(false);
        expect(isNil('')).toBe(false);
        expect(isNil(false)).toBe(false);
        expect(isNil(Number.NaN)).toBe(false);
    });
});

describe('isNotNil', function () {
    test('it should reject null and undefined', function () {
        expect(isNotNil(null)).toBe(false);
        expect(isNotNil(undefined)).toBe(false);
    });

    test('it should accept other falsy values', function () {
        expect(isNotNil(0)).toBe(true);
        expect(isNotNil('')).toBe(true);
        expect(isNotNil(false)).toBe(true);
    });
});
