# @blue/log

> Isomorphic logging core for BlueJS — one `Logger` abstraction over the OpenTelemetry API, with severity mappings and threshold filtering.

`@blue/log` is the dependency-light logging layer shared across BlueJS. It defines the `Logger` contract, the `getLogger()` factory, console and OpenTelemetry-backed implementations, and the severity mappings that translate Apache, syslog, npm, and CLI level names into `SeverityNumber`s. It depends only on the OpenTelemetry API packages — no BlueJS packages — so low-level framework code (`@blue/factory`, `@blue/dispatcher`, `@blue/platform-node`, `@blue/test`) can log without pulling in the telemetry stack.

## Installation

```bash
pnpm add @blue/log
```

Prerequisites for every BlueJS package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```ts
import { getLogger } from '@blue/log';

const logger = getLogger('my-app');

logger.info('application started', { region: 'eu-west-1' });
logger.error('request failed', new Error('connection reset'));
```

Loggers created by the factory default to the console appender and the `DEBUG` threshold, and include trace context automatically when an OpenTelemetry span is active.

## Usage

### Choosing an appender and threshold

`LoggerFactory` configures the loggers created afterwards — `'console'` (default), `'open-telemetry'` (emits through the OTel log pipeline), or `'none'`:

```ts
import { SeverityNumber } from '@opentelemetry/api-logs';
import { LoggerFactory } from '@blue/log';

LoggerFactory.setType('open-telemetry');
LoggerFactory.setThreshold(SeverityNumber.WARN);

const logger = LoggerFactory.getLogger('queue');
logger.debug('ignored at WARN');
logger.warn('queue depth high', { depth: 42 });
```

The factory also exposes `setContextAware(enabled)` (trace/span attributes on each entry) and `reset()` for tests.

### Thresholds per logger

Each `Logger` carries its own threshold and can raise or lower it at runtime:

```ts
import { SeverityNumber } from '@opentelemetry/api-logs';

const logger = getLogger('chat');
logger.setThreshold(SeverityNumber.ERROR);
logger.isEnabled(SeverityNumber.WARN); // false
```

### Severity mappings

The package ships the severity schemes used across the framework — `detectSeverityScheme`, `getSeverityMapping`, `levelToSeverityNumber`, and `severityNumberToLevel` for the `apache`, `syslog`, `npm`, and `cli` naming conventions.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/log build:lib
pnpm --filter @blue/log test
```

## See Also

- [@blue/telemetry](../blue-telemetry/README.md) — metrics, tracing, and platform wiring that consume these loggers

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
