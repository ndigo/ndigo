/**
 * @author Jeff Rose
 */

import { Context, context as apiContext, HrTime } from '@opentelemetry/api';
import { LogRecord, LogAttributes } from '@opentelemetry/api-logs';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { trace } from '@opentelemetry/api';
import { Entry, loggable, newEntry } from '../entry';
import { Level } from '../level';
import { levelToSeverity, severityToLevel } from './level-mapping';

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
 * Convert a millisecond timestamp to HrTime format [seconds, nanoseconds]
 */
function millisToHrTime(millis: number): HrTime {
    const seconds = Math.trunc(millis / 1000);
    const nanos = (millis % 1000) * 1e6;
    return [seconds, nanos];
}

/**
 * Convert HrTime format to milliseconds
 */
function hrTimeToMillis(hrTime: HrTime): number {
    return hrTime[0] * 1000 + hrTime[1] / 1e6;
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
export function entryToLogRecord(entry: Entry, options: EntryToLogRecordOptions = {}): Partial<LogRecord> {
    const {
        context = apiContext.active(),
        scheme = 'apache',
        attributes: additionalAttributes = {},
        resource,
        instrumentationScope,
    } = options;

    const severity = levelToSeverity(entry.level, scheme);

    // Build attributes
    const attributes: LogAttributes = {
        'blue.logger.category': entry.category,
        ...additionalAttributes,
    };

    // Add source if present
    if (entry.source) {
        attributes['blue.logger.source'] = entry.source;
    }

    // Add error flag if present
    if (entry.error) {
        attributes['blue.logger.error'] = true;
    }

    // Extract span context for trace correlation
    const span = trace.getSpan(context);
    if (span) {
        const spanContext = span.spanContext();
        if (spanContext.traceId) {
            attributes['trace_id'] = spanContext.traceId;
        }
        if (spanContext.spanId) {
            attributes['span_id'] = spanContext.spanId;
        }
        if (spanContext.traceFlags !== undefined) {
            attributes['trace_flags'] = spanContext.traceFlags;
        }
    }

    // Handle Error objects in message
    const errorObj = entry.message.find((msg) => msg instanceof Error) as Error | undefined;
    if (errorObj) {
        attributes['exception.type'] = errorObj.name;
        attributes['exception.message'] = errorObj.message;
        if (errorObj.stack) {
            attributes['exception.stacktrace'] = errorObj.stack;
        }
    }

    // Format message body - join all loggable items
    const body = entry.message
        .map((msg) => {
            if (msg instanceof Error) {
                return `${msg.name}: ${msg.message}`;
            }
            if (typeof msg === 'object') {
                try {
                    return JSON.stringify(msg);
                } catch {
                    return String(msg);
                }
            }
            return String(msg);
        })
        .join(' ');

    const logRecord: Partial<LogRecord> = {
        timestamp: entry.timestamp,
        observedTimestamp: Date.now(),
        severityNumber: severity.severityNumber,
        severityText: severity.severityText,
        body,
        attributes,
    };

    // Add resource if provided
    if (resource) {
        (logRecord as any).resource = resource;
    }

    // Add instrumentation scope if provided
    if (instrumentationScope) {
        (logRecord as any).instrumentationScope = instrumentationScope;
    }

    return logRecord;
}

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
export function logRecordToEntry(record: ReadableLogRecord): Entry {
    const attributes = record.attributes || {};

    // Extract category from attributes (or use default)
    const category = (attributes['blue.logger.category'] as string) || 'default';

    // Extract source if present
    const source = attributes['blue.logger.source'] as string | undefined;

    // Convert severity back to Level
    const level = severityToLevel(record.severityNumber, record.severityText);

    // Parse body back to message array
    const body = record.body;
    let message: loggable[];

    // Check if there's an exception in attributes
    const exceptionType = attributes['exception.type'] as string | undefined;
    const exceptionMessage = attributes['exception.message'] as string | undefined;
    const exceptionStack = attributes['exception.stacktrace'] as string | undefined;

    if (exceptionType && exceptionMessage) {
        // Reconstruct Error object
        const error = new Error(exceptionMessage);
        error.name = exceptionType;
        if (exceptionStack) {
            error.stack = exceptionStack;
        }
        message = [error];

        // If body has additional text beyond the error, include it
        const errorString = `${exceptionType}: ${exceptionMessage}`;
        if (typeof body === 'string' && body !== errorString && body.length > errorString.length) {
            const additionalText = body.slice(errorString.length).trim();
            if (additionalText) {
                message.push(additionalText);
            }
        }
    } else {
        // No error, just convert body to message
        if (typeof body === 'string') {
            message = [body];
        } else if (typeof body === 'object' && body !== null) {
            message = [body];
        } else {
            message = [String(body)];
        }
    }

    // Use the original timestamp from the record (convert HrTime to milliseconds if needed)
    const timestamp = record.hrTime ? hrTimeToMillis(record.hrTime) : Date.now();

    return {
        category,
        level,
        message,
        source,
        error: attributes['blue.logger.error'] === true,
        timestamp,
    };
}

/**
 * Extract trace context from an Entry's attributes
 *
 * @param entry - The Entry to extract trace context from
 * @returns Trace context object or undefined
 */
export function extractTraceContext(
    entry: Entry
): { traceId?: string; spanId?: string; traceFlags?: number } | undefined {
    // This would require extending Entry type to include attributes
    // For now, return undefined - trace context is added during conversion
    return undefined;
}

/**
 * Inject trace context into a LogRecord from the current active span
 *
 * @param logRecord - The LogRecord to inject trace context into
 * @param context - Optional context to use (defaults to active context)
 */
export function injectTraceContext(logRecord: Partial<LogRecord>, context?: Context): void {
    const ctx = context || apiContext.active();
    const span = trace.getSpan(ctx);

    if (span) {
        const spanContext = span.spanContext();
        const attributes = (logRecord.attributes || {}) as LogAttributes;

        if (spanContext.traceId) {
            attributes['trace_id'] = spanContext.traceId;
        }
        if (spanContext.spanId) {
            attributes['span_id'] = spanContext.spanId;
        }
        if (spanContext.traceFlags !== undefined) {
            attributes['trace_flags'] = spanContext.traceFlags;
        }

        logRecord.attributes = attributes;
    }
}
