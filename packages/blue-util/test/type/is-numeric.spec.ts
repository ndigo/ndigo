import { describe, test, expect } from 'vitest';

import isNumeric from '@blue/util/type/is-numeric';

describe('isNumeric', function () {
    test('it should identify numbers as numeric', function () {
        expect(isNumeric(42)).toBe(true);
        expect(isNumeric(0)).toBe(true);
        expect(isNumeric(-1.5)).toBe(true);
        expect(isNumeric(new Number(10))).toBe(true);
    });

    test('it should identify numeric strings', function () {
        expect(isNumeric('42')).toBe(true);
        expect(isNumeric('0')).toBe(true);
        expect(isNumeric('-1.5')).toBe(true);
        expect(isNumeric('1e10')).toBe(true);
        expect(isNumeric('  42  ')).toBe(true);
    });

    test('it should identify non-numeric strings', function () {
        expect(isNumeric('abc')).toBe(false);
        expect(isNumeric('')).toBe(false);
        expect(isNumeric('   ')).toBe(false);
        expect(isNumeric('12px')).toBe(false);
        expect(isNumeric('NaN')).toBe(false);
        expect(isNumeric('Infinity')).toBe(false);
    });

    test('it should identify non-numeric values', function () {
        expect(isNumeric(NaN)).toBe(false);
        expect(isNumeric(Infinity)).toBe(false);
        expect(isNumeric(undefined)).toBe(false);
        expect(isNumeric(null)).toBe(false);
        expect(isNumeric(true)).toBe(false);
        expect(isNumeric({})).toBe(false);
        expect(isNumeric([])).toBe(false);
    });
});
