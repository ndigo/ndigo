/**
 * Chain composition for `@ndigo/proxy`.
 */
import { compareBy, numberComparator } from '@ndigo/core';

import type { MethodInterceptor, MethodInvocation } from './interceptor';

/**
 * Stable sort of interceptors by `order` (missing order counts as `0`);
 * equal orders keep registration order.
 *
 * @param interceptors - The interceptors to sort.
 * @returns A new array in execution order.
 */
export function sortInterceptors(interceptors: readonly MethodInterceptor[]): MethodInterceptor[] {
    return [...interceptors].sort(compareBy((interceptor) => interceptor.order ?? 0, numberComparator.compare));
}

/**
 * Runs the matched interceptor chain for one call and returns its result.
 *
 * - `interceptors` must be pre-matched and pre-sorted.
 * - `tail` invokes the installed method on the target; it is called exactly
 *   once per full chain pass.
 * - An interceptor that never calls `next()` short-circuits the call.
 * - `next()` is *re-entrant*: every invocation starts a fresh advance from
 *   the caller's position, so around-advice may invoke it multiple times —
 *   that is the retry pattern (each re-entry re-runs the remaining advice
 *   and eventually the tail). Interceptors that must not re-execute are
 *   responsible for guarding their own state.
 *
 * @param interceptors - The pre-matched, pre-sorted interceptor chain.
 * @param invocation - The invocation passed to every interceptor.
 * @param tail - Invokes the installed method on the target.
 * @returns The chain's final result.
 *
 * @example
 * ```ts
 * const result = invokeChain(interceptors, invocation, () => method.apply(target, args));
 * ```
 */
export function invokeChain(
    interceptors: readonly MethodInterceptor[],
    invocation: MethodInvocation,
    tail: () => unknown
): unknown {
    const proceed =
        (position: number): (() => unknown) =>
        () => {
            const interceptor = interceptors[position];
            if (interceptor === undefined) {
                return tail();
            }
            return interceptor.invoke(invocation, proceed(position + 1));
        };

    return proceed(0)();
}
