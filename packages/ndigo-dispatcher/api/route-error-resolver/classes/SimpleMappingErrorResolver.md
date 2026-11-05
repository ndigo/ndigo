[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-error-resolver](../README.md) / SimpleMappingErrorResolver

# Class: SimpleMappingErrorResolver

[RouteErrorResolver](../interfaces/RouteErrorResolver.md) implementation that allows for mapping exception class names to view names, either for a set of given handlers or for all handlers in the `Dispatcher`.

## See

`Dispatcher`

## Extends

- [`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md)

## Constructors

### Constructor

> **new SimpleMappingErrorResolver**(`defaultErrorView?`): `SimpleMappingErrorResolver`

Create a resolver backed by simple error-name mappings.

#### Parameters

##### defaultErrorView?

`string`

The fallback view name to use when no mapping matches.

#### Returns

`SimpleMappingErrorResolver`

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`constructor`](AbstractRouteErrorResolver.md#constructor)

## Properties

### defaultErrorView

> **defaultErrorView**: `string` \| `null`

View name used when no specific error mapping matches.

***

### errorMappings

> **errorMappings**: `Map`\<`string`, `string`\> \| `null`

Error-name-to-view-name mappings.

***

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

#### Overrides

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
