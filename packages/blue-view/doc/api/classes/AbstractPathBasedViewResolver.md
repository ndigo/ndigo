[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / AbstractPathBasedViewResolver

# Abstract Class: AbstractPathBasedViewResolver

Resolves a view name to a concrete [View](../interfaces/View.md) instance.

## Extends

- [`AbstractCachingViewResolver`](AbstractCachingViewResolver.md)

## Extended by

- [`ImportViewResolver`](ImportViewResolver.md)
- [`IslandViewResolver`](IslandViewResolver.md)

## Constructors

### Constructor

> **new AbstractPathBasedViewResolver**(): `AbstractPathBasedViewResolver`

Creates a path-based resolver with JavaScript media type defaults.

#### Returns

`AbstractPathBasedViewResolver`

#### Overrides

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`constructor`](AbstractCachingViewResolver.md#constructor)

## Properties

### isCaching

> **isCaching**: `boolean`

Indicates whether resolved views should be cached.

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`isCaching`](AbstractCachingViewResolver.md#iscaching)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

Media type assigned to resolved views.

***

### prefix

> **prefix**: `string`

Prefix applied before the resolved view name.

***

### suffix

> **suffix**: `string`

Suffix applied after the resolved view name.

***

### viewNames

> **viewNames**: (`string` \| `RegExp`)[] \| `null`

The set of names this resolver supports.

## Accessors

### cache

#### Get Signature

> **get** **cache**(): `object`

A read-only mirror of the cached views keyed by name and language.

##### Returns

`object`

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`cache`](AbstractCachingViewResolver.md#cache)

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

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`resolveViewName`](AbstractCachingViewResolver.md#resolveviewname)

***

### supports()

> **supports**(`name`, `language?`): `boolean`

Returns whether this resolver can handle the given view name.

#### Parameters

##### name

`string`

The view name to test.

##### language?

`unknown`

Optional locale or language hint.

#### Returns

`boolean`

`true` when the name is supported; otherwise `false`.
