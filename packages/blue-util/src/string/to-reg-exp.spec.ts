import toRegExp from './to-reg-exp';

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
