/**
 * @author Jeff Rose
 */
import { Logger as OTelLoggerAPI, LoggerOptions, LoggerProvider } from '@opentelemetry/api-logs';
import { LoggerProvider as SDKLoggerProvider, LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { Appender } from '../appender';
import { Logger } from '../logger';
/**
 * Configuration options for BlueLoggerProvider
 */
export interface BlueLoggerProviderConfig {
    /**
     * Resource to associate with all loggers
     * Describes the entity producing logs (service name, version, etc.)
     */
    resource?: Resource;
    /**
     * Log record processors to use
     * Processors handle batching, filtering, and exporting of log records
     */
    processors?: LogRecordProcessor[];
    /**
     * Whether to merge with global resource
     * Default: true
     */
    mergeResourceWithGlobal?: boolean;
    /**
     * Instrumentation scope name for loggers
     * Default: '@blue/logger'
     */
    scopeName?: string;
    /**
     * Instrumentation scope version
     */
    scopeVersion?: string;
    /**
     * Schema URL for instrumentation scope
     */
    schemaUrl?: string;
}
/**
 * BlueLoggerProvider wraps OpenTelemetry's LoggerProvider to provide
 * blue-logger conventions and backward compatibility with the Appender system.
 *
 * @example
 * ```typescript
 * import { BlueLoggerProvider, ConsoleExporter } from '@blue/logger';
 *
 * const provider = new BlueLoggerProvider({
 *   processors: [
 *     new SimpleLogRecordProcessor(new ConsoleExporter())
 *   ]
 * });
 *
 * const logger = provider.getLogger('my-app');
 * logger.info('Application started');
 * ```
 */
export declare class BlueLoggerProvider implements LoggerProvider {
    private sdkProvider;
    private processors;
    private resource;
    private scopeName;
    private scopeVersion?;
    private schemaUrl?;
    constructor(config?: BlueLoggerProviderConfig);
    /**
     * Get an OpenTelemetry Logger
     *
     * @param name - Logger name (typically component or module name)
     * @param version - Logger version
     * @param options - Logger options
     * @returns OpenTelemetry Logger instance
     */
    getLogger(name: string, version?: string, options?: LoggerOptions): OTelLoggerAPI;
    /**
     * Create a blue-logger Logger backed by OpenTelemetry
     *
     * This is a convenience method that wraps getLogger() and returns a
     * Logger instance compatible with the blue-logger interface.
     *
     * @param name - Logger name
     * @param version - Logger version
     * @returns blue-logger Logger instance
     *
     * @example
     * ```typescript
     * const logger = provider.createLogger('my-app');
     * logger.info('Using blue-logger interface');
     * ```
     */
    createLogger(name: string, version?: string): Logger;
    /**
     * Create a BlueLoggerProvider with Appender-based processors (backward compatibility)
     *
     * This static factory method allows existing code using Appenders to work with
     * the new OTel architecture. Each Appender is wrapped in an AppenderLogRecordExporter.
     *
     * NOTE: In OpenTelemetry SDK v0.211.0, processors must be configured at construction time.
     * If you need to use appenders, create a provider with this method.
     *
     * @param appenders - Array of blue-logger Appenders
     * @param config - Optional provider configuration
     * @returns BlueLoggerProvider configured with appenders
     *
     * @example
     * ```typescript
     * import { ConsoleAppender } from '@blue/logger';
     *
     * const provider = BlueLoggerProvider.fromAppenders([
     *   new ConsoleAppender()
     * ]);
     * const logger = provider.createLogger('my-app');
     * ```
     */
    static fromAppenders(appenders: Appender[], config?: Omit<BlueLoggerProviderConfig, 'processors'>): BlueLoggerProvider;
    /**
     * Get the underlying SDK LoggerProvider
     *
     * @returns The OpenTelemetry SDK LoggerProvider instance
     */
    getSDKProvider(): SDKLoggerProvider;
    /**
     * Get the resource associated with this provider
     *
     * @returns The Resource instance
     */
    getResource(): Resource;
    /**
     * Get all registered processors
     *
     * @returns Array of LogRecordProcessor instances
     */
    getProcessors(): LogRecordProcessor[];
    /**
     * Shutdown the provider and flush all pending log records
     *
     * @returns Promise that resolves when shutdown is complete
     */
    shutdown(): Promise<void>;
    /**
     * Force flush all pending log records
     *
     * @returns Promise that resolves when flush is complete
     */
    forceFlush(): Promise<void>;
}
/**
 * Create a simple BlueLoggerProvider with console logging
 *
 * @param config - Optional configuration
 * @returns Configured BlueLoggerProvider
 *
 * @example
 * ```typescript
 * const provider = createSimpleConsoleProvider();
 * const logger = provider.createLogger('my-app');
 * ```
 */
export declare function createSimpleConsoleProvider(config?: Omit<BlueLoggerProviderConfig, 'processors'>): Promise<BlueLoggerProvider>;
/**
 * Create a BlueLoggerProvider with batching console exporter
 *
 * @param config - Optional configuration
 * @returns Configured BlueLoggerProvider with batching
 *
 * @example
 * ```typescript
 * const provider = createBatchConsoleProvider();
 * const logger = provider.createLogger('my-app');
 * ```
 */
export declare function createBatchConsoleProvider(config?: Omit<BlueLoggerProviderConfig, 'processors'>): Promise<BlueLoggerProvider>;
//# sourceMappingURL=blue-logger-provider.d.ts.map