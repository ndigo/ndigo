import { describe, test, expect } from 'vitest';

import fromRepeatedPairs from '@blue/util/list/from-repeated-pairs';

describe('fromRepeatedPairs', function () {
    test('combines an array of two-element arrays into an object', function () {
        expect(
            fromRepeatedPairs([
                ['a', 1],
                ['b', 2],
                ['c', 3],
            ])
        ).toEqual({ a: 1, b: 2, c: 3 });
    });

    test('combines repeated entries into a list', function () {
        expect(
            fromRepeatedPairs([
                ['x', 1],
                ['x', 2],
                ['x', 3],
            ])
        ).toEqual({ x: [1, 2, 3] });
    });

    test('handles null values', function () {
        expect(
            fromRepeatedPairs([
                ['x', null],
                ['x', null],
            ])
        ).toEqual({ x: [null, null] });
    });
});
