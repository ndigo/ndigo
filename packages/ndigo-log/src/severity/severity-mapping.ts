/**
 */
import { SeverityNumber } from '@opentelemetry/api-logs';

/**
 * Defines the supported severity schemes for mapping log levels.
 * - `'syslog'`: Standard Unix syslog severity levels.
 * - `'npm'`: Severity levels used by npm.
 * - `'apache'`: Severity levels used by Apache.
 * - `'cli'`: Common CLI logging levels.
 */
export type SeverityScheme = 'syslog' | 'npm' | 'apache' | 'cli';

/**
 * Defines an interface for mapping between string-based log level names and OpenTelemetry `SeverityNumber`s.
 *
 * Implementations of this interface provide a way to standardize log severity across different
 * logging schemes (e.g., syslog, npm, Apache).
 */
export interface SeverityMapping {
    /**
     * The name of the severity scheme this mapping implements.
     */
    readonly scheme: SeverityScheme;

    /**
     * Converts a string-based log level name to its corresponding OpenTelemetry `SeverityNumber`.
     * @param levelName - The string name of the log level (e.g., "info", "error").
     * @returns The `SeverityNumber` corresponding to the given level name.
     */
    toSeverityNumber(levelName: string): SeverityNumber;

    /**
     * Converts an OpenTelemetry `SeverityNumber` to its corresponding string-based log level name.
     * @param severityNumber - The `SeverityNumber` to convert.
     * @returns The string name of the log level.
     */
    toSeverityText(severityNumber: SeverityNumber): string;
}
