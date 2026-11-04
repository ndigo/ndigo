[**@ndigo/cluster v0.0.1**](../README.md)

***

[@ndigo/cluster](../README.md) / ClusterRunner

# Class: ClusterRunner

The cluster supervisor (AD-74 D-1..D-5). Construct with
[ClusterRunnerOptions](../interfaces/ClusterRunnerOptions.md), then `await run()`; the returned result
carries the resolved exit code and per-slot snapshots.

## Constructors

### Constructor

> **new ClusterRunner**(`options`): `ClusterRunner`

#### Parameters

##### options

[`ClusterRunnerOptions`](../interfaces/ClusterRunnerOptions.md)

Cluster sizing, command, and tuning.

#### Returns

`ClusterRunner`

#### Throws

On invalid size or an empty command.

## Methods

### abort()

> **abort**(): `Promise`\<`void`\>

Immediate abort — the programmatic equivalent of a second signal:
all children are force-killed and the result carries exit code `1`.

#### Returns

`Promise`\<`void`\>

***

### run()

> **run**(): `Promise`\<[`ClusterRunResult`](../interfaces/ClusterRunResult.md)\>

Runs the cluster: installs the signal handlers, spawns every slot,
and resolves when the cluster stops (signal, [ClusterRunner.stop](#stop),
[ClusterRunner.abort](#abort), or a crash-loop trip). Each slot's
supervise loop is bound to a per-slot [ClusterChild](../interfaces/ClusterChild.md) handle.

#### Returns

`Promise`\<[`ClusterRunResult`](../interfaces/ClusterRunResult.md)\>

The cluster outcome.

***

### stop()

> **stop**(): `Promise`\<`void`\>

Deliberate graceful stop — the programmatic equivalent of the first
relayed signal. Every child receives `SIGTERM`; a child that does not
exit within the shutdown deadline is force-killed. Never respawns.

#### Returns

`Promise`\<`void`\>
