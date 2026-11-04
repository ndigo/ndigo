/**
 * Log↔trace correlation tooling (AD-32 D-4): a stand-alone accessor for
 * the active OpenTelemetry trace context, for consumers that do not go
 * through loggers — queue payloads, outbound headers, custom sinks.
 * @module ndigo-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { context, trace } from '@opentelemetry/api';

/** The active trace context as plain ids, for stamping anything. */
export interface TraceCorrelation {
    traceId: string;
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
 */
export function currentTraceContext(): TraceCorrelation | undefined {
    const span = trace.getSpan(context.active());
    if (span === undefined) {
        return undefined;
    }

    const { traceId, spanId } = span.spanContext();
    return { traceId, spanId };
}
