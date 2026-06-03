import { bench, describe } from 'vitest';
import { LRUCache } from '../src/_lru-cache';

describe('LRUCache — throughput', () => {
    bench('set/get hot path (all hits)', () => {
        const cache = new LRUCache<string, number>(64);
        // Warm with 32 entries
        for (let i = 0; i < 32; i++) cache.set(`key${i}`, i);
        // Hot loop: all hits
        let acc = 0;
        for (let i = 0; i < 10_000; i++) {
            acc += cache.get(`key${i % 32}`) ?? 0;
        }
        if (acc < 0) throw new Error();
    });

    bench('set/get with eviction (capacity pressure)', () => {
        const cache = new LRUCache<string, number>(32);
        let acc = 0;
        for (let i = 0; i < 10_000; i++) {
            cache.set(`key${i}`, i);
            acc += cache.get(`key${i}`) ?? 0;
        }
        if (acc < 0) throw new Error();
    });
});