import { describe, test, expect } from 'vitest';
import { ValidationError, ConstraintViolationError } from '../src/error';

describe('error', () => {
    test('it should maintain the prototype chain', () => {
        const error = new ValidationError('test');

        expect(error).toBeInstanceOf(ValidationError);
        expect(error).toBeInstanceOf(Error);
        expect(error.cause).toBe(null);
        expect(error.message).toBe('Validation failed: "test"');

        const violation = new ConstraintViolationError('crap', new Set(['oops']));
        expect(violation).toBeInstanceOf(ConstraintViolationError);
        expect(violation).toBeInstanceOf(ValidationError);
        expect(violation).toBeInstanceOf(Error);
        expect(violation.cause).toBe(null);
        expect(violation.message).toBe('Validation failed: "crap"');
    });
});
