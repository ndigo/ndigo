[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / QueryParamExpression

# Class: QueryParamExpression

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:48

Parses and matches a single URL query-string parameter expression against a route.

Query parameters are the `?key=value` pairs carried in `Route.data`.
For path-segment matrix parameters (`/path;key=value`), see [MatrixParamExpression](MatrixParamExpression.md).

## Extends

- [`AbstractNameValueExpression`](AbstractNameValueExpression.md)\<`string`\>

## Constructors

### Constructor

> **new QueryParamExpression**(`expression`): `QueryParamExpression`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:63

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

Defined in: packages/blue-dispatcher/src/route-condition.ts:64

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`isNegated`](AbstractNameValueExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:65

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`name`](AbstractNameValueExpression.md#name)

***

### value?

> `readonly` `optional` **value?**: `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:66

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`value`](AbstractNameValueExpression.md#value)

***

### namesToMatch

> `readonly` **namesToMatch**: `Set`\<`string`\>

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:52

Parameter names that may satisfy this expression.

## Accessors

### isCaseSensitiveName

#### Get Signature

> **get** **isCaseSensitiveName**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:54

##### Returns

`boolean`

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`isCaseSensitiveName`](AbstractNameValueExpression.md#iscasesensitivename)

## Methods

### match()

> **match**(`route`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:118

Determine whether this expression matches the given route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`boolean`

`true` when the expression matches.

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`match`](AbstractNameValueExpression.md#match)

***

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: packages/blue-dispatcher/src/route-condition.ts:128

Serialize the expression to JSON.

#### Returns

`JSONValue`

The string form of the expression.

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`toJSON`](AbstractNameValueExpression.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:137

Convert the expression to its textual form.

#### Returns

`string`

The expression string.

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`toString`](AbstractNameValueExpression.md#tostring)

***

### matchName()

> **matchName**(`route`): `boolean`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:82

Check whether the route contains a matching parameter name.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`boolean`

`true` when the parameter name matches.

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`matchName`](AbstractNameValueExpression.md#matchname)

***

### matchValue()

> **matchValue**(`route`): `boolean`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:97

Check whether the route parameter value matches this expression.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`boolean`

`true` when the parameter value matches.

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`matchValue`](AbstractNameValueExpression.md#matchvalue)

***

### parseValue()

> **parseValue**(`valueExpression`): `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:107

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
