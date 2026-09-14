/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import isFunction from '@blue/util/type/is-function';

describe('isFunction', function () {
    test('it should identify functions', function () {
        expect(isFunction(function () {})).toBe(true);
        expect(isFunction(() => {})).toBe(true);
        expect(isFunction(async function () {})).toBe(true);
        expect(isFunction(async () => {})).toBe(true);
        expect(isFunction(function* () {})).toBe(true);
        expect(isFunction(class A {})).toBe(true);
        expect(isFunction(new Function())).toBe(true);
        expect(isFunction(Array)).toBe(true);
        expect(isFunction(Object)).toBe(true);
        expect(isFunction(Function)).toBe(true);
        expect(isFunction({ method() {} }.method)).toBe(true);
    });

    test('it should identify non-functions', function () {
        expect(isFunction(undefined)).toBe(false);
        expect(isFunction(null)).toBe(false);
        expect(isFunction('')).toBe(false);
        expect(isFunction(1)).toBe(false);
        expect(isFunction(new Number(1))).toBe(false);
        expect(isFunction(true)).toBe(false);
        expect(isFunction({})).toBe(false);
        expect(isFunction([])).toBe(false);
        expect(isFunction(/abc/)).toBe(false);
    });
});
