[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / ColumnOptions

# Interface: ColumnOptions

Options for defining a column in an entity.

## Properties

### name?

> `optional` **name?**: `string`

***

### nullable?

> `optional` **nullable?**: `boolean`

***

### schema?

> `optional` **schema?**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Optional Zod schema validating this column's value. When set, the
entity's derived schema (see `schemaForEntity`) validates the field
with this type instead of an untyped passthrough.

***

### type?

> `optional` **type?**: `string`
