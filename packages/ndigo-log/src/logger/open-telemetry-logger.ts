/**
 */
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { context, trace, Exception, SpanStatusCode } from '@opentelemetry/api';
import { Logger, LogAttributes } from './logger.js';
import { severityNumberToLevel } from '../severity/index.js';

export class OpenTelemetryLogger implements Logger {
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

    debug(message: string, attributes?: LogAttributes): void {
        this.emit(
            severityNumberToLevel(SeverityNumber.DEBUG, 'apache').toUpperCase(),
            SeverityNumber.DEBUG,
            message,
            attributes
        );
    }

    info(message: string, attributes?: LogAttributes): void {
        this.emit(
            severityNumberToLevel(SeverityNumber.INFO, 'apache').toUpperCase(),
            SeverityNumber.INFO,
            message,
            attributes
        );
    }

    warn(message: string, attributes?: LogAttributes): void {
        this.emit(
            severityNumberToLevel(SeverityNumber.WARN, 'apache').toUpperCase(),
            SeverityNumber.WARN,
            message,
            attributes
        );
    }

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
