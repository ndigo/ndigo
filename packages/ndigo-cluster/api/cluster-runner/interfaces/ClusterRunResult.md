[**@ndigo/cluster v0.0.1**](../../README.md)

***

[@ndigo/cluster](../../README.md) / [cluster-runner](../README.md) / ClusterRunResult

# Interface: ClusterRunResult

The cluster outcome.

## Properties

### exitCode

> `readonly` **exitCode**: `number`

Process exit code: `0` after a clean stop, `1` otherwise.

***

### reason

> `readonly` **reason**: [`ClusterStopReason`](../type-aliases/ClusterStopReason.md)

Why the cluster stopped.

***

### slots

> `readonly` **slots**: readonly [`ClusterSlotSnapshot`](ClusterSlotSnapshot.md)[]

Final slot states.
