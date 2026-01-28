/**
 * HTTP export example
 *
 * This example demonstrates:
 * - Exporting logs to an HTTP endpoint
 * - Batch processing for efficiency
 * - Layout customization
 * - Error handling
 */

import { BlueLoggerProvider, FetchLogRecordExporter, JSONLayout } from '../src';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { ApacheLevel } from '../src/apache-logging';

// Configure HTTP exporter
const exporter = new FetchLogRecordExporter('http://localhost:8080/api/logs', {
    layout: new JSONLayout(),
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer your-api-token',
    },
});

// Configure batch processor for efficient export
const processor = new BatchLogRecordProcessor(exporter, {
    maxQueueSize: 2048, // Max logs to queue before dropping
    maxExportBatchSize: 512, // Max logs per batch export
    scheduledDelayMillis: 5000, // Export every 5 seconds
    exportTimeoutMillis: 30000, // Export timeout
});

// Create provider with resource metadata
const provider = new BlueLoggerProvider({
    resource: new Resource({
        'service.name': 'http-export-example',
        'service.version': '1.0.0',
        'deployment.environment': 'production',
        'host.name': 'server-01',
    }),
    processors: [processor],
});

// Create logger
const logger = provider.createLogger('http-export');

// Generate logs
console.log('=== HTTP Export Example ===');
console.log('Logs will be batched and sent to http://localhost:8080/api/logs\n');

// Log messages (will be batched)
for (let i = 1; i <= 10; i++) {
    logger.log(ApacheLevel.INFO, [`Log message ${i}`]);

    if (i % 3 === 0) {
        logger.log(ApacheLevel.WARN, [`Warning on iteration ${i}`]);
    }

    if (i % 5 === 0) {
        logger.log(ApacheLevel.ERROR, [`Error on iteration ${i}`, new Error('Simulated error')]);
    }
}

console.log('Logs queued for export...');

// Force flush to send immediately
provider
    .forceFlush()
    .then(() => {
        console.log('Logs flushed to HTTP endpoint');

        // Shutdown
        return provider.shutdown();
    })
    .then(() => {
        console.log('Provider shutdown complete');
    })
    .catch((error) => {
        console.error('Export error:', error.message);
    });

/**
 * To test this example, you can use a simple HTTP server:
 *
 * ```javascript
 * const http = require('http');
 *
 * const server = http.createServer((req, res) => {
 *     if (req.method === 'POST' && req.url === '/api/logs') {
 *         let body = '';
 *         req.on('data', chunk => body += chunk);
 *         req.on('end', () => {
 *             console.log('Received logs:', body);
 *             res.writeHead(200);
 *             res.end('OK');
 *         });
 *     }
 * });
 *
 * server.listen(8080, () => {
 *     console.log('Log server listening on port 8080');
 * });
 * ```
 */
