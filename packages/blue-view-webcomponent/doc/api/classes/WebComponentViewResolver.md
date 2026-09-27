[**@blue/view-webcomponent v0.0.1**](../README.md)

***

[@blue/view-webcomponent](../README.md) / WebComponentViewResolver

# Class: WebComponentViewResolver

Resolves view names to `WebComponentView` descriptors.

## Example

```ts
// zero-config: 'todo-app' → WebComponentView('todo-app')
const resolver = new WebComponentViewResolver();

// registry: logical name → component class (eager) or module path (lazy)
const resolver = new WebComponentViewResolver({
    registry: { todo: TodoApp, 'legacy-list': './components/legacy-list.ts' },
});
```

## Extends

- `AbstractPathBasedViewResolver`

## Constructors

### Constructor

> **new WebComponentViewResolver**(`options?`): `WebComponentViewResolver`

Creates a resolver with an optional component registry.

#### Parameters

##### options?

[`WebComponentViewResolverOptions`](../interfaces/WebComponentViewResolverOptions.md) = `{}`

Registry + name filter options.

#### Returns

`WebComponentViewResolver`

#### Overrides

`AbstractPathBasedViewResolver.constructor`

## Properties

### cache

> `readonly` **cache**: `object`

Cached views keyed by name and language.

#### Index Signature

\[`key`: `string`\]: [`View`](#)

#### Inherited from

`AbstractPathBasedViewResolver.cache`

***

### isCaching

> **isCaching**: `boolean`

Indicates whether resolved views should be cached.

#### Inherited from

`AbstractPathBasedViewResolver.isCaching`

***

### mediaType

> **mediaType**: `MediaType` \| `null`

Media type assigned to resolved views.

#### Inherited from

`AbstractPathBasedViewResolver.mediaType`

***

### prefix

> **prefix**: `string`

Prefix applied before the resolved view name.

#### Inherited from

`AbstractPathBasedViewResolver.prefix`

***

### suffix

> **suffix**: `string`

Suffix applied after the resolved view name.

#### Inherited from

`AbstractPathBasedViewResolver.suffix`

***

### viewNames

> **viewNames**: (`string` \| `RegExp`)[] \| `null`

The set of names this resolver supports.

#### Inherited from

`AbstractPathBasedViewResolver.viewNames`

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](#) \| `null`\>

Resolves the requested view name, optionally using the cache.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint used during resolution.

#### Returns

`Promise`\<[`View`](#) \| `null`\>

A promise that resolves to the matching view, or `null` when none is available.

#### Inherited from

`AbstractPathBasedViewResolver.resolveViewName`

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

`AbstractPathBasedViewResolver.supports`
