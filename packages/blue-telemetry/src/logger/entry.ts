import { Exception } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { SeverityScheme } from '../severity';
import { LogAttributes } from './logger';

export interface LogEntry {
    name: string;
    severityNumber: SeverityNumber;
    severityText: string;
    body: string;
    attributes?: LogAttributes;
    timestamp?: number;
    error?: Exception;
    traceId?: string;
    spanId?: string;
    severityScheme?: SeverityScheme;
}
