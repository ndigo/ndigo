[**@ndigo/cluster v0.0.1**](../../README.md)

***

[@ndigo/cluster](../../README.md) / [cluster-runner](../README.md) / ClusterRunnerOptions

# Interface: ClusterRunnerOptions

Options for [ClusterRunner](../classes/ClusterRunner.md).

## Properties

### basePort?

> `optional` **basePort?**: `number`

Port base: when set, each child gets `PORT = base + slot` (the apps'
documented `PORT` env override) unless `ports` pins a value.

***

### clock?

> `optional` **clock?**: () => `number`

Injectable epoch-ms clock.

#### Returns

`number`

***

### command

> **command**: `string`[]

The child command (argv), e.g. `['node', 'dist/main.js']`.

***

### cwd?

> `optional` **cwd?**: `string`

Working directory for the children; defaults to the parent's cwd.

***

### env?

> `optional` **env?**: `Record`\<`string`, `string`\>

Base environment for every child; slot variables are overlaid.

***

### log?

> `optional` **log?**: (`message`) => `void`

Log sink; defaults to the `ndigo-cluster:runner` `@ndigo/log` channel.

#### Parameters

##### message

`string`

#### Returns

`void`

***

### maxRestartsPerWindow?

> `optional` **maxRestartsPerWindow?**: `number`

Crash-loop guard: max respawns per slot per window.

***

### ports?

> `optional` **ports?**: `number`[]

Explicit per-slot `PORT` overrides (indexed by slot).

***

### restartBaseMs?

> `optional` **restartBaseMs?**: `number`

Respawn backoff base (default 500 ms).

***

### restartJitter?

> `optional` **restartJitter?**: `number`

Backoff jitter factor (default 0.2).

***

### restartMaxMs?

> `optional` **restartMaxMs?**: `number`

Respawn backoff ceiling (default 30 000 ms).

***

### restartWindowMs?

> `optional` **restartWindowMs?**: `number`

Crash-loop guard window (default 60 000 ms).

***

### shutdownTimeoutMs?

> `optional` **shutdownTimeoutMs?**: `number`

How long a child may take to exit after the relayed signal before it
is force-killed (default 10 000 ms, the `gracefulShutdown` precedent).

***

### signalHost?

> `optional` **signalHost?**: [`ClusterSignalHost`](ClusterSignalHost.md)

Injectable signal host (defaults to `process`).

***

### signals?

> `optional` **signals?**: `Signals`[]

Signals that trigger a graceful cluster stop (default `SIGINT`, `SIGTERM`).

***

### size

> **size**: `number`

Number of worker slots (≥ 1).

***

### spawner?

> `optional` **spawner?**: [`ClusterSpawner`](ClusterSpawner.md)

Injectable spawner (defaults to `node:child_process`).
