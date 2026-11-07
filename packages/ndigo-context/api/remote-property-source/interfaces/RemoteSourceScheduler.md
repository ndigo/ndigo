[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [remote-property-source](../README.md) / RemoteSourceScheduler

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

The handle.

#### Returns

`void`

***

### setInterval()

> **setInterval**(`callback`, `ms`): `unknown`

Schedules a repeated callback. Returns an opaque handle.

#### Parameters

##### callback

() => `void`

The callback.

##### ms

`number`

The interval in ms.

#### Returns

`unknown`

An opaque handle.
