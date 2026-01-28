[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ContentNegotiationViewResolver

# Class: ContentNegotiationViewResolver

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:125

Should ViewResolver be typed, i.e. ViewResolver<T extends View>?
-JBR

## Implements

- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new ContentNegotiationViewResolver**(`manager`): `ContentNegotiationViewResolver`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:130

#### Parameters

##### manager

[`ContentNegotiationManager`](ContentNegotiationManager.md)

#### Returns

`ContentNegotiationViewResolver`

## Properties

### contentNegotiationManager

> **contentNegotiationManager**: [`ContentNegotiationManager`](ContentNegotiationManager.md)

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:126

***

### defaultViews

> **defaultViews**: [`View`](../interfaces/View.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:127

***

### viewResolvers

> **viewResolvers**: [`ViewResolver`](../interfaces/ViewResolver.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:128

## Methods

### getMediaTypes()

> **getMediaTypes**(`request`): [`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:134

#### Parameters

##### request

`any`

#### Returns

[`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

***

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:139

#### Parameters

##### name

`string`

##### language?

`any`

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)
