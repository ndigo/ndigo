/**
 * NodeSDK configuration for `@ndigo/telemetry-node` (AD-32): sampler
 * presets, per-signal exporter ergonomics, and a once-per-process guard.
 */
import { SeverityNumber } from '@opentelemetry/api-logs';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
    AlwaysOffSampler,
    AlwaysOnSampler,
    ConsoleSpanExporter,
    ParentBasedSampler,
    SimpleSpanProcessor,
    TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import type { Sampler, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { ConsoleMetricExporter, MetricReader, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor, ConsoleLogRecordExporter, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { LoggerFactory, registerMetricSnapshotProvider } from '@ndigo/telemetry';
import { SeverityFilterLogRecordProcessor } from './severity-filter-log-record-processor';
import { PrometheusMetricReader } from './metrics/prometheus-metric-reader';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-telemetry-node:node-config');

/**
 * Trace sampling configuration (AD-32 D-1). Presets resolve to parent-based
 * samplers so child spans inherit the root decision; a raw OTel `Sampler`
 * passes through untouched. Default: `'always'` (100% sampling — today's
 * effective behavior).
 */
export type SamplerSpec = { ratio: number } | 'always' | 'off' | Sampler;

/**
 * Per-signal exporter configuration (AD-32 D-2), reaching parity with
 * `@ndigo/telemetry-web`'s dev posture:
 * - `undefined`/`'console'`/`{ console: true }` — console exporter
 *   (the dev default; a missing url can no longer silently phone the
 *   default collector);
 * - `'none'` — the signal's export path is disabled;
 * - `'prometheus'` — **metric signal only** (AD-77 D-1): registers the pull
 *   {@link PrometheusMetricReader} instead of the periodic push reader, and
 *   serves the meter state through `GET /metrics` in the Prometheus text
 *   exposition format (plus the JSON projection);
 * - `{ url, headers? }` — OTLP/HTTP, headers forwarded (e.g. bearer auth;
 *   never logged). A `headers`-only spec still selects OTLP (explicit
 *   intent), using the default endpoint.
 */
export type ExporterSpec =
    | { url?: string; headers?: Record<string, string>; console?: true }
    | 'console'
    | 'none'
    | 'prometheus';

/**
 * Node telemetry configuration: the exporter chosen per signal (traces,
 * metrics, logs), an optional sampler and instrumentation list, and the minimum
 * severity applied to the log pipeline.
 */
export interface TelemetryConfig {
    /** Trace exporter spec; defaults to the console exporter. */
    traceExporter?: ExporterSpec;
    /** Metric exporter spec; `'prometheus'` selects the pull reader. */
    metricExporter?: ExporterSpec;
    /** Log exporter spec; defaults to the console exporter. */
    logExporter?: ExporterSpec;
    /** Trace sampler preset or raw OTel sampler; defaults to `'always'`. */
    sampler?: SamplerSpec;
    /** OTel instrumentations registered with the NodeSDK. */
    instrumentations?: Instrumentation[];
    /** Minimum severity routed to the OpenTelemetry log pipeline. */
    minimumSeverity?: SeverityNumber;
}

/** The resolved export choice for one signal. */
export type ResolvedExporter =
    | { kind: 'console' }
    | { kind: 'none' }
    | { kind: 'otlp'; url?: string; headers?: Record<string, string> }
    | { kind: 'prometheus' };

/**
 * Resolves a per-signal exporter spec (AD-32 D-2/D-3). Pure — no providers
 * are touched — so the shape table is unit-testable in one process.
 * OTLP urls fail loud here (`new URL`), naming the signal in the error.
 *
 * @param spec - The exporter spec to resolve.
 * @param signal - The signal being configured.
 * @returns The normalized export choice.
 * @throws When `'prometheus'` is used for a non-metric signal or an OTLP url is invalid.
 *
 * @example
 * ```ts
 * resolveExporter({ url: 'http://localhost:4318/v1/traces' }, 'trace');
 * // { kind: 'otlp', url: 'http://localhost:4318/v1/traces' }
 * ```
 */
export function resolveExporter(spec: ExporterSpec | undefined, signal: 'trace' | 'metric' | 'log'): ResolvedExporter {
    if (spec === undefined || spec === 'console' || (typeof spec === 'object' && spec.console === true)) {
        return { kind: 'console' };
    }
    if (spec === 'none') {
        return { kind: 'none' };
    }
    if (spec === 'prometheus') {
        if (signal !== 'metric') {
            throw new Error(
                `TelemetryConfig: 'prometheus' is only valid for the metric exporter (requested for ${signal})`
            );
        }
        return { kind: 'prometheus' };
    }
    if (spec.url !== undefined) {
        try {
            new URL(spec.url);
        } catch {
            throw new Error(`TelemetryConfig: ${signal} exporter url is invalid: ${JSON.stringify(spec.url)}`);
        }
    }
    return { kind: 'otlp', url: spec.url, headers: spec.headers };
}

function logRecordProcessorFor(
    resolved: Exclude<ResolvedExporter, { kind: 'none' } | { kind: 'prometheus' }>,
    minimumSeverity: SeverityNumber | undefined
): BatchLogRecordProcessor | SimpleLogRecordProcessor | SeverityFilterLogRecordProcessor {
    const base =
        resolved.kind === 'console'
            ? new SimpleLogRecordProcessor({ exporter: new ConsoleLogRecordExporter() })
            : new BatchLogRecordProcessor({
                  exporter: new OTLPLogExporter({ url: resolved.url, headers: resolved.headers }),
              });

    return minimumSeverity === undefined ? base : new SeverityFilterLogRecordProcessor(base, minimumSeverity);
}

function resolveSampler(spec: SamplerSpec | undefined): Sampler {
    if (spec === undefined || spec === 'always') {
        return new ParentBasedSampler({ root: new AlwaysOnSampler() });
    }
    if (spec === 'off') {
        return new ParentBasedSampler({ root: new AlwaysOffSampler() });
    }
    if (typeof spec === 'object' && 'ratio' in spec) {
        const { ratio } = spec as { ratio: number };
        if (typeof ratio !== 'number' || Number.isNaN(ratio) || ratio < 0 || ratio > 1) {
            throw new Error(`TelemetryConfig: sampler ratio must be a number in [0, 1], got ${JSON.stringify(ratio)}`);
        }
        return new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(ratio) });
    }
    return spec;
}

