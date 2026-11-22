/**
 * Log↔trace correlation tooling: a stand-alone accessor for
 * the active OpenTelemetry trace context, for consumers that do not go
 * through loggers — queue payloads, outbound headers, custom sinks.
 */
import { context, trace } from '@opentelemetry/api';

/** The active trace context as plain ids, for stamping anything. *
 * @example
 * ```ts
 * const corr: TraceCorrelation = { traceId: 'abc', spanId: 'def' };
 * ```
 */
export interface TraceCorrelation {
    /** The active trace id. */
    traceId: string;
    /** The active span id. */
    spanId: string;
}

/**
 * Returns the active span's trace ids, or `undefined` when no span is
 * active (no provider, or outside any span) — safe in pure-logging mode.
 *
 * @example Stamping an outbound queue message with the current trace:
 * ```ts
 * const correlation = currentTraceContext();
 * await queue.push({ ...payload, traceparent: correlation ? `${correlation.traceId}/${correlation.spanId}` : undefined });
 * ```
 *
 * @returns The active trace ids, or `undefined` outside a span.
 */
export function currentTraceContext(): TraceCorrelation | undefined {
    const span = trace.getSpan(context.active());
    if (span === undefined) {
        return undefined;
    }

    const { traceId, spanId } = span.spanContext();
    return { traceId, spanId };
}
