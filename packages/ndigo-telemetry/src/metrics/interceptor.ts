/**
 * `@counted` execution: the counter annotation and the interceptor that
 * records the increment.
 *
 * The decorator (see `decorators.ts`) only declares the counter. A decorated
 * method stays inert until something advises it — `interceptMethods` by hand,
 * or `interception(...)` in the container.
 */
import '@tsmetadata/polyfill';
import { methodAnnotation, type AnnotationKey } from '@ndigo/core';
import type { MethodInterceptor, MethodInvocation } from '@ndigo/advice';
import type { LogAttributes } from '@ndigo/log';
import type { ApplicationContext } from '@ndigo/context';
import { createLazyCounter } from './lazy-counter';
import { FEATURE_METRIC_AGGREGATOR } from './context-tokens';
import type { FeatureMetricAggregator } from './feature-metric-aggregator';

/**
 * The declaration recorded for a method decorated with `@counted`: the
 * counter name, attributes, and optional feature aggregation.
 */
export interface CountedMethodConfig {
    /** The counter name (defaults to `<method>.count`). */
    name: string;
    /** Attributes associated with the counter. */
    attributes?: LogAttributes;
    /** Optional aggregator for feature-scoped counters. */
    featureAggregator?: FeatureMetricAggregator;
    /** The attribute key holding the feature (defaults to 'feature'). */
    featureKey?: string;
}

/**
 * `@counted` annotation key: the counter declaration for a method. Pass it to
 * `hasAnnotation(...)` to select counted methods.
 *
 * @example
 * ```ts
 * { when: hasAnnotation(countedCounter), use: new CountedInterceptor() }
 * ```
 */
export const countedCounter: AnnotationKey<CountedMethodConfig> =
    methodAnnotation<CountedMethodConfig>('telemetry:counted');

/**
 * Counter handle shared by every `@counted` method: instruments resolve
 * lazily on first recorded call (the declaration is read at class-definition
 * time, typically before any SDK registers a global `MeterProvider`).
 */
const counters = createLazyCounter();

/**
 * Resolves the aggregator a counted method reports to: the declaration's own
 * aggregator, the instance's, or the application context's.
 *
 * @param invocation - The advised call.
 * @param config - The method's counted declaration.
 * @returns The aggregator, or `undefined` when none is reachable.
 */
function resolveAggregator(
    invocation: MethodInvocation,
    config: CountedMethodConfig
): FeatureMetricAggregator | undefined {
    if (config.featureAggregator !== undefined) {
        return config.featureAggregator;
    }

    const instance = invocation.target as {
        featureMetricAggregator?: FeatureMetricAggregator;
        applicationContext?: ApplicationContext;
    };

    if (instance.featureMetricAggregator !== undefined) {
        return instance.featureMetricAggregator;
    }

    const context = instance.applicationContext;
    if (context === undefined) {
        return undefined;
    }

    try {
        if (typeof context.hasValue === 'function' && context.hasValue(FEATURE_METRIC_AGGREGATOR)) {
            return context.getValue(FEATURE_METRIC_AGGREGATOR);
        }
        if (
            typeof context.hasValue === 'function' &&
            // oxlint-disable-next-line @ndigo/no-string-token-lookup -- metric token lives in @ndigo/management which depends on the context package
            context.hasValue('metricAggregator')
        ) {
            // oxlint-disable-next-line @ndigo/no-string-token-lookup -- see above
            return context.getValue('metricAggregator') as FeatureMetricAggregator;
        }
    } catch {
        return undefined;
    }

    return undefined;
}

/**
 * Increments a counter for every `@counted` call.
 *
 * The interceptor stays synchronous: it records the increment, then returns
 * the method's own result untouched. Marking it `async` would make every
 * advised method return a promise, which the type system cannot see.
 *
 * @example
 * ```ts
 * const service = interceptMethods(new CatalogService(), [
 *     { when: hasAnnotation(countedCounter), use: new CountedInterceptor() },
 * ]);
 * ```
 */
export class CountedInterceptor implements MethodInterceptor {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * @returns The string "CountedInterceptor".
     */
    get [Symbol.toStringTag](): string {
        return 'CountedInterceptor';
    }

    /**
     * Records one counter increment (and one feature tally when a feature is
     * reachable), then runs the method.
     *
     * @param invocation - The advised call.
     * @param next - Continues the inner chain and runs the method.
     * @returns The call result.
     */
    invoke(invocation: MethodInvocation, next: () => unknown): unknown {
        const config = invocation.annotation(countedCounter);
        if (config === undefined) {
            // A rule's matcher gates the chain; keep hand-built chains safe.
            return next();
        }

        counters(config.name, config.attributes);

        const aggregator = resolveAggregator(invocation, config);
        if (aggregator !== undefined) {
            const feature = config.attributes?.[config.featureKey ?? 'feature'];
            if (typeof feature === 'string') {
                aggregator.incrementCounter(feature, config.name);
            }
        }

        return next();
    }
}
