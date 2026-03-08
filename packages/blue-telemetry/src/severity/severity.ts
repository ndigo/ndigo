import { SeverityNumber } from '@opentelemetry/api-logs';
import { Logger } from '../logger/logger';
import {
    apacheSeverityMapping,
    cliSeverityMapping,
    npmSeverityMapping,
    syslogSeverityMapping,
} from './_severity-mappings';
import { SeverityMapping, SeverityScheme } from './severity-mapping';

const severityMappings: Readonly<Record<SeverityScheme, SeverityMapping>> = {
    syslog: syslogSeverityMapping,
    npm: npmSeverityMapping,
    apache: apacheSeverityMapping,
    cli: cliSeverityMapping,
};

export function getSeverityMapping(scheme: SeverityScheme): SeverityMapping {
    return severityMappings[scheme];
}

export function detectSeverityScheme(levelName: string): SeverityScheme {
    const level = levelName.toLowerCase();

    if (level === 'silent' || level === 'http' || level === 'verbose') {
        return 'npm';
    }

    if (level === 'help' || level === 'data' || level === 'prompt' || level === 'input' || level === 'silly') {
        return 'cli';
    }

    if (level === 'notice' || level === 'crit') {
        return 'apache';
    }

    if (level === 'emerg' || level === 'alert' || level === 'err' || level === 'warning') {
        return 'syslog';
    }

    return 'apache';
}

export function levelToSeverityNumber(levelName: string, scheme?: SeverityScheme): SeverityNumber {
    const resolvedScheme = scheme ?? detectSeverityScheme(levelName);
    return getSeverityMapping(resolvedScheme).toSeverityNumber(levelName);
}

export function severityNumberToLevel(severityNumber: SeverityNumber, scheme: SeverityScheme = 'apache'): string {
    return getSeverityMapping(scheme).toSeverityText(severityNumber);
}

export function levelToSeverityText(levelName: string, scheme?: SeverityScheme): string {
    const severityNumber = levelToSeverityNumber(levelName, scheme);
    const resolvedScheme = scheme ?? detectSeverityScheme(levelName);
    return severityNumberToLevel(severityNumber, resolvedScheme);
}

export const loggerSeverityMethodNames: ReadonlyArray<keyof Logger> = ['debug', 'info', 'warn', 'error'];
