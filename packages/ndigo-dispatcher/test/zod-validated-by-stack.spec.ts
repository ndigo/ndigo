/**
 * AD-103: a validation failure carries exactly one stack — the thrown
 * `ParameterConversionError`'s. The `ZodValidationError` cause is a structured
 * payload and must not capture on V8.
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ZodValidationError, validatedBy } from '../src/zod-validated-by';
import { ParameterConversionError } from '../src/error';
import { bodyValue } from '../src/parameter-factories';

const limitHost = Error as typeof Error & { stackTraceLimit?: number };
const hasV8Limit = typeof limitHost.stackTraceLimit === 'number';

/** Counts V8 stack frames (lines beginning with `at`). */
function framesOf(error: Error): number {
    return (error.stack ?? '').split('\n').filter((line) => line.trimStart().startsWith('at ')).length;
}

/** Runs `validatedBy` over `{}` and returns the thrown conversion error. */
function conversionFailure(value: unknown): ParameterConversionError {
    const extractor = validatedBy(z.object({ title: z.string().min(1) }), bodyValue('data'));
    try {
        extractor.convert?.(value);
    } catch (error) {
        expect(error).toBeInstanceOf(ParameterConversionError);
        return error as ParameterConversionError;
    }
    throw new Error('expected a conversion failure');
}

describe('validatedBy stack policy (AD-103)', () => {
    it.skipIf(!hasV8Limit)('keeps exactly one stack: the thrown error’s', () => {
        const thrown = conversionFailure({});
        const cause = thrown.cause as ZodValidationError;

        expect(cause).toBeInstanceOf(ZodValidationError);
        expect(cause.issues.length).toBeGreaterThan(0);
        expect(framesOf(thrown)).toBeGreaterThan(0);
        expect(framesOf(cause)).toBe(0);
        expect(cause.stack).toContain(cause.message);
    });

    it.skipIf(!hasV8Limit)('restores the previous Error.stackTraceLimit', () => {
        const before = limitHost.stackTraceLimit;
        conversionFailure({});
        expect(limitHost.stackTraceLimit).toBe(before);
    });

    it.skipIf(!hasV8Limit)('applies to null, undefined, and the empty object', () => {
        for (const value of [undefined, null, {}]) {
            expect(framesOf(conversionFailure(value).cause as ZodValidationError)).toBe(0);
        }
    });

    it('leaves the message and issues intact', () => {
        const thrown = conversionFailure({ title: '' });
        const cause = thrown.cause as ZodValidationError;

        expect(cause.message).toContain('title');
        expect(cause.issues).toHaveLength(1);
        expect(cause.issues[0]?.path).toEqual(['title']);
        expect(thrown.message).toContain(cause.message);
    });
});
