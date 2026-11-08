/**
 * The logger contract and log attribute types.
 */
import { Attributes, Exception } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';

/**
 * Represents a collection of attributes to be associated with a log entry.
 * These attributes provide additional context and metadata for the log.
 */
export type LogAttributes = Attributes;

/**
 * Defines the interface for a logger that supports different severity levels and structured logging.
 *
 * Implementations of this interface are responsible for processing and emitting log entries,
 * potentially integrating with OpenTelemetry logging systems.
 */
export interface Logger {
    /**
     * The minimum severity level for log messages to be processed by this logger.
     * Messages with a severity lower than this threshold will be ignored.
     */
    readonly threshold: SeverityNumber;

    /**
     * Sets the minimum severity level for log messages.
     * @param threshold - The new minimum `SeverityNumber`.
     */
    setThreshold(threshold: SeverityNumber): void;

    /**
     * Checks if logging is enabled for a given severity number.
     * @param severityNumber - The `SeverityNumber` to check.
     * @returns `true` if logging is enabled for the specified severity, `false` otherwise.
     */
    isEnabled(severityNumber: SeverityNumber): boolean;

    /**
     * Logs a message with `DEBUG` severity.
     * @param message - The log message.
     * @param attributes - Optional attributes to associate with the log entry.
     */
    debug(message: string, attributes?: LogAttributes): void;

    /**
     * Logs a message with `INFO` severity.
     * @param message - The log message.
     * @param attributes - Optional attributes to associate with the log entry.
     */
    info(message: string, attributes?: LogAttributes): void;

    /**
     * Logs a message with `WARN` severity.
     * @param message - The log message.
     * @param attributes - Optional attributes to associate with the log entry.
     */
    warn(message: string, attributes?: LogAttributes): void;

    /**
     * Logs a message with `ERROR` severity.
     * @param message - The log message.
     * @param error - Optional. An `Exception` object to associate with the log entry.
     * @param attributes - Optional attributes to associate with the log entry.
     */
    error(message: string, error?: Exception, attributes?: LogAttributes): void;
}
