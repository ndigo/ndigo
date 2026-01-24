/**
 * @author Jeff Rose
 */

import { SeverityNumber } from '@opentelemetry/api-logs';
import { Level } from '../level';
import { ApacheLevel, ApacheLevelToSeverity } from '../apache-logging';
import { NPMLevel, NPMLevelToSeverity } from '../npm-logging';
import { CLILevel, CLILevelToSeverity } from '../cli-logging';
import { SyslogLevel, SyslogLevelToSeverity } from '../syslog-logging';

/**
 * Result of converting a Level to OpenTelemetry severity
 */
export interface SeverityMapping {
    severityNumber: SeverityNumber;
    severityText: string;
}

// Note: The mapping tables (ApacheLevelToSeverity, NPMLevelToSeverity, etc.)
// are imported from the respective level scheme files and re-exported below
// to avoid duplication and maintain consistency.

/**
 * OTel severity to blue-logger Level mapping (reverse lookup)
 * Maps severity numbers to approximate Level equivalents
 */
export const SeverityToApacheLevel: Record<number, Level> = {
    [SeverityNumber.UNSPECIFIED]: Level.OFF,
    [SeverityNumber.TRACE]: ApacheLevel.TRACE,
    [SeverityNumber.TRACE2]: ApacheLevel.TRACE,
    [SeverityNumber.TRACE3]: ApacheLevel.TRACE,
    [SeverityNumber.TRACE4]: ApacheLevel.TRACE,
    [SeverityNumber.DEBUG]: ApacheLevel.DEBUG,
    [SeverityNumber.DEBUG2]: ApacheLevel.DEBUG,
    [SeverityNumber.DEBUG3]: ApacheLevel.DEBUG,
    [SeverityNumber.DEBUG4]: ApacheLevel.DEBUG,
    [SeverityNumber.INFO]: ApacheLevel.INFO,
    [SeverityNumber.INFO2]: ApacheLevel.INFO,
    [SeverityNumber.INFO3]: ApacheLevel.INFO,
    [SeverityNumber.INFO4]: ApacheLevel.INFO,
    [SeverityNumber.WARN]: ApacheLevel.WARN,
    [SeverityNumber.WARN2]: ApacheLevel.WARN,
    [SeverityNumber.WARN3]: ApacheLevel.WARN,
    [SeverityNumber.WARN4]: ApacheLevel.WARN,
    [SeverityNumber.ERROR]: ApacheLevel.ERROR,
    [SeverityNumber.ERROR2]: ApacheLevel.ERROR,
    [SeverityNumber.ERROR3]: ApacheLevel.ERROR,
    [SeverityNumber.ERROR4]: ApacheLevel.ERROR,
    [SeverityNumber.FATAL]: ApacheLevel.FATAL,
    [SeverityNumber.FATAL2]: ApacheLevel.FATAL,
    [SeverityNumber.FATAL3]: ApacheLevel.FATAL,
    [SeverityNumber.FATAL4]: ApacheLevel.FATAL,
};

/**
 * Convert a blue-logger Level to OpenTelemetry SeverityNumber and SeverityText
 *
 * @param level - The Level to convert
 * @param scheme - Optional level scheme ('apache', 'npm', 'cli', 'syslog'). Defaults to 'apache'.
 * @returns Severity mapping with severityNumber and severityText
 *
 * @example
 * ```typescript
 * const severity = levelToSeverity(ApacheLevel.ERROR);
 * // { severityNumber: SeverityNumber.ERROR, severityText: 'error' }
 * ```
 */
export function levelToSeverity(level: Level, scheme: 'apache' | 'npm' | 'cli' | 'syslog' = 'apache'): SeverityMapping {
    const levelName = level.name.toLowerCase();

    let severityNumber: SeverityNumber;

    switch (scheme) {
        case 'npm':
            severityNumber = NPMLevelToSeverity[levelName] ?? SeverityNumber.UNSPECIFIED;
            break;
        case 'cli':
            severityNumber = CLILevelToSeverity[levelName] ?? SeverityNumber.UNSPECIFIED;
            break;
        case 'syslog':
            severityNumber = SyslogLevelToSeverity[levelName] ?? SeverityNumber.UNSPECIFIED;
            break;
        case 'apache':
        default:
            severityNumber = ApacheLevelToSeverity[levelName] ?? SeverityNumber.UNSPECIFIED;
            break;
    }

    return {
        severityNumber,
        severityText: levelName,
    };
}

/**
 * Convert OpenTelemetry SeverityNumber to a blue-logger Level
 *
 * @param severityNumber - The OTel severity number
 * @param severityText - Optional severity text for more precise mapping
 * @returns Corresponding Level (defaults to Apache level scheme)
 *
 * @example
 * ```typescript
 * const level = severityToLevel(SeverityNumber.ERROR, 'error');
 * // ApacheLevel.ERROR
 * ```
 */
export function severityToLevel(severityNumber: SeverityNumber, severityText?: string): Level {
    // If we have severity text, try to find exact match first
    if (severityText) {
        const text = severityText.toLowerCase();

        // Try Apache levels
        if (ApacheLevelToSeverity[text] === severityNumber) {
            return findLevelByName(text, 'apache');
        }

        // Try NPM levels
        if (NPMLevelToSeverity[text] === severityNumber) {
            return findLevelByName(text, 'npm');
        }

        // Try CLI levels
        if (CLILevelToSeverity[text] === severityNumber) {
            return findLevelByName(text, 'cli');
        }

        // Try Syslog levels
        if (SyslogLevelToSeverity[text] === severityNumber) {
            return findLevelByName(text, 'syslog');
        }
    }

    // Fall back to severity number mapping (Apache scheme)
    return SeverityToApacheLevel[severityNumber] ?? Level.OFF;
}

/**
 * Helper function to find a Level by name from a specific scheme
 */
function findLevelByName(name: string, scheme: 'apache' | 'npm' | 'cli' | 'syslog'): Level {
    const upperName = name.toUpperCase();

    switch (scheme) {
        case 'apache':
            return (ApacheLevel as any)[upperName] ?? Level.ALL;
        case 'npm':
            return (NPMLevel as any)[upperName] ?? Level.ALL;
        case 'cli':
            return (CLILevel as any)[upperName] ?? Level.ALL;
        case 'syslog':
            return (SyslogLevel as any)[upperName] ?? Level.ALL;
        default:
            return Level.ALL;
    }
}

/**
 * Detect which level scheme a Level belongs to based on its value
 *
 * @param level - The Level to identify
 * @returns The scheme name or 'unknown'
 */
export function detectLevelScheme(level: Level): 'apache' | 'npm' | 'cli' | 'syslog' | 'unknown' {
    const name = level.name.toLowerCase();

    if (ApacheLevelToSeverity[name] !== undefined) {
        return 'apache';
    }

    if (NPMLevelToSeverity[name] !== undefined) {
        return 'npm';
    }

    if (CLILevelToSeverity[name] !== undefined) {
        return 'cli';
    }

    if (SyslogLevelToSeverity[name] !== undefined) {
        return 'syslog';
    }

    return 'unknown';
}

// Re-export the mapping tables for convenience
export { ApacheLevelToSeverity, NPMLevelToSeverity, CLILevelToSeverity, SyslogLevelToSeverity };
