[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / UnresolvedResource

# Class: UnresolvedResource

Defined in: [packages/blue-context/src/resource.ts:145](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-145)

Resource wrapper used when loading fails.

## Implements

- [`Resource`](../interfaces/Resource.md)\<`Error`\>

## Constructors

### Constructor

> **new UnresolvedResource**(`path`, `value`): `UnresolvedResource`

Defined in: [packages/blue-context/src/resource.ts:152](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-152)

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

Defined in: [packages/blue-context/src/resource.ts:146](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-146)

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`value`](../interfaces/Resource.md#value)

## Accessors

### exists

#### Get Signature

> **get** **exists**(): `boolean`

Defined in: [packages/blue-context/src/resource.ts:148](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-148)

##### Returns

`boolean`

#### Implementation of

[`Resource`](../interfaces/Resource.md).[`exists`](../interfaces/Resource.md#exists)
