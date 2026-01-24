/**
 * @author Jeff Rose
 */
import { context as apiContext, trace } from '@opentelemetry/api';
import { OTelLogger } from './otel-logger';
/**
 * ContextAwareLogger extends OTelLogger with automatic trace correlation.
 *
 * This logger automatically injects trace_id, span_id, and trace_flags
 * from the active OpenTelemetry context into log records, enabling
 * correlation between logs and traces in observability systems.
 *
 * @example
 * ```typescript
 * import { ContextAwareLogger, BlueLoggerProvider } from '@blue/logger';
 * import { trace } from '@opentelemetry/api';
 *
 * const provider = new BlueLoggerProvider();
 * const otelLogger = provider.getLogger('my-app');
 * const logger = new ContextAwareLogger('my-app', otelLogger);
 *
 * // Within a traced operation
 * const tracer = trace.getTracer('my-app');
 * const span = tracer.startSpan('operation');
 * trace.context.with(trace.setSpan(apiContext.active(), span), () => {
 *   logger.info('This log will include trace_id and span_id');
 *   span.end();
 * });
 * ```
 */
export class ContextAwareLogger extends OTelLogger {
    autoInjectContext;
    /**
     * Create a ContextAwareLogger
     *
     * @param name - Logger name
     * @param otelLogger - OpenTelemetry Logger instance
     * @param options - Optional conversion options
     * @param autoInjectContext - Whether to automatically inject context (default: true)
     */
    constructor(name, otelLogger, options = {}, autoInjectContext = true) {
        super(name, otelLogger, options);
        this.autoInjectContext = autoInjectContext;
    }
    /**
     * Log an entry with automatic trace context injection
     *
     * @param entry - The Entry to log
     */
    _logEntry(entry) {
        if (this.autoInjectContext) {
            // Get the active context
            const activeContext = apiContext.active();
            // Get the active span
            const span = trace.getSpan(activeContext);
            if (span) {
                // Include context in conversion options
                this.conversionOptions = {
                    ...this.conversionOptions,
                    context: activeContext,
                };
            }
        }
        // Call parent implementation
        super._logEntry(entry);
    }
    /**
     * Enable or disable automatic context injection
     *
     * @param enabled - Whether to enable auto-injection
     */
    setAutoInjectContext(enabled) {
        this.autoInjectContext = enabled;
    }
    /**
     * Check if automatic context injection is enabled
     *
     * @returns True if auto-injection is enabled
     */
    isAutoInjectContextEnabled() {
        return this.autoInjectContext;
    }
    /**
     * Get the current active trace context
     *
     * @returns Trace context object or undefined
     */
    getActiveTraceContext() {
        const activeContext = apiContext.active();
        const span = trace.getSpan(activeContext);
        if (span) {
            const spanContext = span.spanContext();
            return {
                traceId: spanContext.traceId,
                spanId: spanContext.spanId,
                traceFlags: spanContext.traceFlags,
            };
        }
        return undefined;
    }
}
/**
 * Create a ContextAwareLogger with default options
 *
 * @param name - Logger name
 * @param otelLogger - OpenTelemetry Logger instance
 * @returns ContextAwareLogger instance
 */
export function createContextAwareLogger(name, otelLogger) {
    return new ContextAwareLogger(name, otelLogger);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC1sb2dnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvb3RlbC9jb250ZXh0LWxvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxPQUFPLElBQUksVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBR2xFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNILE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxVQUFVO0lBQ3RDLGlCQUFpQixDQUFVO0lBRW5DOzs7Ozs7O09BT0c7SUFDSCxZQUNJLElBQVksRUFDWixVQUF5QixFQUN6QixVQUE0QyxFQUFFLEVBQzlDLG9CQUE2QixJQUFJO1FBRWpDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLFNBQVMsQ0FBQyxLQUFZO1FBQzVCLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIseUJBQXlCO1lBQ3pCLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUUxQyxzQkFBc0I7WUFDdEIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUUxQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNQLHdDQUF3QztnQkFDeEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHO29CQUNyQixHQUFHLElBQUksQ0FBQyxpQkFBaUI7b0JBQ3pCLE9BQU8sRUFBRSxhQUFhO2lCQUN6QixDQUFDO1lBQ04sQ0FBQztRQUNMLENBQUM7UUFFRCw2QkFBNkI7UUFDN0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILG9CQUFvQixDQUFDLE9BQWdCO1FBQ2pDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCwwQkFBMEI7UUFDdEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxxQkFBcUI7UUFDakIsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFMUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNQLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxPQUFPO2dCQUNILE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTztnQkFDNUIsTUFBTSxFQUFFLFdBQVcsQ0FBQyxNQUFNO2dCQUMxQixVQUFVLEVBQUUsV0FBVyxDQUFDLFVBQVU7YUFDckMsQ0FBQztRQUNOLENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0NBQ0o7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsd0JBQXdCLENBQUMsSUFBWSxFQUFFLFVBQXlCO0lBQzVFLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDcEQsQ0FBQyJ9