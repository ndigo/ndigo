/**
 * Browser telemetry bootstrap: global OTel providers, console/OTLP gating,
 * once-per-process idempotency, and flush-on-unload.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { metrics, trace, DiagConsoleLogger, DiagLogLevel, diag, propagation } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import {
    BasicTracerProvider,
    SimpleSpanProcessor,
    BatchSpanProcessor,
    ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { MeterProvider, PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import { LoggerProvider, SimpleLogRecordProcessor, ConsoleLogRecordExporter } from '@opentelemetry/sdk-logs';
import { getLogger } from '@ndigo/log';
import { LoggerFactory } from '@ndigo/telemetry';

const logger = getLogger('ndigo-telemetry-web:browser-config');

/**
 * Browser telemetry configuration: the service name reported on every signal,
 * an optional OTLP/HTTP `traceUrl`, and `useConsoleExporters` to silence the
 * console exporters in production.
 */
export interface BrowserTelemetryConfig {
    serviceName: string;
    /**
     * OTLP/HTTP trace endpoint (e.g. a local OpenTelemetry Collector:
     * `http://localhost:4318/v1/traces`). When set, spans are exported
     * there; otherwise the console exporter is used (dev posture).
     * A configured `traceUrl` always enables trace export, even when
     * `useConsoleExporters` is `false`.
     */
    traceUrl?: string;
    /**
     * When `false`, disables the console exporters. This is NOT a global
     * "export off" switch: a configured `traceUrl` still exports spans over
     * OTLP/HTTP regardless of this flag (console and OTLP are independent).
     * No OTLP targets exist for metrics or logs, so those signals are gated
     * solely by this flag and remain console-only — and, with `false`, the
     * log pipeline is disabled entirely, so application logs are **not**
     * routed through OpenTelemetry (they stay on the console bridge).
     */
    useConsoleExporters?: boolean;
    minimumSeverity?: SeverityNumber;
    enableDiagnostics?: boolean;
}

/**
 * Handle returned by {@link configureBrowserTelemetry} — explicit lifecycle
 * for hosts that own the page (SPAs, tests).
 */
export interface BrowserTelemetryHandle {
    /** Flush pending spans/metrics/logs without shutting the providers down. */
    forceFlush(): Promise<void>;
    /** Remove the unload listeners and shut the providers down. */
    shutdown(): Promise<void>;
}

/**
 * The tracer provider registered by the last successful
 * {@link configureBrowserTelemetry} call. The idempotency latch keys off the
 * *live* global provider: a genuine second configure (global provider still
 * ours) is ignored, while a reconfigure after an explicit `trace.disable()`
 * (tests, host teardown) proceeds. OTel itself ignores later global
 * registrations, so without this the second call would half-configure.
 */
let activeTracerProvider: BasicTracerProvider | undefined;
let activeHandle: BrowserTelemetryHandle | undefined;
/** Detaches the `pagehide`/`visibilitychange` force-flush listeners. */
let detachUnloadListeners: (() => void) | undefined;

/**
 * Registers unload listeners that best-effort flush pending telemetry when
 * the page is hidden or torn down — batched spans otherwise vanish with the
 * tab (TEL-05). No-op outside a DOM (SSR / tests without jsdom).
 *
 * @param forceFlush - The flush routine to invoke on unload.
 * @returns A detach function removing both listeners.
 */
function registerUnloadFlush(forceFlush: () => Promise<void>): () => void {
    // Unload flush is best-effort: a rejecting provider (already shut down)
    // must not surface an unhandled rejection during teardown.
    const flush = (): void => {
        void forceFlush().catch(() => undefined);
    };
    const onPageHide = (): void => flush();
    const onVisibilityChange = (): void => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            flush();
        }
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('pagehide', onPageHide);
    }
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVisibilityChange);
    }
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('pagehide', onPageHide);
        }
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', onVisibilityChange);
        }
    };
}

/**
 * The tracer provider currently registered with the OTel API. The API wraps
 * the registered provider in a `ProxyTracerProvider`, so `getTracerProvider()`
 * is never reference-equal to what we set — resolve the delegate instead.
 *
 * @returns The live registered provider, or `undefined` when it is the
 *   API's Noop/default provider.
 */
function currentTracerProvider(): unknown {
    // The API's `TracerProvider` type does not expose `getDelegate`; the
    // concrete `ProxyTracerProvider` does. Widen through `unknown` (the
    // surface types have no overlap to assert directly).
    const provider = trace.getTracerProvider() as unknown as { getDelegate?: () => unknown };
    return typeof provider.getDelegate === 'function' ? provider.getDelegate() : provider;
}

