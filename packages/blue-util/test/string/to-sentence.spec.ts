/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import toSentence from '@blue/util/string/to-sentence';

describe('toSentence', function () {
    test('it should uppercase first char of each sentence and lowercase others', function () {
        const str = 'lorem Ipsum doLOr. sit amet dolor.';
        expect(toSentence(str)).toBe('Lorem ipsum dolor. Sit amet dolor.');
    });
});
