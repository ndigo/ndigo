/**
 * @author Jeff Rose
 */
import { Level } from './level';
import { Logger } from './logger';
import { BrowserConsoleAppender } from './appenders/browser-console-appender';
import { loggable } from './entry';
import { SeverityNumber } from '@opentelemetry/api-logs';
type Constructable<T = {}> = new (...args: any[]) => T;
export declare class ApacheLevel extends Level {
    static FATAL: Level;
    static ERROR: Level;
    static WARN: Level;
    static INFO: Level;
    static DEBUG: Level;
    static TRACE: Level;
    /**
     * Convert an Apache level to OpenTelemetry SeverityNumber
     *
     * @param level - The Apache level to convert
     * @returns The corresponding OpenTelemetry SeverityNumber
     */
    static toSeverity(level: Level): SeverityNumber;
    /**
     * Convert an OpenTelemetry SeverityNumber to an Apache level
     *
     * @param severityNumber - The severity number to convert
     * @returns The corresponding Apache level
     */
    static fromSeverity(severityNumber: SeverityNumber): Level;
}
/**
 * Apache level to OpenTelemetry severity mapping table
 */
export declare const ApacheLevelToSeverity: Record<string, SeverityNumber>;
export declare const ApacheColor: {
    fatal: string;
    error: string;
    warn: string;
    info: string;
    debug: string;
    trace: string;
};
export declare const ApacheBrowserConsoleLevelMapping: {
    fatal: string;
    error: string;
    warn: string;
    info: string;
    debug: string;
    trace: string;
};
export declare class ApacheBrowserConsoleAppender extends BrowserConsoleAppender {
    constructor();
}
export interface ApacheLogger extends Logger {
    fatal(...message: loggable[]): void;
    error(...message: loggable[]): void;
    warn(...message: loggable[]): void;
    info(...message: loggable[]): void;
    debug(...message: loggable[]): void;
    trace(...message: loggable[]): void;
}
export declare const likeApacheLogger: (value: any) => boolean;
export declare const AsApacheLogger: <T extends Constructable<Logger>>(superclass: T) => Constructable<ApacheLogger> & T;
export {};
//# sourceMappingURL=apache-logging.d.ts.map