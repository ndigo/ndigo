[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ImportViewResolver

# Class: ImportViewResolver

Defined in: [packages/blue-view/src/view-resolver.ts:200](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-200)

## Extends

- [`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md)

## Constructors

### Constructor

> **new ImportViewResolver**(): `ImportViewResolver`

Defined in: [packages/blue-view/src/view-resolver.ts:125](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-125)

Creates a path-based resolver with JavaScript media type defaults.

#### Returns

`ImportViewResolver`

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`constructor`](AbstractPathBasedViewResolver.md#constructor)

## Properties

### cache

> `readonly` **cache**: `object`

Defined in: [packages/blue-view/src/view-resolver.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-44)

Cached views keyed by name and language.

#### Index Signature

\[`key`: `string`\]: [`View`](../interfaces/View.md)

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`cache`](AbstractPathBasedViewResolver.md#cache)

***

### isCaching

> **isCaching**: `boolean`

Defined in: [packages/blue-view/src/view-resolver.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-48)

Indicates whether resolved views should be cached.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`isCaching`](AbstractPathBasedViewResolver.md#iscaching)

***

### mediaType

> **mediaType**: `MediaType` \| `null`

Defined in: [packages/blue-view/src/view-resolver.ts:104](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-104)

Media type assigned to resolved views.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`mediaType`](AbstractPathBasedViewResolver.md#mediatype)

***

### prefix

> **prefix**: `string`

Defined in: [packages/blue-view/src/view-resolver.ts:108](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-108)

Prefix applied before the resolved view name.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`prefix`](AbstractPathBasedViewResolver.md#prefix)

***

### suffix

> **suffix**: `string`

Defined in: [packages/blue-view/src/view-resolver.ts:112](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-112)

Suffix applied after the resolved view name.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`suffix`](AbstractPathBasedViewResolver.md#suffix)

***

### viewClass

> **viewClass**: `Constructable`\<[`View`](../interfaces/View.md)\>

Defined in: [packages/blue-view/src/view-resolver.ts:116](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-116)

The concrete view class that will be instantiated.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`viewClass`](AbstractPathBasedViewResolver.md#viewclass)

***

### viewNames

> **viewNames**: (`string` \| `RegExp`)[] \| `null`

Defined in: [packages/blue-view/src/view-resolver.ts:120](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-120)

The set of names this resolver supports.

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`viewNames`](AbstractPathBasedViewResolver.md#viewnames)

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md) \| `null`\>

Defined in: [packages/blue-view/src/view-resolver.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-70)

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

### \_createView()

> `protected` **\_createView**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md) \| `null`\>

Defined in: [packages/blue-view/src/view-resolver.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-89)

#### Parameters

##### name

`string`

##### language?

`unknown`

#### Returns

`Promise`\<[`View`](../interfaces/View.md) \| `null`\>

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`_createView`](AbstractPathBasedViewResolver.md#_createview)

***

### \_createCacheKey()

> `protected` **\_createCacheKey**(`name`, `language?`): `string`

Defined in: [packages/blue-view/src/view-resolver.ts:93](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-93)

#### Parameters

##### name

`string`

##### language?

`unknown`

#### Returns

`string`

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`_createCacheKey`](AbstractPathBasedViewResolver.md#_createcachekey)

***

### supports()

> **supports**(`name`, `language?`): `boolean`

Defined in: [packages/blue-view/src/view-resolver.ts:140](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-140)

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

***

### \_buildView()

> `protected` **\_buildView**(`name`): [`View`](../interfaces/View.md)

Defined in: [packages/blue-view/src/view-resolver.ts:157](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-157)

#### Parameters

##### name

`string`

#### Returns

[`View`](../interfaces/View.md)

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`_buildView`](AbstractPathBasedViewResolver.md#_buildview)

***

### \_loadView()

> `protected` **\_loadView**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: [packages/blue-view/src/view-resolver.ts:208](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-resolver.ts#lines-208)

Loads a view module dynamically and instantiates its default export.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint.

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

A promise that resolves to the imported view instance.

#### Overrides

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`_loadView`](AbstractPathBasedViewResolver.md#_loadview)
