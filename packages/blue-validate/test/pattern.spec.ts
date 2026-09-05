import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pattern } from '../src/decorators';
import { ConstraintViolationError } from '../src/error';

describe('@pattern Decorator', () => {
    let warnSpy: any;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('allows setting values that match the pattern', () => {
        class Example {
            @pattern({ regex: /^[a-z]+$/ })
            username: string;
        }

        const instance = new Example();
        instance.username = 'validusername';

        expect(instance.username).toBe('validusername');
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws by default for invalid patterns', () => {
        class Example {
            @pattern({ regex: /^[a-z]+$/ })
            username: string;
        }

        const instance = new Example();

        expect(() => {
            instance.username = 'INVALID123';
        }).toThrow(ConstraintViolationError);
        expect(instance.username).toBeUndefined();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('supports non-blocking mode via config', () => {
        class Example {
            @pattern({ regex: /^[a-z]+$/, mode: 'non-blocking' })
            username: string;
        }

        const instance = new Example();
        instance.username = 'INVALID123';

        expect(instance.username).toBe('INVALID123');
        expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('keeps decorated property enumerable and configurable', () => {
        class Example {
            @pattern({ regex: /^[a-z]+$/ })
            decorated: string;

            normal: string;
        }

        const instance = new Example();
        instance.decorated = 'hello';
        instance.normal = 'world';

        const keys = Object.keys(instance);
        expect(keys).toContain('decorated');
        expect(keys).toContain('normal');

        const descriptor = Object.getOwnPropertyDescriptor(instance, 'decorated');
        expect(descriptor?.configurable).toBe(true);
        expect(descriptor?.enumerable).toBe(true);
    });
});
