[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / schemaForColumn

# Function: schemaForColumn()

> **schemaForColumn**(`column`): `ZodType`

Builds the Zod schema for a single column: the column's declared `schema`
if present, else the base mapping for its `type`, else a passthrough;
`nullable: true` allows `null`.

## Parameters

### column

[`ColumnDefinition`](../interfaces/ColumnDefinition.md)

The column definition from entity metadata.

## Returns

`ZodType`

The column's Zod schema.
