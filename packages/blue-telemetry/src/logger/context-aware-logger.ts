import { context, trace, Exception } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { LogAttributes, Logger } from './logger';

export class ContextAwareLogger implements Logger {
    constructor(private readonly logger: Logger) {}

    get threshold(): SeverityNumber {
        return this.logger.threshold;
    }

    setThreshold(threshold: SeverityNumber): void {
        this.logger.setThreshold(threshold);
    }

    isEnabled(severityNumber: SeverityNumber): boolean {
        return this.logger.isEnabled(severityNumber);
    }

    debug(message: string, attributes?: LogAttributes): void {
        this.logger.debug(message, this.injectTraceContext(attributes));
    }

    info(message: string, attributes?: LogAttributes): void {
        this.logger.info(message, this.injectTraceContext(attributes));
    }

    warn(message: string, attributes?: LogAttributes): void {
        this.logger.warn(message, this.injectTraceContext(attributes));
    }

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
