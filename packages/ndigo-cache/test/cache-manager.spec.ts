/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { CacheMiss } from '../src/cache';
import { MemoryCacheManager } from '../src/cache-manager';

describe('MemoryCacheManager', () => {
    test('auto-creates named caches and returns the same instance per name', () => {
        const manager = new MemoryCacheManager();
        expect(manager.hasCache('users')).toBe(false);
        const users = manager.getCache<string>('users');
        expect(manager.hasCache('users')).toBe(true);
        expect(manager.getCache('users')).toBe(users);
    });

    test('applies manager defaults to auto-created caches', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            const manager = new MemoryCacheManager({ defaults: { defaultTtl: 5_000 } });
            const cache = manager.getCache<string>('ttl');
            await cache.set('k', 'v');
            expect(await cache.get('k')).toBe('v');
            vi.advanceTimersByTime(5_001);
            expect(await cache.get('k')).toBe(CacheMiss.INSTANCE);
        } finally {
            vi.useRealTimers();
        }
    });

    test('rejects non-string or empty cache names', () => {
        const manager = new MemoryCacheManager();
        expect(() => manager.getCache('')).toThrow(TypeError);
        // hasCache shares the same resolution/validation (DA-9).
        expect(() => manager.hasCache('')).toThrow(TypeError);
    });
});
