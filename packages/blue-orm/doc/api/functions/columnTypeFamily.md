[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / columnTypeFamily

# Function: columnTypeFamily()

> **columnTypeFamily**(`type`): [`ColumnTypeFamily`](../type-aliases/ColumnTypeFamily.md)

Classifies a declared column type into its [ColumnTypeFamily](../type-aliases/ColumnTypeFamily.md) using
whole-word matching, so unrelated types (`point`, `interval`) are not
mistaken for `int`.

## Parameters

### type

`string` \| `undefined`

The declared column type; `undefined` for untyped columns.

## Returns

[`ColumnTypeFamily`](../type-aliases/ColumnTypeFamily.md)

The matched family, or `'unknown'` when no family applies.
