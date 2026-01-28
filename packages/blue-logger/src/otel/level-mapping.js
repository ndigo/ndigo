/**
 * @author Jeff Rose
 */
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Level } from '../level';
import { ApacheLevel, ApacheLevelToSeverity } from '../apache-logging';
import { NPMLevel, NPMLevelToSeverity } from '../npm-logging';
import { CLILevel, CLILevelToSeverity } from '../cli-logging';
import { SyslogLevel, SyslogLevelToSeverity } from '../syslog-logging';
// Note: The mapping tables (ApacheLevelToSeverity, NPMLevelToSeverity, etc.)
// are imported from the respective level scheme files and re-exported below
// to avoid duplication and maintain consistency.
/**
 * OTel severity to blue-logger Level mapping (reverse lookup)
 * Maps severity numbers to approximate Level equivalents
 */
export const SeverityToApacheLevel = {
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
export function levelToSeverity(level, scheme = 'apache') {
    const levelName = level.name.toLowerCase();
    let severityNumber;
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
export function severityToLevel(severityNumber, severityText) {
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
function findLevelByName(name, scheme) {
    const upperName = name.toUpperCase();
    switch (scheme) {
        case 'apache':
            return ApacheLevel[upperName] ?? Level.ALL;
        case 'npm':
            return NPMLevel[upperName] ?? Level.ALL;
        case 'cli':
            return CLILevel[upperName] ?? Level.ALL;
        case 'syslog':
            return SyslogLevel[upperName] ?? Level.ALL;
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
export function detectLevelScheme(level) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV2ZWwtbWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxldmVsLW1hcHBpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDekQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDdkUsT0FBTyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzlELE9BQU8sRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5RCxPQUFPLEVBQUUsV0FBVyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFVdkUsNkVBQTZFO0FBQzdFLDRFQUE0RTtBQUM1RSxpREFBaUQ7QUFFakQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQTBCO0lBQ3hELENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHO0lBQ3ZDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQ3pDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQ3pDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJO0lBQ3ZDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJO0lBQ3hDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJO0lBQ3hDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJO0lBQ3hDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJO0lBQ3ZDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJO0lBQ3hDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJO0lBQ3hDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJO0lBQ3hDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQ3pDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQ3pDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0lBQzFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLO0NBQzdDLENBQUM7QUFFRjs7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