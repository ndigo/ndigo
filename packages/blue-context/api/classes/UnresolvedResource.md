[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / UnresolvedResource

# Class: UnresolvedResource

Resource wrapper used when loading fails.

## Implements

- [`Resource`](../interfaces/Resource.md)\<`Error`\>

## Constructors

### Constructor

> **new UnresolvedResource**(`path`, `value`): `UnresolvedResource`

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

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`value`](../interfaces/Resource.md#value)

## Accessors

### exists

#### Get Signature

> **get** **exists**(): `boolean`

##### Returns

`boolean`

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`exists`](../interfaces/Resource.md#exists)
