[**@ndigo/inspect v0.0.1**](../README.md)

***

[@ndigo/inspect](../README.md) / InspectConfigEntry

# Interface: InspectConfigEntry

A configuration key a `@configurationProperties` class declares.

Deliberately value-free: only whether the environment currently supplies a
value is exposed, never the value itself.

## Properties

### hasValue

> **hasValue**: `boolean`

Whether the environment currently has a value for the key.

***

### key

> **key**: `string`

The full environment keypath (e.g. `server.port`).

***

### origin?

> `optional` **origin?**: `string`

The winning property source name, when the environment can report one.

***

### type?

> `optional` **type?**: `string`

The declared conversion target (`number`/`boolean`/`date`/`string`), when known.
