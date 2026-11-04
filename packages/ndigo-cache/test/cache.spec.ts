/**
 * @module ndigo-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { CacheMiss, MemoryCache } from '../src/cache';

describe('MemoryCache', () => {
    test('stores and retrieves values', async () => {
        const cache = new MemoryCache<string>();
        await cache.set('k', 'v');
        expect(await cache.get('k')).toBe('v');
        expect(await cache.size()).toBe(1);
    });

    test('returns the miss sentinel for absent keys', async () => {
        const cache = new MemoryCache();
        expect(await cache.get('missing')).toBe(CacheMiss.INSTANCE);
        expect(await cache.has('missing')).toBe(false);
    });

    test('distinguishes a stored undefined from a miss', async () => {
        const cache = new MemoryCache<undefined>();
        await cache.set('k', undefined);
        expect(await cache.get('k')).toBeUndefined();
        expect(await cache.get('k')).not.toBe(CacheMiss.INSTANCE);
        expect(await cache.has('k')).toBe(true);
    });

    test('expires entries after their TTL and removes them on access', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            const cache = new MemoryCache<string>();
            await cache.set('k', 'v', 10_000);
            expect(await cache.get('k')).toBe('v');
            vi.advanceTimersByTime(10_001);
            expect(await cache.get('k')).toBe(CacheMiss.INSTANCE);
            expect(await cache.has('k')).toBe(false);
            expect(await cache.size()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    test('applies defaultTtl and lets a per-set ttl override it', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            const cache = new MemoryCache<string>({ defaultTtl: 5_000 });
            await cache.set('a', '1');
            await cache.set('b', '2', 20_000);
            vi.advanceTimersByTime(5_001);
            expect(await cache.get('a')).toBe(CacheMiss.INSTANCE);
            expect(await cache.get('b')).toBe('2');
        } finally {
            vi.useRealTimers();
        }
    });

    test('lru eviction evicts the least-recently-used entry on capacity', async () => {
        const cache = new MemoryCache<string>({ maxSize: 2 });
        await cache.set('a', '1');
        await cache.set('b', '2');
        await cache.get('a'); // promote a to MRU
        await cache.set('c', '3'); // evicts b
        expect(await cache.has('a')).toBe(true);
        expect(await cache.has('b')).toBe(false);
        expect(await cache.has('c')).toBe(true);
    });

    test('lru update promotes the entry (set on an existing key)', async () => {
        const cache = new MemoryCache<string>({ maxSize: 2 });
        await cache.set('a', '1');
        await cache.set('b', '2');
        await cache.set('a', '10'); // update a → MRU
        await cache.set('c', '3'); // evicts b
        expect(await cache.get('a')).toBe('10');
        expect(await cache.has('b')).toBe(false);
    });

    test('fifo eviction ignores access and update order (oldest insertion goes first)', async () => {
        const cache = new MemoryCache<string>({ maxSize: 2, eviction: 'fifo' });
        await cache.set('a', '1');
        await cache.set('b', '2');
        await cache.get('a'); // no promotion
        await cache.set('a', '10'); // update keeps the insertion position
        await cache.set('c', '3'); // evicts the oldest inserted: a
        expect(await cache.has('a')).toBe(false);
        expect(await cache.has('b')).toBe(true);
        expect(await cache.has('c')).toBe(true);
    });

    test('imposes no size eviction when maxSize is omitted', async () => {
        const cache = new MemoryCache<string>();
        await Promise.all(Array.from({ length: 10_000 }, (_, i) => cache.set(`k${i}`, String(i))));
        expect(await cache.size()).toBe(10_000);
        expect(await cache.get('k0')).toBe('0');
    });

    test('delete removes entries and clear empties the store', async () => {
        const cache = new MemoryCache<string>();
        await cache.set('a', '1');
        expect(await cache.delete('a')).toBe(true);
        expect(await cache.delete('a')).toBe(false);
        await cache.set('b', '2');
        await cache.clear();
        expect(await cache.size()).toBe(0);
        expect(await cache.get('b')).toBe(CacheMiss.INSTANCE);
    });

    test('rejects caching the CacheMiss sentinel as a value', async () => {
        const cache = new MemoryCache();
        await expect(cache.set('k', CacheMiss.INSTANCE)).rejects.toThrow(TypeError);
    });

    test('validates constructor options and per-set ttl arguments', async () => {
        expect(() => new MemoryCache({ maxSize: -1 })).toThrow(TypeError);
        expect(() => new MemoryCache({ maxSize: 1.5 })).toThrow(TypeError);
        expect(() => new MemoryCache({ defaultTtl: -1 })).toThrow(TypeError);
        expect(() => new MemoryCache({ defaultTtl: Number.NaN })).toThrow(TypeError);
        expect(() => new MemoryCache({ eviction: 'lfu' as never })).toThrow(TypeError);
        const cache = new MemoryCache();
        await expect(cache.set('k', 'v', -1)).rejects.toThrow(TypeError);
        await expect(cache.set('k', 'v', Number.NaN)).rejects.toThrow(TypeError);
    });
});
