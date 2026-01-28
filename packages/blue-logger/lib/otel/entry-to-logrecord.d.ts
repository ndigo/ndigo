/**
 * @author Jeff Rose
 */
import { Context } from '@opentelemetry/api';
import { LogRecord, LogAttributes } from '@opentelemetry/api-logs';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { Entry } from '../entry';
/**
 * Options for converting Entry to LogRecord
 */
export interface EntryToLogRecordOptions {
    /**
     * OpenTelemetry context to associate with the log record
     * If not provided, uses the active context
     */
    context?: Context;
    /**
     * Level scheme to use for severity mapping
     */
    scheme?: 'apache' | 'npm' | 'cli' | 'syslog';
    /**
     * Additional attributes to include in the log record
     */
    attributes?: LogAttributes;
    /**
     * Resource to associate with the log record
     */
    resource?: any;
    /**
     * Instrumentation scope
     */
    instrumentationScope?: {
        name: string;
        version?: string;
        schemaUrl?: string;
    };
}
/**
 * Convert a blue-logger Entry to an OpenTelemetry LogRecord
 *
 * @param entry - The Entry to convert
 * @param options - Conversion options
 * @returns A LogRecord compatible with OTel exporters
 *
 * @example
 * ```typescript
 * const entry = newEntry('app', ApacheLevel.ERROR, ['Something failed']);
 * const logRecord = entryToLogRecord(entry);
 * ```
 */
export declare function entryToLogRecord(entry: Entry, options?: EntryToLogRecordOptions): Partial<LogRecord>;
/**
 * Convert an OpenTelemetry ReadableLogRecord back to a blue-logger Entry
 *
 * This is primarily used for Layout compatibility - exporters that need to use
 * blue-logger's Layout system can convert LogRecords back to Entries for formatting.
 *
 * @param record - The ReadableLogRecord to convert
 * @returns A blue-logger Entry
 *
 * @example
 * ```typescript
 * const entry = logRecordToEntry(record);
 * const formatted = layout.format(entry);
 * ```
 */
export declare function logRecordToEntry(record: ReadableLogRecord): Entry;
/**
 * Extract trace context from an Entry's attributes
 *
 * @param entry - The Entry to extract trace context from
 * @returns Trace context object or undefined
 */
export declare function extractTraceContext(entry: Entry): {
    traceId?: string;
    spanId?: string;
    traceFlags?: number;
} | undefined;
/**
 * Inject trace context into a LogRecord from the current active span
 *
 * @param logRecord - The LogRecord to inject trace context into
 * @param context - Optional context to use (defaults to active context)
 */
export declare function injectTraceContext(logRecord: Partial<LogRecord>, context?: Context): void;
//# sourceMappingURL=entry-to-logrecord.d.ts.map