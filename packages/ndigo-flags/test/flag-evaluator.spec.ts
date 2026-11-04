/**
 * Flag-key grammar, guard, and the never-throw evaluation contract
 * (AD-82 D-2): typing, DEFAULT-on-missing, error classification.
 *
 * @module ndigo-flags
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { likeFlagEvaluator, validateFlagKey, type FlagEvaluator } from '../src/flag-evaluator';

describe('validateFlagKey', () => {
    test('accepts identifier-key characters (dotted, dashed, colons)', () => {
        expect(() => validateFlagKey('checkout')).not.toThrow();
        expect(() => validateFlagKey('todo.dueDates')).not.toThrow();
        expect(() => validateFlagKey('a_b.c-d:e')).not.toThrow();
    });

    test('rejects spaces, slashes and empty keys at decoration time', () => {
        expect(() => validateFlagKey('')).toThrow(TypeError);
        expect(() => validateFlagKey('two words')).toThrow(TypeError);
        expect(() => validateFlagKey('admin/users')).toThrow(TypeError);
        expect(() => validateFlagKey('pay>100')).toThrow(TypeError);
    });

    test('rejects non-strings', () => {
        expect(() => validateFlagKey(42 as unknown as string)).toThrow(TypeError);
        expect(() => validateFlagKey(undefined as unknown as string)).toThrow(TypeError);
    });
});

describe('likeFlagEvaluator', () => {
    test('accepts evaluator-shaped values', () => {
        const evaluator: FlagEvaluator = {
            kind: 'test',
            evaluate: async <T>() => ({ value: undefined as unknown as T, reason: 'DEFAULT' as const }),
        };
        expect(likeFlagEvaluator(evaluator)).toBe(true);
    });

    test('rejects non-evaluators', () => {
        expect(likeFlagEvaluator(null)).toBe(false);
        expect(likeFlagEvaluator({ kind: 'x' })).toBe(false);
        expect(likeFlagEvaluator({ evaluate: async () => ({ value: true, reason: 'STATIC' }) })).toBe(false);
    });
});
