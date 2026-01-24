/**
 * @author Jeff Rose
 */
import { loggable, Level } from '@blue/logger';
type BlueLoggerProvider = any;
type OTelLoggerAPI = any;
type EntryToLogRecordOptions = any;
declare const EventLogger_base: any;
/**
 * @class module:context.EventLogger
 * @implements module:context.EventEmitter
 * @implements module:logger.Logger
 * @implements module:logger.LevelComparator
 * @extends module:core.Null
 */
export declare class EventLogger extends EventLogger_base {
    #private;
    name: string;
    get threshold(): Level;
    set threshold(newThreshold: Level);
    constructor();
    /**
     * Enable OpenTelemetry integration
     *
     * When enabled, log entries will be emitted both as events (existing behavior)
     * and as OpenTelemetry LogRecords (new behavior).
     *
     * @param provider - The BlueLoggerProvider to use for creating the OTel logger
     * @param options - Optional conversion options for Entry to LogRecord conversion
     *
     * @example
     * ```typescript
     * import { BlueLoggerProvider } from '@blue/logger';
     *
     * const provider = new BlueLoggerProvider();
     * const logger = new EventLogger();
     * logger.enableOTel(provider);
     *
     * // Logs will now emit both events and OTel records
     * logger.log(Level.INFO, ['Application started']);
     * ```
     */
    enableOTel(provider: BlueLoggerProvider, options?: EntryToLogRecordOptions): void;
    /**
     * Disable OpenTelemetry integration
     *
     * After calling this, only event emission will occur (original behavior).
     */
    disableOTel(): void;
    /**
     * Check if OpenTelemetry integration is enabled
     *
     * @returns True if OTel is enabled
     */
    isOTelEnabled(): boolean;
    /**
     * Get the OpenTelemetry logger (if enabled)
     *
     * @returns The OTel logger or undefined
     */
    getOTelLogger(): OTelLoggerAPI | undefined;
    log(level: Level, message: loggable[]): void;
}
export {};
//# sourceMappingURL=event-logger.d.ts.map