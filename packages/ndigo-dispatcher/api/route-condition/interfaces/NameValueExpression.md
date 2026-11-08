[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-condition](../README.md) / NameValueExpression

# Interface: NameValueExpression\<T\>

Describes a parsed name/value expression.

## Type Parameters

### T

`T`

## Properties

### isNegated

> **isNegated**: `boolean`

Whether the expression is negated (`!`).

***

### name

> **name**: `string`

The expression name.

***

### value?

> `optional` **value?**: `T`

The parsed value, when the expression has `=`.
