import '@tsmetadata/polyfill';
import { getSymbolMetadata } from '@blue/core';
import { SpanStatusCode, Tracer, trace } from '@opentelemetry/api';

const TRACED_KEY = 'telemetry:traced';

let tracedTracer: Tracer | undefined;

function getTracer(): Tracer {
    if (!tracedTracer) {
        tracedTracer = trace.getTracer('@blue/telemetry');
    }

    return tracedTracer;
}

/**
 * Retrieves the span name associated with a traced method.
 * @param target - The target object or prototype.
 * @param propertyKey - The name of the method.
 * @returns The span name if the method is traced, otherwise `undefined`.
 */
export function getTraced(target: any, propertyKey: string | symbol): string | undefined {
    return getSymbolMetadata(target)[`${TRACED_KEY}:${String(propertyKey)}`];
}

/**
 * Checks if a method has been decorated with `@traced`.
 * @param target - The target object or prototype.
 * @param propertyKey - The name of the method.
 * @returns `true` if the method is traced, otherwise `false`.
 */
export function hasTraced(target: any, propertyKey: string | symbol): boolean {
    return getTraced(target, propertyKey) !== undefined;
}

function createTracedDecorator(spanName?: string) {
    return function <This, Args extends unknown[], Return>(
        target: (this: This, ...args: Args) => Return,
        context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
    ) {
        if (context.kind !== 'method') {
            throw new TypeError('@traced can only be applied to methods');
        }

        const methodSpanName = spanName ?? String(context.name);
        context.metadata[`${TRACED_KEY}:${String(context.name)}`] = methodSpanName;

        return function (this: This, ...args: Args): Return {
            return getTracer().startActiveSpan(methodSpanName, (span) => {
                try {
                    const result = target.apply(this, args);

                    if (result && typeof (result as unknown as PromiseLike<unknown>).then === 'function') {
                        return (result as unknown as Promise<unknown>)
                            .then((value) => {
                                span.setStatus({ code: SpanStatusCode.OK });
                                span.end();
                                return value;
                            })
                            .catch((error) => {
                                span.recordException(error as Error);
                                span.setStatus({ code: SpanStatusCode.ERROR });
                                span.end();
                                throw error;
                            }) as Return;
                    }

                    span.setStatus({ code: SpanStatusCode.OK });
                    span.end();
                    return result;
                } catch (error) {
                    span.recordException(error as Error);
                    span.setStatus({ code: SpanStatusCode.ERROR });
                    span.end();
                    throw error;
                }
            });
        };
    };
}

/**
 * A method decorator that creates and manages an OpenTelemetry span for the decorated method's execution.
 *
 * When applied, this decorator will automatically start a new span before the method executes and end it
 * upon completion, recording any errors that occur. It supports both synchronous and asynchronous methods.
 *
 * @param nameOrTarget - Optional. The name of the span to create. If not provided, the method's name will be used.
 *                       Alternatively, if used without parentheses, this will be the target function.
 * @param maybeContext - Optional. The decorator context provided by TypeScript for method decorators.
 * @returns A method decorator or the decorated method itself.
 * @throws {TypeError} If applied to anything other than a method.
 * @example
 * ```typescript
 * class MyService {
 *   @traced()
 *   myMethod() {
 *     // ...
 *   }
 *
 *   @traced('custom-span-name')
 *   anotherMethod() {
 *     // ...
 *   }
 *
 *   @traced('async-operation')
 *   async asyncMethod() {
 *     await someAsyncOperation();
 *   }
 * }
 * ```
 */
export function traced(nameOrTarget?: string | Function, maybeContext?: ClassMethodDecoratorContext): any {
    if (typeof nameOrTarget === 'string') {
        return createTracedDecorator(nameOrTarget);
    }

    if (typeof maybeContext === 'object' && maybeContext !== null) {
        return createTracedDecorator()(nameOrTarget as (this: unknown, ...args: unknown[]) => unknown, maybeContext);
    }

    return createTracedDecorator();
}

export const getTracedSpanName = getTraced;

/** @deprecated Use @traced instead. */
export const Traced = traced;
