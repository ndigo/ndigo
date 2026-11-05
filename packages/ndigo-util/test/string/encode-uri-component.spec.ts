/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import encode from '@ndigo/util/string/encode-uri-component';

describe('encodeURIComponent', function () {
    test('it should encode', function () {
        expect(encode('unicorn!foobar')).toBe('unicorn%21foobar');
        expect(encode("unicorn'foobar")).toBe('unicorn%27foobar');
        expect(encode('unicorn*foobar')).toBe('unicorn%2Afoobar');
        expect(encode('unicorn*foobar')).not.toBe(encodeURIComponent('unicorn*foobar'));
    });
});
