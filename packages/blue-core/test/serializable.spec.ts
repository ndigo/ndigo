/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { isJSONArray, isJSONObject, isJSONValue, serialize } from '../src/serializable';

describe('isJSONValue', () => {
    test('it should recognize JSON values', () => {
        const values = [123, 'abc', true, { def: 456 }];
        values.forEach((value) => expect(isJSONValue(value)).toBe(true));
    });

    test('it should recognize non-JSON values', () => {
        const values = [function () {}, { abc: function () {} }];
        values.forEach((value) => expect(isJSONValue(value)).toBe(false));
    });

    test('it should return false for cyclic and BigInt-bearing values (KRN-REV-SERIAL-16)', () => {
        const cycle: { self?: unknown } = {};
        cycle.self = cycle;
        expect(isJSONValue(cycle)).toBe(false);
        expect(isJSONValue({ count: 1n })).toBe(false);
        expect(isJSONValue([1n])).toBe(false);
    });
});

describe('isJSONObject / isJSONArray (KRN-REV-SERIAL-16)', () => {
    test('isJSONObject rejects cycles and BigInt instead of throwing', () => {
        const cycle: { self?: unknown } = {};
        cycle.self = cycle;
        expect(isJSONObject(cycle)).toBe(false);
        expect(isJSONObject({ count: 1n })).toBe(false);
        expect(isJSONObject({ ok: 1 })).toBe(true);
    });

    test('isJSONArray rejects BigInt elements instead of throwing', () => {
        expect(isJSONArray([1n])).toBe(false);
        expect(isJSONArray([1, 2])).toBe(true);
    });
});

describe('serialize (KRN-REV-SERIAL-16)', () => {
    test('recurses non-JSON arrays instead of stringifying them', () => {
        const result = serialize([1, () => {}]);
        expect(Array.isArray(result)).toBe(true);
        expect(Array.isArray(result) ? result[0] : null).toBe(1);
    });

    test('does not throw a raw TypeError on cyclic input', () => {
        const cycle: Record<string, unknown> = {};
        cycle.self = cycle;
        expect(() => serialize(cycle)).not.toThrow();
    });
});
