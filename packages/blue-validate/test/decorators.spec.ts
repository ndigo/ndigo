import { describe, test, expect, vi } from 'vitest';
import { constrained, email, length, min, notBlank, pattern, validated, formatErrorMessage, setErrorMessageFormatter } from '../src/decorators';
import { validationGroup } from '../src/group';

describe('validation decorators', () => {
    test('named decorators validate values', () => {
        class User {
            @email()
            emailAddress: string;

            @notBlank()
            displayName: string;
        }

        const user = new User();
        user.emailAddress = 'name@example.com';
        user.displayName = 'Jane';

        expect(user.emailAddress).toBe('name@example.com');
        expect(user.displayName).toBe('Jane');
    });

    test('constraint decorators throw on invalid values by default', () => {
        class User {
            @min({ value: 18 })
            age: number;

            @length({ min: 3 })
            code: string;
        }

        const user = new User();

        expect(() => {
            user.age = 16;
        }).toThrow();

        expect(() => {
            user.code = 'ab';
        }).toThrow();
    });

    test('generic constrained decorator supports arbitrary constraints', () => {
        class Credentials {
            @constrained({
                constraint: 'Pattern',
                params: {
                    regex: /^[A-Z]{3}\d{3}$/,
                },
            })
            token: string;
        }

        const credentials = new Credentials();
        credentials.token = 'ABC123';
        expect(credentials.token).toBe('ABC123');

        expect(() => {
            credentials.token = 'invalid';
        }).toThrow();
    });

    test('multiple decorators on one field enforce all constraints', () => {
        class Composite {
            @notBlank()
            @length({ min: 3 })
            value: string;
        }

        const instance = new Composite();

        expect(() => {
            instance.value = '';
        }).toThrow();

        expect(() => {
            instance.value = 'ab';
        }).toThrow();

        instance.value = 'abcd';
        expect(instance.value).toBe('abcd');
    });

    test('validated decorator exposes class-level validate method', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        @validated()
        class Payload {
            @pattern({ regex: /^[a-z]+$/, mode: 'non-blocking' })
            slug: string;
        }

        const payload = new Payload();
        payload.slug = 'INVALID';

        const result = (payload as any).validate();
        expect(result.isValid).toBe(true);
        expect(result.failedProperties.has('slug')).toBe(false);

        warnSpy.mockRestore();
    });

    test('validated supports group-specific evaluation', () => {
        const onCreate = validationGroup('create');
        const onUpdate = validationGroup('update');

        @validated({ groups: [onCreate] })
        class Payload {
            @pattern({ regex: /^[a-z]+$/, groups: [onCreate] })
            createSlug: string;

            @pattern({ regex: /^[A-Z]+$/, groups: [onUpdate] })
            updateCode: string;
        }

        const payload = new Payload();
        payload.createSlug = 'INVALID';
        payload.updateCode = 'invalid';

        const defaultResult = (payload as any).validate();
        expect(defaultResult.isValid).toBe(false);
        expect(defaultResult.failedProperties.has('createSlug')).toBe(true);
        expect(defaultResult.failedProperties.has('updateCode')).toBe(false);

        const updateResult = (payload as any).validate({ groups: [onUpdate] });
        expect(updateResult.isValid).toBe(false);
        expect(updateResult.failedProperties.has('updateCode')).toBe(true);
        expect(updateResult.failedProperties.has('createSlug')).toBe(false);
    });
});

describe('error message formatting', () => {
    test('formatErrorMessage includes rejected value by default', () => {
        const msg = formatErrorMessage('Email', 'userEmail', 'not-an-email');
        expect(msg).toContain('Email');
        expect(msg).toContain('userEmail');
        expect(msg).toContain('not-an-email');
    });

    test('createViolationError uses custom message when provided', () => {
        const msg = formatErrorMessage('Min', 'age', 15, 'Age must be at least 18');
        expect(msg).toBe('Age must be at least 18');
    });

    test('setErrorMessageFormatter replaces the default formatter', () => {
        const original = formatErrorMessage;
        try {
            setErrorMessageFormatter((constraint, field, value, msg) => {
                return `[${constraint}] ${field} = ${value}`;
            });

            const msg = formatErrorMessage('NotBlank', 'name', '');
            expect(msg).toBe('[NotBlank] name = ');
        } finally {
            setErrorMessageFormatter(original);
        }
    });
});

describe('validated with backend', () => {
    test('validated with zod backend passes valid values', () => {
        @validated({ backend: 'zod' })
        class User {
            @email()
            emailAddress: string = '';

            @pattern({ regex: /^\d{5}$/ })
            zipCode: string = '';
        }

        const user = new User();
        user.emailAddress = 'test@example.com';
        user.zipCode = '12345';

        const result = (user as any).validate();
        expect(result.isValid).toBe(true);
    });

    test('validated with zod backend fails on invalid values', () => {
        @validated({ backend: 'zod' })
        class User {
            @email()
            emailAddress: string = '';

            @min({ value: 18 })
            age: number = 0;
        }

        const user = new User();
        // Bypass setter validation to set values that fail zod validation
        Object.defineProperty(user, 'emailAddress', { value: 'not-an-email', configurable: true, writable: true });
        Object.defineProperty(user, 'age', { value: 15, configurable: true, writable: true });

        const result = (user as any).validate();
        expect(result.isValid).toBe(false);
        expect(result.failedProperties.has('emailAddress')).toBe(true);
        expect(result.failedProperties.has('age')).toBe(true);
    });

    test('validated with zod backend respects groups', () => {
        const onCreate = validationGroup('create');
        const onUpdate = validationGroup('update');

        @validated({ groups: [onCreate], backend: 'zod' })
        class Payload {
            @notBlank({ groups: [onCreate] })
            title: string = '';

            @min({ value: 1, groups: [onUpdate] })
            quantity: number = 0;
        }

        const payload = new Payload();

        // Default group (onCreate) — only title validates (and it's empty)
        const defaultResult = (payload as any).validate();
        expect(defaultResult.isValid).toBe(false);
        expect(defaultResult.failedProperties.has('title')).toBe(true);
        expect(defaultResult.failedProperties.has('quantity')).toBe(false);

        // onUpdate group — only quantity validates (and it's 0)
        const updateResult = (payload as any).validate({ groups: [onUpdate] });
        expect(updateResult.isValid).toBe(false);
        expect(updateResult.failedProperties.has('title')).toBe(false);
        expect(updateResult.failedProperties.has('quantity')).toBe(true);
    });
});
