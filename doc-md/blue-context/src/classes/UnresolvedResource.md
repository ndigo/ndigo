[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / UnresolvedResource

# Class: UnresolvedResource

Defined in: packages/blue-context/src/resource.ts:149

Resource wrapper used when loading fails.

## Implements

- [`Resource`](../interfaces/Resource.md)\<`Error`\>

## Constructors

### Constructor

> **new UnresolvedResource**(`path`, `value`): `UnresolvedResource`

Defined in: packages/blue-context/src/resource.ts:156

#### Parameters

##### path

`string`

##### value

`Error`

#### Returns

`UnresolvedResource`

## Properties

### value

> `readonly` **value**: `Error`

Defined in: packages/blue-context/src/resource.ts:150

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`value`](../interfaces/Resource.md#value)

## Accessors

### exists

#### Get Signature

> **get** **exists**(): `boolean`

Defined in: packages/blue-context/src/resource.ts:152

##### Returns

`boolean`

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`exists`](../interfaces/Resource.md#exists)
