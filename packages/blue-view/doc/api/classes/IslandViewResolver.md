[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / IslandViewResolver

# Class: IslandViewResolver

Resolves view names to `IslandView` markers.

## Example

```ts
const resolver = new IslandViewResolver();
const view = await resolver.resolveViewName('todo-app'); // IslandView('todo-app')
```

## Extends

- [`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md)

## Constructors

### Constructor

> **new IslandViewResolver**(`options?`): `IslandViewResolver`

Creates an island resolver with an optional name filter.

#### Parameters

##### options?

[`IslandViewResolverOptions`](../interfaces/IslandViewResolverOptions.md) = `{}`

Name filter options.

#### Returns

`IslandViewResolver`

#### Overrides

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`constructor`](AbstractPathBasedViewResolver.md#constructor)

## Properties

### cache

> `readonly` **cache**: `object`

Cached views keyed by name and language.

#### Index Signature

\[`key`: `string`\]: [`View`](../interfaces/View.md)

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`cache`](AbstractPathBasedViewResolver.md#cache)

***

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
