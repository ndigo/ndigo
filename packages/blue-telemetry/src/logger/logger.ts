import { Attributes, Exception } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';

export type LogAttributes = Attributes;

export interface Logger {
    readonly threshold: SeverityNumber;

    setThreshold(threshold: SeverityNumber): void;

    isEnabled(severityNumber: SeverityNumber): boolean;

    debug(message: string, attributes?: LogAttributes): void;

    info(message: string, attributes?: LogAttributes): void;

    warn(message: string, attributes?: LogAttributes): void;

    error(message: string, error?: Exception, attributes?: LogAttributes): void;
}
