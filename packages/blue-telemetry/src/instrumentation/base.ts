/**
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 * @note OTel 2.x sweep (2026-09-15): all `@opentelemetry/*` usages verified
 *   against the installed 2.x SDK line (`@opentelemetry/api` 1.9,
 *   `sdk-*` 2.11, instrumentation 0.222). Findings: `InMemoryMetricReader`
 *   was dropped (specs now use `InMemoryMetricExporter` +
 *   `PeriodicExportingMetricReader.collect()`) and `NodeSDK` `metricReader`
 *   (singular) is deprecated in favor of `metricReaders` — both resolved.
 *   Constructors here use only current option names.
 */
import { SpanKind, SpanStatusCode, trace, metrics } from '@opentelemetry/api';
import type { Attributes, Counter, Span } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import type { InstrumentationModuleDefinition } from '@opentelemetry/instrumentation';

/**
 * Shared span configuration for method instrumentation.
 */
export interface SpanConfig {
    /** Span name as it appears in traces. */
    name: string;
    /** Span kind (CLIENT, SERVER, etc.). */
    kind: SpanKind;
    /** Optional callback that produces span attributes from the patched instance and arguments. */
    attributes?: (instance: unknown, args: unknown[]) => Record<string, unknown>;
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
        span: Span,
        outcome: { ok: boolean; value?: unknown; error?: unknown },
        instance: unknown,
        args: unknown[]
    ) => void;
}

/**
 * Configuration for counter instrumentation.
 */
export interface CountConfig {
    /** The name of the counter. */
    name: string;
    /** Optional attributes to associate with the counter. */
    attributes?: Attributes;
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
export abstract class AbstractBaseInstrumentation extends InstrumentationBase {
    /**
     * Creates the instrumentation, deriving the package name from the component.
     *
     * @param component - Short component name (e.g. `'context'`, `'dispatcher'`).
     */
    constructor(component: string) {
        super(`@blue/instrumentation-${component}`, '0.0.1', {});
    }

    /** @inheritdoc */
    protected init(): InstrumentationModuleDefinition[] {
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
        return <This, Args extends unknown[], Return>(
            original: (this: This, ...args: Args) => Return
        ): ((this: This, ...args: Args) => Return) => {
            // Lazily resolved on first patched call: `InstrumentationBase`
            // runs `enable()` (and this factory) in its constructor, before
            // any SDK registers a global MeterProvider — an eager
            // `createCounter` would capture the NoopMeter and silently drop
            // every datapoint. First call happens post-init, so the global
            // meter is real by then.
            let counter: Counter | null = null;

            return function (this: This, ...args: Args): Return {
                counter ??= metrics.getMeter('@blue/telemetry').createCounter(config.name);
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
        return <This, Args extends unknown[], Return>(
            original: (this: This, ...args: Args) => Return
        ): ((this: This, ...args: Args) => Return) => {
            return function (this: This, ...args: Args): Return {
                const tracer = trace.getTracer('@blue/telemetry');
                const span = tracer.startSpan(config.name, {
                    kind: config.kind,
                    // Config callbacks build arbitrary bags from runtime args;
                    // OTel accepts only AttributeValues — assert at the boundary.
                    attributes: config.attributes?.(this, args) as Attributes | undefined,
                });
                try {
                    const result = original.apply(this, args);
                    span.end();
                    return result;
                } catch (error) {
                    span.recordException(error as Error);
                    span.setStatus({ code: SpanStatusCode.ERROR });
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
        return <This, Args extends unknown[], Return>(
            original: (this: This, ...args: Args) => Promise<Return>
        ): ((this: This, ...args: Args) => Promise<Return>) => {
            return function (this: This, ...args: Args): Promise<Return> {
                const tracer = trace.getTracer('@blue/telemetry');
                return tracer.startActiveSpan(
                    config.name,
                    {
                        kind: config.kind,
                        // Config callbacks build arbitrary bags from runtime args;
                        // OTel accepts only AttributeValues — assert at the boundary.
                        attributes: config.attributes?.(this, args) as Attributes | undefined,
                    },
                    (span) => {
                        return original
                            .apply(this, args)
                            .then((result) => {
                                config.onEnd?.(span, { ok: true, value: result }, this, args);
                                span.end();
                                return result;
                            })
                            .catch((error) => {
                                span.recordException(error);
                                span.setStatus({ code: SpanStatusCode.ERROR });
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
