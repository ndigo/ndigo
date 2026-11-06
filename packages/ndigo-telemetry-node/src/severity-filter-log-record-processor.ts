/**
 */
import { Context } from '@opentelemetry/api';
import { LogRecordProcessor, type ReadWriteLogRecord } from '@opentelemetry/sdk-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';

/**
 * A `LogRecordProcessor` that filters log records based on their severity number.
 *
 * This processor wraps another `LogRecordProcessor` and only passes log records
 * to the delegate if their severity number meets or exceeds a configured minimum severity.
 */
export class SeverityFilterLogRecordProcessor implements LogRecordProcessor {
    readonly #minimumSeverity: SeverityNumber;
    readonly #delegate: LogRecordProcessor;

    /**
     * Creates an instance of `SeverityFilterLogRecordProcessor`.
     * @param delegate - The underlying `LogRecordProcessor` to which filtered log records will be passed.
     * @param minimumSeverity - The minimum `SeverityNumber` required for a log record to be processed.
     *                          Defaults to `SeverityNumber.UNSPECIFIED`, meaning all records are processed.
     */
    constructor(delegate: LogRecordProcessor, minimumSeverity: SeverityNumber = SeverityNumber.UNSPECIFIED) {
        this.#delegate = delegate;
        this.#minimumSeverity = minimumSeverity;
    }

    /**
     * Processes a `LogRecord`. If the log record's severity meets the minimum threshold,
     * it is passed to the delegate processor. Otherwise, it is dropped.
     * @param logRecord - The `ReadWriteLogRecord` to process.
     * @param context - Optional. The OpenTelemetry `Context` associated with the log record.
     */
    onEmit(logRecord: ReadWriteLogRecord, context?: Context): void {
        if ((logRecord.severityNumber ?? SeverityNumber.UNSPECIFIED) < this.#minimumSeverity) {
            return;
        }

        this.#delegate.onEmit(logRecord, context);
    }

    /**
     * Forces the flushing of any buffered log records by delegating to the wrapped processor.
     * @returns A promise that resolves when the flush operation is complete.
     */
    forceFlush(): Promise<void> {
        return this.#delegate.forceFlush();
    }

    /**
     * Shuts down the processor by delegating to the wrapped processor.
     * @returns A promise that resolves when the shutdown operation is complete.
     */
    shutdown(): Promise<void> {
        return this.#delegate.shutdown();
    }
}
