# OpenTelemetry Migration Guide for blue-logger

## Overview

This guide helps you migrate blue-logger from the traditional Log4J/Commons Logging architecture to OpenTelemetry (OTel), enabling modern observability features like distributed tracing correlation, standardized log formats, and integration with OTel collectors.

## Why OpenTelemetry?

**Benefits:**

- **Trace Correlation**: Automatically link logs to distributed traces
- **Standardization**: Industry-standard telemetry with vendor-neutral APIs
- **Interoperability**: Works with Jaeger, Zipkin, Prometheus, and OTel Collector
- **Future-proof**: Active CNCF project with growing ecosystem

**Backward Compatibility:**

- All existing blue-logger interfaces preserved
- Appenders continue to work via adapter pattern
- Gradual migration supported - use both approaches simultaneously

## Architecture Comparison

| Traditional (Log4J) | OpenTelemetry           | Notes                                      |
| ------------------- | ----------------------- | ------------------------------------------ |
| Logger              | Logger                  | Same interface, OTel-backed impl available |
| Appender            | LogRecordExporter       | Adapter available for existing Appenders   |
| BatchAppender       | BatchLogRecordProcessor | Batching moved to processor layer          |
| Layout              | Exporter serialization  | Layouts work in OTel exporters             |
| Level               | SeverityNumber/Text     | Bidirectional mapping utilities            |
| Entry               | LogRecord               | Conversion functions provided              |
| AppenderRegistry    | LoggerProvider          | Provider manages processor chain           |

## Quick Start

### Installation

Dependencies are already included in `@blue/logger` 3.0.0+:

- `@opentelemetry/api-logs@~0.211.0`
- `@opentelemetry/sdk-logs@~0.211.0`

### Basic Usage

```typescript
import { BlueLoggerProvider, LayoutAwareConsoleExporter } from '@blue/logger';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { ApacheLevel } from '@blue/logger';

// Create OTel provider with console exporter
const exporter = new LayoutAwareConsoleExporter();
const processor = new SimpleLogRecordProcessor(exporter);
const provider = new BlueLoggerProvider({ processors: [processor] });

// Create logger
const logger = provider.createLogger('my-app');

// Use familiar blue-logger API
logger.log(ApacheLevel.INFO, ['Application started']);
```

### With Trace Correlation

```typescript
import { ContextAwareLogger, BlueLoggerProvider } from '@blue/logger';
import { trace, context } from '@opentelemetry/api';

const provider = new BlueLoggerProvider({ processors: [processor] });
const otelLogger = provider.getLogger('my-app');

// Context-aware logger automatically includes trace/span IDs
const logger = new ContextAwareLogger('my-app', otelLogger);

// Within a traced operation
const tracer = trace.getTracer('my-app');
const span = tracer.startSpan('operation');
context.with(trace.setSpan(context.active(), span), () => {
    logger.log(ApacheLevel.INFO, ['This log includes trace_id and span_id']);
    span.end();
});
```

## Migration Strategies

### Strategy 1: Gradual Migration (Recommended)

Keep existing Appenders while adding OTel exporters:

```typescript
import { BlueLoggerProvider } from '@blue/logger';
import { ConsoleAppender } from '@blue/logger';

// Create provider from existing appenders
const provider = BlueLoggerProvider.fromAppenders([new ConsoleAppender()]);

const logger = provider.createLogger('my-app');
// Logger works exactly as before
```

**Benefits:**

- Zero code changes for existing loggers
- Test OTel features in parallel
- Easy rollback

### Strategy 2: Full OTel Adoption

Replace Appenders with OTel exporters:

**Before:**

```typescript
import { SimpleLogger } from '@blue/logger';
import { ConsoleAppender } from '@blue/logger';

const logger = new SimpleLogger('my-app');
logger.addAppender(new ConsoleAppender());
```

**After:**

```typescript
import { BlueLoggerProvider, LayoutAwareConsoleExporter } from '@blue/logger';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

const exporter = new LayoutAwareConsoleExporter();
const processor = new SimpleLogRecordProcessor(exporter);
const provider = new BlueLoggerProvider({ processors: [processor] });

const logger = provider.createLogger('my-app');
```

