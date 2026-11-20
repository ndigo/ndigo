/**
 * Rule registry: features contribute rules, the framework reads them.
 *
 * Features never weave. They add a {@link MethodInterceptorRule} to the
 * container's registry; the single interception processor compiles every
 * registered rule into one plan per method. That keeps one processor per
 * stage rather than one per feature, and lets two features advise the same
 * method without either knowing about the other.
 */
import type { MethodInterceptorRule } from './interceptor';

/**
 * Ordered, identity-deduplicated collection of advice rules.
 *
 * Registration order is the tie-breaker between rules with equal order, so
 * later registrations nest inside earlier ones.
 *
 * @example
 * ```ts
 * const registry = new MethodInterceptorRegistry();
 * registry.add({ when: hasAnnotation(cached), use: new CacheInterceptor() });
 * ```
 */
export class MethodInterceptorRegistry {
    /** The registered rules, in registration order. */
    #rules: MethodInterceptorRule[] = [];

    /**
     * The registered rules, in registration order.
     */
    get rules(): readonly MethodInterceptorRule[] {
        return this.#rules;
    }

    /**
     * Registers one or more rules.
     *
     * A rule already registered by identity is skipped, so a feature that
     * initializes twice (or a processor that re-runs) cannot double-advise.
     *
     * @param rules - The rules to add.
     * @returns This registry, for chaining.
     */
    add(...rules: readonly MethodInterceptorRule[]): this {
        for (const rule of rules) {
            if (!this.#rules.includes(rule)) {
                this.#rules.push(rule);
            }
        }
        return this;
    }

    /**
     * Whether any rule is registered.
     *
     * @returns `true` when the registry holds at least one rule.
     */
    get isEmpty(): boolean {
        return this.#rules.length === 0;
    }
}
