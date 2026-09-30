[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / MatrixParamExpression

# Class: MatrixParamExpression

Parses and matches a single matrix-parameter expression against a route segment.

Matrix parameters are per-segment key=value pairs carried in `RouteSegment.data`.
This expression walks every segment of the route looking for a matching name/value pair.

## Extends

- [`AbstractNameValueExpression`](AbstractNameValueExpression.md)\<`string`\>

## Constructors

### Constructor

> **new MatrixParamExpression**(`expression`): `MatrixParamExpression`

Parse a name/value expression.

#### Parameters

##### expression

`string`

The expression to parse.

#### Returns

`MatrixParamExpression`

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`constructor`](AbstractNameValueExpression.md#constructor)

## Properties

### isNegated

> `readonly` **isNegated**: `boolean`

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`isNegated`](AbstractNameValueExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`name`](AbstractNameValueExpression.md#name)

***

### value?

> `readonly` `optional` **value?**: `string`

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`value`](AbstractNameValueExpression.md#value)

## Accessors

### isCaseSensitiveName

#### Get Signature

> **get** **isCaseSensitiveName**(): `boolean`

##### Returns

`boolean`

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`isCaseSensitiveName`](AbstractNameValueExpression.md#iscasesensitivename)

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

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`match`](AbstractNameValueExpression.md#match)

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

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`matches`](AbstractNameValueExpression.md#matches)

***

### matchName()

> **matchName**(`route`): `boolean`

Check whether any route segment contains a matching matrix-parameter name.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when at least one segment carries the parameter name.

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`matchName`](AbstractNameValueExpression.md#matchname)

***

### matchValue()

> **matchValue**(`route`): `boolean`

Check whether any route segment carries the expected matrix-parameter value.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when at least one segment matches both name and value.

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`matchValue`](AbstractNameValueExpression.md#matchvalue)

***

### parseValue()

> **parseValue**(`valueExpression`): `string`

Return the parameter value as-is.

#### Parameters

##### valueExpression

`string`

The raw value expression.

#### Returns

`string`

The parsed value.

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`parseValue`](AbstractNameValueExpression.md#parsevalue)

***

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the expression to JSON.

#### Returns

`JSONValue`

The string form of the expression.

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`toJSON`](AbstractNameValueExpression.md#tojson)

***

### toString()

> **toString**(): `string`

Convert the expression to its textual form.

#### Returns

`string`

The expression string.

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`toString`](AbstractNameValueExpression.md#tostring)
