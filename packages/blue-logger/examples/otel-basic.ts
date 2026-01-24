/**
 * Basic OpenTelemetry logging example
 *
 * This example demonstrates:
 * - Creating a BlueLoggerProvider
 * - Configuring a console exporter
 * - Using the logger with Apache level scheme
 */

import { BlueLoggerProvider, LayoutAwareConsoleExporter, PatternLayout } from '../src';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { ApacheLevel } from '../src/apache-logging';

// Configure resource with service information
const resource = new Resource({
    'service.name': 'basic-example',
    'service.version': '1.0.0',
});

// Create console exporter with pattern layout
const layout = new PatternLayout('[%d{yyyy-MM-dd HH:mm:ss}] %c %p - %m');
const exporter = new LayoutAwareConsoleExporter({ layout });

// Create processor (use SimpleLogRecordProcessor for immediate export)
const processor = new SimpleLogRecordProcessor(exporter);

// Create logger provider
const provider = new BlueLoggerProvider({
    resource,
    processors: [processor],
});

// Create logger
const logger = provider.createLogger('basic-example');

// Log messages at different levels
logger.log(ApacheLevel.INFO, ['Application started']);
logger.log(ApacheLevel.DEBUG, ['Debug information', { config: 'loaded' }]);
logger.log(ApacheLevel.WARN, ['Warning: Rate limit approaching']);
logger.log(ApacheLevel.ERROR, ['Error occurred', new Error('Something went wrong')]);

// Shutdown provider gracefully
provider.shutdown().then(() => {
    console.log('\nProvider shutdown complete');
});
