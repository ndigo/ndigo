[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-condition](../README.md) / AbstractNameValueExpression

# Abstract Class: AbstractNameValueExpression\<T\>

Base class for parsed name/value expressions.

## Extended by

- [`MatrixParamExpression`](../../matrix-param-condition/classes/MatrixParamExpression.md)
- [`QueryParamExpression`](../../query-param-condition/classes/QueryParamExpression.md)

## Type Parameters

### T

`T`

## Implements

- [`NameValueExpression`](../interfaces/NameValueExpression.md)\<`T`\>
- `Serializable`
- [`Matchable`](#)\<[`Route`](#)\>

## Constructors

### Constructor

> **new AbstractNameValueExpression**\<`T`\>(`expression`): `AbstractNameValueExpression`\<`T`\>

Parse a name/value expression.

#### Parameters

##### expression

`string`

The expression to parse.

#### Returns

`AbstractNameValueExpression`\<`T`\>

## Properties

### isCaseSensitiveName

> `abstract` `readonly` **isCaseSensitiveName**: `boolean`

Whether the name comparison is case-sensitive.

***

### isNegated

> `readonly` **isNegated**: `boolean`

Whether the expression is negated (`!`).

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`isNegated`](../interfaces/NameValueExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

The expression name.

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`name`](../interfaces/NameValueExpression.md#name)

***

### value?

> `readonly` `optional` **value?**: `T`

The parsed value, when present.

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`value`](../interfaces/NameValueExpression.md#value)

## Methods

### match()

> **match**(`route`): `boolean`

Determine whether this expression matches the given route.

A `name` expression (no `=`) matches on the name alone; a `name=`
expression — including the empty value — matches on value. The branch
uses `!== undefined` rather than truthiness so `name=` is not silently
treated as a name-only expression (which would accept any route
carrying the name, whatever its value).

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when the expression matches.

***

### matches()

> **matches**(`value`): `boolean`

Implements [Matchable](#): equivalent to [match](#match). Gives the
matcher family (`RouteDefinition`, `PathRoute`, …) a single name
(MTC-1).

#### Parameters

##### value

[`Route`](#)

The route to test.

#### Returns

`boolean`

`true` when this expression matches the route.

#### Implementation of

`Matchable.matches`

***

### matchName()

> `abstract` **matchName**(`route`): `boolean`

Whether the route matches the expression name.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

Whether the name matches.

***

### matchValue()

> `abstract` **matchValue**(`route`): `boolean`

Whether the route matches the expression value.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

Whether the value matches.

***

### parseValue()

> `abstract` **parseValue**(`valueExpression`): `T`

Parses the value side of the expression.

#### Parameters

##### valueExpression

`string`

The raw value text.

#### Returns

`T`

The parsed value.

***

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the expression to JSON.

#### Returns

`JSONValue`

The string form of the expression.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Convert the expression to its textual form.

#### Returns

`string`

The expression string.

#### Implementation of

`Serializable.toString`
