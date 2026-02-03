/**
 * @author Jeff Rose
 * 
 * Tests for @Pattern decorator
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Pattern } from '../src/decorators';

describe('@Pattern Decorator', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('Basic Validation', () => {
        it('allows setting values that match the pattern', () => {
            class Example {
                @Pattern({ regex: /^[a-z]+$/ })
                username: string;
            }

            const instance = new Example();
            instance.username = 'validusername';

            expect(instance.username).toBe('validusername');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('logs error but still sets value for invalid patterns', () => {
            class Example {
                @Pattern({ regex: /^[a-z]+$/ })
                username: string;
            }

            const instance = new Example();
            instance.username = 'INVALID123';

            expect(consoleErrorSpy).toHaveBeenCalledWith('YOU BAD DATA FILE');
            expect(instance.username).toBe('INVALID123');
        });

        it('validates on every property assignment', () => {
            class Example {
                @Pattern({ regex: /^[0-9]+$/ })
                code: string;
            }

            const instance = new Example();

            // Valid value
            instance.code = '123';
            expect(instance.code).toBe('123');
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            // Invalid value
            instance.code = 'abc';
            expect(instance.code).toBe('abc');
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

            // Valid value again
            instance.code = '456';
            expect(instance.code).toBe('456');
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Multiple Decorated Properties', () => {
        it('validates each property independently', () => {
            class User {
                @Pattern({ regex: /^[a-z]+$/ })
                username: string;

                @Pattern({ regex: /^[A-Z0-9]+$/ })
                code: string;
            }

            const user = new User();

            // Valid values
            user.username = 'johndoe';
            user.code = 'ABC123';

            expect(user.username).toBe('johndoe');
            expect(user.code).toBe('ABC123');
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            // Invalid username
            user.username = 'JOHN';
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

            // Invalid code
            user.code = 'abc';
            expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('Instance Isolation', () => {
        it('each instance maintains its own value', () => {
            class Example {
                @Pattern({ regex: /^[a-z]+$/ })
                name: string;
            }

            const instance1 = new Example();
            const instance2 = new Example();

            instance1.name = 'alice';
            instance2.name = 'bob';

            expect(instance1.name).toBe('alice');
            expect(instance2.name).toBe('bob');
        });

        it('validation is independent per instance', () => {
            class Example {
                @Pattern({ regex: /^[a-z]+$/ })
                value: string;
            }

            const instance1 = new Example();
            const instance2 = new Example();

            instance1.value = 'valid';
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            instance2.value = 'INVALID';
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

            instance1.value = 'stillvalid';
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Property Descriptor', () => {
        it('property is enumerable', () => {
            class Example {
                @Pattern({ regex: /^[a-z]+$/ })
                decorated: string;

                normal: string;
            }

            const instance = new Example();
            instance.decorated = 'foo';
            instance.normal = 'bar';

            const keys = Object.keys(instance);
            expect(keys).toContain('decorated');
            expect(keys).toContain('normal');
        });

        it('property is configurable', () => {
            class Example {
                @Pattern({ regex: /^[a-z]+$/ })
                value: string;
            }

            const instance = new Example();
            instance.value = 'test';

            const descriptor = Object.getOwnPropertyDescriptor(instance, 'value');
            expect(descriptor).toBeDefined();
            expect(descriptor!.configurable).toBe(true);
            expect(descriptor!.enumerable).toBe(true);
        });
    });

    describe('Complex Patterns', () => {
        it('validates phone numbers', () => {
            class Contact {
                @Pattern({ regex: /^\d{3}-\d{4}$/ })
                phone: string;
            }

            const contact = new Contact();

            contact.phone = '555-1234';
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            contact.phone = '5551234';
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        });

        it('validates email-like patterns', () => {
            class User {
                @Pattern({ regex: /^[a-z]+@[a-z]+\.[a-z]+$/ })
                email: string;
            }

            const user = new User();

            user.email = 'user@example.com';
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            user.email = 'invalid';
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Initial Values', () => {
        it('handles undefined initial value', () => {
            class Example {
                @Pattern({ regex: /^[a-z]+$/ })
                value: string;
            }

            const instance = new Example();
            expect(instance.value).toBeUndefined();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('validates when setting undefined explicitly', () => {
            class Example {
                @Pattern({ regex: /^[a-z]+$/ })
                value: string;
            }

            const instance = new Example();
            instance.value = undefined;

            // undefined fails pattern validation
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(instance.value).toBeUndefined();
        });
    });

    describe('Inheritance', () => {
        it('works correctly in inheritance hierarchies', () => {
            class Base {
                @Pattern({ regex: /^[a-z]+$/ })
                baseValue: string;
            }

            class Derived extends Base {
                @Pattern({ regex: /^[A-Z]+$/ })
                derivedValue: string;
            }

            const instance = new Derived();

            instance.baseValue = 'lowercase';
            instance.derivedValue = 'UPPERCASE';

            expect(instance.baseValue).toBe('lowercase');
            expect(instance.derivedValue).toBe('UPPERCASE');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('handles null values', () => {
            class Example {
                @Pattern({ regex: /^[a-z]+$/ })
                value: string;
            }

            const instance = new Example();
            instance.value = null;

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(instance.value).toBeNull();
        });

        it('handles empty strings correctly based on pattern', () => {
            class Example1 {
                @Pattern({ regex: /^[a-z]+$/ })
                requiresChars: string;
            }

            class Example2 {
                @Pattern({ regex: /^[a-z]*$/ })
                allowsEmpty: string;
            }

            const instance1 = new Example1();
            const instance2 = new Example2();

            instance1.requiresChars = '';
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

            instance2.allowsEmpty = '';
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Still 1, not 2
        });

        it('handles number coercion', () => {
            class Example {
                @Pattern({ regex: /^[0-9]+$/ })
                value: any;
            }

            const instance = new Example();
            instance.value = 123;

            // Number 123 will be validated - check if it matches
            // The constraint will convert it to string for regex test
        });
    });
});
