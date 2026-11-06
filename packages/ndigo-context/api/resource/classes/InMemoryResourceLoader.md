[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [resource](../README.md) / InMemoryResourceLoader

# Class: InMemoryResourceLoader

Resource loader backed by an in-memory map of location to value.

Useful for tests, browser rendering with bundled content, and prototypes
where resource content is known at construction time.

## Implements

- [`ResourceLoader`](../interfaces/ResourceLoader.md)

## Constructors

### Constructor

> **new InMemoryResourceLoader**(): `InMemoryResourceLoader`

#### Returns

`InMemoryResourceLoader`

## Methods

### getResource()

> **getResource**(`location`): `Promise`\<[`Resource`](../interfaces/Resource.md)\<`unknown`\>\>

#### Parameters

##### location

`string`

#### Returns

`Promise`\<[`Resource`](../interfaces/Resource.md)\<`unknown`\>\>

#### Implementation of

[`ResourceLoader`](../interfaces/ResourceLoader.md).[`getResource`](../interfaces/ResourceLoader.md#getresource)

***

### set()

> **set**(`location`, `value`): `this`

Register a resource value under the given location.

#### Parameters

##### location

`string`

The resource location to register.

##### value

`unknown`

The resource content.

#### Returns

`this`

This loader, for chaining.
