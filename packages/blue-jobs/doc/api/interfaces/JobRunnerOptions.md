[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / JobRunnerOptions

# Interface: JobRunnerOptions

Options for [JobRunner](../classes/JobRunner.md).

## Since

1.0.0

## Properties

### autoStart?

> `optional` **autoStart?**: `boolean`

Start the poll loop on context refresh (`SmartLifecycle`). Default
**false** — a pending poll timer keeps the process alive, so the loop
starts explicitly (the `HTTPServer` precedent): worker processes start
the runner after boot; API-only processes leave it stopped. Set `true`
to opt into refresh-driven start.

***

### backoffMs?

> `optional` **backoffMs?**: (`attempt`) => `number`

Retry backoff (milliseconds until the next attempt); default exponential.

#### Parameters

##### attempt

`number`

#### Returns

`number`

***

### clock?

> `optional` **clock?**: () => `number`

Clock override for deterministic tests; default `Date.now`.

#### Returns

`number`

***

### concurrency?

> `optional` **concurrency?**: `number`

Execution slots (max claimed per pass); default 1.

***

### driver?

> `optional` **driver?**: [`JobDriver`](JobDriver.md)

The driver to claim from; resolved from the `jobDriver` bean when omitted.

***

### leaseMs?

> `optional` **leaseMs?**: `number`

Claim lease; also the heartbeat interval base (`leaseMs / 2`); default 30000.

***

### logger?

> `optional` **logger?**: `Logger`

Logger override; default `getLogger('@blue/jobs')`.

***

### pollIntervalMs?

> `optional` **pollIntervalMs?**: `number`

Delay between empty polls; default 1000.

***

### registry?

> `optional` **registry?**: [`JobHandlerRegistry`](../classes/JobHandlerRegistry.md)

The handler registry; resolved from the `jobHandlerRegistry` bean when omitted.
