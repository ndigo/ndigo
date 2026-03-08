import { Context } from '@opentelemetry/api';
import { LogRecord, LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';

export class SeverityFilterLogRecordProcessor implements LogRecordProcessor {
    readonly #minimumSeverity: SeverityNumber;
    readonly #delegate: LogRecordProcessor;

    constructor(delegate: LogRecordProcessor, minimumSeverity: SeverityNumber = SeverityNumber.UNSPECIFIED) {
        this.#delegate = delegate;
        this.#minimumSeverity = minimumSeverity;
    }

    onEmit(logRecord: LogRecord, context?: Context): void {
        if ((logRecord.severityNumber ?? SeverityNumber.UNSPECIFIED) < this.#minimumSeverity) {
            return;
        }

        this.#delegate.onEmit(logRecord, context);
    }

    forceFlush(): Promise<void> {
        return this.#delegate.forceFlush();
    }

    shutdown(): Promise<void> {
        return this.#delegate.shutdown();
    }
}
