/**
 * @author Jeff Rose
 */

import { Level } from './level';
import { Logger } from './logger';
import { BrowserConsoleAppender } from './appenders/browser-console-appender';
import { loggable } from './entry';
import { like } from '@blue/util';

// TODO Use the @blue/core version once it updates -JBR
type Constructable<T = {}> = new (...args: any[]) => T;

export class NPMLevel extends Level {
    static ERROR = new Level('error', 10000);
    static WARN = new Level('warn', 20000);
    static INFO = new Level('info', 30000);
    static HTTP = new Level('http', 40000);
    static VERBOSE = new Level('verbose', 50000);
    static DEBUG = new Level('debug', 60000);
    static SILLY = new Level('silly', 70000);
}

export const NPMColor = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'green',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'magenta',
};

export const NPMBrowserConsoleLevelMapping = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    http: 'info',
    verbose: 'debug',
    debug: 'debug',
    silly: 'debug',
};

export class NPMBrowserConsoleAppender extends BrowserConsoleAppender {
    constructor() {
        super(NPMBrowserConsoleLevelMapping);
    }
}

export interface NPMLogger extends Logger {
    error(...message: loggable[]): void;
    warn(...message: loggable[]): void;
    info(...message: loggable[]): void;
    http(...message: loggable[]): void;
    verbose(...message: loggable[]): void;
    debug(...message: loggable[]): void;
    silly(...message: loggable[]): void;
}

export const likeNPMLogger = like({
    error: Function,
    warn: Function,
    info: Function,
    http: Function,
    verbose: Function,
    debug: Function,
    silly: Function,
});

export const AsNPMLogger = <T extends Constructable<Logger>>(superclass: T): Constructable<NPMLogger> & T =>
    class extends superclass implements NPMLogger {
        threshold: NPMLevel = Level.ALL;

        error(...message: loggable[]): void {
            this.log(NPMLevel.ERROR, message);
        }

        warn(...message: loggable[]): void {
            this.log(NPMLevel.WARN, message);
        }

        info(...message: loggable[]): void {
            this.log(NPMLevel.INFO, message);
        }

        http(...message: loggable[]): void {
            this.log(NPMLevel.HTTP, message);
        }

        verbose(...message: loggable[]): void {
            this.log(NPMLevel.VERBOSE, message);
        }

        debug(...message: loggable[]): void {
            this.log(NPMLevel.DEBUG, message);
        }

        silly(...message: loggable[]): void {
            this.log(NPMLevel.SILLY, message);
        }
    };
