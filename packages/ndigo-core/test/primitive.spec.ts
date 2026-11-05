/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { isPrimitive, isNotPrimitive } from '../src/primitive';

const primitives = [123, 'abc', true, Symbol.iterator, null, 456n, void 0];
const nonPrimitives = [function () {}, {}, new Number(123), new String('abc'), new Boolean(true)];

describe('isPrimitive', () => {
    test('it should recognize primitive values', () => {
        primitives.forEach((value) => expect(isPrimitive(value)).toBe(true));
    });
    test('it should recognize non-primitive values', () => {
        nonPrimitives.forEach((value) => expect(isPrimitive(value)).toBe(false));
    });
});

describe('isNotPrimitive', () => {
    test('it should recognize primitive values', () => {
        primitives.forEach((value) => expect(isNotPrimitive(value)).toBe(false));
    });
    test('it should recognize non-primitive values', () => {
        nonPrimitives.forEach((value) => expect(isNotPrimitive(value)).toBe(true));
    });
});
