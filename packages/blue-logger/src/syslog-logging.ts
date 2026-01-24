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

export class SyslogLevel extends Level {
    static EMERG = new Level('emerg', 10000);
    static ALERT = new Level('alert', 20000);
    static CRIT = new Level('crit', 30000);
    static ERROR = new Level('error', 40000);
    static WARNING = new Level('warning', 50000);
    static NOTICE = new Level('notice', 60000);
    static INFO = new Level('info', 70000);
    static DEBUG = new Level('debug', 80000);

    /**
     * Convert a Syslog level to OpenTelemetry SeverityNumber
     *
     * @param level - The Syslog level to convert
     * @returns The corresponding OpenTelemetry SeverityNumber
     */
    static toSeverity(level: Level): SeverityNumber {
        return SyslogLevelToSeverity[level.name.toLowerCase()] || SeverityNumber.UNSPECIFIED;
    }

    /**
     * Convert an OpenTelemetry SeverityNumber to a Syslog level
     *
     * @param severityNumber - The severity number to convert
     * @returns The corresponding Syslog level
     */
    static fromSeverity(severityNumber: SeverityNumber): Level {
        if (severityNumber >= SeverityNumber.FATAL4) {
            return SyslogLevel.EMERG;
        }
        if (severityNumber >= SeverityNumber.FATAL) {
            return SyslogLevel.ALERT;
        }
        if (severityNumber >= SeverityNumber.ERROR) {
            return SyslogLevel.ERROR;
        }
        if (severityNumber >= SeverityNumber.WARN) {
            return SyslogLevel.WARNING;
        }
        if (severityNumber >= SeverityNumber.INFO) {
            return SyslogLevel.INFO;
        }
        if (severityNumber >= SeverityNumber.DEBUG) {
            return SyslogLevel.DEBUG;
        }
        return Level.OFF;
    }
}

/**
 * Syslog level to OpenTelemetry severity mapping table
 */
export const SyslogLevelToSeverity: Record<string, SeverityNumber> = {
    emerg: SeverityNumber.FATAL4,
    alert: SeverityNumber.FATAL,
    crit: SeverityNumber.FATAL,
    error: SeverityNumber.ERROR,
    warning: SeverityNumber.WARN,
    notice: SeverityNumber.WARN,
    info: SeverityNumber.INFO,
    debug: SeverityNumber.DEBUG,
    off: SeverityNumber.UNSPECIFIED,
    all: SeverityNumber.UNSPECIFIED,
};

export const SyslogColor = {
    emerg: 'red',
    alert: 'yellow',
    crit: 'red',
    error: 'red',
    warning: 'red',
    notice: 'yellow',
    info: 'green',
    debug: 'blue',
};

export const SyslogBrowserConsoleLevelMapping = {
    emerg: 'error',
    alert: 'warn',
    crit: 'error',
    error: 'error',
    warning: 'error',
    notice: 'warn',
    info: 'info',
    debug: 'debug',
};

export class SyslogBrowserConsoleAppender extends BrowserConsoleAppender {
    constructor() {
        super(SyslogBrowserConsoleLevelMapping);
    }
}

export interface SyslogLogger extends Logger {
    emerg(...message: loggable[]): void;
    alert(...message: loggable[]): void;
    crit(...message: loggable[]): void;
    error(...message: loggable[]): void;
    warning(...message: loggable[]): void;
    notice(...message: loggable[]): void;
    info(...message: loggable[]): void;
    debug(...message: loggable[]): void;
}

export const likeSyslogLogger = like({
    emerg: Function,
    alert: Function,
    crit: Function,
    error: Function,
    warning: Function,
    notice: Function,
    info: Function,
    debug: Function,
});

export const AsSyslogLogger = <T extends Constructable<Logger>>(superclass: T): Constructable<SyslogLogger> & T =>
    class extends superclass implements SyslogLogger {
        threshold: SyslogLevel = Level.ALL;

        emerg(...message: loggable[]): void {
            this.log(SyslogLevel.EMERG, message);
        }

        alert(...message: loggable[]): void {
            this.log(SyslogLevel.ALERT, message);
        }

        crit(...message: loggable[]): void {
            this.log(SyslogLevel.CRIT, message);
        }

        error(...message: loggable[]): void {
            this.log(SyslogLevel.ERROR, message);
        }

        warning(...message: loggable[]): void {
            this.log(SyslogLevel.WARNING, message);
        }

        notice(...message: loggable[]): void {
            this.log(SyslogLevel.NOTICE, message);
        }

        info(...message: loggable[]): void {
            this.log(SyslogLevel.INFO, message);
        }

        debug(...message: loggable[]): void {
            this.log(SyslogLevel.DEBUG, message);
        }
    };
