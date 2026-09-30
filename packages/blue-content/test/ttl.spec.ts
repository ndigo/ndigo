/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { TtlContentSource } from '../src/ttl';

describe('TtlContentSource', () => {
    test('loads and caches content', async () => {
        const loader = vi.fn().mockResolvedValue('Hello');
        const source = new TtlContentSource(loader);

        const result = await source.getContent('welcome', 'en');
        expect(result).toBe('Hello');
        expect(loader).toHaveBeenCalledTimes(1);

        // Second call uses the cache.
        const cached = await source.getContent('welcome', 'en');
        expect(cached).toBe('Hello');
        expect(loader).toHaveBeenCalledTimes(1);
    });

    test('caches per key+language pair', async () => {
        const loader = vi.fn().mockResolvedValue('Bonjour');
        const source = new TtlContentSource(loader);

        expect(await source.getContent('welcome', 'fr')).toBe('Bonjour');
        expect(await source.getContent('welcome', 'en')).toBe('Bonjour');
        expect(loader).toHaveBeenCalledTimes(2);
    });

    test('invalidate clears all cache entries', async () => {
        const loader = vi.fn().mockResolvedValue('Hello');
        const source = new TtlContentSource(loader);

        await source.getContent('welcome', 'en');
        source.invalidate();

        expect(await source.getContent('welcome', 'en')).toBe('Hello');
        expect(loader).toHaveBeenCalledTimes(2);
    });

    test('invalidateEntry removes a single cache entry', async () => {
        const loader = vi.fn().mockResolvedValue('Hello');
        const source = new TtlContentSource(loader);

        await source.getContent('welcome', 'en');
        await source.getContent('goodbye', 'en');

        source.invalidateEntry('welcome', 'en');

        expect(loader).toHaveBeenCalledTimes(2);
        expect(await source.getContent('welcome', 'en')).toBe('Hello');
        expect(await source.getContent('goodbye', 'en')).toBe('Hello');
        expect(loader).toHaveBeenCalledTimes(3);
    });

    test('reloads after TTL expires', async () => {
        vi.useFakeTimers();
        const loader = vi.fn().mockResolvedValue('Hello');
        const source = new TtlContentSource(loader, 1000);

        await source.getContent('welcome', 'en');
        expect(loader).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1001);

        // Cache is now stale — the loader runs again.
        expect(await source.getContent('welcome', 'en')).toBe('Hello');
        expect(loader).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });
});
