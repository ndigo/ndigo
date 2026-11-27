/**
 * Tests for the enhanced URI component decoder.
 */
import { describe, test, expect } from 'vitest';

import decode from '@ndigo/util/string/decode-uri-component';

const fixtures = {
    test: 'test',
    'a+b': 'a b',
    'a+b+c+d': 'a b c d',
    '=a': '=a',
    '%': '%',
    '%25': '%',
    '%%25%%': '%%%%',
    'st%C3%A5le': 'ståle',
    'st%C3%A5le%': 'ståle%',
    '%st%C3%A5le%': '%ståle%',
    '%%7Bst%C3%A5le%7D%': '%{ståle}%',
    '%ab%C3%A5le%': '%abåle%',
    '%C3%A5%able%': 'å%able%',
    '%7B%ab%7C%de%7D': '{%ab|%de}',
    '%7B%ab%%7C%de%%7D': '{%ab%|%de%}',
    '%7 B%ab%%7C%de%%7 D': '%7 B%ab%|%de%%7 D',
    '%ab': '%ab',
    '%ab%ab%ab': '%ab%ab%ab',
    '%61+%4d%4D': 'a MM',
    '\uFEFFtest': '\uFEFFtest',
    '\uFEFF': '\uFEFF',
    '%EF%BB%BFtest': '\uFEFFtest',
    '%EF%BB%BF': '\uFEFF',
    '%FE%FF': '\uFFFD\uFFFD',
    '%FF%FE': '\uFFFD\uFFFD',
    '†': '†',
    '%C2': '\uFFFD',
    '%C2x': '\uFFFDx',
    '%C2%B5': 'µ',
    '%C2%B5%': 'µ%',
    '%%C2%B5%': '%µ%',
    // Regression: replacement strings must never be interpreted as `$&`,
    // `` $` ``, `$'`, or `$$` patterns.
    'hello_%24%26_%GG': 'hello_$&_%GG',
    '%24%60': '$`',
    // Regression: decoded output must not be decoded a second time.
    '%2541_%41_%GG': '%41_A_%GG',
    '%41%2542': 'A%42',
    // Invalid UTF-8 escapes stay literal.
    '%C0%C0': '%C0%C0',
};

describe('decodeURIComponent', function () {
    test('it should encode', function () {
        const keys = Object.keys(fixtures),
            length = keys.length;
        let index = 0,
            key;

        for (; index < length; index += 1) {
            key = keys[index];
            expect(decode(key)).toBe((fixtures as Record<string, string>)[key]);
        }
    });

    // A quadratic or recursive fallback would not finish this within the test
    // timeout (the previous implementation hung for over 20 seconds).
    test('it decodes long invalid runs in linear time', function () {
        const input = '%C0'.repeat(10_000);
        expect(decode(input)).toBe(input);
    }, 1_000);
});
