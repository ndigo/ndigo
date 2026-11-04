[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / sortComparator

# Function: sortComparator()

> **sortComparator**\<`T`\>(`sort`): (`left`, `right`) => `number`

Builds a multi-key comparator for the given sort clauses. Clauses apply
in order; ties keep their input order. Used by `pageFromAll` and the
derived-query repositories.

## Type Parameters

### T

`T`

## Parameters

### sort

[`SortOrder`](../interfaces/SortOrder.md)[]

## Returns

(`left`, `right`) => `number`
