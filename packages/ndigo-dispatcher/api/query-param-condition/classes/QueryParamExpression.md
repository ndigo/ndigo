[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [query-param-condition](../README.md) / QueryParamExpression

# Class: QueryParamExpression

Parses and matches a single URL query-string parameter expression against a route.

Query parameters are the `?key=value` pairs carried in `Route.data`.
Repeated keys aggregate into arrays, and a `key=value` expression matches
when any element equals `value` (`?q=a&q=b` matches `q=a` and `q=b`).
For path-segment matrix parameters (`/path;key=value`), see [MatrixParamExpression](../../matrix-param-condition/classes/MatrixParamExpression.md).

## Extends

- [`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md)\<`string`\>

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

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`constructor`](../../route-condition/classes/AbstractNameValueExpression.md#constructor)

## Properties

### isNegated

> `readonly` **isNegated**: `boolean`

Whether the expression is negated (`!`).

#### Inherited from

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`isNegated`](../../route-condition/classes/AbstractNameValueExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

The expression name.

#### Inherited from

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`name`](../../route-condition/classes/AbstractNameValueExpression.md#name)

***

### namesToMatch

> `readonly` **namesToMatch**: `Set`\<`string`\>

Parameter names that may satisfy this expression.

***

### value?

> `readonly` `optional` **value?**: `string`

The parsed value, when present.

#### Inherited from

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`value`](../../route-condition/classes/AbstractNameValueExpression.md#value)

## Accessors

### isCaseSensitiveName

#### Get Signature

> **get** **isCaseSensitiveName**(): `boolean`

Query-parameter names are always case-sensitive.

##### Returns

`boolean`

Whether the name comparison is case-sensitive.

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

Check whether the route contains a matching parameter name.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when the parameter name matches.

#### Overrides

[`AbstractNameValueExpression`](../../route-condition/classes/AbstractNameValueExpression.md).[`matchName`](../../route-condition/classes/AbstractNameValueExpression.md#matchname)

***

### matchValue()

> **matchValue**(`route`): `boolean`

Check whether the route parameter value matches this expression.

A route value may be an array when the query string repeats a key
(`?q=a&q=b` parses to `['a', 'b']`); the expression matches when any
element equals the expected value. A single value matches by strict
equality, so `q=` matches only an explicit empty-string value.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`boolean`

`true` when the parameter value matches.

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
