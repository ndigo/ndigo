import { describe, it, expect, test } from 'vitest';
import posixClass from '../src/posix-class';

describe('posixClass', function () {
    test('it should parse POSIX character classes', function () {
        const parsedAlnum = posixClass.run('[:alnum:]'),
            parsedNonDigit = posixClass.run('[:!digit:]');

        expect(parsedAlnum.isError).toBe(false);
        expect(parsedAlnum.result).toBe('[a-zA-Z0-9]');

        expect(parsedNonDigit.isError).toBe(false);
        expect(parsedNonDigit.result).toBe('[^0-9]');
    });

    test('it should parse POSIX shorthand character classes', function () {
        const parsedLowerCase = posixClass.run('[:l:]');

        expect(parsedLowerCase.isError).toBe(false);
        expect(parsedLowerCase.result).toBe('[a-z]');
    });

    test('it should return an error with invalid classes', function () {
        const parsedFoo = posixClass.run('[:foo:]');

        expect(parsedFoo.isError).toBe(true);
        expect(parsedFoo.error).to.match(/Expecting POSIX character class/);
    });
});
