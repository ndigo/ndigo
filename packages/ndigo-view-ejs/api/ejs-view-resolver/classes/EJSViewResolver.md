[**@ndigo/view-ejs v0.0.1**](../../README.md)

***

[@ndigo/view-ejs](../../README.md) / [ejs-view-resolver](../README.md) / EJSViewResolver

# Class: EJSViewResolver

Resolves logical view names to [EJSView](../../ejs-view/classes/EJSView.md) instances by applying a
prefix and suffix around the name (e.g. `views/` + name + `.html`).

This is the Ndigo equivalent of the classic `InternalResourceViewResolver`: it
maps a controller's returned view name to a template on disk. Restrict the
names it serves by setting [EJSViewResolver.viewNames](#viewnames); when left null
every name is resolved.

## Extends

- `AbstractPathBasedViewResolver`

## Constructors

### Constructor

> **new EJSViewResolver**(`options?`): `EJSViewResolver`

Creates a new EJS view resolver.

#### Parameters

##### options?

[`EJSViewResolverOptions`](../interfaces/EJSViewResolverOptions.md) = `{}`

Engine, resource-loader, and path-framing options shared by resolved views.

#### Returns

`EJSViewResolver`

#### Overrides

`AbstractPathBasedViewResolver.constructor`

## Properties

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

## Accessors

### cache

#### Get Signature

> **get** **cache**(): `object`

A read-only mirror of the cached views keyed by name and language.

##### Returns

`object`

#### Inherited from

`AbstractPathBasedViewResolver.cache`

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
