/**
 * @author Jeff Rose
 */
import { Level } from './level';
import { Logger } from './logger';
import { BrowserConsoleAppender } from './appenders/browser-console-appender';
import { loggable } from './entry';
import { SeverityNumber } from '@opentelemetry/api-logs';
type Constructable<T = {}> = new (...args: any[]) => T;
export declare class CLILevel extends Level {
    static ERROR: Level;
    static WARN: Level;
    static HELP: Level;
    static DATA: Level;
    static INFO: Level;
    static DEBUG: Level;
    static PROMPT: Level;
    static VERBOSE: Level;
    static INPUT: Level;
    static SILLY: Level;
    /**
     * Convert a CLI level to OpenTelemetry SeverityNumber
     *
     * @param level - The CLI level to convert
     * @returns The corresponding OpenTelemetry SeverityNumber
     */
    static toSeverity(level: Level): SeverityNumber;
    /**
     * Convert an OpenTelemetry SeverityNumber to a CLI level
     *
     * @param severityNumber - The severity number to convert
     * @returns The corresponding CLI level
     */
    static fromSeverity(severityNumber: SeverityNumber): Level;
}
/**
 * CLI level to OpenTelemetry severity mapping table
 */
export declare const CLILevelToSeverity: Record<string, SeverityNumber>;
export declare const CLIColor: {
    error: string;
    warn: string;
    help: string;
    data: string;
    info: string;
    debug: string;
    prompt: string;
    verbose: string;
    input: string;
    silly: string;
};
export declare const CLIBrowserConsoleLevelMapping: {
    error: string;
    warn: string;
    help: string;
    data: string;
    info: string;
    debug: string;
    prompt: string;
    verbose: string;
    input: string;
    silly: string;
};
export declare class CLIBrowserConsoleAppender extends BrowserConsoleAppender {
    constructor();
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
export declare const AsCLILogger: <T extends Constructable<Logger>>(superclass: T) => Constructable<CLILogger> & T;
export {};
//# sourceMappingURL=cli-logging.d.ts.map