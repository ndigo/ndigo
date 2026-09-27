[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / RemoteSourceScheduler

# Interface: RemoteSourceScheduler

The poll scheduler seam (injectable for deterministic tests). Defaults to
`globalThis.setInterval`/`clearInterval`. The handle type is opaque to the
source (Node's `setInterval` returns a `Timeout`, an injected fake may use
a number) — the seam owns its handle.

## Methods

### clearInterval()

> **clearInterval**(`handle`): `void`

Cancels a scheduled callback by its handle.

#### Parameters

##### handle

`unknown`

#### Returns

`void`

***

### setInterval()

> **setInterval**(`callback`, `ms`): `unknown`

Schedules a repeated callback. Returns an opaque handle.

#### Parameters

##### callback

() => `void`

##### ms

`number`

#### Returns

`unknown`
