import '@tsmetadata/polyfill';
import { SpanStatusCode, Tracer, trace } from '@opentelemetry/api';

const TRACED_KEY = 'telemetry:traced';

let tracedTracer: Tracer | undefined;

function getTracer(): Tracer {
    if (!tracedTracer) {
        tracedTracer = trace.getTracer('@blue/telemetry');
    }

    return tracedTracer;
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

export function getTraced(target: any, propertyKey: string | symbol): string | undefined {
    return getMetadata(target)[`${TRACED_KEY}:${String(propertyKey)}`];
}

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

                    if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
                        return (result as Promise<unknown>)
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