/**
 * Configures the global OpenTelemetry providers for a browser process.
 *
 * Idempotent: OTel's global providers register once per process, so a repeat
 * call while the configured providers are still live warns and returns the
 * existing handle (TEL-05). The returned handle flushes stashed telemetry
 * and tears the providers down.
 *
 * @param config - Service identity, exporter gating, and diagnostics options.
 * @returns The telemetry lifecycle handle.
 */
export function configureBrowserTelemetry(config: BrowserTelemetryConfig): BrowserTelemetryHandle {
    if (activeTracerProvider !== undefined && currentTracerProvider() === activeTracerProvider) {
        logger.error(
            '[ndigo-telemetry-web] configureBrowserTelemetry called again — OpenTelemetry global providers are ' +
                'registered once per process and the first call wins; this call is being ignored.'
        );
        return activeHandle as BrowserTelemetryHandle;
    }

    // Reconfigure after an explicit `trace.disable()` (tests, host teardown):
    // retire the previous providers so their export timers/listeners stop,
    // then drop any stale unload listeners so they cannot flush a dead
    // provider.
    detachUnloadListeners?.();
    detachUnloadListeners = undefined;
    const previous = activeHandle;
    activeHandle = undefined;
    activeTracerProvider = undefined;
    if (previous !== undefined) {
        // Best-effort: a host may call configure again while the old providers
        // wind down.
        void previous.shutdown().catch(() => undefined);
    }

    if (config.enableDiagnostics) {
        diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }

    const resource = resourceFromAttributes({
        'service.name': config.serviceName,
    });

    // Distributed tracing (browser→server journey): W3C trace context is the
    // wire protocol — the TraceHeaderInterceptor injects it into outgoing
    // requests; the server instrumentation continues the trace.
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());

    // OpenTelemetry SDK 2.x: processors/readers are constructor options and
    // global registration uses the API registry (providers no longer self-register).
    // Console exporters are gated by `useConsoleExporters`, but OTLP trace
    // export is independent: a configured `traceUrl` always exports spans.
    const spanExportEnabled = config.useConsoleExporters !== false || config.traceUrl !== undefined;
    // OTLP spans are batched — one POST per flush window instead of one per
    // span (OP-14). Console stays on the SimpleSpanProcessor so dev spans
    // appear immediately.
    const traceProcessors: SpanProcessor[] = spanExportEnabled
        ? [
              config.traceUrl
                  ? new BatchSpanProcessor(new OTLPTraceExporter({ url: config.traceUrl }))
                  : new SimpleSpanProcessor(new ConsoleSpanExporter()),
          ]
        : [];
    const tracerProvider = new BasicTracerProvider({
        resource,
        spanProcessors: traceProcessors,
    });
    trace.setGlobalTracerProvider(tracerProvider);

    const meterProvider = new MeterProvider({
        resource,
        readers:
            config.useConsoleExporters === false
                ? []
                : [
                      new PeriodicExportingMetricReader({
                          exporter: new ConsoleMetricExporter(),
                          exportIntervalMillis: 10000,
                      }),
                  ],
    });
    metrics.setGlobalMeterProvider(meterProvider);

    const loggerProvider = new LoggerProvider({
        resource,
        processors:
            config.useConsoleExporters === false
                ? []
                : [new SimpleLogRecordProcessor({ exporter: new ConsoleLogRecordExporter() })],
    });
    logs.setGlobalLoggerProvider(loggerProvider);

    // Only switch the log factory when a log pipeline actually exists: with
    // `useConsoleExporters: false` the browser has no exporter, so routing
    // application logs through OTel would strand every record in a disabled
    // provider (TEL-04). Mirrors the node gate (`logExporter !== none`).
    if (config.useConsoleExporters !== false) {
        LoggerFactory.setType('open-telemetry');
    }
    if (config.minimumSeverity !== undefined) {
        LoggerFactory.setThreshold(config.minimumSeverity);
    }

    const forceFlush = async (): Promise<void> => {
        await Promise.all([tracerProvider.forceFlush(), meterProvider.forceFlush(), loggerProvider.forceFlush()]);
    };
    const shutdown = async (): Promise<void> => {
        detachUnloadListeners?.();
        detachUnloadListeners = undefined;
        // Clear the latch so a later configure (host restart, tests) can
        // register fresh providers instead of warning against the dead one.
        activeTracerProvider = undefined;
        activeHandle = undefined;
        await Promise.all([tracerProvider.shutdown(), meterProvider.shutdown(), loggerProvider.shutdown()]);
    };

    const handle: BrowserTelemetryHandle = { forceFlush, shutdown };
    activeTracerProvider = tracerProvider;
    activeHandle = handle;
    detachUnloadListeners = registerUnloadFlush(forceFlush);

    return handle;
}
