[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [resource](../README.md) / DefaultResourceLoader

# Class: DefaultResourceLoader

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

> **getResource**(`location`): `Promise`\<[`Resource`](../interfaces/Resource.md)\<`unknown`\>\>

Returns a resource handle for the location.

#### Parameters

##### location

`string`

The resource location.

#### Returns

`Promise`\<[`Resource`](../interfaces/Resource.md)\<`unknown`\>\>

#### Inherited from

`AsModuleResourceLoader(Null).getResource`
