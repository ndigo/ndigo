import { describe, test, expect } from 'vitest';

import slugify from './slugify';

describe('slugify', function () {
    test("it shouldn't split camelCase text", function () {
        const str = 'loremIpsum';
        expect(slugify('', str)).toBe('loremipsum');
    });

    test('it should replace spaces with delimeter', function () {
        const str = '  lorem ipsum    dolor';
        expect(slugify('_', str)).toBe('lorem_ipsum_dolor');
    });

    test('it should use hyphen as delimeter by default', function () {
        const str = 'lorem ipsum dolor';
        expect(slugify('-', str)).toBe('lorem-ipsum-dolor');
    });

    test('it should remove non-word chars', function () {
        const str = ' %# lorem ipsum  ? $  dolor';
        expect(slugify('-', str)).toBe('lorem-ipsum-dolor');
    });

    test('it should replace accents', function () {
        const str = 'spéçïãl chârs';
        expect(slugify('-', str)).toBe('special-chars');
    });

    test('it should convert to lowercase', function () {
        const str = 'LOREM IPSUM';
        expect(slugify('-', str)).toBe('lorem-ipsum');
    });

    test('it should do it all at once', function () {
        const str = '  %$ & lorem Ipsum @ dolor spéçïãl  ! chârs  )( )  ';
        expect(slugify('-', str)).toBe('lorem-ipsum-dolor-special-chars');
    });
});
