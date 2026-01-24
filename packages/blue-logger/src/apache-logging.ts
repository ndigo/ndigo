/**
 * @author Jeff Rose
 */

import { Level } from './level';
import { Logger } from './logger';
import { BrowserConsoleAppender } from './appenders/browser-console-appender';
import { loggable } from './entry';
import { like } from '@blue/util';
import { SeverityNumber } from '@opentelemetry/api-logs';

// TODO Use the @blue/core version once it updates -JBR
type Constructable<T = {}> = new (...args: any[]) => T;

export class ApacheLevel extends Level {
    static FATAL = new Level('fatal', 10000);
    static ERROR = new Level('error', 20000);
    static WARN = new Level('warn', 30000);
    static INFO = new Level('info', 40000);
    static DEBUG = new Level('debug', 50000);
    static TRACE = new Level('trace', 60000);

    /**
     * Convert an Apache level to OpenTelemetry SeverityNumber
     *
     * @param level - The Apache level to convert
     * @returns The corresponding OpenTelemetry SeverityNumber
     */
    static toSeverity(level: Level): SeverityNumber {
        return ApacheLevelToSeverity[level.name.toLowerCase()] || SeverityNumber.UNSPECIFIED;
    }

    /**
     * Convert an OpenTelemetry SeverityNumber to an Apache level
     *
     * @param severityNumber - The severity number to convert
     * @returns The corresponding Apache level
     */
    static fromSeverity(severityNumber: SeverityNumber): Level {
        if (severityNumber >= SeverityNumber.FATAL) {
            return ApacheLevel.FATAL;
        }
        if (severityNumber >= SeverityNumber.ERROR) {
            return ApacheLevel.ERROR;
        }
        if (severityNumber >= SeverityNumber.WARN) {
            return ApacheLevel.WARN;
        }
        if (severityNumber >= SeverityNumber.INFO) {
            return ApacheLevel.INFO;
        }
        if (severityNumber >= SeverityNumber.DEBUG) {
            return ApacheLevel.DEBUG;
        }
        if (severityNumber >= SeverityNumber.TRACE) {
            return ApacheLevel.TRACE;
        }
        return Level.OFF;
    }
}

/**
 * Apache level to OpenTelemetry severity mapping table
 */
export const ApacheLevelToSeverity: Record<string, SeverityNumber> = {
    fatal: SeverityNumber.FATAL,
    error: SeverityNumber.ERROR,
    warn: SeverityNumber.WARN,
    info: SeverityNumber.INFO,
    debug: SeverityNumber.DEBUG,
    trace: SeverityNumber.TRACE,
    off: SeverityNumber.UNSPECIFIED,
    all: SeverityNumber.UNSPECIFIED,
};

export const ApacheColor = {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'cyan',
    trace: 'grey',
};

export const ApacheBrowserConsoleLevelMapping = {
    fatal: 'error',
    error: 'error',
    warn: 'warn',
    info: 'info',
    debug: 'debug',
    trace: 'debug',
};

export class ApacheBrowserConsoleAppender extends BrowserConsoleAppender {
    constructor() {
        super(ApacheBrowserConsoleLevelMapping);
    }
}

export interface ApacheLogger extends Logger {
    fatal(...message: loggable[]): void;
    error(...message: loggable[]): void;
    warn(...message: loggable[]): void;
    info(...message: loggable[]): void;
    debug(...message: loggable[]): void;
    trace(...message: loggable[]): void;
}

export const likeApacheLogger = like({
    fatal: Function,
    error: Function,
    warn: Function,
    info: Function,
    debug: Function,
    trace: Function,
});

export const AsApacheLogger = <T extends Constructable<Logger>>(superclass: T): Constructable<ApacheLogger> & T =>
    class extends superclass implements ApacheLogger {
        threshold: ApacheLevel = Level.ALL;

        fatal(...message: loggable[]): void {
            this.log(ApacheLevel.FATAL, message);
        }

        error(...message: loggable[]): void {
            this.log(ApacheLevel.ERROR, message);
        }

        warn(...message: loggable[]): void {
            this.log(ApacheLevel.WARN, message);
        }

        info(...message: loggable[]): void {
            this.log(ApacheLevel.INFO, message);
        }

        debug(...message: loggable[]): void {
            this.log(ApacheLevel.DEBUG, message);
        }

        trace(...message: loggable[]): void {
            this.log(ApacheLevel.TRACE, message);
        }
    };
