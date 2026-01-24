/**
 * @author Jeff Rose
 */
import { Level } from './level';
import { Logger } from './logger';
import { BrowserConsoleAppender } from './appenders/browser-console-appender';
import { loggable } from './entry';
type Constructable<T = {}> = new (...args: any[]) => T;
export declare class NPMLevel extends Level {
    static ERROR: Level;
    static WARN: Level;
    static INFO: Level;
    static HTTP: Level;
    static VERBOSE: Level;
    static DEBUG: Level;
    static SILLY: Level;
}
export declare const NPMColor: {
    error: string;
    warn: string;
    info: string;
    http: string;
    verbose: string;
    debug: string;
    silly: string;
};
export declare const NPMBrowserConsoleLevelMapping: {
    error: string;
    warn: string;
    info: string;
    http: string;
    verbose: string;
    debug: string;
    silly: string;
};
export declare class NPMBrowserConsoleAppender extends BrowserConsoleAppender {
    constructor();
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
export declare const likeNPMLogger: (value: any) => boolean;
export declare const AsNPMLogger: <T extends Constructable<Logger>>(superclass: T) => Constructable<NPMLogger> & T;
export {};
//# sourceMappingURL=npm-logging.d.ts.map