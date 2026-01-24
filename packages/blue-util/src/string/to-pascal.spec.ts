import toPascal from './to-pascal';

describe('toPascal', function () {
    test('it should convert hyphenated text to camelCase', function () {
        const str = 'lorem-ipsum-dolor';
        expect(toPascal(str)).toBe('LoremIpsumDolor');
    });

    test('it should convert spaces to camelCase', function () {
        const str = '  lorem ipsum  dolor  ';
        expect(toPascal(str)).toBe('LoremIpsumDolor');
    });

    test('it should convert underscores to camelCase', function () {
        const str = 'lorem_ipsum_dolor';
        expect(toPascal(str)).toBe('LoremIpsumDolor');
    });

    test('it should remove non word', function () {
        const str = ' #$  lorem ipsum ^ &:  dolor ++ ';
        expect(toPascal(str)).toBe('LoremIpsumDolor');
    });

    test('it should replace accents', function () {
        const str = 'spéçïãl chârs';
        expect(toPascal(str)).toBe('SpecialChars');
    });

    test('it should do it all at once', function () {
        const str = '  %$ & lorem Ipsum @ dolor spéçïãl  ! chârs  )( )  ';
        expect(toPascal(str)).toBe('LoremIpsumDolorSpecialChars');
    });
});
