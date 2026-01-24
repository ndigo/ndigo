/**
 * @author Jeff Rose
 */

import { Logger as OTelLoggerAPI } from '@opentelemetry/api-logs';
import { AbstractLogger } from '../logger';
import { Entry } from '../entry';
import { Level } from '../level';
import { entryToLogRecord, EntryToLogRecordOptions } from './entry-to-logrecord';
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
    constructor(name: string, otelLogger: OTelLoggerAPI, options: Partial<EntryToLogRecordOptions> = {}) {
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
    protected _logEntry(entry: Entry): void {
        // Auto-detect level scheme if not explicitly set
        const scheme = this.scheme === 'apache' ? detectLevelScheme(entry.level) : this.scheme;

        // Convert Entry to LogRecord
        const logRecord = entryToLogRecord(entry, {
            ...this.conversionOptions,
            scheme: scheme !== 'unknown' ? scheme : 'apache',
        });

        // Emit via OTel Logger
        this.otelLogger.emit(logRecord as any);
    }

    /**
     * Get the underlying OpenTelemetry Logger
     *
     * @returns The OTel Logger instance
     */
    getOTelLogger(): OTelLoggerAPI {
        return this.otelLogger;
    }

    /**
     * Set the level scheme for severity mapping
     *
     * @param scheme - The level scheme to use
     */
    setScheme(scheme: 'apache' | 'npm' | 'cli' | 'syslog'): void {
        this.scheme = scheme;
    }

    /**
     * Get the current level scheme
     *
     * @returns The current level scheme
     */
    getScheme(): 'apache' | 'npm' | 'cli' | 'syslog' {
        return this.scheme;
    }

    /**
     * Set conversion options for Entry to LogRecord conversion
     *
     * @param options - Conversion options
     */
    setConversionOptions(options: Partial<EntryToLogRecordOptions>): void {
        this.conversionOptions = { ...this.conversionOptions, ...options };
    }

    /**
     * Get current conversion options
     *
     * @returns Current conversion options
     */
    getConversionOptions(): Partial<EntryToLogRecordOptions> {
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
export function createOTelLogger(name: string, otelLogger: OTelLoggerAPI): OTelLogger {
    return new OTelLogger(name, otelLogger);
}
