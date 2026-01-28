[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractCachingViewResolver

# Abstract Class: AbstractCachingViewResolver

Defined in: packages/blue-view/src/view-resolver.ts:33

Should ViewResolver be typed, i.e. ViewResolver<T extends View>?
-JBR

## Extended by

- [`AbstractPathBasedViewResolver`](AbstractPathBasedViewResolver.md)

## Implements

- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new AbstractCachingViewResolver**(): `AbstractCachingViewResolver`

Defined in: packages/blue-view/src/view-resolver.ts:37

#### Returns

`AbstractCachingViewResolver`

## Properties

### cache

> `readonly` **cache**: `object`

Defined in: packages/blue-view/src/view-resolver.ts:34

#### Index Signature

\[`key`: `string`\]: [`View`](../interfaces/View.md)

***

### isCaching

> **isCaching**: `boolean`

Defined in: packages/blue-view/src/view-resolver.ts:35

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

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)

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
