[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractPathBasedViewResolver

# Abstract Class: AbstractPathBasedViewResolver

Defined in: packages/blue-view/src/view-resolver.ts:77

Should ViewResolver be typed, i.e. ViewResolver<T extends View>?
-JBR

## Extends

- [`AbstractCachingViewResolver`](AbstractCachingViewResolver.md)

## Extended by

- [`ImportViewResolver`](ImportViewResolver.md)

## Constructors

### Constructor

> **new AbstractPathBasedViewResolver**(): `AbstractPathBasedViewResolver`

Defined in: packages/blue-view/src/view-resolver.ts:84

#### Returns

`AbstractPathBasedViewResolver`

#### Overrides

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`constructor`](AbstractCachingViewResolver.md#constructor)

## Properties

### cache

> `readonly` **cache**: `object`

Defined in: packages/blue-view/src/view-resolver.ts:34

#### Index Signature

\[`key`: `string`\]: [`View`](../interfaces/View.md)

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`cache`](AbstractCachingViewResolver.md#cache)

***

### isCaching

> **isCaching**: `boolean`

Defined in: packages/blue-view/src/view-resolver.ts:35

#### Inherited from

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`isCaching`](AbstractCachingViewResolver.md#iscaching)

***

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-view/src/view-resolver.ts:78

***

### prefix

> **prefix**: `string`

Defined in: packages/blue-view/src/view-resolver.ts:79

***

### suffix

> **suffix**: `string`

Defined in: packages/blue-view/src/view-resolver.ts:80

***

### viewClass

> **viewClass**: [`Constructable`](../../../blue-core/src/type-aliases/Constructable.md)\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:81

***

### viewNames

> **viewNames**: (`string` \| `RegExp`)[]

Defined in: packages/blue-view/src/view-resolver.ts:82

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

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`resolveViewName`](AbstractCachingViewResolver.md#resolveviewname)

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

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`_createView`](AbstractCachingViewResolver.md#_createview)

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

[`AbstractCachingViewResolver`](AbstractCachingViewResolver.md).[`_createCacheKey`](AbstractCachingViewResolver.md#_createcachekey)

***

### \_loadView()

> `abstract` `protected` **\_loadView**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/view-resolver.ts:74

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

Defined in: packages/blue-view/src/view-resolver.ts:92

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`boolean`

***

### \_buildView()

> `protected` **\_buildView**(`name`): [`View`](../interfaces/View.md)

Defined in: packages/blue-view/src/view-resolver.ts:108

#### Parameters

##### name

`string`

#### Returns

[`View`](../interfaces/View.md)
