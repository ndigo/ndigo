/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import removeNonWord from '@blue/util/string/remove-non-word';

describe('removeNonWord', function () {
    test('it should remove non-word symbols', function () {
        const input = 'lorem ~!@#$%^&*()_+`-={}[]|\\:\";\'/?><., ipsum';
        expect(removeNonWord(input)).toBe('lorem _- ipsum');
    });

    test('it should keep alphanumeric and specific symbols', function () {
        const input = 'hello-world_123 café';
        expect(removeNonWord(input)).toBe('hello-world_123 café');
    });

    test('it should handle empty string', function () {
        expect(removeNonWord('')).toBe('');
    });
});
