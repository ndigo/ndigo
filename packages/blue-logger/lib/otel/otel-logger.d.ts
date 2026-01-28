/**
 * @author Jeff Rose
 */
import { Logger as OTelLoggerAPI } from '@opentelemetry/api-logs';
import { AbstractLogger } from '../logger';
import { Entry } from '../entry';
import { EntryToLogRecordOptions } from './entry-to-logrecord';
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
export declare class OTelLogger extends AbstractLogger {
    protected otelLogger: OTelLoggerAPI;
    protected scheme: 'apache' | 'npm' | 'cli' | 'syslog';
    protected conversionOptions: Partial<EntryToLogRecordOptions>;
    /**
     * Create an OTelLogger
     *
     * @param name - Logger name
     * @param otelLogger - OpenTelemetry Logger instance
     * @param options - Optional conversion options
     */
    constructor(name: string, otelLogger: OTelLoggerAPI, options?: Partial<EntryToLogRecordOptions>);
    /**
     * Log an entry by converting it to a LogRecord and emitting via OTel
     *
     * @param entry - The Entry to log
     */
    protected _logEntry(entry: Entry): void;
    /**
     * Get the underlying OpenTelemetry Logger
     *
     * @returns The OTel Logger instance
     */
    getOTelLogger(): OTelLoggerAPI;
    /**
     * Set the level scheme for severity mapping
     *
     * @param scheme - The level scheme to use
     */
    setScheme(scheme: 'apache' | 'npm' | 'cli' | 'syslog'): void;
    /**
     * Get the current level scheme
     *
     * @returns The current level scheme
     */
    getScheme(): 'apache' | 'npm' | 'cli' | 'syslog';
    /**
     * Set conversion options for Entry to LogRecord conversion
     *
     * @param options - Conversion options
     */
    setConversionOptions(options: Partial<EntryToLogRecordOptions>): void;
    /**
     * Get current conversion options
     *
     * @returns Current conversion options
     */
    getConversionOptions(): Partial<EntryToLogRecordOptions>;
}
/**
 * Create a simple OTelLogger with default options
 *
 * @param name - Logger name
 * @param otelLogger - OpenTelemetry Logger instance
 * @returns OTelLogger instance
 */
export declare function createOTelLogger(name: string, otelLogger: OTelLoggerAPI): OTelLogger;
//# sourceMappingURL=otel-logger.d.ts.map