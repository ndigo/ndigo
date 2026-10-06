/**
 * NodeSDK configuration for `@blue/telemetry-node` (AD-32): sampler
 * presets, per-signal exporter ergonomics, and a once-per-process guard.
 * @module blue-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
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
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor, ConsoleLogRecordExporter, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { LoggerFactory } from '@blue/telemetry';
import { SeverityFilterLogRecordProcessor } from './severity-filter-log-record-processor';

/**
 * Trace sampling configuration (AD-32 D-1). Presets resolve to parent-based
 * samplers so child spans inherit the root decision; a raw OTel `Sampler`
 * passes through untouched. Default: `'always'` (100% sampling — today's
 * effective behavior).
 */
export type SamplerSpec = { ratio: number } | 'always' | 'off' | Sampler;

/**
 * Per-signal exporter configuration (AD-32 D-2), reaching parity with
 * `@blue/telemetry-web`'s dev posture:
 * - `undefined`/`'console'`/`{ console: true }` — console exporter
 *   (the dev default; a missing url can no longer silently phone the
 *   default collector);
 * - `'none'` — the signal's export path is disabled;
 * - `{ url, headers? }` — OTLP/HTTP, headers forwarded (e.g. bearer auth;
 *   never logged). A `headers`-only spec still selects OTLP (explicit
 *   intent), using the default endpoint.
 */
export type ExporterSpec = { url?: string; headers?: Record<string, string>; console?: true } | 'console' | 'none';

export interface TelemetryConfig {
    traceExporter?: ExporterSpec;
    metricExporter?: ExporterSpec;
    logExporter?: ExporterSpec;
    sampler?: SamplerSpec;
    instrumentations?: Instrumentation[];
    minimumSeverity?: SeverityNumber;
}

/** The resolved export choice for one signal. */
export type ResolvedExporter =
    | { kind: 'console' }
    | { kind: 'none' }
    | { kind: 'otlp'; url?: string; headers?: Record<string, string> };

/**
 * Resolves a per-signal exporter spec (AD-32 D-2/D-3). Pure — no providers
 * are touched — so the shape table is unit-testable in one process.
 * OTLP urls fail loud here (`new URL`), naming the signal in the error.
 */
export function resolveExporter(spec: ExporterSpec | undefined, signal: 'trace' | 'metric' | 'log'): ResolvedExporter {
    if (spec === undefined || spec === 'console' || (typeof spec === 'object' && spec.console === true)) {
        return { kind: 'console' };
    }
    if (spec === 'none') {
        return { kind: 'none' };
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
    resolved: Exclude<ResolvedExporter, { kind: 'none' }>,
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
 */
export function configureTelemetry(config: TelemetryConfig) {
    // Resolve/validate before any side effects or the once-per-process latch.
    const sampler = resolveSampler(config.sampler);
    const trace = resolveExporter(config.traceExporter, 'trace');
    const metric = resolveExporter(config.metricExporter, 'metric');
    const log = resolveExporter(config.logExporter, 'log');

    if (configured) {
        console.error(
            '[blue-telemetry-node] configureTelemetry called again — OpenTelemetry global providers are ' +
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

    // Metrics: the reader list is always explicit (as before).
    const metricReaders =
        metric.kind === 'none'
            ? []
            : [
                  new PeriodicExportingMetricReader({
                      exporter:
                          metric.kind === 'console'
                              ? new ConsoleMetricExporter()
                              : new OTLPMetricExporter({ url: metric.url, headers: metric.headers }),
                  }),
              ];

    const logRecordProcessors = log.kind === 'none' ? [] : [logRecordProcessorFor(log, config.minimumSeverity)];

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
