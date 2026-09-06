import { describe, expect, test } from 'vitest';
import { DomainError } from '../src/error';

describe('DomainError', () => {
    test('it should preserve error message', () => {
        const error = new DomainError('domain failed');

        expect(error.message).toBe('domain failed');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(DomainError);
    });

    test('it should expose Symbol.toStringTag', () => {
        const error = new DomainError();

        expect(error[Symbol.toStringTag]).toBe('DomainError');
    });
});
