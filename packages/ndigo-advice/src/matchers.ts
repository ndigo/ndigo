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
