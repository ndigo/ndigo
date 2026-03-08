import { SeverityNumber } from '@opentelemetry/api-logs';

export type SeverityScheme = 'syslog' | 'npm' | 'apache' | 'cli';

export interface SeverityMapping {
    readonly scheme: SeverityScheme;

    toSeverityNumber(levelName: string): SeverityNumber;

    toSeverityText(severityNumber: SeverityNumber): string;
}
