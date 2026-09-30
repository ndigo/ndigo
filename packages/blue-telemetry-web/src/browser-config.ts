/**
 * @module blue-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { metrics, trace, DiagConsoleLogger, DiagLogLevel, diag, propagation } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { BasicTracerProvider, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { MeterProvider, PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import { LoggerProvider, SimpleLogRecordProcessor, ConsoleLogRecordExporter } from '@opentelemetry/sdk-logs';
import { LoggerFactory } from '@blue/telemetry';

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
     * solely by this flag and remain console-only.
     */
    useConsoleExporters?: boolean;
    minimumSeverity?: SeverityNumber;
    enableDiagnostics?: boolean;
}

export function configureBrowserTelemetry(config: BrowserTelemetryConfig): void {
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
    const traceProcessors: SimpleSpanProcessor[] = spanExportEnabled
        ? [
              new SimpleSpanProcessor(
                  config.traceUrl ? new OTLPTraceExporter({ url: config.traceUrl }) : new ConsoleSpanExporter()
              ),
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

    LoggerFactory.setType('open-telemetry');
    if (config.minimumSeverity !== undefined) {
        LoggerFactory.setThreshold(config.minimumSeverity);
    }
}
