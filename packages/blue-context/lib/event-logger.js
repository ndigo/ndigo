/**
 * @author Jeff Rose
 */
import { newEntry, AsLevelComparator, Level } from '@blue/logger';
import { AsEventEmitter } from './event-emitter';
import { Null } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { is } from '@blue/util';
const isLevel = is(Level);
/**
 * @class module:context.EventLogger
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
    name;
    #threshold;
    // OpenTelemetry integration (optional)
    #otelLogger;
    #otelEnabled = false;
    #entryToLogRecord;
    #conversionOptions;
    get threshold() {
        return this.#threshold;
    }
    set threshold(newThreshold) {
        if (isLevel(newThreshold)) {
            // emit comes from AsEventEmitter mixin
            this.emit('change', this.#threshold, newThreshold);
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
    enableOTel(provider, options) {
        try {
            // Dynamically import OTel utilities to avoid hard dependency
            const { entryToLogRecord } = require('@blue/logger/lib/otel/entry-to-logrecord');
            this.#otelLogger = provider.getLogger(this.name);
            this.#entryToLogRecord = entryToLogRecord;
            this.#conversionOptions = options;
            this.#otelEnabled = true;
        }
        catch (error) {
            console.error('Failed to enable OpenTelemetry integration:', error);
            this.#otelEnabled = false;
        }
    }
    /**
     * Disable OpenTelemetry integration
     *
     * After calling this, only event emission will occur (original behavior).
     */
    disableOTel() {
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
    isOTelEnabled() {
        return this.#otelEnabled;
    }
    /**
     * Get the OpenTelemetry logger (if enabled)
     *
     * @returns The OTel logger or undefined
     */
    getOTelLogger() {
        return this.#otelLogger;
    }
    log(level, message) {
        // compare comes from AsLevelComparator mixin
        // emit comes from AsEventEmitter mixin
        if (this.compare(this.threshold, level) >= 0) {
            const entry = newEntry(this.name, level, message);
            // Existing behavior: Emit event (ALWAYS happens)
            this.emit(`log:${level.name}`, entry);
            // New behavior: Also emit to OTel if enabled (opt-in)
            if (this.#otelEnabled && this.#otelLogger && this.#entryToLogRecord) {
                try {
                    const logRecord = this.#entryToLogRecord(entry, this.#conversionOptions);
                    this.#otelLogger.emit(logRecord);
                }
                catch (error) {
                    // Silently fail to avoid disrupting existing behavior
                    // Could optionally emit an error event here
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2ZW50LWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBb0IsUUFBUSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFDckcsT0FBTyxFQUFFLGNBQWMsRUFBZ0IsTUFBTSxpQkFBaUIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQU9oQyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUE4QixDQUFDO0FBRXZEOzs7Ozs7R0FNRztBQUNILDJFQUEyRTtBQUMzRSxxRkFBcUY7QUFDckYseUZBQXlGO0FBQ3pGLGlHQUFpRztBQUNqRyxNQUFNLE9BQU8sV0FBWSxTQUFRLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRixJQUFJLENBQVM7SUFFYixVQUFVLENBQVE7SUFFbEIsdUNBQXVDO0lBQ3ZDLFdBQVcsQ0FBaUI7SUFDNUIsWUFBWSxHQUFZLEtBQUssQ0FBQztJQUM5QixpQkFBaUIsQ0FBMEQ7SUFDM0Usa0JBQWtCLENBQTJCO0lBRTdDLElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRUQsSUFBSSxTQUFTLENBQUMsWUFBbUI7UUFDN0IsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUN4Qix1Q0FBdUM7WUFDdEMsSUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsVUFB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