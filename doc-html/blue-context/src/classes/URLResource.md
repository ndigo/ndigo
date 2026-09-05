[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / URLResource

# Class: URLResource\<T\>

Defined in: [packages/blue-context/src/resource.ts:109](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-109)

Resource implementation backed by a URL.

## Type Parameters

### T

`T` = `any`

## Implements

- [`Resource`](../interfaces/Resource.md)\<`T`\>

## Constructors

### Constructor

> **new URLResource**\<`T`\>(`path`, `value`): `URLResource`\<`T`\>

Defined in: [packages/blue-context/src/resource.ts:117](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-117)

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

Defined in: [packages/blue-context/src/resource.ts:110](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-110)

***

### value

> `readonly` **value**: `T`

Defined in: [packages/blue-context/src/resource.ts:111](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-111)

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`value`](../interfaces/Resource.md#value)

## Accessors

### exists

#### Get Signature

> **get** **exists**(): `boolean`

Defined in: [packages/blue-context/src/resource.ts:113](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-113)

##### Returns

`boolean`

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`exists`](../interfaces/Resource.md#exists)
