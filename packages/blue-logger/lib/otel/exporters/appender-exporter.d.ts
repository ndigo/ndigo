/**
 * @author Jeff Rose
 */
import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult } from '@opentelemetry/core';
import { Appender } from '../../appender';
import { Layout } from '../../layout';
/**
 * AppenderLogRecordExporter wraps a blue-logger Appender as an OpenTelemetry LogRecordExporter.
 *
 * This adapter allows existing Appenders to work with the new OTel architecture,
 * providing a smooth migration path.
 *
 * @example
 * ```typescript
 * import { ConsoleAppender } from '@blue/logger';
 * import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
 *
 * const appender = new ConsoleAppender();
 * const exporter = new AppenderLogRecordExporter(appender);
 * const processor = new SimpleLogRecordProcessor(exporter);
 * ```
 */
export declare class AppenderLogRecordExporter implements LogRecordExporter {
    private appender;
    private layout?;
    constructor(appender: Appender, layout?: Layout);
    /**
     * Export log records by converting them to Entries and passing to the Appender
     *
     * @param logs - Array of log records to export
     * @param resultCallback - Callback to invoke with export result
     */
    export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void;
    /**
     * Synchronous export for regular appenders
     */
    private exportSync;
    /**
     * Asynchronous export for async appenders
     */
    private exportAsync;
    /**
     * Type guard to check if appender is async
     */
    private isAsyncAppender;
    /**
     * Shutdown the exporter
     */
    shutdown(): Promise<void>;
    /**
     * Force flush any pending records
     */
    forceFlush(): Promise<void>;
    /**
     * Type guard to check if appender is a batch appender
     */
    private isBatchAppender;
    /**
     * Get the wrapped appender
     */
    getAppender(): Appender;
    /**
     * Get the layout being used
     */
    getLayout(): Layout | undefined;
}
//# sourceMappingURL=appender-exporter.d.ts.map