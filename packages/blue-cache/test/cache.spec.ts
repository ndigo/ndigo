/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { CacheMiss, MemoryCache } from '../src/cache';

describe('CacheMiss', () => {
    test('is an identity singleton distinguishable from undefined', () => {
        expect(CacheMiss.INSTANCE).toBe(CacheMiss.INSTANCE);
        expect(CacheMiss.INSTANCE).not.toBeUndefined();
    });
});

describe('MemoryCache', () => {
    test('stores and retrieves values', () => {
        const cache = new MemoryCache<string>();
        cache.set('k', 'v');
        expect(cache.get('k')).toBe('v');
        expect(cache.size).toBe(1);
    });

    test('returns the miss sentinel for absent keys', () => {
        const cache = new MemoryCache();
        expect(cache.get('missing')).toBe(CacheMiss.INSTANCE);
        expect(cache.has('missing')).toBe(false);
    });

    test('distinguishes a stored undefined from a miss', () => {
        const cache = new MemoryCache<undefined>();
        cache.set('k', undefined);
        expect(cache.get('k')).toBeUndefined();
        expect(cache.get('k')).not.toBe(CacheMiss.INSTANCE);
        expect(cache.has('k')).toBe(true);
    });

    test('expires entries after their TTL and removes them on access', () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            const cache = new MemoryCache<string>();
            cache.set('k', 'v', 10_000);
            expect(cache.get('k')).toBe('v');
            vi.advanceTimersByTime(10_001);
            expect(cache.get('k')).toBe(CacheMiss.INSTANCE);
            expect(cache.has('k')).toBe(false);
            expect(cache.size).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    test('applies defaultTtl and lets a per-set ttl override it', () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            const cache = new MemoryCache<string>({ defaultTtl: 5_000 });
            cache.set('a', '1');
            cache.set('b', '2', 20_000);
            vi.advanceTimersByTime(5_001);
            expect(cache.get('a')).toBe(CacheMiss.INSTANCE);
            expect(cache.get('b')).toBe('2');
        } finally {
            vi.useRealTimers();
        }
    });

    test('lru eviction evicts the least-recently-used entry on capacity', () => {
        const cache = new MemoryCache<string>({ maxSize: 2 });
        cache.set('a', '1');
        cache.set('b', '2');
        cache.get('a'); // promote a to MRU
        cache.set('c', '3'); // evicts b
        expect(cache.has('a')).toBe(true);
        expect(cache.has('b')).toBe(false);
        expect(cache.has('c')).toBe(true);
    });

    test('lru update promotes the entry (set on an existing key)', () => {
        const cache = new MemoryCache<string>({ maxSize: 2 });
        cache.set('a', '1');
        cache.set('b', '2');
        cache.set('a', '10'); // update a → MRU
        cache.set('c', '3'); // evicts b
        expect(cache.get('a')).toBe('10');
        expect(cache.has('b')).toBe(false);
    });

    test('fifo eviction ignores access and update order (oldest insertion goes first)', () => {
        const cache = new MemoryCache<string>({ maxSize: 2, eviction: 'fifo' });
        cache.set('a', '1');
        cache.set('b', '2');
        cache.get('a'); // no promotion
        cache.set('a', '10'); // update keeps the insertion position
        cache.set('c', '3'); // evicts the oldest inserted: a
        expect(cache.has('a')).toBe(false);
        expect(cache.has('b')).toBe(true);
        expect(cache.has('c')).toBe(true);
    });

    test('imposes no size eviction when maxSize is omitted', () => {
        const cache = new MemoryCache<string>();
        for (let i = 0; i < 10_000; i += 1) {
            cache.set(`k${i}`, String(i));
        }
        expect(cache.size).toBe(10_000);
        expect(cache.get('k0')).toBe('0');
    });

    test('delete removes entries and clear empties the store', () => {
        const cache = new MemoryCache<string>();
        cache.set('a', '1');
        expect(cache.delete('a')).toBe(true);
        expect(cache.delete('a')).toBe(false);
        cache.set('b', '2');
        cache.clear();
        expect(cache.size).toBe(0);
        expect(cache.get('b')).toBe(CacheMiss.INSTANCE);
    });

    test('rejects caching the CacheMiss sentinel as a value', () => {
        const cache = new MemoryCache();
        expect(() => cache.set('k', CacheMiss.INSTANCE)).toThrow(TypeError);
    });

    test('validates constructor options and per-set ttl arguments', () => {
        expect(() => new MemoryCache({ maxSize: -1 })).toThrow(TypeError);
        expect(() => new MemoryCache({ maxSize: 1.5 })).toThrow(TypeError);
        expect(() => new MemoryCache({ defaultTtl: -1 })).toThrow(TypeError);
        expect(() => new MemoryCache({ defaultTtl: Number.NaN })).toThrow(TypeError);
        expect(() => new MemoryCache({ eviction: 'lfu' as never })).toThrow(TypeError);
        const cache = new MemoryCache();
        expect(() => cache.set('k', 'v', -1)).toThrow(TypeError);
        expect(() => cache.set('k', 'v', Number.NaN)).toThrow(TypeError);
    });
});
