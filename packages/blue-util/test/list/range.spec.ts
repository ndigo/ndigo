import { describe, test, expect } from 'vitest';

import range from '@blue/util/list/range';

describe('range', function () {
    test('it should return empty array for single argument', function () {
        expect(range(1)).toEqual([]);
    });

    test('it should return empty array when from equals to', function () {
        expect(range(1, 1)).toEqual([]);
    });

    test('it should return range of numbers', function () {
        expect(range(1, 5)).toEqual([1, 2, 3, 4]);
        expect(range(50, 53)).toEqual([50, 51, 52]);
    });

    test('it should handle decimals', function () {
        expect(range(1, 1.1)).toEqual([1]);
    });

    test('it should work with negative numbers', function () {
        expect(range(-3, 0)).toEqual([-3, -2, -1]);
    });
});
