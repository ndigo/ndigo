/**
 * Shared cache-name resolution contract (DA-9).
 * @module ndigo-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { ContextToken } from '@ndigo/factory';
import type { Cache } from '../src/cache';
import { resolveCacheName } from '../src/cache-name';

describe('resolveCacheName', () => {
    test('returns plain names unchanged', () => {
        expect(resolveCacheName('users', 'MemoryCacheManager')).toBe('users');
    });

    test('resolves typed store tokens (AD-34 D7) to their description', () => {
        const token = new ContextToken<Cache<unknown>>('reports');
        expect(resolveCacheName(token, 'RedisCacheManager')).toBe('reports');
    });

    test('rejects empty names and empty token descriptions with the caller context', () => {
        expect(() => resolveCacheName('', 'MemoryCacheManager')).toThrow(
            'MemoryCacheManager: cache name must be a non-empty string'
        );
        expect(() => resolveCacheName(new ContextToken<Cache<unknown>>(''), '@cached')).toThrow(
            '@cached: cache name must be a non-empty string'
        );
    });
});
