[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / parseDerivedQuery

# Function: parseDerivedQuery()

> **parseDerivedQuery**(`methodName`, `columns`): [`DerivedQuery`](../interfaces/DerivedQuery.md) \| `null`

Parses a derived method name into filters, ordering, and limit.

## Parameters

### methodName

`string`

The method name (e.g. `findByNameOrderByAgeDesc`).

### columns

[`ColumnDefinition`](../interfaces/ColumnDefinition.md)[]

The entity's declared columns.

## Returns

[`DerivedQuery`](../interfaces/DerivedQuery.md) \| `null`

The parsed query, or `null` if the method name is not a
  supported derived query.
