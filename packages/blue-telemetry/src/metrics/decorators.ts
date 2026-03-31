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

export function getCounted(
    target: any,
    propertyKey: string | symbol
): { name: string; attributes?: LogAttributes } | undefined {
    return getSymbolMetadata(target)[`${COUNTED_KEY}:${String(propertyKey)}`];
}

export function hasCounted(target: any, propertyKey: string | symbol): boolean {
    return getCounted(target, propertyKey) !== undefined;
}

export interface CountedOptions {
    attributes?: LogAttributes;
    featureAggregator?: FeatureMetricAggregator;
    featureKey?: string;
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
