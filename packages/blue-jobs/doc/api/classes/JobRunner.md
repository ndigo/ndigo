[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / JobRunner

# Class: JobRunner

The worker engine (AD-72 D-4): single-flight poll ticks, `concurrency`
execution slots, per-execution timeout (cooperative `AbortSignal`), lease
heartbeat, exponential-backoff retries until `maxAttempts`, one
`jobs.job.<type>` span per execution, and outcome logging via `@blue/log`.

Lifecycle: `SmartLifecycle`, phase 10 (after the registry scan in phase 0).
The poll loop starts explicitly — `start()` after boot, the `HTTPServer`
precedent — because a pending poll timer keeps the process alive; pass
`autoStart: true` for refresh-driven start (`stop()` stops claiming while
in-flight executions continue; `close()` drains — the container closes it
on context close).

Deterministic tests drive [tick](#tick) directly with an injected clock.

## Since

1.0.0

## Constructors

### Constructor

> **new JobRunner**(`options?`): `JobRunner`

#### Parameters

##### options?

[`JobRunnerOptions`](../interfaces/JobRunnerOptions.md) = `{}`

Driver/registry (or context resolution) and tuning.

#### Returns

`JobRunner`

## Properties

### isAutoStartup

> `readonly` **isAutoStartup**: `boolean`

***

### phase

> `readonly` **phase**: `10` = `10`

## Accessors

### inFlight

#### Get Signature

> **get** **inFlight**(): `number`

Executions currently in flight.

##### Returns

`number`

***

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

Whether the poll loop is running.

##### Returns

`boolean`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Container teardown: stops claiming and drains in-flight executions.

#### Returns

`Promise`\<`void`\>

***

### drain()

> **drain**(): `Promise`\<`void`\>

Awaits all in-flight executions (retry-safe: executions do not claim
new work, so the set only shrinks).

#### Returns

`Promise`\<`void`\>

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Container injection: the context drivers and registries are resolved
from when not passed to the constructor.

#### Parameters

##### applicationContext

`ApplicationContext`

The application context.

#### Returns

`void`

***

### start()

> **start**(): `void`

SmartLifecycle start: resolves collaborators (fail loud when missing)
and arms the poll loop.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

SmartLifecycle stop: stops claiming; in-flight executions continue.

#### Returns

`void`

***

### tick()

> **tick**(): `Promise`\<`number`\>

One poll pass: claims up to the free execution slots and starts their
executions. Single-flight — concurrent calls share one pass.

#### Returns

`Promise`\<`number`\>

Number of jobs claimed in this pass.
