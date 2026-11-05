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

***

### value

> `readonly` **value**: `T`

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
