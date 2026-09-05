import { SeverityNumber } from '@opentelemetry/api-logs';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { SeverityFilterLogRecordProcessor } from './severity-filter-log-record-processor';

export interface TelemetryConfig {
    traceExporter?: {
        url: string;
    };
    metricExporter?: {
        url: string;
    };
    logExporter?: {
        url: string;
    };
    instrumentations?: Instrumentation[];
    minimumSeverity?: SeverityNumber;
}

export function configureTelemetry(config: TelemetryConfig) {
    const logExporter =
        config.logExporter?.url === undefined
            ? undefined
            : new OTLPLogExporter({
                  url: config.logExporter.url,
              });

    const logRecordProcessor = logExporter ? new BatchLogRecordProcessor({ exporter: logExporter }) : undefined;

    const filteredLogRecordProcessor =
        logRecordProcessor === undefined || config.minimumSeverity === undefined
            ? logRecordProcessor
            : new SeverityFilterLogRecordProcessor(logRecordProcessor, config.minimumSeverity);

    const sdk = new NodeSDK({
        traceExporter: new OTLPTraceExporter({
            url: config.traceExporter?.url,
        }),
        metricReader: new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter({
                url: config.metricExporter?.url,
            }),
        }),
        ...(filteredLogRecordProcessor ? { logRecordProcessors: [filteredLogRecordProcessor] } : {}),
        instrumentations: config.instrumentations ?? [],
    });

    sdk.start();

    return sdk;
}
