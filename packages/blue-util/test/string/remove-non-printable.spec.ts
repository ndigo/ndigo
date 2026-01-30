import { describe, test, expect } from 'vitest';

import removeNonPrintable from '@blue/util/string/remove-non-printable';

describe('removeNonPrintable', function () {
    test('it should remove non-printable ASCII characters', function () {
        const input = 'äÄçÇéÉêlorem-ipsumöÖÐþúÚ';
        expect(removeNonPrintable(input)).toBe('lorem-ipsum');
    });

    test('it should remove control characters', function () {
        const input = 'hello\x00\x01world\x1F';
        expect(removeNonPrintable(input)).toBe('helloworld');
    });

    test('it should keep printable ASCII characters', function () {
        const input =
            " !#$ %&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
        expect(removeNonPrintable(input)).toBe(input);
    });

    test('it should handle empty string', function () {
        expect(removeNonPrintable('')).toBe('');
    });
});
