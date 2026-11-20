/**
 * Matchers that read declared annotations.
 *
 * Selection lives in the rule, not the interceptor: an interceptor says how
 * advice runs, a matcher says where.
 */
import type { AnnotationKey, Matchable } from '@ndigo/core';

import type { MethodDescriptor } from './interceptor';

/**
 * Matches methods that carry an annotation, optionally narrowing by value.
 *
 * @typeParam T - The annotation value type.
 * @param key - The annotation handle to read.
 * @param accept - Extra condition the value must satisfy.
 * @returns A matcher over method descriptors.
 *
 * @example
 * ```ts
 * { when: hasAnnotation(retry), use: new RetryInterceptor() }
 * ```
 */
export function hasAnnotation<T>(key: AnnotationKey<T>, accept?: (value: T) => boolean): Matchable<MethodDescriptor> {
    return {
        matches(method: MethodDescriptor): boolean {
            const value = method.annotation(key);
            return value !== undefined && (accept === undefined || accept(value));
        },
    };
}

/**
 * The conventional order bands for advice.
 *
 * Lower numbers run closer to the caller. A feature picks the band that
 * describes its concern instead of guessing a number relative to every other
 * feature, so independently authored rules interleave predictably.
 *
 * A transaction sits inside resilience on purpose: retrying a transaction
 * must start a fresh one per attempt.
 *
 * @example
 * ```ts
 * registry.add({ when: hasAnnotation(retry), use: new RetryInterceptor(), order: AdviceOrder.Resilience });
 * ```
 */
export const AdviceOrder = {
    /** Traces, metrics, logging: must observe retries, not be re-run by them. */
    Observability: 100,
    /** Retry and circuit breaking: several attempts per outer call. */
    Resilience: 200,
    /** Transaction boundaries: one fresh transaction per attempt. */
    Transaction: 300,
    /** Feature-specific policy that belongs inside framework concerns. */
    Application: 400,
    /** Closest to the method: may short-circuit before the real call. */
    Innermost: 500,
} as const;

/**
 * The order band values.
 */
export type AdviceOrderBand = (typeof AdviceOrder)[keyof typeof AdviceOrder];
