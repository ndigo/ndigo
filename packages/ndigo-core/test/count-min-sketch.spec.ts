import { describe, it, expect } from 'vitest';
import { CountMinSketch } from '../src/count-min-sketch';

describe('CountMinSketch', () => {
    it('estimates counts (no undercount)', () => {
        const cms = new CountMinSketch(5, 1024);
        cms.add('a', 3).add('b', 7);
        expect(cms.estimate('a')).toBeGreaterThanOrEqual(3);
        expect(cms.estimate('b')).toBeGreaterThanOrEqual(7);
    });

    it('serializes round-trip', () => {
        const cms = new CountMinSketch(3, 64);
        cms.add('x', 5).add('y', 2);
        const loaded = CountMinSketch.fromJSON(cms.toJSON());
        expect(loaded.depth).toBe(3);
        expect(loaded.width).toBe(64);
        expect(loaded.total).toBe(7);
        expect(loaded.estimate('x')).toBeGreaterThanOrEqual(5);
        expect(loaded.estimate('y')).toBeGreaterThanOrEqual(2);
    });
});
