[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractNameValueExpression

# Abstract Class: AbstractNameValueExpression\<T\>

Defined in: packages/blue-dispatcher/src/route-condition.ts:67

## Extended by

- [`ParamExpression`](ParamExpression.md)

## Type Parameters

### T

`T`

## Implements

- [`NameValueExpression`](../interfaces/NameValueExpression.md)\<`T`\>
- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Constructors

### Constructor

> **new AbstractNameValueExpression**\<`T`\>(`expression`): `AbstractNameValueExpression`\<`T`\>

Defined in: packages/blue-dispatcher/src/route-condition.ts:74

#### Parameters

##### expression

`string`

#### Returns

`AbstractNameValueExpression`\<`T`\>

## Properties

### isNegated

> `readonly` **isNegated**: `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:68

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`isNegated`](../interfaces/NameValueExpression.md#isnegated)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:69

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`name`](../interfaces/NameValueExpression.md#name)

***

### value?

> `readonly` `optional` **value**: `T`

Defined in: packages/blue-dispatcher/src/route-condition.ts:70

#### Implementation of

[`NameValueExpression`](../interfaces/NameValueExpression.md).[`value`](../interfaces/NameValueExpression.md#value)

***

### isCaseSensitiveName

> `abstract` `readonly` **isCaseSensitiveName**: `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:72

## Methods

### match()

> **match**(`route`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:111

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`boolean`

***

### toJSON()

> **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-dispatcher/src/route-condition.ts:116

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:120

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)

***

### matchName()

> `abstract` **matchName**(`route`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:125

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`boolean`

***

### matchValue()

> `abstract` **matchValue**(`route`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:126

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`boolean`

***

### parseValue()

> `abstract` **parseValue**(`valueExpression`): `T`

Defined in: packages/blue-dispatcher/src/route-condition.ts:127

#### Parameters

##### valueExpression

`string`

#### Returns

`T`
