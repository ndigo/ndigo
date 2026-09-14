/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';

import toCamel from '@blue/util/string/to-camel';

describe('toCamel', function () {
    test('it should convert hyphenated text to camelCase', function () {
        const str = 'lorem-ipsum-dolor';
        expect(toCamel(str)).toBe('loremIpsumDolor');
    });

    test('it should convert spaces to camelCase', function () {
        const str = '  lorem ipsum  dolor  ';
        expect(toCamel(str)).toBe('loremIpsumDolor');
    });

    test('it should convert underscores to camelCase', function () {
        const str = 'lorem_ipsum_dolor';
        expect(toCamel(str)).toBe('loremIpsumDolor');
    });

    test('it should remove non word', function () {
        const str = ' #$  lorem ipsum ^ &:  dolor ++ ';
        expect(toCamel(str)).toBe('loremIpsumDolor');
    });

    test('it should replace accents', function () {
        const str = 'spéçïãl chârs';
        expect(toCamel(str)).toBe('specialChars');
    });

    test('it should do it all at once', function () {
        const str = '  %$ & lorem Ipsum @ dolor spéçïãl  ! chârs  )( )  ';
        expect(toCamel(str)).toBe('loremIpsumDolorSpecialChars');
    });
});
