/**
 * @author Jeff Rose
 */
import { ExportResultCode } from '@opentelemetry/core';
import { logRecordToEntry } from '../entry-to-logrecord';
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
export class AppenderLogRecordExporter {
    appender;
    layout;
    constructor(appender, layout) {
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
    export(logs, resultCallback) {
        try {
            // Check if appender is async
            const isAsync = this.isAsyncAppender(this.appender);
            if (isAsync) {
                this.exportAsync(logs, resultCallback);
            }
            else {
                this.exportSync(logs, resultCallback);
            }
        }
        catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }
    /**
     * Synchronous export for regular appenders
     */
    exportSync(logs, resultCallback) {
        try {
            for (const log of logs) {
                const entry = logRecordToEntry(log);
                this.appender.append(entry);
            }
            resultCallback({ code: ExportResultCode.SUCCESS });
        }
        catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }
    /**
     * Asynchronous export for async appenders
     */
    async exportAsync(logs, resultCallback) {
        try {
            const asyncAppender = this.appender;
            for (const log of logs) {
                const entry = logRecordToEntry(log);
                await asyncAppender.append(entry);
            }
            resultCallback({ code: ExportResultCode.SUCCESS });
        }
        catch (error) {
            resultCallback({
                code: ExportResultCode.FAILED,
                error: error instanceof Error ? error : new Error(String(error)),
            });
        }
    }
    /**
     * Type guard to check if appender is async
     */
    isAsyncAppender(appender) {
        const appendMethod = appender.append;
        return appendMethod && appendMethod.constructor.name === 'AsyncFunction';
    }
    /**
     * Shutdown the exporter
     */
    async shutdown() {
        // Appenders don't have a shutdown method, but we can check for cleanup
        if (typeof this.appender.shutdown === 'function') {
            await this.appender.shutdown();
        }
    }
    /**
     * Force flush any pending records
     */
    async forceFlush() {
        // For batch appenders, we might want to flush the batch
        if (this.isBatchAppender(this.appender)) {
            const batchAppender = this.appender; // Use 'any' to access internal entries array
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
    isBatchAppender(appender) {
        return 'batchSize' in appender && typeof appender.appendBatch === 'function';
    }
    /**
     * Get the wrapped appender
     */
    getAppender() {
        return this.appender;
    }
    /**
     * Get the layout being used
     */
    getLayout() {
        return this.layout || this.appender.layout;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwZW5kZXItZXhwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb3RlbC9leHBvcnRlcnMvYXBwZW5kZXItZXhwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQWdCLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFckUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFHekQ7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxPQUFPLHlCQUF5QjtJQUMxQixRQUFRLENBQVc7SUFDbkIsTUFBTSxDQUFVO0lBRXhCLFlBQVksUUFBa0IsRUFBRSxNQUFlO1FBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLGlFQUFpRTtRQUNqRSxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBeUIsRUFBRSxjQUE4QztRQUM1RSxJQUFJLENBQUM7WUFDRCw2QkFBNkI7WUFDN0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFcEQsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDVixJQUFJLENBQUMsV0FBVyxDQUFDLElBQTJCLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbEUsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzFDLENBQUM7UUFDTCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLGNBQWMsQ0FBQztnQkFDWCxJQUFJLEVBQUUsZ0JB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