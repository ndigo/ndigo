[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / parseDerivedQuery

# Function: parseDerivedQuery()

> **parseDerivedQuery**(`methodName`, `columns`): `object`[] \| `null`

Defined in: [packages/blue-orm/src/derived-query-repository.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/derived-query-repository.ts#lines-33)

Parses a derived method name into a list of property filters.

## Parameters

### methodName

`string`

The method name (e.g. `findByName`).

### columns

[`ColumnDefinition`](../interfaces/ColumnDefinition.md)[]

The entity's declared columns.

## Returns

`object`[] \| `null`

A list of `{ property, valueIndex }` filters, or `null` if the
  method name is not a supported derived query.
