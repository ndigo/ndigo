[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / renderSnapshot

# Function: renderSnapshot()

> **renderSnapshot**(`snapshot`): `string`

Renders the committed snapshot document (`db/schema.json`). Key order is
stable so regeneration is byte-identical for the freshness gate.

## Parameters

### snapshot

[`SchemaSnapshot`](../interfaces/SchemaSnapshot.md)

The projection.

## Returns

`string`

The pretty-printed JSON document.
