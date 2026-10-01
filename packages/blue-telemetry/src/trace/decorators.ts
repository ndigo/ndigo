/**
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
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
export function getTraced(target: object, propertyKey: string | symbol): string | undefined {
    return getSymbolMetadata(target)[`${TRACED_KEY}:${String(propertyKey)}`];
}

/**
 * Checks if a method has been decorated with the `traced` decorator.
 * @param target - The target object or prototype.
 * @param propertyKey - The name of the method.
 * @returns `true` if the method is traced, otherwise `false`.
 */
export function hasTraced(target: object, propertyKey: string | symbol): boolean {
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
        // Preserve the original (pre-wrap) function so framework code can
        // inspect its signature — the returned wrapper is `(...args)` and
        // destroys the declared parameter names.
        context.metadata[`${TRACED_KEY}:${String(context.name)}:original`] = target;

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
 *   `traced`()
 *   myMethod() {
 *     // ...
 *   }
 *
 *   `traced`('custom-span-name')
 *   anotherMethod() {
 *     // ...
 *   }
 *
 *   `traced`('async-operation')
 *   async asyncMethod() {
 *     await someAsyncOperation();
 *   }
 * }
 * ```
 */
export function traced(
    nameOrTarget?: string | Function,
    maybeContext?: ClassMethodDecoratorContext
    // The dual form (@traced bare applies directly; @traced(...) returns a
    // replacement decorator) has no single precise type: TS requires the bare
    // form's return to be `void | Method`, and the factory form's result to be
    // the decorator — only `any` satisfies both call shapes.
    // oxlint-disable-next-line no-explicit-any -- untypeable dual-form decorator
): any {
    if (typeof nameOrTarget === 'string') {
        return createTracedDecorator(nameOrTarget);
    }

    if (typeof maybeContext === 'object' && maybeContext !== null) {
        return createTracedDecorator()(nameOrTarget as (this: unknown, ...args: unknown[]) => unknown, maybeContext);
    }

    return createTracedDecorator();
}
