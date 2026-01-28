/**
 * Dual-mode logging during migration
 *
 * This example demonstrates:
 * - Running traditional Appenders alongside OTel exporters
 * - Gradual migration strategy
 * - A/B testing OTel features
 */

import { BlueLoggerProvider, LayoutAwareConsoleExporter, PatternLayout, SimpleLogger, ConsoleAppender } from '../src';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { ApacheLevel } from '../src/apache-logging';

// Setup traditional blue-logger with Appender
const traditionalLogger = new SimpleLogger('traditional');
const traditionalAppender = new ConsoleAppender();
traditionalAppender.layout = new PatternLayout('[TRADITIONAL] %p - %m');
traditionalLogger.addAppender(traditionalAppender);

// Setup OTel-based logger
const otelExporter = new LayoutAwareConsoleExporter({
    layout: new PatternLayout('[OTEL] %p - %m'),
});
const otelProcessor = new SimpleLogRecordProcessor(otelExporter);
const otelProvider = new BlueLoggerProvider({
    processors: [otelProcessor],
});
const otelLogger = otelProvider.createLogger('otel');

// Wrapper function for dual logging
class DualLogger {
    constructor(
        private traditional: SimpleLogger,
        private otel: ReturnType<typeof otelProvider.createLogger>
    ) {}

    log(level: (typeof ApacheLevel)[keyof typeof ApacheLevel], message: any[]) {
        // Log to traditional system
        this.traditional.log(level, message);

        // Also log to OTel system
        this.otel.log(level, message);
    }

    info(...message: any[]) {
        this.log(ApacheLevel.INFO, message);
    }

    warn(...message: any[]) {
        this.log(ApacheLevel.WARN, message);
    }

    error(...message: any[]) {
        this.log(ApacheLevel.ERROR, message);
    }

    debug(...message: any[]) {
        this.log(ApacheLevel.DEBUG, message);
    }
}

// Create dual logger
const logger = new DualLogger(traditionalLogger, otelLogger);

// Use logger - logs appear from both systems
console.log('=== Dual-Mode Logging Example ===\n');

logger.info('Application starting');
logger.debug('Configuration loaded', { env: 'development' });
logger.warn('Memory usage high');
logger.error('Database connection failed', new Error('Connection timeout'));

console.log('\n=== Output shows both traditional and OTel logs ===');

// Cleanup
setTimeout(async () => {
    await otelProvider.shutdown();
    console.log('\nOTel provider shutdown');
}, 1000);
