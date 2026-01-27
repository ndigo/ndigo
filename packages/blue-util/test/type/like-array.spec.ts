import { describe, test, expect } from 'vitest';

import likeArray from '@blue/util/type/like-array';

describe('isArrayLike', function () {
    test('it should identify array-likes', function () {
        expect(likeArray([])).toBe(true);
        expect(likeArray('')).toBe(true);
        expect(likeArray({ nodeType: 1, length: 1 })).toBe(true);
        expect(likeArray({ length: 0 })).toBe(true);
        expect(likeArray({ 0: 'zero', 9: 'nine', length: 10 })).toBe(true);
    });

    test('it should identify non-constructors', function () {
        expect(likeArray(undefined)).toBe(false);
        expect(likeArray(null)).toBe(false);
        expect(likeArray(1)).toBe(false);
        expect(likeArray({})).toBe(false);
        expect(likeArray({ nodeType: 1, length: 0 })).toBe(false);
        expect(likeArray({ length: 10 })).toBe(false);
    });
});
