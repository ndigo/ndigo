[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-socket-session](../README.md) / ResolvedSocketLimits

# Interface: ResolvedSocketLimits

Resolved, read-only socket limits with defaults applied.

## Properties

### maxBufferedBytes

> `readonly` **maxBufferedBytes**: `number` \| `null`

Maximum buffered bytes, or `null`.

***

### maxPayloadBytes

> `readonly` **maxPayloadBytes**: `number`

Maximum inbound frame size in bytes.

***

### maxQueuedBytes

> `readonly` **maxQueuedBytes**: `number` \| `null`

Maximum queued outbound bytes, or `null`.

***

### maxQueuedMessages

> `readonly` **maxQueuedMessages**: `number`

Maximum queued outbound messages.

***

### onOverflow

> `readonly` **onOverflow**: `"close"` \| `"drop"`

Overflow posture.
