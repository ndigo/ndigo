/**
 * Plan compilation: turn rules plus a method surface into per-method advice
 * chains.
 */
import { sortRules } from './chain';
import {
    createMethodDescriptor,
    type MethodDescriptor,
    type MethodInterceptor,
    type MethodInterceptorRule,
} from './interceptor';

/**
 * One method with the advice that runs around it, fixed at weave time.
 */
export interface MethodInterceptorPlan {
    /** The method's static descriptor. */
    readonly descriptor: MethodDescriptor;
    /** The matched, ordered advice chain. */
    readonly interceptors: readonly MethodInterceptor[];
}

/**
 * Compiles rules against a set of method names.
 *
 * Selection and validation both happen here, once, so a misconfigured
 * interceptor fails at startup rather than on the first call. Rules are
 * sorted by effective order before matching so the resulting chains inherit
 * that order; ties keep registry insertion order.
 *
 * @param targetType - The class the methods are resolved from.
 * @param entryName - The container entry name, or class name standalone.
 * @param methodNames - The method names to consider.
 * @param rules - The registered rules.
 * @returns One plan per method that at least one rule matched.
 *
 * @example
 * ```ts
 * const plans = compileInterceptorPlan(OrderService, 'orderService', ['submit'], rules);
 * ```
 */
export function compileInterceptorPlan(
    targetType: Function,
    entryName: string,
    methodNames: readonly PropertyKey[],
    rules: readonly MethodInterceptorRule[]
): MethodInterceptorPlan[] {
    const ordered = sortRules(rules);
    const plans: MethodInterceptorPlan[] = [];

    for (const methodName of methodNames) {
        const descriptor = createMethodDescriptor(targetType, entryName, methodName);
        const matched = ordered.filter((rule) => rule.when?.matches(descriptor) ?? true);
        if (matched.length === 0) {
            continue;
        }
        for (const rule of matched) {
            rule.use.validate?.(descriptor);
        }
        plans.push({ descriptor, interceptors: matched.map((rule) => rule.use) });
    }

    return plans;
}
