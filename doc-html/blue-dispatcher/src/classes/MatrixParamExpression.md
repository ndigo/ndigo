[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MatrixParamExpression

# Class: MatrixParamExpression

Defined in: [packages/blue-dispatcher/src/route-mapping-info.ts:242](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping-info.ts#lines-242)

Parses and matches a single matrix-parameter expression against a route segment.

Matrix parameters are per-segment key=value pairs carried in `RouteSegment.data`.
This expression walks every segment of the route looking for a matching name/value pair.

## Extends

- [`AbstractNameValueExpression`](AbstractNameValueExpression.md)\<`string`\>

## Constructors

### Constructor

> **new MatrixParamExpression**(`expression`): `MatrixParamExpression`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:75](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-75)

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

Defined in: [packages/blue-dispatcher/src/route-condition.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-64)

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`isNegated`](AbstractNameValueExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-65)

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`name`](AbstractNameValueExpression.md#name)

***

### value?

> `readonly` `optional` **value?**: `string`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:66](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-66)

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`value`](AbstractNameValueExpression.md#value)

## Accessors

### isCaseSensitiveName

#### Get Signature

> **get** **isCaseSensitiveName**(): `boolean`

Defined in: [packages/blue-dispatcher/src/route-mapping-info.ts:243](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping-info.ts#lines-243)

##### Returns

`boolean`

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`isCaseSensitiveName`](AbstractNameValueExpression.md#iscasesensitivename)

## Methods

### match()

> **match**(`route`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:118](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-118)

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

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:128](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-128)

Serialize the expression to JSON.

#### Returns

`JSONValue`

The string form of the expression.

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`toJSON`](AbstractNameValueExpression.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-dispatcher/src/route-condition.ts:137](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-condition.ts#lines-137)

Convert the expression to its textual form.

#### Returns

`string`

The expression string.

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`toString`](AbstractNameValueExpression.md#tostring)

***

### matchName()

> **matchName**(`route`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-mapping-info.ts:253](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping-info.ts#lines-253)

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

Defined in: [packages/blue-dispatcher/src/route-mapping-info.ts:270](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping-info.ts#lines-270)

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

Defined in: [packages/blue-dispatcher/src/route-mapping-info.ts:289](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping-info.ts#lines-289)

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
