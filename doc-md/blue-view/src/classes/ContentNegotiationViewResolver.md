[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ContentNegotiationViewResolver

# Class: ContentNegotiationViewResolver

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:313](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-313)

Resolves views using content negotiation results.

## Implements

- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new ContentNegotiationViewResolver**(`manager`): `ContentNegotiationViewResolver`

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:332](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-332)

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

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:317](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-317)

The manager used to derive acceptable media types.

***

### defaultViews

> **defaultViews**: [`View`](../interfaces/View.md)[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:321](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-321)

The fallback views used when negotiation cannot resolve a specific one.

***

### viewResolvers

> **viewResolvers**: [`ViewResolver`](../interfaces/ViewResolver.md)[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:325](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-325)

The delegate resolvers queried after negotiation.

## Methods

### getMediaTypes()

> **getMediaTypes**(`request`): `MediaType`[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:342](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-342)

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

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:354](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-354)

Resolves a view name using negotiated media types.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint.

#### Returns

`Promise`\<[`View`](../interfaces/View.md)\>

Never returns normally.

#### Throws

Always thrown because the method is not implemented.

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)
