/**
 * Empty-payload fast fail in `validatedBy`: `{}`, `null`, and `undefined` reuse
 * a memoized failure template per schema, with no change for other values.
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ZodValidationError, validatedBy } from '../src/zod-validated-by';
import { ParameterConversionError } from '../src/error';
import { bodyValue } from '../src/parameter-factories';
import type { ParameterExtractor } from '../src/parameters';

/** Runs `convert` and returns the `ZodValidationError` cause. */
function failureOf(extractor: ParameterExtractor, value: unknown): ZodValidationError {
    let thrown: unknown;
    try {
        extractor.convert?.(value);
    } catch (error) {
        thrown = error;
    }
    expect(thrown).toBeInstanceOf(ParameterConversionError);
    return (thrown as ParameterConversionError).cause as ZodValidationError;
}

/** Normalizes a direct Zod parse the same way `validatedBy` does. */
function directFailure(schema: z.ZodType, value: unknown): { message: string; issues: unknown } {
    const result = schema.safeParse(value);
    expect(result.success).toBe(false);
    const issues = (result as { success: false; error: z.ZodError }).error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
        code: issue.code,
    }));
    return {
        message: issues.map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`).join(', '),
        issues,
    };
}

describe('validatedBy empty-shape fast fail', () => {
    it('reuses {} issues and message identical to a direct parse', () => {
        const schema = z.object({ title: z.string().min(1), count: z.number() });
        const extractor = validatedBy(schema, bodyValue('data'));
        const expected = directFailure(schema, {});

        // Twice: the second call must come from the memoized template.
        for (let index = 0; index < 2; index++) {
            const failure = failureOf(extractor, {});
            expect(failure.issues).toEqual(expected.issues);
            expect(failure.message).toBe(expected.message);
        }
    });

    it('keeps distinct messages for undefined and null', () => {
        const schema = z.object({ title: z.string().min(1) });
        const extractor = validatedBy(schema, bodyValue('data'));

        expect(failureOf(extractor, undefined).message).toBe(directFailure(schema, undefined).message);
        expect(failureOf(extractor, null).message).toBe(directFailure(schema, null).message);
        expect(failureOf(extractor, undefined).message).toContain('received undefined');
        expect(failureOf(extractor, null).message).toContain('received null');
    });

    it('still parses when the schema accepts the empty shape and returns fresh data', () => {
        const schema = z.object({ tag: z.string().default('none'), count: z.number().default(0) });
        const extractor = validatedBy(schema, bodyValue('data'));

        const first = extractor.convert?.({}) as { tag: string; count: number };
        const second = extractor.convert?.({}) as { tag: string; count: number };
        expect(first).toEqual({ tag: 'none', count: 0 });
        expect(second).toEqual(first);
        expect(second).not.toBe(first);

        // Mutating one result must not leak into the next request.
        first.tag = 'mutated';
        expect(extractor.convert?.({})).toEqual({ tag: 'none', count: 0 });
    });

    it('falls through for a keyless class instance', () => {
        class KeylessBody {
            get title(): string {
                return 'from prototype';
            }
        }
        const schema = z.object({ title: z.string().min(1) });
        const extractor = validatedBy(schema, bodyValue('data'));

        expect(extractor.convert?.(new KeylessBody())).toEqual({ title: 'from prototype' });
    });

    it('leaves valid and non-empty invalid payloads unchanged', () => {
        const schema = z.object({ title: z.string().min(1) });
        const extractor = validatedBy(schema, bodyValue('data'));

        expect(extractor.convert?.({ title: 'buy milk' })).toEqual({ title: 'buy milk' });

        const failure = failureOf(extractor, { title: '' });
        const expected = directFailure(schema, { title: '' });
        expect(failure.issues).toEqual(expected.issues);
        expect(failure.message).toBe(expected.message);
    });
});
