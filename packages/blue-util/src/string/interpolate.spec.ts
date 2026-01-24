import interpolate from './interpolate';

describe('interpolate', function () {
    test('it should replace values', function () {
        expect(
            interpolate('{{a}} ipsum {{b}}', {
                a: 'lorem',
                b: 'dolor',
            })
        ).toBe('lorem ipsum dolor');

        expect(interpolate('{{0}} ipsum {{1}}', ['lorem', 'dolor'])).toBe('lorem ipsum dolor');
    });

    test('it should remove undefined tokens', function () {
        expect(
            interpolate('{{a}}{{b}}{{c}}', {
                a: 'lorem',
                b: 'ipsum',
            })
        ).toBe('loremipsum');

        expect(interpolate('{{0}}{{1}}{{2}}', ['lorem', 'ipsum'])).toBe('loremipsum');
    });

    test('it should allow a different syntax', function () {
        const syntax = /\$\{([^}]+)\}/g;

        expect(
            interpolate(
                '${a} ipsum ${b}',
                {
                    a: 'lorem',
                    b: 'dolor',
                },
                syntax
            )
        ).toBe('lorem ipsum dolor');

        expect(interpolate('${0} ipsum ${1}', ['lorem', 'dolor'], syntax)).toBe('lorem ipsum dolor');
    });

    test('it should treat null as empty string', function () {
        expect(interpolate('{{a}}', { a: null })).toBe('');
        expect(interpolate(null, {})).toBe('');
    });

    test('it should treat undefined as empty string', function () {
        expect(interpolate('{{a}}', { a: void 0 })).toBe('');
        expect(interpolate(null, {})).toBe('');
    });

    test('it should treat false as string "false"', function () {
        expect(interpolate('{{a}} {{b}}', { a: false, b: true })).toBe('false true');
    });

    test('it should allow nested replacement objects', function () {
        const replacements = {
            a: { b: { c: 'lorem ipsum' } },
        };

        expect(interpolate('{{a.b.c}}', replacements)).toBe('lorem ipsum');
        expect(interpolate('{{a.b.d}}', replacements)).toBe('');
    });

    test('it should allow nested complex key names', function () {
        const replacements = {
            '-#$&@_': 'foo bar',
        };

        expect(interpolate('{{-#$&@_}}', replacements)).toBe('foo bar');
    });
});
