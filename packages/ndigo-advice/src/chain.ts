/**
 * Chain composition for compiled method plans.
 */
import { compareBy, numberComparator } from '@ndigo/core';

import { DEFAULT_ADVICE_ORDER } from './order';
import type { MethodInterceptor, MethodInterceptorRule, MethodInvocation } from './interceptor';

/**
 * The order a rule's advice executes in: the rule's own `order` when set,
 * otherwise the interceptor's, otherwise {@link DEFAULT_ADVICE_ORDER}.
 *
 * The default band matters. An unordered rule that fell to the outermost
 * position would wrap observability, turning one span per call into one span
 * per retry attempt; landing in `Application` keeps it inside the framework
 * concerns it has no opinion about.
 *
 * @param rule - The rule to read.
 * @returns The effective order.
 */
export function ruleOrder(rule: MethodInterceptorRule): number {
    return rule.order ?? rule.use.order ?? DEFAULT_ADVICE_ORDER;
}

/**
 * Stable sort of rules by effective order; equal orders keep registration
 * order, so a registry's insertion sequence is the tie-breaker.
 *
 * @param rules - The rules to sort.
 * @returns A new array in execution order.
 */
export function sortRules(rules: readonly MethodInterceptorRule[]): MethodInterceptorRule[] {
    return [...rules].sort(compareBy(ruleOrder, numberComparator.compare));
}

/**
 * Runs one call through the compiled advice chain.
 *
 * - `interceptors` must be pre-matched and pre-sorted.
 * - `tail` invokes the installed method on the target; it is called once per
 *   full chain pass.
 * - An interceptor that never calls `next()` short-circuits the call.
 * - `next()` is re-entrant: every invocation starts a fresh advance from the
 *   caller's position, so around-advice may invoke it multiple times — that
 *   is the retry pattern. Interceptors that must not re-execute guard their
 *   own state.
 *
 * @param interceptors - The compiled, ordered advice chain.
 * @param invocation - The invocation passed to every interceptor.
 * @param tail - Invokes the installed method on the target.
 * @returns The chain's final result.
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
