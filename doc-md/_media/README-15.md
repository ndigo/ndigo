# Blue Telemetry

Blue Telemetry provides tracing, metrics, and logging integrations for BlueJS using OpenTelemetry.

## Features

- Telemetry bootstrap via `configureTelemetry()`
- TC39 decorators: `@traced`, `@counted`
- Logger abstraction with threshold filtering
- Severity mapping utilities for `syslog`, `npm`, `apache`, and `cli`
- Context-aware logging for trace/span correlation
- Built-in instrumentation for BlueJS context/dispatcher/router packages

## Installation

```bash
pnpm add @blue/telemetry
```

## Usage

```typescript
import { SeverityNumber } from '@opentelemetry/api-logs';
import { configureTelemetry } from '@blue/telemetry/node';
import { getLogger } from '@blue/telemetry';

configureTelemetry({
    minimumSeverity: SeverityNumber.INFO,
    instrumentations: [],
});

const logger = getLogger('example');
logger.info('telemetry initialized');
```

## Development

```bash
pnpm --filter @blue/telemetry build:lib
pnpm --filter @blue/telemetry test
```
