[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [resource](../README.md) / URLResource

# Class: URLResource\<T\>

Resource implementation backed by a URL.

## Type Parameters

### T

`T` = `unknown`

## Implements

- [`Resource`](../interfaces/Resource.md)\<`T`\>

## Constructors

### Constructor

> **new URLResource**\<`T`\>(`path`, `value`): `URLResource`\<`T`\>

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

The resolved URL.

***

### value

> `readonly` **value**: `T`

The loaded value.

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`value`](../interfaces/Resource.md#value)

## Accessors

### exists

#### Get Signature

> **get** **exists**(): `boolean`

Whether the resource exists (always `true` for URL resources).

##### Returns

`boolean`

Whether the resource exists.

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`exists`](../interfaces/Resource.md#exists)
