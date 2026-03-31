import { describe, test, expect, beforeEach, vi } from 'vitest';

vi.mock('@blue/util/relation', async () => {
    const actual = await vi.importActual<typeof import('@blue/util/relation')>('@blue/util/relation');

    return {
        ...actual,
        equals: vi.fn(actual.equals),
    };
});

import { equates, likeEquatable } from '../src/equatable';
import { equals } from '@blue/util/relation';

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
    const equalsMock = vi.mocked(equals);

    beforeEach(() => {
        equalsMock.mockClear();
    });

    test('it should compare two Equatable objects using equals method', () => {
        const value1 = {
            equals: vi.fn(() => true),
        };
        const value2 = {
            equals: vi.fn(() => false),
        };

        expect(equates(value1, value2)).toBe(true);
        expect(value1.equals).toHaveBeenCalledWith(value2);
        expect(equalsMock).not.toHaveBeenCalled();
    });

    test('it should return true for equal primitives', () => {
        expect(equates(42, 42)).toBe(true);
        expect(equates('a', 'a')).toBe(true);
        expect(equalsMock).not.toHaveBeenCalled();
    });

    test('it should return false for unequal primitives', () => {
        expect(equates(42, 43)).toBe(false);
        expect(equalsMock).not.toHaveBeenCalled();
    });

    test('it should compare null values', () => {
        expect(equates(null, null)).toBe(true);
        expect(equalsMock).not.toHaveBeenCalled();
    });

    test('it should fall through to deep equality for mixed types', () => {
        const value1 = {
            equals: vi.fn(() => false),
        };
        const value2 = { a: 1 } as unknown as object;

        equalsMock.mockReturnValueOnce(true);

        expect(equates(value1, value2 as any)).toBe(true);
        expect(value1.equals).not.toHaveBeenCalled();
        expect(equalsMock).toHaveBeenCalledWith(value1, value2);
    });

    test('it should handle deep equality for non-Equatable non-primitive objects', () => {
        const value1 = { a: 1 } as unknown as object;
        const value2 = { a: 1 } as unknown as object;

        expect(equates(value1 as any, value2 as any)).toBe(true);
        expect(equalsMock).toHaveBeenCalledWith(value1, value2);
    });
});
