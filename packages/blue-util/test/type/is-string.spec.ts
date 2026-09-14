/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import isString from '@blue/util/type/is-string';

describe('isString', function () {
    test('it should identify strings', function () {
        expect(isString('hello')).toBe(true);
        expect(isString('')).toBe(true);
        expect(isString(`template`)).toBe(true);
        expect(isString(new String('hello'))).toBe(true);
    });

    test('it should identify non-strings', function () {
        expect(isString(undefined)).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(1)).toBe(false);
        expect(isString(new Number(1))).toBe(false);
        expect(isString(true)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString([])).toBe(false);
        expect(isString(() => {})).toBe(false);
    });
});
