[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractCachingViewResolver

# Abstract Class: AbstractCachingViewResolver

Defined in: packages/blue-view/src/view-resolver.ts:43

Resolves a view name to a concrete [View](../interfaces/View.md) instance.

## Extended by

- [`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md)

## Implements

- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new AbstractCachingViewResolver**(): `AbstractCachingViewResolver`

Defined in: packages/blue-view/src/view-resolver.ts:56

Creates a resolver with an empty cache.

#### Returns

`AbstractCachingViewResolver`

## Properties

### cache

> `readonly` **cache**: `object`

Defined in: packages/blue-view/src/view-resolver.ts:47

Cached views keyed by name and language.

#### Index Signature

\[`key`: `string`\]: [`View`](../interfaces/View.md)

***

### isCaching

> **isCaching**: `boolean`

Defined in: packages/blue-view/src/view-resolver.ts:51

Indicates whether resolved views should be cached.

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:73

Resolves the requested view name, optionally using the cache.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`any`

Optional locale or language hint used during resolution.

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

A promise that resolves to the matching view, or `null` when none is available.

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)

***

### \_createView()

> `protected` **\_createView**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:92

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

***

### \_createCacheKey()

> `protected` **\_createCacheKey**(`name`, `language?`): `string`

Defined in: packages/blue-view/src/view-resolver.ts:96

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`string`

***

### \_loadView()

> `abstract` `protected` **\_loadView**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:100

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>
