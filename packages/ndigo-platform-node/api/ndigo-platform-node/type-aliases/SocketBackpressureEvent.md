[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / SocketBackpressureEvent

# Type Alias: SocketBackpressureEvent

> **SocketBackpressureEvent** = `object`

Backpressure enforcement event — the decision-point seam for telemetry
and logging (the private `#safeSend` decision is otherwise unobservable).

## Properties

### action

> **action**: `"close"` \| `"drop"`

What the policy did: `close` (`1013`) or `drop` (silent skip).

***

### bufferedBytes

> **bufferedBytes**: `number`

Transport bytes queued at the decision point.

***

### path

> **path**: `string`

Endpoint path the session belongs to (auto-join set key).
