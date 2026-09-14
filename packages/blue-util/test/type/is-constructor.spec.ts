/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import isConstructor from '@blue/util/type/is-constructor';

describe('isConstructor', function () {
    test('it should identify constructors', function () {
        expect(isConstructor(function () {})).toBe(true);
        expect(isConstructor(class A {})).toBe(true);
        expect(isConstructor(Array)).toBe(true);
        expect(isConstructor(Function)).toBe(true);
        expect(isConstructor(new Function())).toBe(true);
    });

    test('it should identify non-constructors', function () {
        expect(isConstructor(undefined)).toBe(false);
        expect(isConstructor(null)).toBe(false);
        expect(isConstructor('')).toBe(false);
        expect(isConstructor(1)).toBe(false);
        expect(isConstructor(new Number(1))).toBe(false);
        expect(isConstructor(Array.prototype)).toBe(false);
        expect(isConstructor(Function.prototype)).toBe(false);
        expect(isConstructor(() => {})).toBe(false);
        expect(isConstructor({ method() {} }.method)).toBe(false);
    });
});
