/**
 * @module blue-log
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Logger } from '../logger/logger.js';
import {
    apacheSeverityMapping,
    cliSeverityMapping,
    npmSeverityMapping,
    syslogSeverityMapping,
} from './_severity-mappings.js';
import { SeverityMapping, SeverityScheme } from './severity-mapping.js';

const severityMappings: Readonly<Record<SeverityScheme, SeverityMapping>> = {
    syslog: syslogSeverityMapping,
    npm: npmSeverityMapping,
    apache: apacheSeverityMapping,
    cli: cliSeverityMapping,
};

/**
 * Retrieves the `SeverityMapping` instance for a given severity scheme.
 * @param scheme - The `SeverityScheme` to retrieve the mapping for.
 * @returns The `SeverityMapping` instance.
 */
export function getSeverityMapping(scheme: SeverityScheme): SeverityMapping {
    return severityMappings[scheme];
}

/**
 * Attempts to detect the `SeverityScheme` based on a given log level name.
 * This function uses a heuristic to guess the most likely scheme.
 * @param levelName - The string name of the log level.
 * @returns The detected `SeverityScheme`. Defaults to `'apache'` if no specific scheme is detected.
 */
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

/**
 * Converts a string-based log level name to its corresponding OpenTelemetry `SeverityNumber`.
 * If a scheme is not provided, it attempts to detect the scheme automatically.
 *
 * An unknown level name falls back to the resolved scheme's default level
 * (`SeverityNumber.INFO` for every built-in scheme) rather than throwing —
 * pass the level in the scheme's own vocabulary (or an explicit `scheme`)
 * to avoid an unintended INFO downgrade of a severe record.
 *
 * @param levelName - The string name of the log level.
 * @param scheme - Optional. The `SeverityScheme` to use for conversion.
 * @returns The `SeverityNumber` corresponding to the given level name.
 */
export function levelToSeverityNumber(levelName: string, scheme?: SeverityScheme): SeverityNumber {
    const resolvedScheme = scheme ?? detectSeverityScheme(levelName);
    return getSeverityMapping(resolvedScheme).toSeverityNumber(levelName);
}

/**
 * Converts an OpenTelemetry `SeverityNumber` to its corresponding string-based log level name.
 * @param severityNumber - The `SeverityNumber` to convert.
 * @param scheme - Optional. The `SeverityScheme` to use for conversion. Defaults to `'apache'`.
 * @returns The string name of the log level.
 */
export function severityNumberToLevel(severityNumber: SeverityNumber, scheme: SeverityScheme = 'apache'): string {
    return getSeverityMapping(scheme).toSeverityText(severityNumber);
}

/**
 * Converts a string-based log level name to its corresponding severity text,
 * first converting to `SeverityNumber` and then back to text.
 * If a scheme is not provided, it attempts to detect the scheme automatically.
 * @param levelName - The string name of the log level.
 * @param scheme - Optional. The `SeverityScheme` to use for conversion.
 * @returns The string representation of the severity.
 */
export function levelToSeverityText(levelName: string, scheme?: SeverityScheme): string {
    const severityNumber = levelToSeverityNumber(levelName, scheme);
    const resolvedScheme = scheme ?? detectSeverityScheme(levelName);
    return severityNumberToLevel(severityNumber, resolvedScheme);
}

/**
 * A read-only array of method names on the `Logger` interface that correspond to severity levels.
 */
export const loggerSeverityMethodNames: ReadonlyArray<keyof Logger> = ['debug', 'info', 'warn', 'error'];
