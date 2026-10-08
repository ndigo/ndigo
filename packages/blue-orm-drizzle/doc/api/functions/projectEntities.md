[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / projectEntities

# Function: projectEntities()

> **projectEntities**(`entities`): [`SchemaSnapshot`](../interfaces/SchemaSnapshot.md)

Projects entity classes into the snapshot shape. Tables with no columns
contribute nothing (mirroring `createTableStatements`); column order is
the metadata declaration order.

## Parameters

### entities

`Constructable`[]

The entity classes declared with `@blue/orm` decorators.

## Returns

[`SchemaSnapshot`](../interfaces/SchemaSnapshot.md)

The metadata projection.
