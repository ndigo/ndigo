/**
 * Console-backed logger honoring a severity threshold.
 */
import { Exception } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Logger, LogAttributes } from './logger.js';

/**
 * Logger that writes to the console, gated by a minimum severity.
 */
export class ConsoleLogger implements Logger {
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

    /**
     * Logs a debug message.
     *
     * @param message - The message body.
     * @param attributes - Optional structured attributes.
     */
    debug(message: string, attributes?: LogAttributes): void {
        if (!this.isEnabled(SeverityNumber.DEBUG)) {
            return;
        }

        console.debug(`[DEBUG] [${this.name}] ${message}`, attributes || '');
    }

    /**
     * Logs an info message.
     *
     * @param message - The message body.
     * @param attributes - Optional structured attributes.
     */
    info(message: string, attributes?: LogAttributes): void {
        if (!this.isEnabled(SeverityNumber.INFO)) {
            return;
        }

        console.info(`[INFO] [${this.name}] ${message}`, attributes || '');
    }

    /**
     * Logs a warning message.
     *
     * @param message - The message body.
     * @param attributes - Optional structured attributes.
     */
    warn(message: string, attributes?: LogAttributes): void {
        if (!this.isEnabled(SeverityNumber.WARN)) {
            return;
        }

        console.warn(`[WARN] [${this.name}] ${message}`, attributes || '');
    }

    /**
     * Logs an error message.
     *
     * @param message - The message body.
     * @param error - Optional exception attached to the log.
     * @param attributes - Optional structured attributes.
     */
    error(message: string, error?: Exception, attributes?: LogAttributes): void {
        if (!this.isEnabled(SeverityNumber.ERROR)) {
            return;
        }

        console.error(`[ERROR] [${this.name}] ${message}`, attributes || '', error || '');
    }
}
