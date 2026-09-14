/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect } from 'vitest';
import { LRUCache } from '../src/_lru-cache';

describe('LRUCache', () => {
    it('stores and retrieves a value', () => {
        const cache = new LRUCache<string, number>();
        cache.set('key', 42);
        expect(cache.get('key')).toBe(42);
    });

    it('returns undefined for missing keys', () => {
        const cache = new LRUCache<string, number>();
        expect(cache.get('missing')).toBeUndefined();
    });

    it('defaults to capacity 256', () => {
        const cache = new LRUCache<string, number>();
        expect(cache.capacity).toBe(256);
    });

    it('respects custom capacity', () => {
        const cache = new LRUCache<string, number>(100);
        expect(cache.capacity).toBe(100);
    });

    it('evicts the least-recently-used entry when at capacity', () => {
        const cache = new LRUCache<string, number>(2);
        cache.set('a', 1);
        cache.set('b', 2);
        cache.set('c', 3);
        expect(cache.get('a')).toBeUndefined(); // Should be evicted
        expect(cache.get('b')).toBe(2); // Should still be present
        expect(cache.get('c')).toBe(3); // Should still be present
    });

    it('promotes a hit to most-recently-used, preventing its eviction', () => {
        const cache = new LRUCache<string, number>(2);
        cache.set('a', 1);
        cache.set('b', 2);
        cache.get('a'); // Access 'a' to promote it
        cache.set('c', 3); // This should evict 'b', not 'a'
        expect(cache.get('a')).toBe(1); // Should still be present
        expect(cache.get('b')).toBeUndefined(); // Should be evicted
        expect(cache.get('c')).toBe(3); // Should still be present
    });

    it('has() does not update recency', () => {
        const cache = new LRUCache<string, number>(2);
        cache.set('a', 1);
        cache.set('b', 2);
        // Order: a (LRU) → b (MRU). has('a') must NOT promote 'a'.
        cache.has('a');
        // set('c') should evict the LRU entry, which is still 'a' (has() didn't promote it)
        cache.set('c', 3);
        expect(cache.get('a')).toBeUndefined(); // evicted — was LRU; has() did not promote
        expect(cache.get('b')).toBe(2); // still present — was MRU
        expect(cache.get('c')).toBe(3); // just inserted
    });

    it('delete() removes an entry', () => {
        const cache = new LRUCache<string, number>();
        cache.set('key', 42);
        expect(cache.delete('key')).toBe(true);
        expect(cache.get('key')).toBeUndefined();
    });

    it('clear() empties the cache', () => {
        const cache = new LRUCache<string, number>();
        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.clear();
        expect(cache.size).toBe(0);
        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toBeUndefined();
    });

    it('size reflects current entry count', () => {
        const cache = new LRUCache<string, number>();
        expect(cache.size).toBe(0);
        cache.set('key1', 1);
        expect(cache.size).toBe(1);
        cache.set('key2', 2);
        expect(cache.size).toBe(2);
        cache.delete('key1');
        expect(cache.size).toBe(1);
        cache.clear();
        expect(cache.size).toBe(0);
    });

    it('set() on existing key promotes to MRU (no duplicate eviction)', () => {
        const cache = new LRUCache<string, number>(2);
        cache.set('a', 1);
        cache.set('b', 2);
        cache.set('a', 10); // Update 'a' value
        cache.set('c', 3); // This should evict 'b', not 'a'
        expect(cache.get('a')).toBe(10); // Should still be present
        expect(cache.get('b')).toBeUndefined(); // Should be evicted
        expect(cache.get('c')).toBe(3); // Should still be present
    });

    it('capacity getter returns the configured capacity', () => {
        const cache = new LRUCache<string, number>(50);
        expect(cache.capacity).toBe(50);
    });
});
