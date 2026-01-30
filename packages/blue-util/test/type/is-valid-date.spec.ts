import { describe, test, expect } from 'vitest';

import isValidDate from '@blue/util/type/is-valid-date';

describe('isValidDate', function () {
    test('it should identify valid Date objects', function () {
        expect(isValidDate(new Date())).toBe(true);
        expect(isValidDate(new Date('2024-01-01'))).toBe(true);
        expect(isValidDate(new Date(2024, 0, 31))).toBe(true);
    });

    test('it should identify valid timestamps', function () {
        expect(isValidDate(1393804800000)).toBe(true);
        expect(isValidDate(0)).toBe(true);
        expect(isValidDate(Date.now())).toBe(true);
    });

    test('it should identify invalid dates', function () {
        expect(isValidDate(new Date(''))).toBe(false);
        expect(isValidDate(new Date('invalid'))).toBe(false);
        expect(isValidDate(new Date(NaN))).toBe(false);
    });

    test('it should identify non-dates', function () {
        expect(isValidDate(undefined)).toBe(false);
        expect(isValidDate(null)).toBe(false);
        expect(isValidDate('2024-01-01')).toBe(false);
        expect(isValidDate(true)).toBe(false);
        expect(isValidDate({})).toBe(false);
    });
});
