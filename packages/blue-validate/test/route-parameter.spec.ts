import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validatedBy } from '../src/route-parameter';
import { ValidationError, ConstraintViolationError } from '../src/error';

describe('validatedBy', () => {
    const mockExtractor = {
        type: 'query:value',
        name: 'test',
        required: false,
        defaultValue: null,
        convert: null,
    };

    describe('Zod Integration', () => {
        const UserSchema = z.object({
            name: z.string().min(2),
            age: z.coerce.number().min(18),
        });

        it('should return a ParameterExtractor with a Zod converter', () => {
            const extractor = validatedBy(UserSchema, mockExtractor);
            expect(extractor.convert).toBeTypeOf('function');
        });

        it('should successfully parse and coerce valid data', () => {
            const extractor = validatedBy(UserSchema, mockExtractor);
            const convert = extractor.convert as Function;

            const result = convert({ name: 'Jeff', age: '30' });
            expect(result).toEqual({ name: 'Jeff', age: 30 });
        });

        it('should throw ValidationError on invalid data', () => {
            const extractor = validatedBy(UserSchema, mockExtractor);
            const convert = extractor.convert as Function;

            expect(() => convert({ name: 'J', age: '17' })).toThrow(ValidationError);
        });
    });

    describe('Validator Integration', () => {
        const mockValidator = {
            validate: vi.fn(),
        };

        it('should successfully validate with TypeValidator', () => {
            mockValidator.validate.mockReturnValue({ isValid: true });
            const extractor = validatedBy(mockValidator as any, 'Email', mockExtractor);
            const convert = extractor.convert as Function;

            const result = convert('test@example.com');
            expect(result).toBe('test@example.com');
            expect(mockValidator.validate).toHaveBeenCalledWith('test@example.com', 'Email');
        });

        it('should throw ConstraintViolationError on invalid data', () => {
            mockValidator.validate.mockReturnValue({
                isValid: false,
                failedConstraints: [{ type: 'Email' }],
            });
            const extractor = validatedBy(mockValidator as any, 'Email', mockExtractor);
            const convert = extractor.convert as Function;

            expect(() => convert('invalid')).toThrow(ConstraintViolationError);
        });
    });
});
