/**
 * @author Jeff Rose
 */

import { context as apiContext, trace } from '@opentelemetry/api';
import { Logger as OTelLoggerAPI } from '@opentelemetry/api-logs';
import { Entry } from '../entry';
import { OTelLogger } from './otel-logger';
import { EntryToLogRecordOptions, injectTraceContext } from './entry-to-logrecord';

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
    private autoInjectContext: boolean;

    /**
     * Create a ContextAwareLogger
     *
     * @param name - Logger name
     * @param otelLogger - OpenTelemetry Logger instance
     * @param options - Optional conversion options
     * @param autoInjectContext - Whether to automatically inject context (default: true)
     */
    constructor(
        name: string,
        otelLogger: OTelLoggerAPI,
        options: Partial<EntryToLogRecordOptions> = {},
        autoInjectContext: boolean = true
    ) {
        super(name, otelLogger, options);
        this.autoInjectContext = autoInjectContext;
    }

    /**
     * Log an entry with automatic trace context injection
     *
     * @param entry - The Entry to log
     */
    protected _logEntry(entry: Entry): void {
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
    setAutoInjectContext(enabled: boolean): void {
        this.autoInjectContext = enabled;
    }

    /**
     * Check if automatic context injection is enabled
     *
     * @returns True if auto-injection is enabled
     */
    isAutoInjectContextEnabled(): boolean {
        return this.autoInjectContext;
    }

    /**
     * Get the current active trace context
     *
     * @returns Trace context object or undefined
     */
    getActiveTraceContext(): { traceId?: string; spanId?: string; traceFlags?: number } | undefined {
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
export function createContextAwareLogger(name: string, otelLogger: OTelLoggerAPI): ContextAwareLogger {
    return new ContextAwareLogger(name, otelLogger);
}
