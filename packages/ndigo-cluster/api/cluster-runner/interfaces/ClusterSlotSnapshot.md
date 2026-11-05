[**@ndigo/cluster v0.0.1**](../../README.md)

***

[@ndigo/cluster](../../README.md) / [cluster-runner](../README.md) / ClusterSlotSnapshot

# Interface: ClusterSlotSnapshot

A snapshot of one slot's state.

## Properties

### exitCode

> `readonly` **exitCode**: `number` \| `null`

Exit code of the most recent run, `null` while first starting.

***

### pid

> `readonly` **pid**: `number` \| `null`

The current child pid, `null` between respawns.

***

### restarts

> `readonly` **restarts**: `number`

How many times this slot has been respawned.

***

### slot

> `readonly` **slot**: `number`

0-based slot index.

***

### status

> `readonly` **status**: `"starting"` \| `"running"` \| `"stopping"` \| `"exited"`

Lifecycle status.
