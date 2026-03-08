import { describe, test, expect } from 'vitest';
import { createValidationBackend } from '../src/backend';
import { HybridValidationBackendAdapter } from '../src/_hybrid-validation-backend-adapter';
import { ZodValidationBackendAdapter } from '../src/_zod-validation-backend-adapter';
import TypeValidator from '../src/validator';
import types from '../src/types';

describe('zod validation backend', () => {
    test('validates supported constraints through zod adapter', () => {
        const backend = new ZodValidationBackendAdapter();

        expect(backend.hasConstraint('Email')).toBe(true);
        expect(backend.validateConstraint('Email', 'a@b.com')).toBe(true);
        expect(backend.validateConstraint('Email', 'invalid-email')).toBe(false);
    });

    test('throws for unsupported constraint in zod-only adapter', () => {
        const backend = new ZodValidationBackendAdapter();

        expect(backend.hasConstraint('RoutingNumber')).toBe(false);
        expect(() => backend.validateConstraint('RoutingNumber', '044000037')).toThrow(TypeError);
    });

    test('hybrid adapter falls back to native for unsupported constraints', () => {
        const backend = new HybridValidationBackendAdapter();

        expect(backend.validateConstraint('RoutingNumber', '044000037')).toBe(true);
        expect(backend.validateConstraint('RoutingNumber', '0214089')).toBe(false);
    });

    test('TypeValidator can be created with hybrid backend name', () => {
        const validator = new TypeValidator(types, 'hybrid');

        expect(validator.validate('test@test.com', 'Email', {}).isValid).toBe(true);
        expect(validator.validate('044000037', 'RoutingNumber', {}).isValid).toBe(true);
    });

    test('createValidationBackend supports native zod and hybrid', () => {
        expect(createValidationBackend('native')).toBeDefined();
        expect(createValidationBackend('zod')).toBeInstanceOf(ZodValidationBackendAdapter);
        expect(createValidationBackend('hybrid')).toBeInstanceOf(HybridValidationBackendAdapter);
    });
});
