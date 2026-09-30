[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / QueryParamExpression

# Class: QueryParamExpression

Parses and matches a single URL query-string parameter expression against a route.

Query parameters are the `?key=value` pairs carried in `Route.data`.
For path-segment matrix parameters (`/path;key=value`), see [MatrixParamExpression](MatrixParamExpression.md).

## Extends

- [`AbstractNameValueExpression`](AbstractNameValueExpression.md)\<`string`\>

## Constructors

### Constructor

> **new QueryParamExpression**(`expression`): `QueryParamExpression`

Parse a parameter expression.

#### Parameters

##### expression

`string`

The expression to parse.

#### Returns

`QueryParamExpression`

#### Overrides

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

### namesToMatch

> `readonly` **namesToMatch**: `Set`\<`string`\>

Parameter names that may satisfy this expression.

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

Check whether the route contains a matching parameter name.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when the parameter name matches.

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`matchName`](AbstractNameValueExpression.md#matchname)

***

### matchValue()

> **matchValue**(`route`): `boolean`

Check whether the route parameter value matches this expression.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when the parameter value matches.

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
