import { describe, test, expect } from 'vitest';

import likePromise from '@blue/util/type/like-promise';

describe('likePromise', function () {
    test('it should identify thenables', function () {
        expect(likePromise(new Promise(() => void 0))).toBe(true);
        expect(likePromise({ then: () => void 0 })).toBe(true);
    });

    test('it should identify non-thenables', function () {
        expect(likePromise(void 0)).toBe(false);
        expect(likePromise(null)).toBe(false);
        expect(likePromise('')).toBe(false);
        expect(likePromise(1)).toBe(false);
        expect(likePromise(new Number(1))).toBe(false);
        expect(likePromise(Array.prototype)).toBe(false);
        expect(likePromise(Function.prototype)).toBe(false);
        expect(likePromise(() => {})).toBe(false);
        expect(likePromise({ method() {} }.method)).toBe(false);
    });
});
