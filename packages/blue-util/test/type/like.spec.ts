/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import like, { LikeDescriptor } from '@blue/util/type/like';

describe('like', function () {
    const wxy: LikeDescriptor = { w: true, x: Number, y: Number };
    test('it should duck-type', function () {
        expect(like(wxy, { w: true, x: 123, y: 456 })).toBe(true);
        expect(like(wxy, { w: {}, x: 123, y: 456, z: 789 })).toBe(true);
        expect(like(wxy, { w: {}, x: 123, y: null })).toBe(true);
        expect(like(wxy, { w: 'abc', x: 123, y: '456' })).toBe(false);
        expect(like(wxy, { w: true, x: 123, z: 789 })).toBe(false);
        expect(like(wxy, null)).toBe(false);
        expect(like(wxy, void 0)).toBe(false);
    });

    test('it should curry', function () {
        const likeWXY = like(wxy);
        expect(likeWXY({ w: true, x: 123, y: 456 })).toBe(true);
        expect(likeWXY({ w: {}, x: 123, y: 456, z: 789 })).toBe(true);
        expect(likeWXY({ w: {}, x: 123, y: null })).toBe(true);
        expect(likeWXY({ w: 'abc', x: 123, y: '456' })).toBe(false);
        expect(likeWXY({ w: true, x: 123, z: 789 })).toBe(false);
        expect(likeWXY(null)).toBe(false);
        expect(likeWXY(void 0)).toBe(false);
    });
});
