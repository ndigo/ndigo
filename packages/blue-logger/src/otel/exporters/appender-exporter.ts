/**
 * @author Jeff Rose
 */

import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { Appender, AsyncAppender, BatchAppender } from '../../appender';
import { logRecordToEntry } from '../entry-to-logrecord';
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
export class AppenderLogRecordExporter implements LogRecordExporter {
    private appender: Appender;
    private layout?: Layout;

    constructor(appender: Appender, layout?: Layout) {
        this.appender = appender;
        this.layout = layout;

        // If a custom layout is provided, override the appender's layout
        if (layout) {
            this.appender.layout = layout;
        }
    }

    /**
     * Export log records by converting them to Entries and passing to the Appender
     *
     * @param logs - Array of log records to export
     * @param resultCallback - Callback to invoke with export result
     */
    export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void {
        try {
            // Check if appender is async
            const isAsync = this.isAsyncAppender(this.appender);

            if (isAsync) {
                this.exportAsync(logs as ReadableLogRecord[], resultCallback);
            } else {
                this.exportSync(logs, resultCallback);
            }
        } catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }

    /**
     * Synchronous export for regular appenders
     */
    private exportSync(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void {
        try {
            for (const log of logs) {
                const entry = logRecordToEntry(log);
                this.appender.append(entry);
            }

            resultCallback({ code: ExportResultCode.SUCCESS });
        } catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }

    /**
     * Asynchronous export for async appenders
     */
    private async exportAsync(
        logs: ReadableLogRecord[],
        resultCallback: (result: ExportResult) => void
    ): Promise<void> {
        try {
            const asyncAppender = this.appender as AsyncAppender;

            for (const log of logs) {
                const entry = logRecordToEntry(log);
                await asyncAppender.append(entry);
            }

            resultCallback({ code: ExportResultCode.SUCCESS });
        } catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }

    /**
     * Type guard to check if appender is async
     */
    private isAsyncAppender(appender: Appender): appender is AsyncAppender {
        const appendMethod = (appender as any).append;
        return appendMethod && appendMethod.constructor.name === 'AsyncFunction';
    }

    /**
     * Shutdown the exporter
     */
    async shutdown(): Promise<void> {
        // Appenders don't have a shutdown method, but we can check for cleanup
        if (typeof (this.appender as any).shutdown === 'function') {
            await (this.appender as any).shutdown();
        }
    }

    /**
     * Force flush any pending records
     */
    async forceFlush(): Promise<void> {
        // For batch appenders, we might want to flush the batch
        if (this.isBatchAppender(this.appender)) {
            const batchAppender = this.appender as any; // Use 'any' to access internal entries array
            // Flush any remaining entries in the batch
            if (batchAppender.entries && Array.isArray(batchAppender.entries) && batchAppender.entries.length > 0) {
                const entries = [...batchAppender.entries];
                batchAppender.entries.length = 0;
                if (typeof batchAppender.appendBatch === 'function') {
                    batchAppender.appendBatch(entries);
                }
            }
        }
    }

    /**
     * Type guard to check if appender is a batch appender
     */
    private isBatchAppender(appender: Appender): appender is BatchAppender {
        return 'batchSize' in appender && typeof (appender as any).appendBatch === 'function';
    }

    /**
     * Get the wrapped appender
     */
    getAppender(): Appender {
        return this.appender;
    }

    /**
     * Get the layout being used
     */
    getLayout(): Layout | undefined {
        return this.layout || this.appender.layout;
    }
}
