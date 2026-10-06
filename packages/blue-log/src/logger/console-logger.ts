/**
 * @module blue-log
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Exception } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Logger, LogAttributes } from './logger';

export class ConsoleLogger implements Logger {
    #threshold: SeverityNumber;

    constructor(
        private readonly name: string,
        threshold: SeverityNumber = SeverityNumber.DEBUG
    ) {
        this.#threshold = threshold;
    }

    get threshold(): SeverityNumber {
        return this.#threshold;
    }

    setThreshold(threshold: SeverityNumber): void {
        this.#threshold = threshold;
    }

    isEnabled(severityNumber: SeverityNumber): boolean {
        return severityNumber >= this.#threshold;
    }

    debug(message: string, attributes?: LogAttributes): void {
        if (!this.isEnabled(SeverityNumber.DEBUG)) {
            return;
        }

        console.debug(`[DEBUG] [${this.name}] ${message}`, attributes || '');
    }

    info(message: string, attributes?: LogAttributes): void {
        if (!this.isEnabled(SeverityNumber.INFO)) {
            return;
        }

        console.info(`[INFO] [${this.name}] ${message}`, attributes || '');
    }

    warn(message: string, attributes?: LogAttributes): void {
        if (!this.isEnabled(SeverityNumber.WARN)) {
            return;
        }

        console.warn(`[WARN] [${this.name}] ${message}`, attributes || '');
    }

    error(message: string, error?: Exception, attributes?: LogAttributes): void {
        if (!this.isEnabled(SeverityNumber.ERROR)) {
            return;
        }

        console.error(`[ERROR] [${this.name}] ${message}`, attributes || '', error || '');
    }
}
