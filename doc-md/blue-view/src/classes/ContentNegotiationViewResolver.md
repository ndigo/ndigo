[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ContentNegotiationViewResolver

# Class: ContentNegotiationViewResolver

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:307

Resolves views using content negotiation results.

## Implements

- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new ContentNegotiationViewResolver**(`manager`): `ContentNegotiationViewResolver`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:326

Creates a resolver backed by the given negotiation manager.

#### Parameters

##### manager

[`ContentNegotiationManager`](ContentNegotiationManager.md)

The negotiation manager to consult.

#### Returns

`ContentNegotiationViewResolver`

## Properties

### contentNegotiationManager

> **contentNegotiationManager**: [`ContentNegotiationManager`](ContentNegotiationManager.md)

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:311

The manager used to derive acceptable media types.

***

### defaultViews

> **defaultViews**: [`View`](../interfaces/View.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:315

The fallback views used when negotiation cannot resolve a specific one.

***

### viewResolvers

> **viewResolvers**: [`ViewResolver`](../interfaces/ViewResolver.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:319

The delegate resolvers queried after negotiation.

## Methods

### getMediaTypes()

> **getMediaTypes**(`request`): `MediaType`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:336

Returns the media types supported by the current request.

#### Parameters

##### request

`any`

The current request.

#### Returns

`MediaType`[]

The negotiated media types.

***

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](../interfaces/View.md)\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:348

Resolves a view name using negotiated media types.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`any`

Optional locale or language hint.

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

Never returns normally.

#### Throws

Always thrown because the method is not implemented.

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)
