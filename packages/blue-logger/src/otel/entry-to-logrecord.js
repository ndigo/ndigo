/**
 * @author Jeff Rose
 */
import { context as apiContext } from '@opentelemetry/api';
import { trace } from '@opentelemetry/api';
import { levelToSeverity, severityToLevel } from './level-mapping';
/**
 * Convert a millisecond timestamp to HrTime format [seconds, nanoseconds]
 */
function millisToHrTime(millis) {
    const seconds = Math.trunc(millis / 1000);
    const nanos = (millis % 1000) * 1e6;
    return [seconds, nanos];
}
/**
 * Convert HrTime format to milliseconds
 */
function hrTimeToMillis(hrTime) {
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
export function entryToLogRecord(entry, options = {}) {
    const { context = apiContext.active(), scheme = 'apache', attributes: additionalAttributes = {}, resource, instrumentationScope, } = options;
    const severity = levelToSeverity(entry.level, scheme);
    // Build attributes
    const attributes = {
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
    const errorObj = entry.message.find((msg) => msg instanceof Error);
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
            }
            catch {
                return String(msg);
            }
        }
        return String(msg);
    })
        .join(' ');
    const logRecord = {
        timestamp: entry.timestamp,
        observedTimestamp: Date.now(),
        severityNumber: severity.severityNumber,
        severityText: severity.severityText,
        body,
        attributes,
    };
    // Add resource if provided
    if (resource) {
        logRecord.resource = resource;
    }
    // Add instrumentation scope if provided
    if (instrumentationScope) {
        logRecord.instrumentationScope = instrumentationScope;
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
export function logRecordToEntry(record) {
    const attributes = record.attributes || {};
    // Extract category from attributes (or use default)
    const category = attributes['blue.logger.category'] || 'default';
    // Extract source if present
    const source = attributes['blue.logger.source'];
    // Convert severity back to Level
    const level = severityToLevel(record.severityNumber, record.severityText);
    // Parse body back to message array
    const body = record.body;
    let message;
    // Check if there's an exception in attributes
    const exceptionType = attributes['exception.type'];
    const exceptionMessage = attributes['exception.message'];
    const exceptionStack = attributes['exception.stacktrace'];
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
    }
    else {
        // No error, just convert body to message
        if (typeof body === 'string') {
            message = [body];
        }
        else if (typeof body === 'object' && body !== null) {
            message = [body];
        }
        else {
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
export function extractTraceContext(entry) {
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
export function injectTraceContext(logRecord, context) {
    const ctx = context || apiContext.active();
    const span = trace.getSpan(ctx);
    if (span) {
        const spanContext = span.spanContext();
        const attributes = (logRecord.attributes || {});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnktdG8tbG9ncmVjb3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZW50cnktdG8tbG9ncmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFXLE9BQU8sSUFBSSxVQUFVLEVBQVUsTUFBTSxvQkFBb0IsQ0FBQztBQUc1RSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQXFDbkU7O0dBRUc7QUFDSCxTQUFTLGNBQWMsQ0FBQyxNQUFjO0lBQ2xDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzFDLE1BQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUNwQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsY0FBYyxDQUFDLE1BQWM7SUFDbEMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDOUMsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxLQUFZLEVBQUUsVUFBbUMsRUFBRTtJQUNoRixNQUFNLEVBQ0YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFDN0IsTUFBTSxHQUFHLFFBQVEsRUFDakIsVUFBVSxFQUFFLG9CQUFvQixHQUFHLEVBQUUsRUFDckMsUUFBUSxFQUNSLG9CQUFvQixHQUN2QixHQUFHLE9BQU8sQ0FBQztJQUVaLE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFD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