### Strategy 3: Dual-Mode (Development/Testing)

Run both systems simultaneously during migration:

```typescript
// Traditional appender
const appenderLogger = new SimpleLogger('my-app');
appenderLogger.addAppender(new ConsoleAppender());

// OTel logger
const provider = new BlueLoggerProvider({ processors: [processor] });
const otelLogger = provider.createLogger('my-app');

// Log to both during transition
function log(level, message) {
    appenderLogger.log(level, message);
    otelLogger.log(level, message);
}
```

## Level Scheme Mapping

All blue-logger level schemes map to OTel SeverityNumber:

### Apache Logging

```typescript
import { ApacheLevel } from '@blue/logger';
import { SeverityNumber } from '@opentelemetry/api-logs';

ApacheLevel.FATAL  → SeverityNumber.FATAL  (21)
ApacheLevel.ERROR  → SeverityNumber.ERROR  (17)
ApacheLevel.WARN   → SeverityNumber.WARN   (13)
ApacheLevel.INFO   → SeverityNumber.INFO   (9)
ApacheLevel.DEBUG  → SeverityNumber.DEBUG  (5)
ApacheLevel.TRACE  → SeverityNumber.TRACE  (1)
```

### Conversion Utilities

```typescript
import { ApacheLevel, levelToSeverity, severityToLevel } from '@blue/logger';

// Level → Severity
const severity = levelToSeverity(ApacheLevel.ERROR, 'apache');
// { severityNumber: 17, severityText: 'error' }

// Severity → Level
const level = severityToLevel(SeverityNumber.ERROR, 'error');
// ApacheLevel.ERROR

// Static methods on level classes
ApacheLevel.toSeverity(ApacheLevel.ERROR); // SeverityNumber.ERROR
ApacheLevel.fromSeverity(SeverityNumber.ERROR); // ApacheLevel.ERROR
```

## Exporter Guide

### Console Exporter

```typescript
import { LayoutAwareConsoleExporter, PatternLayout } from '@blue/logger';

const exporter = new LayoutAwareConsoleExporter({
    layout: new PatternLayout('[%d] %c %p - %m'),
    useColors: true,
});
```

### HTTP Exporter

```typescript
import { FetchLogRecordExporter, JSONLayout } from '@blue/logger';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

const exporter = new FetchLogRecordExporter('https://logs.example.com/api/logs', {
    layout: new JSONLayout(),
    timeout: 10000,
    headers: {
        Authorization: 'Bearer token123',
    },
});

const processor = new BatchLogRecordProcessor(exporter, {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 5000,
    exportTimeoutMillis: 30000,
});
```

### Appender Adapter

Wrap existing Appenders:

```typescript
import { AppenderLogRecordExporter } from '@blue/logger';
import { MyCustomAppender } from './my-appender';

const appender = new MyCustomAppender();
const exporter = new AppenderLogRecordExporter(appender);
const processor = new SimpleLogRecordProcessor(exporter);
```

### blue-dispatcher HTTP Exporter

For dependency injection with blue-dispatcher:

```typescript
import { HTTPLogRecordExporter } from '@blue/dispatcher';
import { HTTP } from '@blue/http';

const exporter = new HTTPLogRecordExporter('/api/logs', {
    timeout: 10000,
});

// Inject HTTP service (via DI framework or manually)
const httpService = new HTTP();
exporter.setHTTP(httpService);
```

## Consumer Package Updates

### blue-context EventLogger

EventLogger now supports dual-mode OTel:

```typescript
import { EventLogger } from '@blue/context';
import { BlueLoggerProvider } from '@blue/logger';

const logger = new EventLogger();

// Traditional event-based (existing behavior)
logger.on('log:info', (entry) => {
    console.log('Event:', entry);
});

// Enable OTel (new opt-in feature)
const provider = new BlueLoggerProvider({ processors: [processor] });
logger.enableOTel(provider);

// Now emits BOTH events AND OTel records
logger.log(Level.INFO, ['Dual-mode logging']);

// Disable OTel if needed
logger.disableOTel();
```

## Layout Support

Layouts continue to work with OTel exporters:

