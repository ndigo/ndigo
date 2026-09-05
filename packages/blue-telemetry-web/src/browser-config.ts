import { metrics, trace, DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { BasicTracerProvider, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { MeterProvider, PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import { LoggerProvider, SimpleLogRecordProcessor, ConsoleLogRecordExporter } from '@opentelemetry/sdk-logs';
import { LoggerFactory } from '@blue/telemetry';

export interface BrowserTelemetryConfig {
    serviceName: string;
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

    // OpenTelemetry SDK 2.x: processors/readers are constructor options and
    // global registration uses the API registry (providers no longer self-register).
    const tracerProvider = new BasicTracerProvider({
        resource,
        spanProcessors:
            config.useConsoleExporters === false ? [] : [new SimpleSpanProcessor(new ConsoleSpanExporter())],
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
