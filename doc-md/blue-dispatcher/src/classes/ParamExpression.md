[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ParamExpression

# Class: ParamExpression

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:45

Parses and matches a single param expression to a route.


0 or more route patterns; if 0 the condition will match to every route.

## Extends

- [`AbstractNameValueExpression`](AbstractNameValueExpression.md)\<`string`\>

## Constructors

### Constructor

> **new ParamExpression**(`expression`): `ParamExpression`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:52

#### Parameters

##### expression

`string`

#### Returns

`ParamExpression`

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`constructor`](AbstractNameValueExpression.md#constructor)

## Properties

### isNegated

> `readonly` **isNegated**: `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:68

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`isNegated`](AbstractNameValueExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:69

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`name`](AbstractNameValueExpression.md#name)

***

### value?

> `readonly` `optional` **value**: `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:70

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`value`](AbstractNameValueExpression.md#value)

***

### namesToMatch

> `readonly` **namesToMatch**: `Set`\<`string`\>

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:46

## Accessors

### isCaseSensitiveName

#### Get Signature

> **get** **isCaseSensitiveName**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:48

##### Returns

`boolean`

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`isCaseSensitiveName`](AbstractNameValueExpression.md#iscasesensitivename)

## Methods

### match()

> **match**(`route`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:111

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`boolean`

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`match`](AbstractNameValueExpression.md#match)

***

### toJSON()

> **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-dispatcher/src/route-condition.ts:116

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`toJSON`](AbstractNameValueExpression.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:120

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`toString`](AbstractNameValueExpression.md#tostring)

***

### matchName()

> **matchName**(`route`): `boolean`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:65

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`boolean`

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`matchName`](AbstractNameValueExpression.md#matchname)

***

### matchValue()

> **matchValue**(`route`): `boolean`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:74

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`boolean`

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`matchValue`](AbstractNameValueExpression.md#matchvalue)

***

### parseValue()

> **parseValue**(`valueExpression`): `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:78

#### Parameters

##### valueExpression

`string`

#### Returns

`string`

#### Overrides

[`AbstractNameValueExpression`](AbstractNameValueExpression.md).[`parseValue`](AbstractNameValueExpression.md#parsevalue)
