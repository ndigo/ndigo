import '@tsmetadata/polyfill';
import { Counter, Meter, metrics } from '@opentelemetry/api';
import { LogAttributes } from '../logger/logger';

const COUNTED_KEY = 'telemetry:counted';

let countedMeter: Meter | undefined;

function getMeter(): Meter {
    if (!countedMeter) {
        countedMeter = metrics.getMeter('@blue/telemetry');
    }

    return countedMeter;
}

function getMetadata(target: any): Record<string, any> {
    if (typeof target === 'function' && target[Symbol.metadata]) {
        return target[Symbol.metadata];
    }

    if (target && target.constructor && target.constructor[Symbol.metadata]) {
        return target.constructor[Symbol.metadata];
    }

    return {};
}

export function getCounted(
    target: any,
    propertyKey: string | symbol
): { name: string; attributes?: LogAttributes } | undefined {
    return getMetadata(target)[`${COUNTED_KEY}:${String(propertyKey)}`];
}

export function hasCounted(target: any, propertyKey: string | symbol): boolean {
    return getCounted(target, propertyKey) !== undefined;
}

function createCountedDecorator(name?: string, attributes?: LogAttributes) {
    return function <This, Args extends unknown[], Return>(
        target: (this: This, ...args: Args) => Return,
        context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
    ) {
        if (context.kind !== 'method') {
            throw new TypeError('@counted can only be applied to methods');
        }

        const counterName = name || `${String(context.name)}.count`;

        context.metadata[`${COUNTED_KEY}:${String(context.name)}`] = {
            name: counterName,
            attributes,
        };

        let counter: Counter | undefined;

        return function (this: This, ...args: Args): Return {
            if (!counter) {
                counter = getMeter().createCounter(counterName);
            }

            counter.add(1, attributes);
            return target.apply(this, args);
        };
    };
}

export function counted(
    nameOrTarget?: string | Function,
    attributesOrContext?: LogAttributes | ClassMethodDecoratorContext,
    maybeContext?: ClassMethodDecoratorContext
): any {
    if (typeof nameOrTarget === 'string') {
        return createCountedDecorator(nameOrTarget, attributesOrContext as LogAttributes | undefined);
    }

    if (typeof attributesOrContext === 'object' && attributesOrContext !== null && 'kind' in attributesOrContext) {
        return createCountedDecorator()(
            nameOrTarget as (this: unknown, ...args: unknown[]) => unknown,
            attributesOrContext as ClassMethodDecoratorContext
        );
    }

    if (typeof maybeContext === 'object' && maybeContext !== null && 'kind' in maybeContext) {
        return createCountedDecorator(undefined, attributesOrContext as LogAttributes | undefined)(
            nameOrTarget as (this: unknown, ...args: unknown[]) => unknown,
            maybeContext
        );
    }

    return createCountedDecorator();
}

export const getCountedConfig = getCounted;

/** @deprecated Use @counted instead. */
export const Counted = counted;
