[**@ndigo/orm-drizzle v0.0.1**](../README.md)

***

[@ndigo/orm-drizzle](../README.md) / readSnapshot

# Function: readSnapshot()

> **readSnapshot**(`source`): [`SchemaSnapshot`](../interfaces/SchemaSnapshot.md)

Parses a committed snapshot document, failing loud on an unknown
`predicate` (AD-78 D-3: a metadata growth that changes the projection
must bump the format, not silently diverge).

## Parameters

### source

`string`

The snapshot document from `renderSnapshot`.

## Returns

[`SchemaSnapshot`](../interfaces/SchemaSnapshot.md)

The parsed snapshot.
