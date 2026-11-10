[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / AppConfigEntry

# Interface: AppConfigEntry

A manifest configuration key, projected from `@ndigo/inspect` v1.

## Properties

### hasValue

> `readonly` **hasValue**: `boolean`

Whether the environment currently supplies a value.

***

### key

> `readonly` **key**: `string`

The full environment keypath (e.g. `server.port`).

***

### origin?

> `readonly` `optional` **origin?**: `string`

The winning property source name, when known.

***

### type?

> `readonly` `optional` **type?**: `string`

The declared conversion target, when known.
