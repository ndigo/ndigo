# blue-logger OpenTelemetry Examples

This directory contains example code demonstrating how to use blue-logger with OpenTelemetry.

## Running Examples

### Prerequisites

```bash
# Install dependencies
pnpm install

# Build blue-logger
cd packages/blue-logger
pnpm build:lib
```

### Basic Example

Demonstrates basic OTel logging with console output:

```bash
npx ts-node examples/otel-basic.ts
```

**Features:**

- BlueLoggerProvider setup
- Console exporter with PatternLayout
- Logging at different levels
- Graceful shutdown

### Context-Aware Example

Demonstrates trace correlation and context propagation:

```bash
npx ts-node examples/otel-with-context.ts
```

**Features:**

- Automatic trace/span ID injection
- Nested span contexts
- Distributed tracing integration
- ContextAwareLogger usage

### Dual-Mode Migration Example

Demonstrates running traditional and OTel logging side-by-side:

```bash
npx ts-node examples/migration-dual-mode.ts
```

**Features:**

- Traditional Appender logging
- OTel exporter logging
- Wrapper for dual output
- Migration strategy demonstration

### HTTP Export Example

Demonstrates batched HTTP log export:

```bash
# First, start a test server (in another terminal):
npx ts-node examples/test-server.ts

# Then run the example:
npx ts-node examples/otel-http-export.ts
```

**Features:**

- HTTP endpoint export
- Batch processing
- JSON layout
- Error handling
- Resource metadata

## Example Structure

Each example follows this pattern:

1. **Setup**: Configure provider, exporters, processors
2. **Usage**: Create logger and log messages
3. **Cleanup**: Shutdown provider gracefully

## Additional Resources

- [Migration Guide](../MIGRATION-OTEL.md) - Comprehensive migration documentation
- [README](../README.md) - Package documentation
- [Tests](../test/otel/) - Unit tests showing API usage

## Customization

Feel free to modify these examples to:

- Try different layouts (JSON, XML, Pattern)
- Experiment with batch processor settings
- Add custom exporters
- Integrate with your tracing setup
- Test different level schemes (NPM, CLI, Syslog)
