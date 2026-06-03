import { describe, test, expect, beforeEach } from 'vitest';

import { equates, likeEquatable } from '../src/equatable';

describe('likeEquatable', () => {
    test('it should return true for objects with an equals method', () => {
        expect(likeEquatable({ equals: () => true })).toBe(true);
    });

    test('it should return false for objects without equals', () => {
        expect(likeEquatable({})).toBe(false);
    });

    test('it should return false for primitives', () => {
        expect(likeEquatable('hello')).toBe(false);
        expect(likeEquatable(42)).toBe(false);
    });

    test('it should return false for null and undefined', () => {
        expect(likeEquatable(null)).toBe(false);
        expect(likeEquatable(undefined)).toBe(false);
    });
});

describe('equates', () => {
    test('it should compare two Equatable objects using equals method', () => {
        const value1 = {
            equals: vi.fn(() => true),
        };
        const value2 = {
            equals: vi.fn(() => false),
        };

        expect(equates(value1, value2)).toBe(true);
        expect(value1.equals).toHaveBeenCalledWith(value2);
    });

    test('it should return true for equal primitives', () => {
        expect(equates(42, 42)).toBe(true);
        expect(equates('a', 'a')).toBe(true);
    });

    test('it should return false for unequal primitives', () => {
        expect(equates(42, 43)).toBe(false);
    });

    test('it should compare null values', () => {
        expect(equates(null, null)).toBe(true);
    });

    test('it should fall through to deep equality for mixed types', () => {
        const value1 = {
            equals: vi.fn(() => false),
        };
        const value2 = { a: 1 } as unknown as object;

        // value1 is Equatable but value2 is not — falls through to native _deepEqual.
        // { equals: fn } vs { a: 1 } are structurally different, so result is false.
        expect(equates(value1, value2 as any)).toBe(false);
        expect(value1.equals).not.toHaveBeenCalled();
    });

    test('it should handle deep equality for non-Equatable non-primitive objects', () => {
        const value1 = { a: 1 } as unknown as object;
        const value2 = { a: 1 } as unknown as object;

        // Both are plain objects — native _deepEqual compares them structurally.
        expect(equates(value1 as any, value2 as any)).toBe(true);
    });
});
