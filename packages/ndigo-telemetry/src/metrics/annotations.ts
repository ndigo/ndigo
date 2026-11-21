/**
 * `@counted` decorator and its metadata readers.
 *
 * The decorator declares the counter; the increment itself is recorded by
 * `CountedInterceptor` (see `interceptor.ts`).
 */
import '@tsmetadata/polyfill';
import { annotationOf } from '@ndigo/core';
import type { LogAttributes } from '@ndigo/log';
import type { FeatureMetricAggregator } from './feature-metric-aggregator';
import { countedCounter } from './interceptor';
import type { CountedMethodConfig } from './interceptor';

export type { CountedMethodConfig } from './interceptor';
export { CountedInterceptor, countedCounter } from './interceptor';

/**
 * Retrieves the declaration for a counted method.
 *
 * Walks the class hierarchy, so an inherited declaration resolves.
 *
 * @param target - The target object, its prototype, or the class.
 * @param propertyKey - The method name.
 * @returns The counter declaration, or `undefined` when the method is not counted.
 */
export function getCounted(target: object, propertyKey: string | symbol): CountedMethodConfig | undefined {
    return annotationOf(target, countedCounter, propertyKey);
}

/**
 * Whether a method carries a `@counted` declaration.
 *
 * @param target - The target object, its prototype, or the class.
 * @param propertyKey - The method name.
 * @returns `true` when the method is counted.
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

/**
 * Declares that a method increments a counter on every call.
 *
 * Records the counter name (defaulting to `<method>.count`), its attributes,
 * and the feature aggregation settings, then returns the method unchanged.
 *
 * A decorated method is inert on its own: `new Service().run()` records
 * nothing until the instance is advised, through `interceptMethods` or the
 * container's `interception(...)` processor.
 *
 * @param nameOrTarget - Overload 1: the counter name. Overload 2: `CountedOptions`. Overload 3: the method when used bare.
 * @param attributesOrContext - Overload 1: attributes for the counter. Overload 3: the decorator context.
 * @param maybeContext - Overload 3: the decorator context.
 * @returns A method decorator, or the method unchanged.
 * @throws If applied to anything other than a method.
 *
 * @example
 * ```ts
 * class MyService {
 *     @counted()
 *     myMethod(): void {}
 *
 *     @counted('custom.event.count')
 *     anotherMethod(): void {}
 *
 *     @counted({ name: 'api.calls', attributes: { endpoint: '/users' } })
 *     apiCall(): void {}
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
    const declare = (options: CountedOptions) =>
        function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
            if (context.kind !== 'method') {
                throw new TypeError('@counted can only be applied to methods');
            }
            return countedCounter({
                name: options.name ?? `${String(context.name)}.count`,
                attributes: options.attributes,
                featureAggregator: options.featureAggregator,
                featureKey: options.featureKey,
            })(target, context);
        };

    if (typeof nameOrTarget === 'string') {
        return declare({ attributes: attributesOrContext as LogAttributes | undefined, name: nameOrTarget });
    }

    if (typeof nameOrTarget === 'object' && nameOrTarget !== null && !('kind' in nameOrTarget)) {
        return declare(nameOrTarget as CountedOptions);
    }

    if (typeof attributesOrContext === 'object' && attributesOrContext !== null && 'kind' in attributesOrContext) {
        return declare({})(nameOrTarget as Function, attributesOrContext as ClassMethodDecoratorContext);
    }

    if (typeof maybeContext === 'object' && maybeContext !== null && 'kind' in maybeContext) {
        return declare({ attributes: attributesOrContext as LogAttributes | undefined })(
            nameOrTarget as Function,
            maybeContext
        );
    }

    return declare({});
}
