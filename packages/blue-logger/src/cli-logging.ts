/**
 * @author Jeff Rose
 */

import { Level } from './level';
import { Logger } from './logger';
import { BrowserConsoleAppender } from './appenders/browser-console-appender';
import { loggable } from './entry';

// TODO Use the @blue/core version once it updates -JBR
type Constructable<T = {}> = new (...args: any[]) => T;

export class CLILevel extends Level {
    static ERROR = new Level('error', 10000);
    static WARN = new Level('warn', 20000);
    static HELP = new Level('help', 30000);
    static DATA = new Level('data', 40000);
    static INFO = new Level('info', 50000);
    static DEBUG = new Level('debug', 60000);
    static PROMPT = new Level('prompt', 70000);
    static VERBOSE = new Level('verbose', 80000);
    static INPUT = new Level('input', 90000);
    static SILLY = new Level('silly', 100000);
}

export const CLIColor = {
    error: 'red',
    warn: 'yellow',
    help: 'cyan',
    data: 'grey',
    info: 'green',
    debug: 'blue',
    prompt: 'grey',
    verbose: 'cyan',
    input: 'grey',
    silly: 'magenta',
};

export const CLIBrowserConsoleLevelMapping = {
    error: 'error',
    warn: 'warn',
    help: 'info',
    data: 'info',
    info: 'info',
    debug: 'debug',
    prompt: 'info',
    verbose: 'debug',
    input: 'debug',
    silly: 'debug',
};

export class CLIBrowserConsoleAppender extends BrowserConsoleAppender {
    constructor() {
        super(CLIBrowserConsoleLevelMapping);
    }
}

export interface CLILogger extends Logger {
    error(...message: loggable[]): void;
    warn(...message: loggable[]): void;
    help(...message: loggable[]): void;
    data(...message: loggable[]): void;
    info(...message: loggable[]): void;
    debug(...message: loggable[]): void;
    prompt(...message: loggable[]): void;
    verbose(...message: loggable[]): void;
    input(...message: loggable[]): void;
    silly(...message: loggable[]): void;
}

export const AsCLILogger = <T extends Constructable<Logger>>(superclass: T): Constructable<CLILogger> & T =>
    class extends superclass implements CLILogger {
        threshold: CLILevel = Level.ALL;

        error(...message: loggable[]): void {
            this.log(CLILevel.ERROR, message);
        }

        warn(...message: loggable[]): void {
            this.log(CLILevel.WARN, message);
        }

        help(...message: loggable[]): void {
            this.log(CLILevel.HELP, message);
        }

        data(...message: loggable[]): void {
            this.log(CLILevel.DATA, message);
        }

        info(...message: loggable[]): void {
            this.log(CLILevel.INFO, message);
        }

        debug(...message: loggable[]): void {
            this.log(CLILevel.DEBUG, message);
        }

        prompt(...message: loggable[]): void {
            this.log(CLILevel.PROMPT, message);
        }

        verbose(...message: loggable[]): void {
            this.log(CLILevel.VERBOSE, message);
        }

        input(...message: loggable[]): void {
            this.log(CLILevel.INPUT, message);
        }

        silly(...message: loggable[]): void {
            this.log(CLILevel.SILLY, message);
        }
    };
