[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / AbstractCachingViewResolver

# Abstract Class: AbstractCachingViewResolver

Resolves a view name to a concrete [View](../interfaces/View.md) instance.

## Extended by

- [`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md)

## Implements

- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new AbstractCachingViewResolver**(): `AbstractCachingViewResolver`

Creates a resolver with an empty cache.

#### Returns

`AbstractCachingViewResolver`

## Properties

### isCaching

> **isCaching**: `boolean`

Indicates whether resolved views should be cached.

## Accessors

### cache

#### Get Signature

> **get** **cache**(): `object`

A read-only mirror of the cached views keyed by name and language.

##### Returns

`object`

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md) \| `null`\>

Resolves the requested view name, optionally using the cache.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint used during resolution.

#### Returns

`Promise`\<[`View`](../interfaces/View.md) \| `null`\>

A promise that resolves to the matching view, or `null` when none is available.

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)
