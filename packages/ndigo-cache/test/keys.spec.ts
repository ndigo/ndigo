/**
 * @module ndigo-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { serializeCacheKey, serializeCacheKeyStrict } from '../src/keys';

describe('serializeCacheKey', () => {
    test('serializes the argument array as JSON', () => {
        expect(serializeCacheKey(1, 'a', true)).toBe('[1,"a",true]');
    });

    test('known collision: undefined and null collapse (documented)', () => {
        // M1 — distinct calls that JSON merges into one key.
        expect(serializeCacheKey(undefined)).toBe('[null]');
        expect(serializeCacheKey(undefined)).toBe(serializeCacheKey(null));
    });

    test('known collision: object key insertion order is significant', () => {
        expect(serializeCacheKey({ a: 1, b: 2 })).not.toBe(serializeCacheKey({ b: 2, a: 1 }));
    });
});

describe('serializeCacheKeyStrict', () => {
    test('distinguishes undefined from null (M1)', () => {
        expect(serializeCacheKeyStrict(undefined)).not.toBe(serializeCacheKeyStrict(null));
        expect(serializeCacheKeyStrict(undefined)).toBe('["undef"]');
        expect(serializeCacheKeyStrict(null)).toBe('["null"]');
    });

    test('distinguishes primitive types that JSON would otherwise merge', () => {
        expect(serializeCacheKeyStrict(1)).not.toBe(serializeCacheKeyStrict('1'));
        expect(serializeCacheKeyStrict(1)).not.toBe(serializeCacheKeyStrict(true));
    });

    test('objects fall back to JSON, tagged as such; stable across calls', () => {
        const key = serializeCacheKeyStrict({ a: 1 });
        // The object is tagged 'o:' then that tag string is itself encoded as an
        // array element (so inner quotes are escaped) — assert structure, not the
        // exact escaping. Differs from the default serializer's bare-object form.
        expect(key.startsWith('["o:')).toBe(true);
        expect(serializeCacheKeyStrict({ a: 1 })).toBe(key);
        expect(key).not.toBe(serializeCacheKey({ a: 1 }));
    });

    test('circular structures throw, matching serializeCacheKey', () => {
        const circular: unknown[] = [];
        (circular as unknown[]).push(circular);
        expect(() => serializeCacheKeyStrict(circular)).toThrow();
        expect(() => serializeCacheKey(circular)).toThrow();
    });
});
