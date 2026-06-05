[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractPathBasedViewResolver

# Abstract Class: AbstractPathBasedViewResolver

Defined in: packages/blue-view/src/view-resolver.ts:103

Resolves a view name to a concrete [View](../interfaces/View.md) instance.

## Extends

- [`AbstractCachingViewResolver`](AbstractCachingViewResolver.md)

## Extended by

- [`ImportViewResolver`](ImportViewResolver.md)

## Constructors

### Constructor

> **new AbstractPathBasedViewResolver**(): `AbstractPathBasedViewResolver`

Defined in: packages/blue-view/src/view-resolver.ts:128

Creates a path-based resolver with JavaScript media type defaults.

#### Returns

`AbstractPathBasedViewResolver`

#### Overrides

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`constructor`](AbstractCachingViewResolver.md#constructor)

## Properties

### cache

> `readonly` **cache**: `object`

Defined in: packages/blue-view/src/view-resolver.ts:47

Cached views keyed by name and language.

#### Index Signature

\[`key`: `string`\]: [`View`](../interfaces/View.md)

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`cache`](AbstractCachingViewResolver.md#cache)

***

### isCaching

> **isCaching**: `boolean`

Defined in: packages/blue-view/src/view-resolver.ts:51

Indicates whether resolved views should be cached.

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`isCaching`](AbstractCachingViewResolver.md#iscaching)

***

### mediaType

> **mediaType**: `MediaType`

Defined in: packages/blue-view/src/view-resolver.ts:107

Media type assigned to resolved views.

***

### prefix

> **prefix**: `string`

Defined in: packages/blue-view/src/view-resolver.ts:111

Prefix applied before the resolved view name.

***

### suffix

> **suffix**: `string`

Defined in: packages/blue-view/src/view-resolver.ts:115

Suffix applied after the resolved view name.

***

### viewClass

> **viewClass**: `Constructable`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:119

The concrete view class that will be instantiated.

***

### viewNames

> **viewNames**: (`string` \| `RegExp`)[]

Defined in: packages/blue-view/src/view-resolver.ts:123

The set of names this resolver supports.

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

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`resolveViewName`](AbstractCachingViewResolver.md#resolveviewname)

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

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`_createView`](AbstractCachingViewResolver.md#_createview)

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

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`_createCacheKey`](AbstractCachingViewResolver.md#_createcachekey)

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

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`_loadView`](AbstractCachingViewResolver.md#_loadview)

***

### supports()

> **supports**(`name`, `language?`): `boolean`

Defined in: packages/blue-view/src/view-resolver.ts:143

Returns whether this resolver can handle the given view name.

#### Parameters

##### name

`string`

The view name to test.

##### language?

`any`

Optional locale or language hint.

#### Returns

`boolean`

`true` when the name is supported; otherwise `false`.

***

### \_buildView()

> `protected` **\_buildView**(`name`): [`View`](../interfaces/View.md)

Defined in: packages/blue-view/src/view-resolver.ts:159

#### Parameters

##### name

`string`

#### Returns

[`View`](../interfaces/View.md)
