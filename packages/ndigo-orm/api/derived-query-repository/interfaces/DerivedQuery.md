[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [derived-query-repository](../README.md) / DerivedQuery

# Interface: DerivedQuery

A parsed derived-query method name: equality filters plus optional
ordering (single clause) and limit (`First`/`TopN`).

## Properties

### filters

> **filters**: `object`[]

Equality filters parsed from the method name.

#### property

> **property**: `string`

#### valueIndex

> **valueIndex**: `number`

***

### limit?

> `optional` **limit?**: `number`

Optional result limit (`First`/`TopN`).

***

### orderBy?

> `optional` **orderBy?**: [`SortOrder`](../../page/interfaces/SortOrder.md)[]

Optional ordering clauses.
