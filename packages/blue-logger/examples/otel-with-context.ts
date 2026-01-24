/**
 * OpenTelemetry logging with trace correlation
 *
 * This example demonstrates:
 * - Context-aware logging
 * - Automatic trace/span ID injection
 * - Distributed tracing integration
 */

import { BlueLoggerProvider, LayoutAwareConsoleExporter, ContextAwareLogger } from '../src';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { context, trace } from '@opentelemetry/api';
import { ApacheLevel } from '../src/apache-logging';

// Setup tracing
const tracerProvider = new NodeTracerProvider({
    resource: new Resource({
        'service.name': 'context-example',
    }),
});
tracerProvider.register();

// Setup logging
const exporter = new LayoutAwareConsoleExporter();
const processor = new SimpleLogRecordProcessor(exporter);
const loggerProvider = new BlueLoggerProvider({
    resource: new Resource({
        'service.name': 'context-example',
    }),
    processors: [processor],
});

// Create context-aware logger
const otelLogger = loggerProvider.getLogger('context-example');
const logger = new ContextAwareLogger('context-example', otelLogger);

// Create tracer
const tracer = trace.getTracer('context-example');

// Example: Process a request within a traced operation
async function processRequest(requestId: string) {
    const span = tracer.startSpan('processRequest', {
        attributes: {
            'request.id': requestId,
        },
    });

    // Execute within span context
    await context.with(trace.setSpan(context.active(), span), async () => {
        // These logs will automatically include trace_id and span_id
        logger.log(ApacheLevel.INFO, ['Processing request', requestId]);

        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 100));

        logger.log(ApacheLevel.DEBUG, ['Request validation complete']);

        // Simulate nested operation
        const childSpan = tracer.startSpan('validateUser', {
            attributes: {
                'user.id': 'user-123',
            },
        });

        await context.with(trace.setSpan(context.active(), childSpan), async () => {
            logger.log(ApacheLevel.INFO, ['Validating user credentials']);
            await new Promise((resolve) => setTimeout(resolve, 50));
            logger.log(ApacheLevel.INFO, ['User validated successfully']);
            childSpan.end();
        });

        logger.log(ApacheLevel.INFO, ['Request processing complete']);
        span.end();
    });
}

// Run example
async function main() {
    console.log('=== Context-Aware Logging Example ===\n');

    await processRequest('req-001');

    console.log('\nShutting down...');
    await loggerProvider.shutdown();
    await tracerProvider.shutdown();
}

main().catch(console.error);
