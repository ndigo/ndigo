[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / NodeParameterBindingErrorResolver

# Class: NodeParameterBindingErrorResolver

A [AbstractRouteErrorResolver](#) mapping [ParameterBindingError](#) to
400/422 problem documents.

## Extends

- [`AbstractRouteErrorResolver`](#)

## Constructors

### Constructor

> **new NodeParameterBindingErrorResolver**(): `NodeParameterBindingErrorResolver`

#### Returns

`NodeParameterBindingErrorResolver`

#### Inherited from

`AbstractRouteErrorResolver.constructor`

## Properties

### mappedHandlerClasses

> **mappedHandlerClasses**: `Constructable`[]

Handler classes explicitly targeted by this resolver, if any.

#### Inherited from

`AbstractRouteErrorResolver.mappedHandlerClasses`

***

### mappedHandlers

> **mappedHandlers**: `object`[] \| `null`

Handlers explicitly targeted by this resolver, if any.

#### Inherited from

`AbstractRouteErrorResolver.mappedHandlers`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

`AbstractRouteErrorResolver.[toStringTag]`

## Methods

### resolveError()

> **resolveError**(`route`, `handler`, `error`): [`ModelAndView`](#) \| `null`

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

[`ModelAndView`](#) \| `null`

A resolved model and view, or `null` when this resolver does not apply.

#### Inherited from

`AbstractRouteErrorResolver.resolveError`