let configured = false;

/**
 * Configures the global OpenTelemetry providers for one process (AD-32).
 *
 * OTel's API registers global providers once per process — later calls are
 * silently ignored — so this shim warns loudly instead: the first call wins
 * and repeated calls indicate a wiring bug (tests, hot reload, or a second
 * subsystem trying to reconfigure). Configuration validation (sampler
 * ratios, exporter urls) runs before the latch and fails loud on every
 * call.
 *
 * @param config - Exporter, sampler, instrumentation, and severity settings.
 * @returns Nothing; the providers are registered as a side effect.
 *
 * @example
 * ```ts
 * configureTelemetry({
 *     traceExporter: { url: 'http://localhost:4318/v1/traces' },
 *     sampler: { ratio: 0.1 },
 * });
 * ```
 */
export function configureTelemetry(config: TelemetryConfig) {
    // Resolve/validate before any side effects or the once-per-process latch.
    const sampler = resolveSampler(config.sampler);
    const trace = resolveExporter(config.traceExporter, 'trace');
    const metric = resolveExporter(config.metricExporter, 'metric');
    const log = resolveExporter(config.logExporter, 'log');

    if (configured) {
        logger.error(
            '[ndigo-telemetry-node] configureTelemetry called again — OpenTelemetry global providers are ' +
                'registered once per process and the first call wins; this call is being ignored.'
        );
        return;
    }
    configured = true;

    // Traces: console/none pass explicit span processors (none = empty list,
    // so the SDK registers nothing); otlp goes through NodeSDK's own
    // batch-processor construction, preserving the previous batching.
    const traceSpanProcessors: SpanProcessor[] | undefined =
        trace.kind === 'console'
            ? [new SimpleSpanProcessor(new ConsoleSpanExporter())]
            : trace.kind === 'none'
              ? []
              : undefined;

    // Metrics: the reader list is always explicit (as before). The
    // `'prometheus'` spec (AD-77 D-1) swaps the periodic push reader for the
    // pull reader; the same process cannot push and pull (one reader slot —
    // combining them is a future `metricReaders` knob).
    let prometheusReader: PrometheusMetricReader | undefined;
    let metricReaders: MetricReader[] = [];
    if (metric.kind === 'prometheus') {
        prometheusReader = new PrometheusMetricReader();
        metricReaders = [prometheusReader];
    } else if (metric.kind !== 'none') {
        metricReaders = [
            new PeriodicExportingMetricReader({
                exporter:
                    metric.kind === 'console'
                        ? new ConsoleMetricExporter()
                        : new OTLPMetricExporter({ url: metric.url, headers: metric.headers }),
            }),
        ];
    }

    // `'prometheus'` cannot reach here: `resolveExporter` throws for the log
    // signal above, before the once-per-process latch. The filter keeps the
    // union honest so an invalid spec can never build a log pipeline.
    const logRecordProcessors =
        log.kind === 'none' || log.kind === 'prometheus' ? [] : [logRecordProcessorFor(log, config.minimumSeverity)];

    const sdk = new NodeSDK({
        // AD-32 D-1: parent-based sampler presets preserve the SDK default
        // (parentbased always-on) unless configured otherwise.
        sampler,
        ...(trace.kind === 'otlp'
            ? { traceExporter: new OTLPTraceExporter({ url: trace.url, headers: trace.headers }) }
            : { spanProcessors: traceSpanProcessors as SpanProcessor[] }),
        // OTel SDK 2.x: plural option — the singular `metricReader` is
        // deprecated in favor of `metricReaders` (Otel 2.x sweep, 2026-09-15).
        metricReaders,
        logRecordProcessors,
        instrumentations: config.instrumentations ?? [],
    });

    sdk.start();

    // AD-77 D-3: the pull reader becomes the process's metric snapshot source
    // (single slot, last registration wins) — `@ndigo/management`'s `/metrics`
    // endpoint reads it per request with zero wiring.
    if (prometheusReader !== undefined) {
        registerMetricSnapshotProvider(prometheusReader);
    }

    // OP-8: the log processor is inert until app loggers emit through the
    // OpenTelemetry API. Web parity: once an explicit `logExporter` is
    // configured, route `LoggerFactory` output through the OTel logger.
    // `'none'` deliberately means "no log pipeline" — app logs stay on the
    // console bridge rather than silently vanishing into a disabled provider.
    if (config.logExporter !== undefined && log.kind !== 'none') {
        LoggerFactory.setType('open-telemetry');
    }

    return sdk;
}
