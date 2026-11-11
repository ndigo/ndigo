import { describe, it, expect } from 'vitest';
import { BloomFilter } from '../src/bloom-filter';

describe('BloomFilter', () => {
    it('has no false negatives', () => {
        const bf = BloomFilter.withTargetError(1000, 0.01);
        for (let i = 0; i < 1000; i++) bf.add(`k${i}`);
        for (let i = 0; i < 1000; i++) expect(bf.has(`k${i}`)).toBe(true);
    });

    it('serializes round-trip', () => {
        const bf = new BloomFilter(1024, 4);
        bf.add('a').add('b');
        const loaded = BloomFilter.fromJSON(bf.toJSON());
        expect(loaded.has('a')).toBe(true);
        expect(loaded.has('b')).toBe(true);
    });
});