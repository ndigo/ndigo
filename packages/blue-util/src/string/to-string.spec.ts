import toString from './to-string';

describe('toString', function () {
    test('it should convert null to empty string', function () {
        expect(toString(null)).toBe('');
    });

    test('it should convert undefined to empty string', function () {
        expect(toString(void 0)).toBe('');
    });

    test('it should return string unchanged', function () {
        expect(toString('')).toBe('');
        expect(toString('test')).toBe('test');
    });

    test('it should return number as string', function () {
        expect(toString(0)).toBe('0');
        expect(toString(10)).toBe('10');
    });

    test('it should return boolean as string', function () {
        expect(toString(false)).toBe('false');
        expect(toString(true)).toBe('true');
    });
});
