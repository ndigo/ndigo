[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [matrix-param-condition](../README.md) / MatrixParamExpression

# Class: MatrixParamExpression

Parses and matches a single matrix-parameter expression against a route segment.

Matrix parameters are per-segment key=value pairs carried in `RouteSegment.data`.
Repeated keys and comma-separated lists aggregate into arrays; a `key=value`
expression matches when any element equals `value`.
This expression walks every segment of the route looking for a matching name/value pair.

## Extends

- [`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md)\<`string`\>

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

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`constructor`](../../route-condition/classes/AbstractNameValueExpression.md#constructor)

## Properties

### isNegated

> `readonly` **isNegated**: `boolean`

#### Inherited from

[`QueryParamExpression`](../../query-param-condition/classes/QueryParamExpression.md).[`isNegated`](../../query-param-condition/classes/QueryParamExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

#### Inherited from

[`QueryParamExpression`](../../query-param-condition/classes/QueryParamExpression.md).[`name`](../../query-param-condition/classes/QueryParamExpression.md#name)

***

### value?

> `readonly` `optional` **value?**: `string`

#### Inherited from

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`value`](../../route-condition/classes/AbstractNameValueExpression.md#value)

## Accessors

### isCaseSensitiveName

#### Get Signature

> **get** **isCaseSensitiveName**(): `boolean`

##### Returns

`boolean`

#### Overrides

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`isCaseSensitiveName`](../../route-condition/classes/AbstractNameValueExpression.md#iscasesensitivename)

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

#### Inherited from

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`match`](../../route-condition/classes/AbstractNameValueExpression.md#match)

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

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`matches`](../../route-condition/classes/AbstractNameValueExpression.md#matches)

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

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`matchName`](../../route-condition/classes/AbstractNameValueExpression.md#matchname)

***

### matchValue()

> **matchValue**(`route`): `boolean`

Check whether any route segment carries the expected matrix-parameter value.

A segment value may be an array when the segment repeats the key
(`;color=red;color=ndigo`) or lists values (`;color=red,ndigo`); the
expression matches when any element equals the expected value. A single
value matches by strict equality.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when at least one segment matches both name and value.

#### Overrides

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`matchValue`](../../route-condition/classes/AbstractNameValueExpression.md#matchvalue)

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

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`parseValue`](../../route-condition/classes/AbstractNameValueExpression.md#parsevalue)

***

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the expression to JSON.

#### Returns

`JSONValue`

The string form of the expression.

#### Inherited from

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`toJSON`](../../route-condition/classes/AbstractNameValueExpression.md#tojson)

***

### toString()

> **toString**(): `string`

Convert the expression to its textual form.

#### Returns

`string`

The expression string.

#### Inherited from

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`toString`](../../route-condition/classes/AbstractNameValueExpression.md#tostring)
