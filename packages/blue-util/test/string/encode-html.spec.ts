/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import encodeHTML from '@blue/util/string/encode-html';

describe('encodeHTML', function () {
    test('it should convert special chars into entities', function () {
        expect(encodeHTML('<em>\'lorem\'</em> & "ipsum"')).toBe(
            '&lt;em&gt;&#39;lorem&#39;&lt;&#x2F;em&gt; &amp; &quot;ipsum&quot;'
        );
    });
});