```typescript
import { PatternLayout, XMLLayout, JSONLayout } from '@blue/logger';

// Pattern layout
const patternLayout = new PatternLayout('[%d{yyyy-MM-dd HH:mm:ss}] %c %p - %m');

// JSON layout
const jsonLayout = new JSONLayout();

// Custom layout
class CustomLayout extends AbstractBatchLayout {
    format(entry) {
        return `${entry.timestamp}: ${entry.message.join(' ')}`;
    }

    formatBatch(entries) {
        return entries.map((e) => this.format(e)).join('\n');
    }
}
```

## Resource Configuration

Add service metadata to logs:

```typescript
import { BlueLoggerProvider } from '@blue/logger';
import { Resource } from '@opentelemetry/resources';

const resource = new Resource({
    'service.name': 'my-service',
    'service.version': '1.0.0',
    'service.instance.id': 'instance-123',
    'deployment.environment': 'production',
});

const provider = new BlueLoggerProvider({
    resource,
    processors: [processor],
});
```

## Best Practices

1. **Use Context-Aware Loggers for Microservices**

    ```typescript
    const logger = new ContextAwareLogger('service-name', otelLogger);
    ```

2. **Configure Batching for Production**

    ```typescript
    const processor = new BatchLogRecordProcessor(exporter, {
        maxQueueSize: 2048,
        maxExportBatchSize: 512,
        scheduledDelayMillis: 5000,
    });
    ```

3. **Set Appropriate Timeouts**

    ```typescript
    const exporter = new FetchLogRecordExporter(url, {
        timeout: 10000, // 10 seconds
    });
    ```

4. **Use Resource Attributes**

    ```typescript
    const resource = new Resource({
        'service.name': 'my-service',
        'service.version': process.env.VERSION,
    });
    ```

5. **Shutdown Gracefully**
    ```typescript
    process.on('SIGTERM', async () => {
        await provider.shutdown();
        process.exit(0);
    });
    ```

## Troubleshooting

### Logs Not Appearing

Check processor configuration:

```typescript
// Use SimpleLogRecordProcessor for immediate export (debugging)
const processor = new SimpleLogRecordProcessor(exporter);

// Or check batch processor settings
const processor = new BatchLogRecordProcessor(exporter, {
    scheduledDelayMillis: 1000, // Flush every second
});
```

### Trace IDs Not Included

Ensure using ContextAwareLogger:

```typescript
const logger = new ContextAwareLogger('my-app', otelLogger);

// Verify context is active
const span = trace.getSpan(context.active());
if (!span) {
    console.warn('No active span!');
}
```

### Performance Issues

Use batching and adjust batch size:

```typescript
const processor = new BatchLogRecordProcessor(exporter, {
    maxQueueSize: 4096, // Increase queue
    maxExportBatchSize: 1024, // Larger batches
    scheduledDelayMillis: 10000, // Less frequent exports
});
```

### Type Errors

Ensure compatible OTel versions:

```json
{
    "@opentelemetry/api": "~1.9.0",
    "@opentelemetry/api-logs": "~0.211.0",
    "@opentelemetry/sdk-logs": "~0.211.0"
}
```

## Migration Checklist

- [ ] Update to `@blue/logger` 3.0.0+
- [ ] Choose migration strategy (gradual/full/dual-mode)
- [ ] Create LoggerProvider with processors
- [ ] Replace SimpleLogger with provider.createLogger()
- [ ] Configure exporters (console/HTTP/custom)
- [ ] Test log output
- [ ] Add trace correlation (if using tracing)
- [ ] Configure resource attributes
- [ ] Set up batching for production
- [ ] Update error handling
- [ ] Add graceful shutdown
- [ ] Monitor performance
- [ ] Update documentation
- [ ] Train team on new APIs

## Additional Resources

- [OpenTelemetry Logs Specification](https://opentelemetry.io/docs/specs/otel/logs/)
- [OpenTelemetry JavaScript SDK](https://github.com/open-telemetry/opentelemetry-js)
- [blue-logger API Documentation](./README.md)
- [Example Applications](./examples/)

## Getting Help

- File issues: [BlueJS GitHub](https://github.com/anthropics/blue/issues)
- Ask questions: BlueJS team channel
- Review examples: `packages/blue-logger/examples/`
