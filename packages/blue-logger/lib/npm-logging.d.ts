/**
 * @author Jeff Rose
 */
import { Level } from './level';
import { Logger } from './logger';
import { BrowserConsoleAppender } from './appenders/browser-console-appender';
import { loggable } from './entry';
import { SeverityNumber } from '@opentelemetry/api-logs';
type Constructable<T = {}> = new (...args: any[]) => T;
export declare class NPMLevel extends Level {
    static ERROR: Level;
    static WARN: Level;
    static INFO: Level;
    static HTTP: Level;
    static VERBOSE: Level;
    static DEBUG: Level;
    static SILLY: Level;
    /**
     * Convert an NPM level to OpenTelemetry SeverityNumber
     *
     * @param level - The NPM level to convert
     * @returns The corresponding OpenTelemetry SeverityNumber
     */
    static toSeverity(level: Level): SeverityNumber;
    /**
     * Convert an OpenTelemetry SeverityNumber to an NPM level
     *
     * @param severityNumber - The severity number to convert
     * @returns The corresponding NPM level
     */
    static fromSeverity(severityNumber: SeverityNumber): Level;
}
/**
 * NPM level to OpenTelemetry severity mapping table
 */
export declare const NPMLevelToSeverity: Record<string, SeverityNumber>;
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