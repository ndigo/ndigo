/**
 * OpenTelemetry-backed logger.
 */
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { context, trace, Exception, SpanStatusCode } from '@opentelemetry/api';
import { Logger, LogAttributes } from './logger.js';
import { severityNumberToLevel } from '../severity/index.js';

/**
 * Logger that emits records through the OpenTelemetry logs API.
 */
export class OpenTelemetryLogger implements Logger {
    #threshold: SeverityNumber;

    constructor(
        private readonly name: string,
        threshold: SeverityNumber = SeverityNumber.DEBUG
    ) {
        this.#threshold = threshold;
    }

    /** The current minimum severity. */
    get threshold(): SeverityNumber {
        return this.#threshold;
    }

    /**
     * Sets the minimum severity.
     *
     * @param threshold - The new minimum severity.
     */
    setThreshold(threshold: SeverityNumber): void {
        this.#threshold = threshold;
    }

    /**
     * Whether a severity passes the current threshold.
     *
     * @param severityNumber - The severity to test.
     * @returns `true` when the severity is enabled.
     */
    isEnabled(severityNumber: SeverityNumber): boolean {
        return severityNumber >= this.#threshold;
    }

    private emit(
        severityText: string,
        severityNumber: SeverityNumber,
        message: string,
        attributes?: LogAttributes,
        error?: Exception
    ): void {
        if (!this.isEnabled(severityNumber)) {
            return;
        }

        const activeContext = context.active();
        const errorAttributes = error ? { 'error.message': error.toString() } : {};

        const openTelemetryLogger = logs.getLogger(this.name);
        openTelemetryLogger.emit({
            severityText,
            severityNumber,
            body: message,
            attributes: { ...attributes, ...errorAttributes },
            context: activeContext,
        });

        if (error && severityNumber === SeverityNumber.ERROR) {
            const span = trace.getSpan(activeContext);
            if (span) {
                span.recordException(error);
                span.setStatus({ code: SpanStatusCode.ERROR, message });
            }
        }
    }

    /**
     * Logs a debug message.
     *
     * @param message - The message body.
     * @param attributes - Optional structured attributes.
     */
    debug(message: string, attributes?: LogAttributes): void {
        this.emit(
            severityNumberToLevel(SeverityNumber.DEBUG, 'apache').toUpperCase(),
            SeverityNumber.DEBUG,
            message,
            attributes
        );
    }

    /**
     * Logs an info message.
     *
     * @param message - The message body.
     * @param attributes - Optional structured attributes.
     */
    info(message: string, attributes?: LogAttributes): void {
        this.emit(
            severityNumberToLevel(SeverityNumber.INFO, 'apache').toUpperCase(),
            SeverityNumber.INFO,
            message,
            attributes
        );
    }

    /**
     * Logs a warning message.
     *
     * @param message - The message body.
     * @param attributes - Optional structured attributes.
     */
    warn(message: string, attributes?: LogAttributes): void {
        this.emit(
            severityNumberToLevel(SeverityNumber.WARN, 'apache').toUpperCase(),
            SeverityNumber.WARN,
            message,
            attributes
        );
    }

    /**
     * Logs an error message and records the exception on the active span.
     *
     * @param message - The message body.
     * @param error - Optional exception attached to the log.
     * @param attributes - Optional structured attributes.
     */
    error(message: string, error?: Exception, attributes?: LogAttributes): void {
        this.emit(
            severityNumberToLevel(SeverityNumber.ERROR, 'apache').toUpperCase(),
            SeverityNumber.ERROR,
            message,
            attributes,
            error
        );
    }
}
