/**
 * @module ndigo-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import randomToken from '@ndigo/util/crypto/random-token';

const base64UrlPattern = /^[A-Za-z0-9_-]+$/;

describe('randomToken', function () {
    test('length is ceil(bytes * 4 / 3) and identical to Buffer base64url', function () {
        for (const bytes of [1, 2, 3, 16, 31, 32, 47, 48, 64, 128]) {
            const token = randomToken(bytes);
            expect(token.length, `bytes=${bytes}`).toBe(Math.ceil((bytes * 4) / 3));

            // Same byte count, same unpadded base64url length as Node's reference.
            const reference = Buffer.alloc(bytes, 1).toString('base64url');
            expect(token.length).toBe(reference.length);
        }
    });

    test('output is base64url with no padding characters', function () {
        for (const bytes of [1, 2, 3, 7, 32, 48, 100]) {
            const token = randomToken(bytes);
            expect(token).toMatch(base64UrlPattern);
            expect(token).not.toContain('=');
            expect(token).not.toContain('+');
            expect(token).not.toContain('/');
        }
    });

    test('produces unique tokens', function () {
        expect(randomToken(32)).not.toBe(randomToken(32));

        const seen = new Set<string>();
        for (let i = 0; i < 1000; i++) seen.add(randomToken(16));
        expect(seen.size).toBe(1000);
    });

    test('decodes back to the requested byte count', function () {
        for (const bytes of [1, 3, 32, 48]) {
            const token = randomToken(bytes);
            const decoded = Buffer.from(token, 'base64url');
            expect(decoded.length, `bytes=${bytes}`).toBe(bytes);
        }
    });

    test('rejects invalid byte counts', function () {
        expect(() => randomToken(0)).toThrow(RangeError);
        expect(() => randomToken(-4)).toThrow(RangeError);
        expect(() => randomToken(1.5)).toThrow(RangeError);
        expect(() => randomToken(Number.NaN)).toThrow(RangeError);
    });
});
