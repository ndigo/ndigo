[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ImportViewResolver

# Class: ImportViewResolver

Defined in: packages/blue-view/src/view-resolver.ts:151

## Extends

- [`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md)

## Constructors

### Constructor

> **new ImportViewResolver**(): `ImportViewResolver`

Defined in: packages/blue-view/src/view-resolver.ts:84

#### Returns

`ImportViewResolver`

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`constructor`](AbstractPathBasedViewResolver.md#constructor)

## Properties

### cache

> `readonly` **cache**: `object`

Defined in: packages/blue-view/src/view-resolver.ts:34

#### Index Signature

\[`key`: `string`\]: [`View`](../interfaces/View.md)

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`cache`](AbstractPathBasedViewResolver.md#cache)

***

### isCaching

> **isCaching**: `boolean`

Defined in: packages/blue-view/src/view-resolver.ts:35

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`isCaching`](AbstractPathBasedViewResolver.md#iscaching)

***

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-view/src/view-resolver.ts:78

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`mediaType`](AbstractPathBasedViewResolver.md#mediatype)

***

### prefix

> **prefix**: `string`

Defined in: packages/blue-view/src/view-resolver.ts:79

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`prefix`](AbstractPathBasedViewResolver.md#prefix)

***

### suffix

> **suffix**: `string`

Defined in: packages/blue-view/src/view-resolver.ts:80

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`suffix`](AbstractPathBasedViewResolver.md#suffix)

***

### viewClass

> **viewClass**: [`Constructable`](../../../blue-core/src/type-aliases/Constructable.md)\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:81

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`viewClass`](AbstractPathBasedViewResolver.md#viewclass)

***

### viewNames

> **viewNames**: (`string` \| `RegExp`)[]

Defined in: packages/blue-view/src/view-resolver.ts:82

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`viewNames`](AbstractPathBasedViewResolver.md#viewnames)

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:47

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`resolveViewName`](AbstractPathBasedViewResolver.md#resolveviewname)

***

### \_createView()

> `protected` **\_createView**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:66

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`_createView`](AbstractPathBasedViewResolver.md#_createview)

***

### \_createCacheKey()

> `protected` **\_createCacheKey**(`name`, `language?`): `string`

Defined in: packages/blue-view/src/view-resolver.ts:70

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`string`

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`_createCacheKey`](AbstractPathBasedViewResolver.md#_createcachekey)

***

### supports()

> **supports**(`name`, `language?`): `boolean`

Defined in: packages/blue-view/src/view-resolver.ts:92

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`boolean`

#### Inherited from

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`supports`](AbstractPathBasedViewResolver.md#supports)

***

### \_buildView()

> `protected` **\_buildView**(`name`): [`View`](../interfaces/View.md)

Defined in: packages/blue-view/src/view-resolver.ts:108

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

Defined in: packages/blue-view/src/view-resolver.ts:152

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

#### Overrides

[`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md).[`_loadView`](AbstractPathBasedViewResolver.md#_loadview)
