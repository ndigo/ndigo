/**
 * @module ndigo-telemetry
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
import { diag, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import type { Attributes, Span } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import type { InstrumentationModuleDefinition } from '@opentelemetry/instrumentation';
import { createLazyCounter } from '../metrics/lazy-counter';

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
 * Instrumentations whose wrappers are currently live, and therefore whose
 * next `enable()` must be a no-op.
 *
 * Module-level because `InstrumentationBase` runs the subclass `enable()`
 * from its own constructor — before this class's instance field initializers
 * — so the constructor-time call cannot be recorded on the instance.
 */
const ENABLED = new WeakSet<AbstractBaseInstrumentation>();

/**
 * Evaluates a span's `attributes` callback defensively: the callback builds
 * an arbitrary bag from runtime arguments, so a throw must never escape into
 * the wrapped method (it would otherwise propagate before/around the original
 * call and crash the request path). A failure degrades to no attributes.
 *
 * @param config - The span configuration carrying the callback.
 * @param instance - The patched instance.
 * @param args - The original method arguments.
 * @returns The callback's attributes, or `undefined` when absent/throwing.
 */
function evaluateAttributes(config: SpanConfig, instance: unknown, args: unknown[]): Attributes | undefined {
    if (config.attributes === undefined) {
        return undefined;
    }
    try {
        // Config callbacks build arbitrary bags from runtime args; OTel
        // accepts only AttributeValues — assert at the boundary.
        return config.attributes(instance, args) as Attributes;
    } catch (error) {
        diag.warn(`span attributes callback for "${config.name}" threw; continuing without attributes`, error);
        return undefined;
    }
}

/**
 * Invokes a span's `onEnd` callback defensively so its failure cannot replace
 * the method outcome or skip `span.end()`.
 *
 * @param config - The span configuration carrying the callback.
 * @param span - The span about to end.
 * @param outcome - Either `{ ok: true, value }` or `{ ok: false, error }`.
 * @param instance - The patched instance.
 * @param args - The original method arguments.
 */
function invokeOnEnd(
    config: SpanConfig,
    span: Span,
    outcome: { ok: boolean; value?: unknown; error?: unknown },
    instance: unknown,
    args: unknown[]
): void {
    if (config.onEnd === undefined) {
        return;
    }
    try {
        config.onEnd(span, outcome, instance, args);
    } catch (error) {
        diag.warn(`span onEnd callback for "${config.name}" threw; the span still ends`, error);
    }
}

/**
 * Base class for Ndigo OpenTelemetry instrumentations.
 *
 * Eliminates the copy-pasted span lifecycle boilerplate (getTracer, startSpan,
 * recordException, setStatus, end) that was duplicated across every
 * instrumentation class.
 *
 * Subclasses only declare:
 * - the target class/method to patch
 * - the span name, kind, and attributes
 *
 * `enable()`/`disable()` are latched: the constructor-time enable counts as
 * the first cycle, a repeated `enable()` (the SDK's `registerInstrumentations`)
 * is a no-op, and `disable()` unwinds the wrappers once and re-arms the next
 * `enable()`.
 */
export abstract class AbstractBaseInstrumentation extends InstrumentationBase {
    /**
     * Creates the instrumentation, deriving the package name from the component.
     *
     * @param component - Short component name (e.g. `'context'`, `'dispatcher'`).
     */
    constructor(component: string) {
        super(`@ndigo/instrumentation-${component}`, '0.0.1', {});

        // `InstrumentationBase`'s constructor has already run the subclass
        // `enable()` exactly once (`enabled` defaults to true), and the
        // platform `_wrap` is not idempotent everywhere — the browser build
        // is plain `shimmer.wrap`, so a second enable nests a wrapper that a
        // single `disable()` would leave live. Record the constructor-time
        // call, then seal `enable`/`disable` on this instance so every later
        // trigger (the SDK's `registerInstrumentations`, a manual re-enable)
        // hits the latch here. Subclasses keep implementing `enable`/
        // `disable`; they cannot forget the latch because it lives in this
        // base class.
        ENABLED.add(this);
        const enable = this.enable;
        const disable = this.disable;
        this.enable = () => {
            if (ENABLED.has(this)) {
                return;
            }
            ENABLED.add(this);
            enable.call(this);
        };
        this.disable = () => {
            if (!ENABLED.has(this)) {
                return;
            }
            ENABLED.delete(this);
            disable.call(this);
        };
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
        // Lazily resolved on first patched call: `InstrumentationBase` runs
        // `enable()` (and this factory) in its constructor, before any SDK
        // registers a global MeterProvider — an eager `createCounter` would
        // capture the NoopMeter and silently drop every datapoint. First call
        // happens post-init, so the global meter is real by then.
        const counter = createLazyCounter();

        return <This, Args extends unknown[], Return>(
            original: (this: This, ...args: Args) => Return
        ): ((this: This, ...args: Args) => Return) => {
            return function (this: This, ...args: Args): Return {
                counter(config.name, config.attributes);
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
                const tracer = trace.getTracer('@ndigo/telemetry');
                const span = tracer.startSpan(config.name, {
                    kind: config.kind,
                    attributes: evaluateAttributes(config, this, args),
                });
                try {
                    const result = original.apply(this, args);
                    invokeOnEnd(config, span, { ok: true, value: result }, this, args);
                    return result;
                } catch (error) {
                    span.recordException(error as Error);
                    span.setStatus({ code: SpanStatusCode.ERROR });
                    invokeOnEnd(config, span, { ok: false, error }, this, args);
                    throw error;
                } finally {
                    span.end();
                }
            };
        };
    }

    /**
     * Returns a patch function that wraps the original method in an active
     * span with the given configuration. Async by convention; the sync
     * variant is the explicitly-named `_patchSync`.
     */
    protected _patch(config: SpanConfig) {
        return <This, Args extends unknown[], Return>(
            original: (this: This, ...args: Args) => Promise<Return>
        ): ((this: This, ...args: Args) => Promise<Return>) => {
            return function (this: This, ...args: Args): Promise<Return> {
                const tracer = trace.getTracer('@ndigo/telemetry');
                return tracer.startActiveSpan(
                    config.name,
                    {
                        kind: config.kind,
                        attributes: evaluateAttributes(config, this, args),
                    },
                    (span) => {
                        return original
                            .apply(this, args)
                            .then(
                                (result) => {
                                    invokeOnEnd(config, span, { ok: true, value: result }, this, args);
                                    return result;
                                },
                                (error) => {
                                    span.recordException(error);
                                    span.setStatus({ code: SpanStatusCode.ERROR });
                                    invokeOnEnd(config, span, { ok: false, error }, this, args);
                                    throw error;
                                }
                            )
                            .finally(() => span.end());
                    }
                );
            };
        };
    }
}
