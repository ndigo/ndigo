import { describe, test, expect } from 'vitest';
import { isJSONValue } from '../src/serializable';

describe('isJSONValue', () => {
    test('it should recognize JSON values', () => {
        const values = [123, 'abc', true, { def: 456 }];
        values.forEach((value) => expect(isJSONValue(value)).toBe(true));
    });

    test('it should recognize non-JSON values', () => {
        const values = [function () {}, { abc: function () {} }];
        values.forEach((value) => expect(isJSONValue(value)).toBe(false));
    });
});
