import toProper from './to-proper';

describe('toProper', function () {
    test('it should uppercase first char of each word and lowercase others', function () {
        expect(toProper('lorem iPSum dolor')).toBe('Lorem Ipsum Dolor');
    });
});
