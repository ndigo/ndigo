/**
 * `@traced` execution: the span-name annotation and the interceptor that
 * opens the span.
 *
 * The decorator (see `annotations.ts`) only declares the name. A decorated
 * method stays inert until something advises it — `interceptMethods` by hand,
 * or `interception(...)` in the container.
 */
import '@tsmetadata/polyfill';
import { methodAnnotation, type MethodAnnotationKey } from '@ndigo/core';
import { AdviceOrder, type MethodInterceptor, type MethodInvocation } from '@ndigo/advice';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { Tracer } from '@opentelemetry/api';

/**
 * `@traced` annotation key: the OpenTelemetry span name recorded for a
 * method. Pass it to `hasAnnotation(...)` to select traced methods.
 *
 * @example
 * ```ts
 * rules.add({ when: hasAnnotation(tracedSpan), use: new TracedInterceptor() });
 * ```
 */
export const tracedSpan: MethodAnnotationKey<string> = methodAnnotation<string>('telemetry:traced');

let tracedTracer: Tracer | undefined;

/**
 * The tracer every `@traced` method reports to.
 *
 * Resolved lazily because the decorator runs at class-definition time, which
 * is typically before an SDK registers a global provider.
 *
 * @returns The shared tracer.
 */
export function getTracedTracer(): Tracer {
    return (tracedTracer ??= trace.getTracer('@ndigo/telemetry'));
}

/**
 * Opens a span around every `@traced` call.
 *
 * The interceptor stays synchronous: it returns the method's own result and
 * only unwraps a returned promise to end the span once it settles. Marking it
 * `async` would make every advised method return a promise, which the type
 * system cannot see.
 *
 * @example
 * ```ts
 * const service = interceptMethods(new CatalogService(), [
 *     { when: hasAnnotation(tracedSpan), use: new TracedInterceptor() },
 * ]);
 * ```
 */
export class TracedInterceptor implements MethodInterceptor {
    /**
     * The observability band: a span must see a retry and its failures as one
     * call, not be re-run per attempt.
     */
    readonly order = AdviceOrder.Observability;

    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * @returns The string "TracedInterceptor".
     */
    get [Symbol.toStringTag](): string {
        return 'TracedInterceptor';
    }

    /**
     * Opens a span named by the method's annotation, records the outcome, and
     * returns the call's result unchanged.
     *
     * @param invocation - The advised call.
     * @param next - Continues the inner chain and runs the method.
     * @returns The call result.
     */
    invoke(invocation: MethodInvocation, next: () => unknown): unknown {
        const spanName = invocation.annotation(tracedSpan) ?? String(invocation.methodName);

        return getTracedTracer().startActiveSpan(spanName, (span) => {
            try {
                const result = next();

                // NOTE: bridging to PromiseLike<unknown> — the source type is
                // wider than this consumer's contract.
                if (result && typeof (result as unknown as PromiseLike<unknown>).then === 'function') {
                    // NOTE: bridging to Promise<unknown> — the source type is
                    // wider than this consumer's contract.
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
                        });
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
    }
}
