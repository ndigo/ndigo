[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [metadata](../README.md) / ColumnDefinition

# Interface: ColumnDefinition

Defines a column's properties within an entity.

## Properties

### columnName

> **columnName**: `string`

The database column name.

***

### fieldName

> **fieldName**: `string`

The entity field name.

***

### nullable?

> `optional` **nullable?**: `boolean`

Whether nulls are allowed.

***

### schema?

> `optional` **schema?**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Optional Zod schema for the column.

***

### type?

> `optional` **type?**: `string`

The column type.
