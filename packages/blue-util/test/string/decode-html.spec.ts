import { describe, test, expect } from 'vitest';

import decodeHTML from '@blue/util/string/decode-html';

describe('decodeHTML', function () {
    test('it should convert &amp;', function () {
        expect(decodeHTML('foo &amp; bar')).toBe('foo & bar');
    });

    test('it should convert &quot;', function () {
        expect(decodeHTML('&quot;foo&quot;')).toBe('"foo"');
    });

    test('it should convert &gt; and &lt;', function () {
        expect(decodeHTML('&lt;foo&gt;')).toBe('<foo>');
    });

    test('it should convert &#39;', function () {
        expect(decodeHTML('&#39;foo&#39;')).toBe("'foo'");
    });

    test('it should accept leading zeros in &#39;', function () {
        expect(decodeHTML('&#0039;foo&#039;')).toBe("'foo'");
    });

    test('it should convert &#x2F;', function () {
        expect(decodeHTML('&#x2F;foo&#x2F;')).toBe('/foo/');
    });

    test('it should convert &#x60;', function () {
        expect(decodeHTML('&#x60;foo&#x60;')).toBe('`foo`');
    });

    test('it should convert &#x3D;', function () {
        expect(decodeHTML('foo&#x3D;bar')).toBe('foo=bar');
    });
});
