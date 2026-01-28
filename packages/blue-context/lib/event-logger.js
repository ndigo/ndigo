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
    async enableOTel(provider, options) {
        try {
            // Dynamically import OTel utilities to avoid hard dependency
            const { entryToLogRecord } = await import('@blue/logger/lib/otel/entry-to-logrecord');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2ZW50LWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBb0IsUUFBUSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFDckcsT0FBTyxFQUFFLGNBQWMsRUFBZ0IsTUFBTSxpQkFBaUIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQU9oQyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUE4QixDQUFDO0FBRXZEOzs7OztHQUtHO0FBQ0gsMkVBQTJFO0FBQzNFLHFGQUFxRjtBQUNyRix5RkFBeUY7QUFDekYsaUdBQWlHO0FBQ2pHLE1BQU0sT0FBTyxXQUFZLFNBQVEsaUJBQWlCLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLElBQUksQ0FBUztJQUViLFVBQVUsQ0FBUTtJQUVsQix1Q0FBdUM7SUFDdkMsV0FBVyxDQUFpQjtJQUM1QixZQUFZLEdBQVksS0FBSyxDQUFDO0lBQzlCLGlCQUFpQixDQUEwRDtJQUMzRSxrQkFBa0IsQ0FBMkI7SUFFN0MsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLFNBQVMsQ0FBQyxZQUFtQjtRQUM3QixJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQ3hCLHVDQUF1QztZQUN0QyxJQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxVQUFV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