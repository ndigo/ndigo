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
 * **Contributions must land before the advised entry is created.** Plans are
 * compiled once, at weave time, so a rule added afterwards does not reach an
 * instance that already exists — a second feature's rule applies to entries
 * created after it registers, not to those before. Independent contributors
 * therefore compose on a method whenever they register before that entry is
 * created, and the registry being readable at weave time is what lets a
 * feature register after the processor was installed.
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
