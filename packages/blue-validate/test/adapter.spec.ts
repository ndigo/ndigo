import { describe, test, expect } from 'vitest';
import Type from '../src/type';
import TypeValidator from '../src/validator';
import { ValidationBackendAdapter } from '../src/_validation-backend-adapter';

class AlwaysValidAdapter implements ValidationBackendAdapter {
    hasConstraint(): boolean {
        return true;
    }

    validateConstraint(): boolean {
        return true;
    }
}

describe('validation backend adapter', () => {
    test('Type uses provided adapter for validation decisions', () => {
        const type = new Type(
            'CustomType',
            {
                constraints: [
                    {
                        type: 'AnyConstraint',
                    },
                ],
            },
            new AlwaysValidAdapter()
        );

        expect(type.validate('anything').isValid).toBe(true);
    });

    test('TypeValidator passes adapter through to created types', () => {
        const validator = new TypeValidator(
            {
                TestType: {
                    constraints: [
                        {
                            type: 'AnyConstraint',
                        },
                    ],
                },
            },
            new AlwaysValidAdapter()
        );

        expect(validator.validate('value', 'TestType', {}).isValid).toBe(true);
    });
});
