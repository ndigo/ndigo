/**
 * @author Jeff Rose
 */
import { Level } from './level';
import { Logger } from './logger';
import { BrowserConsoleAppender } from './appenders/browser-console-appender';
import { loggable } from './entry';
type Constructable<T = {}> = new (...args: any[]) => T;
export declare class SyslogLevel extends Level {
    static EMERG: Level;
    static ALERT: Level;
    static CRIT: Level;
    static ERROR: Level;
    static WARNING: Level;
    static NOTICE: Level;
    static INFO: Level;
    static DEBUG: Level;
}
export declare const SyslogColor: {
    emerg: string;
    alert: string;
    crit: string;
    error: string;
    warning: string;
    notice: string;
    info: string;
    debug: string;
};
export declare const SyslogBrowserConsoleLevelMapping: {
    emerg: string;
    alert: string;
    crit: string;
    error: string;
    warning: string;
    notice: string;
    info: string;
    debug: string;
};
export declare class SyslogBrowserConsoleAppender extends BrowserConsoleAppender {
    constructor();
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
export declare const likeSyslogLogger: (value: any) => boolean;
export declare const AsSyslogLogger: <T extends Constructable<Logger>>(superclass: T) => Constructable<SyslogLogger> & T;
export {};
//# sourceMappingURL=syslog-logging.d.ts.map