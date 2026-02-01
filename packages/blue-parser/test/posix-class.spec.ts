import { describe, it, expect } from 'vitest';
import { expectSuccess } from './_expect';
import posixClass from '../src/posix-class';

describe('posixClass', () => {
    it('should parse POSIX character classes', () => {
        expectSuccess(posixClass, '[:alnum:]', '[a-zA-Z0-9]');
        expectSuccess(posixClass, '[:!digit:]', '[^0-9]');
    });

    it('should parse POSIX shorthand character classes', () => {
        expectSuccess(posixClass, '[:l:]', '[a-z]');
    });

    it('should return an error with invalid classes', () => {
        const parsedFoo = posixClass.run('[:foo:]');
        expect(parsedFoo.isError).toBe(true);
        expect(parsedFoo.error).toMatch(/Expecting POSIX character class/);
    });
});
