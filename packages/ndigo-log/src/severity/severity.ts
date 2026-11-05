/**
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

/**
 * The canonical threshold vocabulary (AD-76 D-7): one name per settable
 * threshold, `off` mapped above every emitted severity (FATAL4 — the
 * `NoopLogger` posture) and `trace` to the lowest. This is the single
 * source of truth for the `/loggers` endpoint's level names.
 */
const LOGGER_THRESHOLDS: Readonly<Record<string, SeverityNumber>> = Object.freeze({
    trace: SeverityNumber.TRACE,
    debug: SeverityNumber.DEBUG,
    info: SeverityNumber.INFO,
    warn: SeverityNumber.WARN,
    error: SeverityNumber.ERROR,
    fatal: SeverityNumber.FATAL,
    off: SeverityNumber.FATAL4,
});

/**
 * The canonical level names, sorted. `LOGGER_THRESHOLDS` keys — the
 * vocabulary `/loggers` advertises and accepts.
 */
export const LOGGER_LEVEL_NAMES: readonly string[] = Object.freeze(Object.keys(LOGGER_THRESHOLDS).sort());

/**
 * Resolves a level name to its threshold severity, strictly.
 *
 * Unlike {@link levelToSeverityNumber} (whose unknown-name fallback silently
 * downgrades to INFO), an unknown name resolves to `undefined` — the
 * `/loggers` endpoint rejects it instead of applying a wrong threshold.
 *
 * @param levelName - The level name (case-insensitive).
 * @returns The threshold severity, or `undefined` when unknown.
 */
export function resolveLoggerLevel(levelName: string): SeverityNumber | undefined {
    const name = levelName.toLowerCase();
    return Object.prototype.hasOwnProperty.call(LOGGER_THRESHOLDS, name) ? LOGGER_THRESHOLDS[name] : undefined;
}

/**
 * Renders a threshold severity back to its canonical level name.
 *
 * Exact `LOGGER_THRESHOLDS` hits round-trip (`silent`-style scheme names are
 * not threshold names); anything else falls back to the apache scheme's
 * text so the wire never carries a bare number.
 *
 * @param severityNumber - The threshold severity.
 * @returns The level name.
 */
export function loggerLevelName(severityNumber: SeverityNumber): string {
    for (const [name, severity] of Object.entries(LOGGER_THRESHOLDS)) {
        if (severity === severityNumber) return name;
    }
    return severityNumberToLevel(severityNumber, 'apache');
}
