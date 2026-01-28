/**
 * @author Jeff Rose
 */

import { Logger, loggable, newEntry, AsLevelComparator, Level, LevelComparator } from '@blue/logger';
import { AsEventEmitter, EventEmitter } from './event-emitter';
import { Null } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { is } from '@blue/util';

// Optional OTel imports - these are only used when OTel mode is enabled
type BlueLoggerProvider = any;
type OTelLoggerAPI = any;
type EntryToLogRecordOptions = any;

const isLevel = is(Level) as (value) => value is Level;

/**
 * @implements module:context.EventEmitter
 * @implements module:logger.Logger
 * @implements module:logger.LevelComparator
 * @extends module:core.Null
 */
// EventLogger extends AsLevelComparator(AsEventEmitter(AsNameAware(Null)))
// which provides EventEmitter, Logger, and LevelComparator functionality via mixins.
// TypeScript 5.7 has stricter checking for mixin implementations, so we don't explicitly
// declare 'implements EventEmitter, Logger, LevelComparator' here - the mixin chain provides it.
export class EventLogger extends AsLevelComparator(AsEventEmitter(AsNameAware(Null))) {
    name: string;

    #threshold: Level;

    // OpenTelemetry integration (optional)
    #otelLogger?: OTelLoggerAPI;
    #otelEnabled: boolean = false;
    #entryToLogRecord?: (entry: any, options?: EntryToLogRecordOptions) => any;
    #conversionOptions?: EntryToLogRecordOptions;

    get threshold(): Level {
        return this.#threshold;
    }

    set threshold(newThreshold: Level) {
        if (isLevel(newThreshold)) {
            // emit comes from AsEventEmitter mixin
            (this as any).emit('change', this.#threshold, newThreshold);
            this.#threshold = newThreshold;
        }
    }

    constructor() {
        super();
        this.threshold = Level.ALL;
    }

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
    async enableOTel(provider: BlueLoggerProvider, options?: EntryToLogRecordOptions): Promise<void> {
        try {
            // Dynamically import OTel utilities to avoid hard dependency
            const { entryToLogRecord } = await import('@blue/logger/lib/otel/entry-to-logrecord');

            this.#otelLogger = provider.getLogger(this.name);
            this.#entryToLogRecord = entryToLogRecord;
            this.#conversionOptions = options;
            this.#otelEnabled = true;
        } catch (error) {
            console.error('Failed to enable OpenTelemetry integration:', error);
            this.#otelEnabled = false;
        }
    }

    /**
     * Disable OpenTelemetry integration
     *
     * After calling this, only event emission will occur (original behavior).
     */
    disableOTel(): void {
        this.#otelEnabled = false;
        this.#otelLogger = undefined;
        this.#entryToLogRecord = undefined;
        this.#conversionOptions = undefined;
    }

    /**
     * Check if OpenTelemetry integration is enabled
     *
     * @returns True if OTel is enabled
     */
    isOTelEnabled(): boolean {
        return this.#otelEnabled;
    }

    /**
     * Get the OpenTelemetry logger (if enabled)
     *
     * @returns The OTel logger or undefined
     */
    getOTelLogger(): OTelLoggerAPI | undefined {
        return this.#otelLogger;
    }

    log(level: Level, message: loggable[]): void {
        // compare comes from AsLevelComparator mixin
        // emit comes from AsEventEmitter mixin
        if ((this as any).compare(this.threshold, level) >= 0) {
            const entry = newEntry(this.name, level, message);

            // Existing behavior: Emit event (ALWAYS happens)
            (this as any).emit(`log:${level.name}`, entry);

            // New behavior: Also emit to OTel if enabled (opt-in)
            if (this.#otelEnabled && this.#otelLogger && this.#entryToLogRecord) {
                try {
                    const logRecord = this.#entryToLogRecord(entry, this.#conversionOptions);
                    this.#otelLogger.emit(logRecord);
                } catch (error) {
                    // Silently fail to avoid disrupting existing behavior
                    // Could optionally emit an error event here
                }
            }
        }
    }
}
