[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-error-resolver](../README.md) / AbstractHandlerMethodErrorResolver

# Abstract Class: AbstractHandlerMethodErrorResolver

Resolves exceptions into a route-specific response.

## Extends

- [`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md)

## Extended by

- [`MetadataErrorResolver`](MetadataErrorResolver.md)

## Constructors

### Constructor

> **new AbstractHandlerMethodErrorResolver**(): `AbstractHandlerMethodErrorResolver`

#### Returns

`AbstractHandlerMethodErrorResolver`

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`constructor`](AbstractRouteErrorResolver.md#constructor)

## Properties

### mappedHandlerClasses

> **mappedHandlerClasses**: `Constructable`[]

Handler classes explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`mappedHandlerClasses`](AbstractRouteErrorResolver.md#mappedhandlerclasses)

***

### mappedHandlers

> **mappedHandlers**: `object`[] \| `null`

Handlers explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`mappedHandlers`](AbstractRouteErrorResolver.md#mappedhandlers)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`[toStringTag]`](AbstractRouteErrorResolver.md#tostringtag)

## Methods

### resolveError()

> **resolveError**(`route`, `handler`, `error`): [`ModelAndView`](../../model-and-view/classes/ModelAndView.md) \| `null`

Resolve an error only when this resolver applies to the current handler.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

`object` \| `null`

The handler that was executing when the error occurred.

##### error

`Error`

The thrown error.

#### Returns

[`ModelAndView`](../../model-and-view/classes/ModelAndView.md) \| `null`

A resolved model and view, or `null` when this resolver does not apply.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`resolveError`](AbstractRouteErrorResolver.md#resolveerror)
