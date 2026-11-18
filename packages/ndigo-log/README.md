# @ndigo/log

> Isomorphic logging core for Ndigo — one `Logger` abstraction over the OpenTelemetry API, with severity mappings and threshold filtering.

`@ndigo/log` is the dependency-light logging layer shared across Ndigo. It defines the `Logger` contract, the `getLogger()` factory, console and OpenTelemetry-backed implementations, and the severity mappings that translate Apache, syslog, npm, and CLI level names into `SeverityNumber`s. It depends only on the OpenTelemetry API packages — no Ndigo packages — so low-level framework code (`@ndigo/factory`, `@ndigo/dispatcher`, `@ndigo/platform-node`, `@ndigo/test`) can log without pulling in the telemetry stack.

## Installation

```bash
pnpm add @ndigo/log
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { getLogger } from '@ndigo/log';

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
import { LoggerFactory } from '@ndigo/log';

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

### Module-level vs context-injected

Two entry points, both backed by the same `LoggerFactory`:

- **Module-level (lightweight):** `const logger = getLogger('my-module')`. Best for
  framework internals, leaf packages, and code outside a managed component.
- **Context-injected (recommended for components):** implement `LoggerAware`
  (`AsLoggerAware`) or call `applicationContext.getLogger('my-component')` from
  `@ndigo/context`. The logger is reconfigurable and testable through the context.

Both produce `ConfigurableLogger` handles wrapping a `ContextAwareLogger`, so
records from either API stamp the active span's `traceId`/`spanId` and
correlate to the same trace tree — no explicit parent linkage is needed. Use
the module-level API when you are outside a managed component; prefer the
injected API in application components so logging follows the context's
configuration.

### Context-driven configuration

`LoggerFactory.configure({ type, threshold, contextAware })` applies settings in
one call; `GenericApplicationContext.refresh()` invokes it from optional
`logging.type`, `logging.threshold`, and `logging.contextAware` environment
properties, so a context can direct its (and its beans') output to the
console, the OTel pipeline, or nowhere.

## API

The full API is at `api/` (generated; run `pnpm doc:api`). Primary exports live in
[`src/index.ts`](src/index.ts);

## Development

```bash
pnpm --filter @ndigo/log build:lib
pnpm --filter @ndigo/log test
```

## See Also

- [@ndigo/telemetry](../ndigo-telemetry/README.md) — metrics, tracing, and platform wiring that consume these loggers

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
