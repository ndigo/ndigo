[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / AbstractRouteErrorResolver

# Abstract Class: AbstractRouteErrorResolver

Resolves exceptions into a route-specific response.

## Extended by

- [`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md)
- [`DefaultRouteErrorResolver`](DefaultRouteErrorResolver.md)
- [`SimpleMappingErrorResolver`](SimpleMappingErrorResolver.md)

## Implements

- [`RouteErrorResolver`](../interfaces/RouteErrorResolver.md)

## Constructors

### Constructor

> **new AbstractRouteErrorResolver**(): `AbstractRouteErrorResolver`

#### Returns

`AbstractRouteErrorResolver`

## Properties

### mappedHandlerClasses

> **mappedHandlerClasses**: `Constructable`[]

Handler classes explicitly targeted by this resolver, if any.

***

### mappedHandlers

> **mappedHandlers**: `object`[] \| `null`

Handlers explicitly targeted by this resolver, if any.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### resolveError()

> **resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md) \| `null`

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

[`ModelAndView`](ModelAndView.md) \| `null`

A resolved model and view, or `null` when this resolver does not apply.

#### Implementation of

[`RouteErrorResolver`](../interfaces/RouteErrorResolver.md).[`resolveError`](../interfaces/RouteErrorResolver.md#resolveerror)
