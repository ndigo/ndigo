/**
 * @author Jeff Rose
 */
import { newEntry, AsLevelComparator, Level } from '@blue/logger';
import { AsEventEmitter } from './event-emitter';
import { Null } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { is } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2ZW50LWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBb0IsUUFBUSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFDckcsT0FBTyxFQUFFLGNBQWMsRUFBZ0IsTUFBTSxpQkFBaUIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBT3RDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQThCLENBQUM7QUFFdkQ7Ozs7O0dBS0c7QUFDSCwyRUFBMkU7QUFDM0UscUZBQXFGO0FBQ3JGLHlGQUF5RjtBQUN6RixpR0FBaUc7QUFDakcsTUFBTSxPQUFPLFdBQVksU0FBUSxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakYsSUFBSSxDQUFTO0lBRWIsVUFBVSxDQUFRO0lBRWxCLHVDQUF1QztJQUN2QyxXQUFXLENBQWlCO0lBQzVCLFlBQVksR0FBWSxLQUFLLENBQUM7SUFDOUIsaUJBQWlCLENBQTBEO0lBQzNFLGtCQUFrQixDQUEyQjtJQUU3QyxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksU0FBUyxDQUFDLFlBQW1CO1FBQzdCLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDeEIsdUNBQXVDO1lBQ3RDLElBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLFVB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