/**
 * @author Jeff Rose
 */
import { LoggerProvider as SDKLoggerProvider, SimpleLogRecordProcessor, BatchLogRecordProcessor, } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { OTelLogger } from './otel-logger';
import { AppenderLogRecordExporter } from './exporters/appender-exporter';
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
export class BlueLoggerProvider {
    sdkProvider;
    processors = [];
    resource;
    scopeName;
    scopeVersion;
    schemaUrl;
    constructor(config = {}) {
        const { resource = Resource.default(), processors = [], mergeResourceWithGlobal = true, scopeName = '@blue/logger', scopeVersion, schemaUrl, } = config;
        this.resource = mergeResourceWithGlobal ? Resource.default().merge(resource) : resource;
        this.processors = [...processors];
        this.scopeName = scopeName;
        this.scopeVersion = scopeVersion;
        this.schemaUrl = schemaUrl;
        // Create SDK provider with processors in config
        // Note: Cast resource to any to avoid type mismatch between different Resource versions
        this.sdkProvider = new SDKLoggerProvider({
            resource: this.resource,
            processors: this.processors,
        });
    }
    /**
     * Get an OpenTelemetry Logger
     *
     * @param name - Logger name (typically component or module name)
     * @param version - Logger version
     * @param options - Logger options
     * @returns OpenTelemetry Logger instance
     */
    getLogger(name, version, options) {
        return this.sdkProvider.getLogger(name, version, options);
    }
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
    createLogger(name, version) {
        const otelLogger = this.getLogger(name, version);
        return new OTelLogger(name, otelLogger);
    }
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
    static fromAppenders(appenders, config = {}) {
        // Create processors from appenders
        const processors = appenders.map((appender) => {
            const exporter = new AppenderLogRecordExporter(appender);
            // Use SimpleLogRecordProcessor for immediate export (like appenders)
            return new SimpleLogRecordProcessor(exporter);
        });
        // Create and return provider with processors
        return new BlueLoggerProvider({
            ...config,
            processors,
        });
    }
    /**
     * Get the underlying SDK LoggerProvider
     *
     * @returns The OpenTelemetry SDK LoggerProvider instance
     */
    getSDKProvider() {
        return this.sdkProvider;
    }
    /**
     * Get the resource associated with this provider
     *
     * @returns The Resource instance
     */
    getResource() {
        return this.resource;
    }
    /**
     * Get all registered processors
     *
     * @returns Array of LogRecordProcessor instances
     */
    getProcessors() {
        return [...this.processors];
    }
    /**
     * Shutdown the provider and flush all pending log records
     *
     * @returns Promise that resolves when shutdown is complete
     */
    async shutdown() {
        return this.sdkProvider.shutdown();
    }
    /**
     * Force flush all pending log records
     *
     * @returns Promise that resolves when flush is complete
     */
    async forceFlush() {
        return this.sdkProvider.forceFlush();
    }
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
export function createSimpleConsoleProvider(config = {}) {
    // Dynamic import to avoid circular dependency
    const { LayoutAwareConsoleExporter } = require('./exporters/console-exporter');
    return new BlueLoggerProvider({
        ...config,
        processors: [new SimpleLogRecordProcessor(new LayoutAwareConsoleExporter())],
    });
}
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
export function createBatchConsoleProvider(config = {}) {
    // Dynamic import to avoid circular dependency
    const { LayoutAwareConsoleExporter } = require('./exporters/console-exporter');
    return new BlueLoggerProvider({
        ...config,
        processors: [new BatchLogRecordProcessor(new LayoutAwareConsoleExporter())],
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmx1ZS1sb2dnZXItcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvb3RlbC9ibHVlLWxvZ2dlci1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFDSCxjQUFjLElBQUksaUJBQWlCLEVBRW5DLHdCQUF3QixFQUN4Qix1QkFBdUIsR0FDMUIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQXlDMUU7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0gsTUFBTSxPQUFPLGtCQUFrQjtJQUNuQixXQUFXLENBQW9CO0lBQy9CLFVBQVUsR0FBeUIsRUFBRSxDQUFDO0lBQ3RDLFFBQVEsQ0FBVztJQUNuQixTQUFTLENBQVM7SUFDbEIsWUFBWSxDQUFVO0lBQ3RCLFNBQVMsQ0FBVTtJQUUzQixZQUFZLFNBQW1DLEVBQUU7UUFDN0MsTUFBTSxFQUNGLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQzdCLFVBQVUsR0FBRyxFQUFFLEVBQ2YsdUJBQXVCLEdBQUcsSUFBSSxFQUM5QixTQUFTLEdBQUcsY0FBYyxFQUMxQixZQUFZLEVBQ1osU0FBUyxHQUNaLEdBQUcsTUFBTSxDQUFDO1FBRVgsSUFBSSxDQUFDLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ3hGLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNC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