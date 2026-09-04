[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / DerivedQueryResult

# Type Alias: DerivedQueryResult\<T\>

> **DerivedQueryResult**\<`T`\> = `T`[]

Defined in: packages/blue-orm/src/derived-query-repository.ts:20

Spring Data-style derived-query method-name parsing for in-memory
repositories.

Supported method-name patterns:
- `findBy<Property>(value)` — equality on a declared `@column`/`@primaryColumn`
- `findBy<Property>And<Property>(a, b)` — conjunction of two equalities

Property names resolve case-insensitively against the entity's declared
columns.

The evaluation side lives in `InMemoryDerivedQueryRepository` (repository.ts).

## Type Parameters

### T

`T`

## Since

1.0.0
