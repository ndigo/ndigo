import { ValidationError, ConstraintViolationError } from '../src/error';

describe('error', function () {
    test('it should maintain the prototype chain', function () {
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
