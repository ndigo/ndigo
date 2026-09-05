[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / DefaultResourceLoader

# Class: DefaultResourceLoader

Defined in: [packages/blue-context/src/resource.ts:191](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-191)

Resource loader that resolves modules through dynamic import.

## Extends

- [`ResourceLoader`](../interfaces/ResourceLoader.md) & `Null`\<`this`\>

## Constructors

### Constructor

> **new DefaultResourceLoader**(): `DefaultResourceLoader`

#### Returns

`DefaultResourceLoader`

#### Inherited from

`AsModuleResourceLoader(Null).constructor`

## Methods

### getResource()

> **getResource**(`location`): `Promise`\<[`Resource`](../interfaces/Resource.md)\<`any`\>\>

Defined in: [packages/blue-context/src/resource.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-22)

#### Parameters

##### location

`string`

#### Returns

`Promise`\<[`Resource`](../interfaces/Resource.md)\<`any`\>\>

#### Inherited from

`AsModuleResourceLoader(Null).getResource`
