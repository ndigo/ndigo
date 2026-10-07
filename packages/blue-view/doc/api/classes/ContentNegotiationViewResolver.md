[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / ContentNegotiationViewResolver

# Class: ContentNegotiationViewResolver

Resolves views using content negotiation results.

## Implements

- [`ViewResolver`](../interfaces/ViewResolver.md)

## Constructors

### Constructor

> **new ContentNegotiationViewResolver**(`manager`): `ContentNegotiationViewResolver`

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

The manager used to derive acceptable media types.

***

### defaultViews

> **defaultViews**: [`View`](../interfaces/View.md)[]

The fallback views used when negotiation cannot resolve a specific one.

***

### viewResolvers

> **viewResolvers**: [`ViewResolver`](../interfaces/ViewResolver.md)[]

The delegate resolvers queried after negotiation.

## Methods

### getMediaTypes()

> **getMediaTypes**(`request`): `MediaType`[]

Returns the media types supported by the current request.

#### Parameters

##### request

`unknown`

The current request.

#### Returns

`MediaType`[]

The negotiated media types.

***

### resolveViewName()

> **resolveViewName**(`name`, `language?`, `request?`): `Promise`\<[`View`](../interfaces/View.md) \| `null`\>

Resolves a view name by aggregating candidate views from every delegate
resolver and selecting one by the given request's negotiated media types
— the Spring ContentNegotiatingViewResolver model.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint.

##### request?

`unknown`

Optional per-call request (typically the route) carrying
  the negotiation data — `Accept` header, path extension. Passed
  explicitly so interleaved async resolutions never share state; when
  omitted, the first candidate is served without negotiation.

#### Returns

`Promise`\<[`View`](../interfaces/View.md) \| `null`\>

The matching view, or `null` when no resolver/default produced one.

#### Throws

When candidates exist but none serves the
  request's accepted media types (HTTP 406).

#### Implementation of

[`ViewResolver`](../interfaces/ViewResolver.md).[`resolveViewName`](../interfaces/ViewResolver.md#resolveviewname)
