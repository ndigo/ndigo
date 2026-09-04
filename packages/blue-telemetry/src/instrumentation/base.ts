import { SpanKind, trace, metrics } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';

/**
 * Shared span configuration for method instrumentation.
 */
export interface SpanConfig {
    /** Span name as it appears in traces. */
    name: string;
    /** Span kind (CLIENT, SERVER, etc.). */
    kind: SpanKind;
    /** Optional callback that produces span attributes from the patched instance and arguments. */
    attributes?: (instance: any, args: any[]) => Record<string, any>;
    /**
     * Optional callback invoked just before the span ends, with the method's
     * result (or thrown error) and the patched instance + args — for outcome
     * attributes like handler name or status.
     *
     * @param span - The span about to end.
     * @param outcome - Either `{ ok: true, value }` or `{ ok: false, error }`.
     * @param instance - The patched instance.
     * @param args - The original method arguments.
     */
    onEnd?: (
        span: import('@opentelemetry/api').Span,
        outcome: { ok: boolean; value?: unknown; error?: unknown },
        instance: any,
        args: any[]
    ) => void;
}

/**
 * Configuration for counter instrumentation.
 */
export interface CountConfig {
    /** The name of the counter. */
    name: string;
    /** Optional attributes to associate with the counter. */
    attributes?: Record<string, any>;
}

/**
 * Base class for BlueJS OpenTelemetry instrumentations.
 *
 * Eliminates the copy-pasted span lifecycle boilerplate (getTracer, startSpan,
 * recordException, setStatus, end) that was duplicated across every
 * instrumentation class.
 *
 * Subclasses only declare:
 * - the target class/method to patch
 * - the span name, kind, and attributes
 */
export abstract class BaseBlueInstrumentation extends InstrumentationBase {
    /**
     * Creates the instrumentation, deriving the package name from the component.
     *
     * @param component - Short component name (e.g. `'context'`, `'dispatcher'`).
     */
    constructor(component: string) {
        super(`@blue/instrumentation-${component}`, '0.0.1', {});
    }

    /** @inheritdoc */
    protected init(): any[] {
        return [];
    }

    /** Hook for subclasses to wire up `_wrap` calls. */
    abstract enable(): void;

    /** Hook for subclasses to wire up `_unwrap` calls. */
    abstract disable(): void;

    /**
     * Returns a synchronous patch function that increments a counter.
     */
    protected _patchCount(config: CountConfig) {
        return (original: (...args: any[]) => any) => {
            const meter = metrics.getMeter('@blue/telemetry');
            const counter = meter.createCounter(config.name);

            return function (this: any, ...args: any[]) {
                counter.add(1, config.attributes);
                return original.apply(this, args);
            };
        };
    }

    /**
     * Returns a synchronous patch function that wraps the original method
     * in a span with the given configuration.
     */
    protected _patchSync(config: SpanConfig) {
        return (original: (...args: any[]) => any) => {
            return function (this: any, ...args: any[]) {
                const tracer = trace.getTracer('@blue/telemetry');
                const span = tracer.startSpan(config.name, {
                    kind: config.kind,
                    attributes: config.attributes?.(this, args) ?? {},
                });
                try {
                    const result = original.apply(this, args);
                    span.end();
                    return result;
                } catch (error) {
                    span.recordException(error as Error);
                    span.setStatus({ code: 2 /* ERROR */ });
                    span.end();
                    throw error;
                }
            };
        };
    }

    /**
     * Returns an asynchronous patch function that wraps the original method
     * in an active span with the given configuration.
     */
    protected _patchAsync(config: SpanConfig) {
        return (original: (...args: any[]) => Promise<any>) => {
            return function (this: any, ...args: any[]) {
                const tracer = trace.getTracer('@blue/telemetry');
                return tracer.startActiveSpan(
                    config.name,
                    {
                        kind: config.kind,
                        attributes: config.attributes?.(this, args) ?? {},
                    },
                    (span) => {
                        return original
                            .apply(this, args)
                            .then((result: any) => {
                                config.onEnd?.(span, { ok: true, value: result }, this, args);
                                span.end();
                                return result;
                            })
                            .catch((error: Error) => {
                                span.recordException(error);
                                span.setStatus({ code: 2 /* ERROR */ });
                                config.onEnd?.(span, { ok: false, error }, this, args);
                                span.end();
                                throw error;
                            });
                    }
                );
            };
        };
    }
}
