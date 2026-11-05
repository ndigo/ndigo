[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-socket-session-registry](../README.md) / NodeSocketSessionRegistryOptions

# Interface: NodeSocketSessionRegistryOptions

Options for [NodeSocketSessionRegistry](../classes/NodeSocketSessionRegistry.md).

## Properties

### backpressure?

> `optional` **backpressure?**: [`SocketBackpressurePolicy`](../type-aliases/SocketBackpressurePolicy.md) \| `null`

Backpressure policy (default: 1 MiB watermark, `close` on overflow).
`null` disables the guard entirely — the transport's own buffering
remains the final backstop.

***

### fanout?

> `optional` **fanout?**: [`SocketFanout`](#)

Application-owned cross-node transport. Await [NodeSocketSessionRegistry.connect](../classes/NodeSocketSessionRegistry.md#connect) before publishing.

***

### heartbeatIntervalMs?

> `optional` **heartbeatIntervalMs?**: `number` \| `null`

Heartbeat ping interval in milliseconds: the registry pings every open
session on this cadence and reaps sessions whose pong is missing past
`idleTimeoutMs`. `null` disables the heartbeat (AD-21 D6 — enabled by
default at 30s).

***

### idleTimeoutMs?

> `optional` **idleTimeoutMs?**: `number`

A session is considered dead when no pong (or any traffic) has been
seen for this many milliseconds. Default `60_000` (~2 missed pongs).

***

### now?

> `optional` **now?**: () => `number`

**`Internal`**

Injectable clock for deterministic tests (the TaskScheduler clock
precedent, AD-20). Defaults to `Date.now`.

#### Returns

`number`

***

### onOverflow?

> `optional` **onOverflow?**: (`event`) => `void`

Observer invoked at each backpressure decision (close or drop), with
the path, action, and queued bytes. Constructor-only, like the policy
itself — the seam for telemetry/logging of the otherwise-private
decision point.

#### Parameters

##### event

[`SocketBackpressureEvent`](../type-aliases/SocketBackpressureEvent.md)

#### Returns

`void`
