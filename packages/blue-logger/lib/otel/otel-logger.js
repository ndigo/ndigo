/**
 * @author Jeff Rose
 */
import { AbstractLogger } from '../logger';
import { entryToLogRecord } from './entry-to-logrecord';
import { detectLevelScheme } from './level-mapping';
/**
 * OTelLogger is a blue-logger Logger implementation backed by OpenTelemetry.
 *
 * This class bridges the blue-logger interface with OTel's logging API,
 * converting Entries to LogRecords and emitting them through the OTel pipeline.
 *
 * @example
 * ```typescript
 * import { BlueLoggerProvider } from '@blue/logger';
 *
 * const provider = new BlueLoggerProvider();
 * const logger = provider.createLogger('my-app');
 *
 * logger.log(Level.INFO, ['Application started']);
 * ```
 */
export class OTelLogger extends AbstractLogger {
    otelLogger;
    scheme;
    conversionOptions;
    /**
     * Create an OTelLogger
     *
     * @param name - Logger name
     * @param otelLogger - OpenTelemetry Logger instance
     * @param options - Optional conversion options
     */
    constructor(name, otelLogger, options = {}) {
        super(name);
        this.otelLogger = otelLogger;
        this.scheme = options.scheme || 'apache';
        this.conversionOptions = options;
    }
    /**
     * Log an entry by converting it to a LogRecord and emitting via OTel
     *
     * @param entry - The Entry to log
     */
    _logEntry(entry) {
        // Auto-detect level scheme if not explicitly set
        const scheme = this.scheme === 'apache' ? detectLevelScheme(entry.level) : this.scheme;
        // Convert Entry to LogRecord
        const logRecord = entryToLogRecord(entry, {
            ...this.conversionOptions,
            scheme: scheme !== 'unknown' ? scheme : 'apache',
        });
        // Emit via OTel Logger
        this.otelLogger.emit(logRecord);
    }
    /**
     * Get the underlying OpenTelemetry Logger
     *
     * @returns The OTel Logger instance
     */
    getOTelLogger() {
        return this.otelLogger;
    }
    /**
     * Set the level scheme for severity mapping
     *
     * @param scheme - The level scheme to use
     */
    setScheme(scheme) {
        this.scheme = scheme;
    }
    /**
     * Get the current level scheme
     *
     * @returns The current level scheme
     */
    getScheme() {
        return this.scheme;
    }
    /**
     * Set conversion options for Entry to LogRecord conversion
     *
     * @param options - Conversion options
     */
    setConversionOptions(options) {
        this.conversionOptions = { ...this.conversionOptions, ...options };
    }
    /**
     * Get current conversion options
     *
     * @returns Current conversion options
     */
    getConversionOptions() {
        return { ...this.conversionOptions };
    }
}
/**
 * Create a simple OTelLogger with default options
 *
 * @param name - Logger name
 * @param otelLogger - OpenTelemetry Logger instance
 * @returns OTelLogger instance
 */
export function createOTelLogger(name, otelLogger) {
    return new OTelLogger(name, otelLogger);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3RlbC1sb2dnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvb3RlbC9vdGVsLWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFHM0MsT0FBTyxFQUFFLGdCQUFnQixFQUEyQixNQUFNLHNCQUFzQixDQUFDO0FBQ2pGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRXBEOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILE1BQU0sT0FBTyxVQUFXLFNBQVEsY0FBYztJQUNoQyxVQUFVLENBQWdCO0lBQzFCLE1BQU0sQ0FBc0M7SUFDNUMsaUJBQWlCLENBQW1DO0lBRTlEOzs7Ozs7T0FNRztJQUNILFlBQVksSUFBWSxFQUFFLFVBQXlCLEVBQUUsVUFBNEMsRUFBRTtRQUMvRixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxTQUFTLENBQUMsS0FBWTtRQUM1QixpREFBaUQ7UUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUV2Riw2QkFBNkI7UUFDN0IsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxFQUFFO1lBQ3RDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQjtZQUN6QixNQUFNLEVBQUUsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRO1NBQ25ELENBQUMsQ0FBQztRQUVILHVCQUF1QjtRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFnQixDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLE1BQTJDO1FBQ2pELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILG9CQUFvQixDQUFDLE9BQXlDO1FBQzFELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsT0FBTyxFQUFFLENBQUM7SUFDdkUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxvQkFBb0I7UUFDaEIsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDekMsQ0FBQztDQUNKO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLElBQVksRUFBRSxVQUF5QjtJQUNwRSxPQUFPLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM1QyxDQUFDIn0=