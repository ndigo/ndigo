[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / AbstractNameValueExpression

# Abstract Class: AbstractNameValueExpression\<T\>

Base class for parsed name/value expressions.

## Extended by

- [`QueryParamExpression`](QueryParamExpression.md)
- [`MatrixParamExpression`](MatrixParamExpression.md)

## Type Parameters

### T

`T`

## Implements

- [`NameValueExpression`](../interfaces/NameValueExpression.md)\<`T`\>
- `Serializable`

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

***

### isNegated

> `readonly` **isNegated**: `boolean`

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`isNegated`](../interfaces/NameValueExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`name`](../interfaces/NameValueExpression.md#name)

***

### value?

> `readonly` `optional` **value?**: `T`

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`value`](../interfaces/NameValueExpression.md#value)

## Methods

### match()

> **match**(`route`): `boolean`

Determine whether this expression matches the given route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when the expression matches.

***

### matchName()

> `abstract` **matchName**(`route`): `boolean`

#### Parameters

##### route

[`Route`](#)

#### Returns

`boolean`

***

### matchValue()

> `abstract` **matchValue**(`route`): `boolean`

#### Parameters

##### route

[`Route`](#)

#### Returns

`boolean`

***

### parseValue()

> `abstract` **parseValue**(`valueExpression`): `T`

#### Parameters

##### valueExpression

`string`

#### Returns

`T`

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
