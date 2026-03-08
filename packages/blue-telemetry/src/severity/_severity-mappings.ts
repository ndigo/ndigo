import { SeverityNumber } from '@opentelemetry/api-logs';
import { SeverityMapping } from './severity-mapping';

function createSeverityMapping(
    scheme: SeverityMapping['scheme'],
    levelToSeverity: Readonly<Record<string, SeverityNumber>>,
    severityToLevel: ReadonlyArray<[SeverityNumber, string]>,
    fallback: string
): SeverityMapping {
    return {
        scheme,
        toSeverityNumber(levelName: string): SeverityNumber {
            const level = levelName.toLowerCase();
            return levelToSeverity[level] ?? levelToSeverity[fallback] ?? SeverityNumber.INFO;
        },
        toSeverityText(severityNumber: SeverityNumber): string {
            for (const [minimum, level] of severityToLevel) {
                if (severityNumber >= minimum) {
                    return level;
                }
            }
            return fallback;
        },
    };
}

const syslogLevelToSeverity: Readonly<Record<string, SeverityNumber>> = {
    emerg: SeverityNumber.FATAL,
    alert: SeverityNumber.FATAL2,
    crit: SeverityNumber.FATAL3,
    err: SeverityNumber.ERROR,
    warning: SeverityNumber.WARN,
    notice: SeverityNumber.INFO2,
    info: SeverityNumber.INFO,
    debug: SeverityNumber.DEBUG,
};

const npmLevelToSeverity: Readonly<Record<string, SeverityNumber>> = {
    silent: SeverityNumber.UNSPECIFIED,
    error: SeverityNumber.ERROR,
    warn: SeverityNumber.WARN,
    info: SeverityNumber.INFO,
    http: SeverityNumber.INFO2,
    verbose: SeverityNumber.DEBUG,
    silly: SeverityNumber.TRACE,
};

const apacheLevelToSeverity: Readonly<Record<string, SeverityNumber>> = {
    emerg: SeverityNumber.FATAL,
    alert: SeverityNumber.FATAL2,
    crit: SeverityNumber.ERROR2,
    error: SeverityNumber.ERROR,
    warn: SeverityNumber.WARN,
    notice: SeverityNumber.INFO2,
    info: SeverityNumber.INFO,
    debug: SeverityNumber.DEBUG,
    trace: SeverityNumber.TRACE,
};

const cliLevelToSeverity: Readonly<Record<string, SeverityNumber>> = {
    error: SeverityNumber.ERROR,
    warn: SeverityNumber.WARN,
    help: SeverityNumber.INFO,
    data: SeverityNumber.INFO2,
    info: SeverityNumber.INFO,
    debug: SeverityNumber.DEBUG,
    prompt: SeverityNumber.DEBUG2,
    verbose: SeverityNumber.DEBUG3,
    input: SeverityNumber.TRACE2,
    silly: SeverityNumber.TRACE,
};

export const syslogSeverityMapping: SeverityMapping = createSeverityMapping(
    'syslog',
    syslogLevelToSeverity,
    [
        [SeverityNumber.FATAL, 'emerg'],
        [SeverityNumber.ERROR, 'err'],
        [SeverityNumber.WARN, 'warning'],
        [SeverityNumber.INFO, 'info'],
        [SeverityNumber.DEBUG, 'debug'],
    ],
    'info'
);

export const npmSeverityMapping: SeverityMapping = createSeverityMapping(
    'npm',
    npmLevelToSeverity,
    [
        [SeverityNumber.ERROR, 'error'],
        [SeverityNumber.WARN, 'warn'],
        [SeverityNumber.INFO2, 'http'],
        [SeverityNumber.INFO, 'info'],
        [SeverityNumber.DEBUG, 'verbose'],
        [SeverityNumber.TRACE, 'silly'],
    ],
    'info'
);

export const apacheSeverityMapping: SeverityMapping = createSeverityMapping(
    'apache',
    apacheLevelToSeverity,
    [
        [SeverityNumber.FATAL, 'emerg'],
        [SeverityNumber.ERROR, 'error'],
        [SeverityNumber.WARN, 'warn'],
        [SeverityNumber.INFO2, 'notice'],
        [SeverityNumber.INFO, 'info'],
        [SeverityNumber.DEBUG, 'debug'],
        [SeverityNumber.TRACE, 'trace'],
    ],
    'info'
);

export const cliSeverityMapping: SeverityMapping = createSeverityMapping(
    'cli',
    cliLevelToSeverity,
    [
        [SeverityNumber.ERROR, 'error'],
        [SeverityNumber.WARN, 'warn'],
        [SeverityNumber.INFO2, 'data'],
        [SeverityNumber.INFO, 'info'],
        [SeverityNumber.DEBUG3, 'verbose'],
        [SeverityNumber.DEBUG, 'debug'],
        [SeverityNumber.TRACE, 'silly'],
    ],
    'info'
);
