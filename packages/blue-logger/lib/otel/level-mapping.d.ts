/**
 * @author Jeff Rose
 */
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Level } from '../level';
import { ApacheLevelToSeverity } from '../apache-logging';
import { NPMLevelToSeverity } from '../npm-logging';
import { CLILevelToSeverity } from '../cli-logging';
import { SyslogLevelToSeverity } from '../syslog-logging';
/**
 * Result of converting a Level to OpenTelemetry severity
 */
export interface SeverityMapping {
    severityNumber: SeverityNumber;
    severityText: string;
}
/**
 * OTel severity to blue-logger Level mapping (reverse lookup)
 * Maps severity numbers to approximate Level equivalents
 */
export declare const SeverityToApacheLevel: Record<number, Level>;
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
export declare function levelToSeverity(level: Level, scheme?: 'apache' | 'npm' | 'cli' | 'syslog'): SeverityMapping;
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
export declare function severityToLevel(severityNumber: SeverityNumber, severityText?: string): Level;
/**
 * Detect which level scheme a Level belongs to based on its value
 *
 * @param level - The Level to identify
 * @returns The scheme name or 'unknown'
 */
export declare function detectLevelScheme(level: Level): 'apache' | 'npm' | 'cli' | 'syslog' | 'unknown';
export { ApacheLevelToSeverity, NPMLevelToSeverity, CLILevelToSeverity, SyslogLevelToSeverity };
//# sourceMappingURL=level-mapping.d.ts.map