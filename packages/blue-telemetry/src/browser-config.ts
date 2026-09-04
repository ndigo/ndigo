/**
 * @author Jeff Rose
 */

import { metrics, DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { BasicTracerProvider, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { MeterProvider, PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import { LoggerProvider, SimpleLogRecordProcessor, ConsoleLogRecordExporter } from '@opentelemetry/sdk-logs';
import { LoggerFactory } from './logger/logger-factory';

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

    const resource = new Resource({
        'service.name': config.serviceName,
    });

    const tracerProvider = new BasicTracerProvider({ resource });
    if (config.useConsoleExporters !== false) {
        tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    }
    tracerProvider.register();

    const meterProvider = new MeterProvider({ resource });
    if (config.useConsoleExporters !== false) {
        meterProvider.addMetricReader(
            new PeriodicExportingMetricReader({
                exporter: new ConsoleMetricExporter(),
                exportIntervalMillis: 10000,
            })
        );
    }
    metrics.setGlobalMeterProvider(meterProvider);

    const loggerProvider = new LoggerProvider({ resource });
    if (config.useConsoleExporters !== false) {
        loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()));
    }
    logs.setGlobalLoggerProvider(loggerProvider);

    LoggerFactory.setType('open-telemetry');
    if (config.minimumSeverity !== undefined) {
        LoggerFactory.setThreshold(config.minimumSeverity);
    }
}
