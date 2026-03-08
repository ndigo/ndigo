import { describe, test, expect, vi } from 'vitest';
import { constrained, email, length, min, notBlank, pattern, validated } from '../src/decorators';
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
