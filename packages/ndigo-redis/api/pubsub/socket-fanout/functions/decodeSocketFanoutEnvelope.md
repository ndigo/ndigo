[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [pubsub/socket-fanout](../README.md) / decodeSocketFanoutEnvelope

# Function: decodeSocketFanoutEnvelope()

> **decodeSocketFanoutEnvelope**(`wire`, `maxBytes`): `object`

Decode and validate a wire envelope (REV-006). Rejects anything the
receiving broker could not frame into a MESSAGE: a header name
containing `:`, CR, LF or NUL, a NUL in a header value or the key. The
same validation runs on outgoing `publish` and inbound `subscribe`, so a
malformed peer can never blackhole a destination silently.

Exported (module-internal, not on the package barrel) so the framing
rules are testable without a live Redis.

## Parameters

### wire

`string`

The JSON envelope.

### maxBytes

`number`

Reject envelopes above this serialized size.

## Returns

`object`

The origin id and the message.

### message

> **message**: [`SocketFanoutMessage`](#)

### origin

> **origin**: `string`
