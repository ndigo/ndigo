/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import toProper from '@blue/util/string/to-proper';

describe('toProper', function () {
    test('it should uppercase first char of each word and lowercase others', function () {
        expect(toProper('lorem iPSum dolor')).toBe('Lorem Ipsum Dolor');
    });
});
