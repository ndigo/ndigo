/**
 * Container integration: one processor for the whole advice model.
 *
 * Features never register processors. They contribute rules to a
 * {@link MethodInterceptorRegistry}; the application hands that registry to
 * this single processor, which compiles one plan per method and weaves the
 * entries the container creates. Two features advising the same method is
 * therefore a normal case, not a conflict.
 */
import { getLogger } from '@ndigo/log';
import type { InitializationAwareProcessor } from '@ndigo/factory';

import { MethodInterceptorRegistry } from './registry';
import { planFor, isWoven, markWovenBy, weavePlans, wovenBy } from './weave';
import type { MethodInterceptorRule } from './interceptor';

const logger = getLogger('ndigo-advice:processor');

/**
 * Builds the single initialization-aware processor that advises container
 * entries.
 *
 * - An entry no rule matches keeps its identity and is never visited again.
 * - A matched entry is advised in place (shadow weaving) or replaced by a
 *   proxy when it cannot be shadow-woven.
 * - Re-processing an entry by *this* processor is idempotent.
 * - A *different* `interception(...)` processor meeting an already-advised
 *   entry throws: a container may register exactly one, and a silent second
 *   registration would look configured but never run.
 * - An entry advised standalone (`interceptMethods`) passes through with a
 *   warning naming the real cause, because there is no duplicate
 *   registration to fail on.
 *
 * @param rules - The registry the application fills, or a fixed rule list.
 * @returns An initialization-aware processor that advises matching entries.
 *
 * @example
 * ```ts
 * const advice = new MethodInterceptorRegistry()
 *     .add({ when: hasAnnotation(cached), use: new CacheInterceptor() });
 *
 * builder.processors(interception(advice));
 * ```
 */
export function interception(
    rules: MethodInterceptorRegistry | readonly MethodInterceptorRule[]
): InitializationAwareProcessor {
    // Identity token recorded as weaving provenance: distinguishes entries
    // this processor wove from standalone-woven and foreign-processor entries.
    const owner = {};

    return {
        processBeforeInitialization<T>(_entryName: string, instance: T): T {
            return instance;
        },

        processAfterInitialization<T = unknown>(entryName: string, instance: T): T {
            if (typeof instance !== 'object' || instance === null) {
                return instance;
            }

            const plans = planFor(instance, rules, entryName);
            if (plans.length === 0) {
                return instance;
            }

            if (isWoven(instance)) {
                const woveBy = wovenBy(instance);
                if (woveBy === owner) {
                    return instance;
                }
                if (woveBy === undefined) {
                    logger.warn(
                        `entry '${entryName}' was already advised standalone (interceptMethods) — the interception(...) processor leaves it unchanged, so its rules do not run on this instance`
                    );
                    return instance;
                }
                throw new Error(
                    `entry '${entryName}' is already advised — register exactly one interception(...) processor and combine all rules in it`
                );
            }

            const { instance: woven } = weavePlans(instance, plans);
            markWovenBy(woven, owner);
            return woven as T;
        },
    };
}
