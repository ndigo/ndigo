import '@tsmetadata/polyfill';
import { getSymbolMetadata } from '@blue/core';
import { LogAttributes } from '../logger/logger';
import { FeatureMetricAggregator } from './feature-metric-aggregator';
import { CountedRegistry } from './_registry';

const COUNTED_KEY = 'telemetry:counted';

/**
 * The configuration recorded for a method decorated with `counted`: the
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
 * Retrieves the configuration for a counted method, including its name and attributes.
 * @param target - The target object or prototype.
 * @param propertyKey - The name of the method.
 * @returns The counter configuration if the method is counted, otherwise `undefined`.
 */
export function getCounted(target: object, propertyKey: string | symbol): CountedMethodConfig | undefined {
    return getSymbolMetadata(target)[`${COUNTED_KEY}:${String(propertyKey)}`];
}

/**
 * Checks if a method has been decorated with `counted`.
 * @param target - The target object or prototype.
 * @param propertyKey - The name of the method.
 * @returns `true` if the method is counted, otherwise `false`.
 */
export function hasCounted(target: object, propertyKey: string | symbol): boolean {
    return getCounted(target, propertyKey) !== undefined;
}

/**
 * Options for the `counted` decorator.
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
            featureAggregator: options.featureAggregator,
            featureKey: options.featureKey,
        };

        // TS types method-context initializers as `(this: This) => void`; the
        // tsmetadata polyfill instead hands the decorated class to the
        // initializer, which is what the registry needs.
        const addInitializer = context.addInitializer as unknown as (initializer: (cls: CountedClass) => void) => void;
        addInitializer((cls) => {
            if (cls) {
                CountedRegistry.register(cls.prototype || cls);
            }
        });

        return target;
    };
}

/** A decorated class (or its prototype) as handed to the registry initializer. */
type CountedClass = { prototype?: object } | undefined;

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
 *   `counted`()
 *   myMethod() {
 *     // Increments 'myMethod.count'
 *   }
 *
 *   `counted`('custom.event.count')
 *   anotherMethod() {
 *     // Increments 'custom.event.count'
 *   }
 *
 *   `counted`({ name: 'api.calls', attributes: { endpoint: '/users' } })
 *   apiCall() {
 *     // Increments 'api.calls' with 'endpoint: /users'
 *   }
 *
 *   `counted`('feature.usage', { feature: 'dashboard' })
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
    // The dual form (@counted bare applies directly; @counted(...) returns a
    // replacement decorator) has no single precise type: TS requires the bare
    // form's return to be `void | Method`, and the factory form's result to be
    // the decorator — only `any` satisfies both call shapes.
    // oxlint-disable-next-line no-explicit-any -- untypeable dual-form decorator
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

/** @deprecated Use `counted` instead. */
export const Counted = counted;
