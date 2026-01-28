[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / URLResource

# Class: URLResource\<T\>

Defined in: packages/blue-context/src/resource.ts:91

## Type Parameters

### T

`T` = `any`

## Implements

- [`Resource`](../interfaces/Resource.md)\<`T`\>

## Constructors

### Constructor

> **new URLResource**\<`T`\>(`path`, `value`): `URLResource`\<`T`\>

Defined in: packages/blue-context/src/resource.ts:99

#### Parameters

##### path

`string`

##### value

`T`

#### Returns

`URLResource`\<`T`\>

## Properties

### url

> `readonly` **url**: `URL`

Defined in: packages/blue-context/src/resource.ts:92

***

### value

> `readonly` **value**: `T`

Defined in: packages/blue-context/src/resource.ts:93

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`value`](../interfaces/Resource.md#value)

## Accessors

### exists

#### Get Signature

> **get** **exists**(): `boolean`

Defined in: packages/blue-context/src/resource.ts:95

##### Returns

`boolean`

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`exists`](../interfaces/Resource.md#exists)
