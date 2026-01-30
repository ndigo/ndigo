import { describe, test, expect } from 'vitest';

import isNumber from '@blue/util/type/is-number';

describe('isNumber', function () {
    test('it should identify finite numbers', function () {
        expect(isNumber(0)).toBe(true);
        expect(isNumber(1)).toBe(true);
        expect(isNumber(-1)).toBe(true);
        expect(isNumber(3.14)).toBe(true);
        expect(isNumber(1e10)).toBe(true);
        expect(isNumber(new Number(42))).toBe(true);
        expect(isNumber(new Number(0))).toBe(true);
    });

    test('it should identify NaN as non-number', function () {
        expect(isNumber(NaN)).toBe(false);
        expect(isNumber(0 / 0)).toBe(false);
        expect(isNumber(Number.NaN)).toBe(false);
    });

    test('it should identify Infinity as non-number', function () {
        expect(isNumber(Infinity)).toBe(false);
        expect(isNumber(-Infinity)).toBe(false);
        expect(isNumber(1 / 0)).toBe(false);
        expect(isNumber(Number.POSITIVE_INFINITY)).toBe(false);
        expect(isNumber(Number.NEGATIVE_INFINITY)).toBe(false);
    });

    test('it should identify non-numbers', function () {
        expect(isNumber(undefined)).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber('42')).toBe(false);
        expect(isNumber('')).toBe(false);
        expect(isNumber(true)).toBe(false);
        expect(isNumber({})).toBe(false);
        expect(isNumber([])).toBe(false);
    });
});
