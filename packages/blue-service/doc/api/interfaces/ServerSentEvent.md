[**@blue/service v0.0.1**](../README.md)

***

[@blue/service](../README.md) / ServerSentEvent

# Interface: ServerSentEvent

One Server-Sent Event on the wire.

## Properties

### data

> **data**: `unknown`

The `data:` payload — JSON-parsed when possible, the raw string
otherwise. `undefined` when the event carried no data field.

***

### event

> **event**: `string`

Event type from the `event:` field; defaults to `'message'`.

***

### id?

> `optional` **id?**: `string`

Optional event id from the `id:` field (last occurrence wins).
