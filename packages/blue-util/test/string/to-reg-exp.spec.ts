/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import toRegExp from '@blue/util/string/to-reg-exp';

describe('toRegExp', function () {
    test('it should convert patterns', function () {
        const pattern = 'foo',
            regexp = toRegExp(pattern);
        expect(regexp).toBeInstanceOf(RegExp);
        expect(regexp).toHaveProperty('flags', '');
        expect(regexp).toHaveProperty('dotAll', false);
        expect(regexp).toHaveProperty('global', false);
        expect(regexp).toHaveProperty('ignoreCase', false);
        expect(regexp).toHaveProperty('multiline', false);
        expect(regexp).toHaveProperty('source', pattern);
    });

    test('it should strip slashes', function () {
        const pattern = '/foo/',
            regexp = toRegExp(pattern);
        expect(regexp).toBeInstanceOf(RegExp);
        expect(regexp).toHaveProperty('flags', '');
        expect(regexp).toHaveProperty('dotAll', false);
        expect(regexp).toHaveProperty('global', false);
        expect(regexp).toHaveProperty('ignoreCase', false);
        expect(regexp).toHaveProperty('multiline', false);
        expect(regexp).toHaveProperty('source', 'foo');
    });

    test('it should parse flags', function () {
        const pattern = '/foo/ig',
            regexp = toRegExp(pattern);
        expect(regexp).toBeInstanceOf(RegExp);
        expect(regexp).toHaveProperty('flags', 'gi');
        expect(regexp).toHaveProperty('dotAll', false);
        expect(regexp).toHaveProperty('global', true);
        expect(regexp).toHaveProperty('ignoreCase', true);
        expect(regexp).toHaveProperty('multiline', false);
        expect(regexp).toHaveProperty('source', 'foo');
    });

    test('it should treat plain patterns containing flag letters as literals', function () {
        for (const pattern of ['my-pattern', 'input:checked', 'greedy']) {
            const regexp = toRegExp(pattern);
            expect(regexp).toBeInstanceOf(RegExp);
            expect(regexp).toHaveProperty('flags', '');
            expect(regexp).toHaveProperty('source', pattern);
            expect(pattern).toMatch(regexp);
        }
    });

    test('it should treat malformed slash patterns as literals', function () {
        for (const pattern of ['/foo/garbage', '/foo/gg', '/foo']) {
            const regexp = toRegExp(pattern);
            expect(regexp).toBeInstanceOf(RegExp);
            expect(regexp).toHaveProperty('flags', '');
            expect(regexp).toHaveProperty('source', pattern.replaceAll('/', '\\/'));
            expect(pattern).toMatch(regexp);
        }
    });

    test('it should cache regexps', function () {
        // Cache the regular expression
        toRegExp('foo');

        const pattern = 'foo',
            regexp = toRegExp(pattern);
        expect(regexp).toBeInstanceOf(RegExp);
        expect(regexp).toHaveProperty('flags', '');
        expect(regexp).toHaveProperty('dotAll', false);
        expect(regexp).toHaveProperty('global', false);
        expect(regexp).toHaveProperty('ignoreCase', false);
        expect(regexp).toHaveProperty('multiline', false);
        expect(regexp).toHaveProperty('source', pattern);
    });
});
