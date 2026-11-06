/**
 */
import { Exception } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { SeverityScheme } from '../severity/index.js';
import { LogAttributes } from './logger.js';

/**
 * Represents a single log entry with structured information.
 * This interface defines the common properties expected for a log record,
 * including severity, message body, attributes, and optional OpenTelemetry trace context.
 */
export interface LogEntry {
    /**
     * The name of the logger that emitted this entry.
     */
    name: string;
    /**
     * The numerical representation of the log entry's severity.
     */
    severityNumber: SeverityNumber;
    /**
     * The textual representation of the log entry's severity (e.g., "INFO", "ERROR").
     */
    severityText: string;
    /**
     * The main message body of the log entry.
     */
    body: string;
    /**
     * Optional. Additional attributes providing context for the log entry.
     */
    attributes?: LogAttributes;
    /**
     * Optional. The Unix timestamp (in milliseconds) when the log entry was created.
     * If not provided, the current time will be used by the logging system.
     */
    timestamp?: number;
    /**
     * Optional. An `Exception` object associated with the log entry, if applicable.
     */
    error?: Exception;
    /**
     * Optional. The OpenTelemetry trace ID associated with the log entry.
     */
    traceId?: string;
    /**
     * Optional. The OpenTelemetry span ID associated with the log entry.
     */
    spanId?: string;
    /**
     * Optional. The severity scheme used to interpret `severityNumber` and `severityText`.
     */
    severityScheme?: SeverityScheme;
}
