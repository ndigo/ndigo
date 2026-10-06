/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { afterEach, describe, expect, test, vi } from 'vitest';

import randomHex from '@blue/util/crypto/random-hex';

const hexPattern = /^[0-9a-f]+$/;

describe('randomHex', function () {
    afterEach(function () {
        vi.unstubAllGlobals();
    });

    test('emits two lowercase hex characters per byte', function () {
        for (const bytes of [1, 2, 3, 8, 16, 31, 32, 64]) {
            const hex = randomHex(bytes);
            expect(hex.length, `bytes=${bytes}`).toBe(bytes * 2);
            expect(hex).toMatch(hexPattern);
        }
    });

    test('decodes back to the requested byte count', function () {
        for (const bytes of [1, 3, 8, 32]) {
            expect(Buffer.from(randomHex(bytes), 'hex').length, `bytes=${bytes}`).toBe(bytes);
        }
    });

    test('produces unique values', function () {
        expect(randomHex(8)).not.toBe(randomHex(8));

        const seen = new Set<string>();
        for (let i = 0; i < 1000; i++) seen.add(randomHex(16));
        expect(seen.size).toBe(1000);
    });

    test('rejects invalid byte counts', function () {
        expect(() => randomHex(0)).toThrow(RangeError);
        expect(() => randomHex(-4)).toThrow(RangeError);
        expect(() => randomHex(1.5)).toThrow(RangeError);
        expect(() => randomHex(Number.NaN)).toThrow(RangeError);
    });

    test('fails closed when Web Cryptography is unavailable', function () {
        vi.stubGlobal('crypto', undefined);
        expect(() => randomHex(8)).toThrow(/Web Cryptography/);
    });
});
