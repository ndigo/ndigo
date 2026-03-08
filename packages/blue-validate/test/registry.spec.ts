import { describe, test, expect, afterAll } from 'vitest';
import Type from '../src/type';
import {
    registerConstraint,
    unregisterConstraint,
    hasConstraint,
    getConstraint,
    availableConstraints,
} from '../src/constraints';
import { registerType, unregisterType, hasType, getType, availableTypes } from '../src/types';

describe('validation registries', () => {
    afterAll(() => {
        unregisterConstraint('AlwaysTrue');
        unregisterType('AlwaysTrueType');
    });

    test('it should register and retrieve custom constraints', () => {
        registerConstraint('AlwaysTrue', {
            validate: () => true,
        });

        expect(hasConstraint('AlwaysTrue')).toBe(true);
        expect(getConstraint('AlwaysTrue').validate('anything', {})).toBe(true);
        expect(availableConstraints()).toContain('AlwaysTrue');
    });

    test('it should register and retrieve custom types', () => {
        registerType('AlwaysTrueType', {
            constraints: [
                {
                    type: 'AlwaysTrue',
                },
            ],
        });

        expect(hasType('AlwaysTrueType')).toBe(true);
        expect(getType('AlwaysTrueType').constraints).toHaveLength(1);
        expect(availableTypes()).toContain('AlwaysTrueType');
    });

    test('it should validate a type using a newly registered constraint', () => {
        const customType = new Type('CustomAlwaysTrue', {
            constraints: [
                {
                    type: 'AlwaysTrue',
                },
            ],
        });

        expect(customType.validate('value').isValid).toBe(true);
    });
});
