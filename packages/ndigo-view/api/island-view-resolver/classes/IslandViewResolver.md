[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [island-view-resolver](../README.md) / IslandViewResolver

# Class: IslandViewResolver

Resolves view names to `IslandView` markers.

Only names matching [IslandViewResolverOptions.viewNames](../interfaces/IslandViewResolverOptions.md#viewnames) (by default
the [isValidCustomElementName](../../island-view/functions/isValidCustomElementName.md) predicate) resolve; every other name
returns `null` so the resolver chain continues (there is no implicit
fallback — an unmatched name is only served if a later resolver claims it,
otherwise the dispatcher's usual not-found path applies).

## Example

```ts
const resolver = new IslandViewResolver();
const view = await resolver.resolveViewName('todo-app'); // IslandView('todo-app')
await resolver.resolveViewName('user'); // null — not a custom-element name
await resolver.resolveViewName('font-face'); // null — reserved, not claimed
```

## Extends

- [`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md)

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

[`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md).[`constructor`](../../view-resolver/classes/AbstractPathBasedViewResolver.md#constructor)

## Properties

### isCaching

> **isCaching**: `boolean`

Indicates whether resolved views should be cached.

#### Inherited from

[`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md).[`isCaching`](../../view-resolver/classes/AbstractPathBasedViewResolver.md#iscaching)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

Media type assigned to resolved views.

#### Inherited from

[`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md).[`mediaType`](../../view-resolver/classes/AbstractPathBasedViewResolver.md#mediatype)

***

### prefix

> **prefix**: `string`

Prefix applied before the resolved view name.

#### Inherited from

[`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md).[`prefix`](../../view-resolver/classes/AbstractPathBasedViewResolver.md#prefix)

***

### suffix

> **suffix**: `string`

Suffix applied after the resolved view name.

#### Inherited from

[`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md).[`suffix`](../../view-resolver/classes/AbstractPathBasedViewResolver.md#suffix)

***

### viewNames

> **viewNames**: (`string` \| `RegExp`)[] \| `null`

The set of names this resolver supports.

#### Inherited from

[`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md).[`viewNames`](../../view-resolver/classes/AbstractPathBasedViewResolver.md#viewnames)

## Accessors

### cache

#### Get Signature

> **get** **cache**(): `object`

A read-only mirror of the cached views keyed by name and language.

##### Returns

`object`

#### Inherited from

[`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md).[`cache`](../../view-resolver/classes/AbstractPathBasedViewResolver.md#cache)

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../../view/interfaces/View.md) \| `null`\>

Resolves the requested view name, optionally using the cache.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint used during resolution.

#### Returns

`Promise`\<[`View`](../../view/interfaces/View.md) \| `null`\>

A promise that resolves to the matching view, or `null` when none is available.

#### Inherited from

[`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md).[`resolveViewName`](../../view-resolver/classes/AbstractPathBasedViewResolver.md#resolveviewname)

***

### supports()

> **supports**(`name`, `language?`): `boolean`

Returns whether this resolver claims the given name.

With the default filter, a name must be a valid, non-reserved
custom-element tag ([isValidCustomElementName](../../island-view/functions/isValidCustomElementName.md)) — reserved names
like `font-face` are NOT claimed and fall through as `null` instead of
reaching `new IslandView(...)`, which would throw. An explicit
`viewNames` filter keeps its own (string/RegExp) semantics.

#### Parameters

##### name

`string`

The view name to test.

##### language?

`unknown`

Optional locale hint (unused — tags are locale-free).

#### Returns

`boolean`

`true` when the name should resolve to an `IslandView`.

#### Overrides

[`AbstractPathBasedViewResolver`](../../view-resolver/classes/AbstractPathBasedViewResolver.md).[`supports`](../../view-resolver/classes/AbstractPathBasedViewResolver.md#supports)
