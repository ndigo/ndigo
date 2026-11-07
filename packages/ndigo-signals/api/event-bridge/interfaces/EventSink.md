[**@ndigo/signals v0.0.1**](../../README.md)

***

[@ndigo/signals](../../README.md) / [event-bridge](../README.md) / EventSink

# Interface: EventSink

An emitter-shaped sink that event occurrences are written to.

## Methods

### emit()

> **emit**(`type`, ...`data`): `unknown`

Writes an occurrence of `type` with `data` to the sink.

#### Parameters

##### type

`string` \| `symbol`

The event type to emit.

##### data

...`unknown`[]

Payload arguments carried by the occurrence.

#### Returns

`unknown`

The sink's own emit result; ignored by the bridge.
