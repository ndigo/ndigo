/**
 * @module ndigo-util
 * @since 1.0.0
 * @author Jeff Rose
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
});
