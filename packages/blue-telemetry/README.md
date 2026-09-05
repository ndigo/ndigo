# Blue Telemetry

Blue Telemetry provides tracing, metrics, and logging integrations for BlueJS using OpenTelemetry.

## Packages

The telemetry surface is split by platform so the isomorphic core carries zero
installation weight:

| Package | Contents |
| --- | --- |
| `@blue/telemetry` | Isomorphic API core: `getLogger`, `FeatureMetricAggregator`, `@traced`/`@counted` decorators, severity mapping, platform-free instrumentation bases. Installs only `@opentelemetry/api`, `api-logs`, `instrumentation`. |
| `@blue/telemetry-node` | Node setup: `configureTelemetry()` (NodeSDK), `HTTPServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`, `SeverityFilterLogRecordProcessor`. |
| `@blue/telemetry-web` | Browser setup: `configureBrowserTelemetry()`, `RouterInstrumentation`, `DispatcherInstrumentation`. |

## Features

- Telemetry bootstrap via `configureTelemetry()` (`@blue/telemetry-node`) or
  `configureBrowserTelemetry()` (`@blue/telemetry-web`)
- TC39 decorators: `@traced`, `@counted`
- Logger abstraction with threshold filtering
- Severity mapping utilities for `syslog`, `npm`, `apache`, and `cli`
- Context-aware logging for trace/span correlation
- Built-in instrumentations for BlueJS context/dispatcher/router packages

## Usage

```typescript
import { SeverityNumber } from '@opentelemetry/api-logs';
import { configureTelemetry } from '@blue/telemetry-node';
import { getLogger } from '@blue/telemetry';

configureTelemetry({
    minimumSeverity: SeverityNumber.INFO,
    instrumentations: [],
});

const logger = getLogger('example');
logger.info('telemetry initialized');
```

Browser apps:

```typescript
import { configureBrowserTelemetry } from '@blue/telemetry-web';

configureBrowserTelemetry({ serviceName: 'my-app', useConsoleExporters: true });
```

## Development

```bash
pnpm --filter @blue/telemetry build:lib
pnpm --filter @blue/telemetry test
```