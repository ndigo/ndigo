/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { context, trace, Exception } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { LogAttributes, Logger } from './logger.js';

/**
 * A decorator logger that automatically injects OpenTelemetry trace and span IDs into log attributes
 * if an active span is present in the current context.
 *
 * This logger wraps an existing `Logger` instance and enhances its logging methods
 * by adding `traceId` and `spanId` to the `LogAttributes` before passing them to the wrapped logger.
 */
export class ContextAwareLogger implements Logger {
    /**
     * Creates an instance of `ContextAwareLogger`.
     * @param logger - The underlying `Logger` instance to wrap.
     */
    constructor(private readonly logger: Logger) {}

    /**
     * Gets the minimum severity level for log messages, delegated to the wrapped logger.
     */
    get threshold(): SeverityNumber {
        return this.logger.threshold;
    }

    /**
     * Sets the minimum severity level for log messages, delegated to the wrapped logger.
     * @param threshold - The new minimum `SeverityNumber`.
     */
    setThreshold(threshold: SeverityNumber): void {
        this.logger.setThreshold(threshold);
    }

    /**
     * Checks if logging is enabled for a given severity number, delegated to the wrapped logger.
     * @param severityNumber - The `SeverityNumber` to check.
     * @returns `true` if logging is enabled for the specified severity, `false` otherwise.
     */
    isEnabled(severityNumber: SeverityNumber): boolean {
        return this.logger.isEnabled(severityNumber);
    }

    /**
     * Logs a message with `DEBUG` severity, injecting trace context into attributes.
     * @param message - The log message.
     * @param attributes - Optional attributes to associate with the log entry.
     */
    debug(message: string, attributes?: LogAttributes): void {
        this.logger.debug(message, this.injectTraceContext(attributes));
    }

    /**
     * Logs a message with `INFO` severity, injecting trace context into attributes.
     * @param message - The log message.
     * @param attributes - Optional attributes to associate with the log entry.
     */
    info(message: string, attributes?: LogAttributes): void {
        this.logger.info(message, this.injectTraceContext(attributes));
    }

    /**
     * Logs a message with `WARN` severity, injecting trace context into attributes.
     * @param message - The log message.
     * @param attributes - Optional attributes to associate with the log entry.
     */
    warn(message: string, attributes?: LogAttributes): void {
        this.logger.warn(message, this.injectTraceContext(attributes));
    }

    /**
     * Logs a message with `ERROR` severity, injecting trace context into attributes.
     * @param message - The log message.
     * @param error - Optional. An `Exception` object to associate with the log entry.
     * @param attributes - Optional attributes to associate with the log entry.
     */
    error(message: string, error?: Exception, attributes?: LogAttributes): void {
        this.logger.error(message, error, this.injectTraceContext(attributes));
    }

    private injectTraceContext(attributes?: LogAttributes): LogAttributes {
        const activeSpan = trace.getSpan(context.active());
        if (!activeSpan) {
            return attributes ?? {};
        }

        const spanContext = activeSpan.spanContext();

        return {
            ...attributes,
            traceId: spanContext.traceId,
            spanId: spanContext.spanId,
        };
    }
}
