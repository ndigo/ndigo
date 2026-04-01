import '@tsmetadata/polyfill';
import { getSymbolMetadata } from '@blue/core';
import { Counter, Meter, metrics } from '@opentelemetry/api';
import { LogAttributes } from '../logger/logger';
import { FeatureMetricAggregator } from './feature-metric-aggregator';

const COUNTED_KEY = 'telemetry:counted';

let countedMeter: Meter | undefined;

function getMeter(): Meter {
    if (!countedMeter) {
        countedMeter = metrics.getMeter('@blue/telemetry');
    }

    return countedMeter;
}

/**
 * Retrieves the configuration for a counted method, including its name and attributes.
 * @param target - The target object or prototype.
 * @param propertyKey - The name of the method.
 * @returns An object containing the counter name and optional attributes if the method is counted, otherwise `undefined`.
 */
export function getCounted(
    target: any,
    propertyKey: string | symbol
): { name: string; attributes?: LogAttributes } | undefined {
    return getSymbolMetadata(target)[`${COUNTED_KEY}:${String(propertyKey)}`];
}

/**
 * Checks if a method has been decorated with `@counted`.
 * @param target - The target object or prototype.
 * @param propertyKey - The name of the method.
 * @returns `true` if the method is counted, otherwise `false`.
 */
export function hasCounted(target: any, propertyKey: string | symbol): boolean {
    return getCounted(target, propertyKey) !== undefined;
}

/**
 * Options for the `@counted` decorator.
 */
export interface CountedOptions {
    /**
     * Optional attributes to associate with the counter.
     */
    attributes?: LogAttributes;
    /**
     * An optional feature metric aggregator to increment a feature-specific counter.
     */
    featureAggregator?: FeatureMetricAggregator;
    /**
     * The key within the attributes to use for feature aggregation. Defaults to 'feature'.
     */
    featureKey?: string;
    /**
     * The name of the counter. If not provided, the method's name will be used with a `.count` suffix.
     */
    name?: string;
}

function createCountedDecorator(options: CountedOptions = {}) {
    return function <This, Args extends unknown[], Return>(
        target: (this: This, ...args: Args) => Return,
        context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
    ) {
        if (context.kind !== 'method') {
            throw new TypeError('@counted can only be applied to methods');
        }

        const counterName = options.name || `${String(context.name)}.count`;

        context.metadata[`${COUNTED_KEY}:${String(context.name)}`] = {
            name: counterName,
            attributes: options.attributes,
        };

        let counter: Counter | undefined;

        return function (this: This, ...args: Args): Return {
            if (!counter) {
                counter = getMeter().createCounter(counterName);
            }

            counter.add(1, options.attributes);

            const featureKey = options.featureKey ?? 'feature';
            const feature = options.attributes?.[featureKey];

            if (options.featureAggregator && typeof feature === 'string') {
                options.featureAggregator.incrementCounter(feature, counterName);
            }

            return target.apply(this, args);
        };
    };
}

/**
 * A method decorator that increments a counter each time the decorated method is called.
 *
 * This decorator integrates with OpenTelemetry metrics to track method invocation counts.
 * It supports various ways of specifying the counter name and associated attributes.
 *
 * @param nameOrTarget - Overload 1: The name of the counter. Overload 2: An object of `CountedOptions`. Overload 3: The target function when used without parentheses.
 * @param attributesOrContext - Overload 1: Optional attributes for the counter. Overload 3: The decorator context.
 * @param maybeContext - Overload 3: The decorator context.
 * @returns A method decorator or the decorated method itself.
 * @throws {TypeError} If applied to anything other than a method.
 * @example
 * ```typescript
 * class MyService {
 *   @counted()
 *   myMethod() {
 *     // Increments 'myMethod.count'
 *   }
 *
 *   @counted('custom.event.count')
 *   anotherMethod() {
 *     // Increments 'custom.event.count'
 *   }
 *
 *   @counted({ name: 'api.calls', attributes: { endpoint: '/users' } })
 *   apiCall() {
 *     // Increments 'api.calls' with 'endpoint: /users'
 *   }
 *
 *   @counted('feature.usage', { feature: 'dashboard' })
 *   dashboardView() {
 *     // Increments 'feature.usage' with 'feature: dashboard'
 *   }
 * }
 * ```
 */
export function counted(
    nameOrTarget?: string | CountedOptions | Function,
    attributesOrContext?: LogAttributes | ClassMethodDecoratorContext,
    maybeContext?: ClassMethodDecoratorContext
): any {
    if (typeof nameOrTarget === 'string') {
        return createCountedDecorator({
            attributes: attributesOrContext as LogAttributes | undefined,
            name: nameOrTarget,
        });
    }

    if (typeof nameOrTarget === 'object' && nameOrTarget !== null && !('kind' in nameOrTarget)) {
        return createCountedDecorator(nameOrTarget as CountedOptions);
    }

    if (typeof attributesOrContext === 'object' && attributesOrContext !== null && 'kind' in attributesOrContext) {
        return createCountedDecorator()(
            nameOrTarget as (this: unknown, ...args: unknown[]) => unknown,
            attributesOrContext as ClassMethodDecoratorContext
        );
    }

    if (typeof maybeContext === 'object' && maybeContext !== null && 'kind' in maybeContext) {
        return createCountedDecorator({
            attributes: attributesOrContext as LogAttributes | undefined,
        })(nameOrTarget as (this: unknown, ...args: unknown[]) => unknown, maybeContext);
    }

    return createCountedDecorator();
}

export const getCountedConfig = getCounted;

/** @deprecated Use @counted instead. */
export const Counted = counted;
