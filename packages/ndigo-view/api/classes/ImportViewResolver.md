[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / ImportViewResolver

# Abstract Class: ImportViewResolver

Convenient base class for [\`ViewResolver\`](../interfaces/ViewResolver.md) implementations. Caches [\`View\`](../interfaces/View.md) instances once resolved.
Subclasses need to implement the [\`\_loadView\`](#) method, building the instance for the specific view name and locale.

## See

[AbstractCachingViewResolver#\_loadView](#)

## Extends

- [`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md)

## Constructors

### Constructor

> **new ImportViewResolver**(): `ImportViewResolver`

Creates a path-based resolver with JavaScript media type defaults.

#### Returns

`ImportViewResolver`

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`constructor`](AbstractPathBasedViewResolver.md#constructor)

## Properties

### isCaching

> **isCaching**: `boolean`

Indicates whether resolved views should be cached.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`isCaching`](AbstractPathBasedViewResolver.md#iscaching)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

Media type assigned to resolved views.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`mediaType`](AbstractPathBasedViewResolver.md#mediatype)

***

### prefix

> **prefix**: `string`

Prefix applied before the resolved view name.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`prefix`](AbstractPathBasedViewResolver.md#prefix)

***

### suffix

> **suffix**: `string`

Suffix applied after the resolved view name.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`suffix`](AbstractPathBasedViewResolver.md#suffix)

***

### viewNames

> **viewNames**: (`string` \| `RegExp`)[] \| `null`

The set of names this resolver supports.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`viewNames`](AbstractPathBasedViewResolver.md#viewnames)

## Accessors

### cache

#### Get Signature

> **get** **cache**(): `object`

A read-only mirror of the cached views keyed by name and language.

##### Returns

`object`

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`cache`](AbstractPathBasedViewResolver.md#cache)

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

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`resolveViewName`](AbstractPathBasedViewResolver.md#resolveviewname)

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

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`supports`](AbstractPathBasedViewResolver.md#supports)
