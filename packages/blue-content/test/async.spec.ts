/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { TtlContentSource } from '../src/async';

describe('TtlContentSource', () => {
    test('returns the key as fallback before any async load', () => {
        const loader = vi.fn().mockResolvedValue('Hello');
        const source = new TtlContentSource(loader);

        expect(source.getContent('welcome', 'en')).toBe('welcome');
    });

    test('getContentAsync loads and caches content', async () => {
        const loader = vi.fn().mockResolvedValue('Hello');
        const source = new TtlContentSource(loader);

        const result = await source.getContentAsync('welcome', 'en');
        expect(result).toBe('Hello');
        expect(loader).toHaveBeenCalledTimes(1);

        // Second call uses cache
        const cached = await source.getContentAsync('welcome', 'en');
        expect(cached).toBe('Hello');
        expect(loader).toHaveBeenCalledTimes(1);
    });

    test('getContent returns cached value after async load', async () => {
        const loader = vi.fn().mockResolvedValue('Bonjour');
        const source = new TtlContentSource(loader);

        await source.getContentAsync('welcome', 'fr');
        expect(source.getContent('welcome', 'fr')).toBe('Bonjour');
    });

    test('invalidate clears all cache entries', async () => {
        const loader = vi.fn().mockResolvedValue('Hello');
        const source = new TtlContentSource(loader);

        await source.getContentAsync('welcome', 'en');
        source.invalidate();

        expect(source.getContent('welcome', 'en')).toBe('welcome');
    });

    test('invalidateEntry removes a single cache entry', async () => {
        const loader = vi.fn().mockResolvedValue('Hello');
        const source = new TtlContentSource(loader);

        await source.getContentAsync('welcome', 'en');
        await source.getContentAsync('goodbye', 'en');

        source.invalidateEntry('welcome', 'en');

        expect(source.getContent('welcome', 'en')).toBe('welcome');
        expect(source.getContent('goodbye', 'en')).toBe('Hello');
    });

    test('reloads after TTL expires', async () => {
        vi.useFakeTimers();
        const loader = vi.fn().mockResolvedValue('Hello');
        const source = new TtlContentSource(loader, 1000);

        await source.getContentAsync('welcome', 'en');
        expect(loader).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1001);

        // Cache is now stale — sync get returns key
        expect(source.getContent('welcome', 'en')).toBe('welcome');

        // Async get re-fetches
        await source.getContentAsync('welcome', 'en');
        expect(loader).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });
});
