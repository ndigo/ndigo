[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-error-resolver](../README.md) / DefaultRouteErrorResolver

# Class: DefaultRouteErrorResolver

The default implementation of the [RouteErrorResolver](../interfaces/RouteErrorResolver.md) interface, resolving standard Ndigo exceptions.

This error resolver is enabled by default in the `WebDispatcher`.

Error classes are mapped to view names via `errorMappings`.  Out of the box it
maps `FrameworkError` to `'error/framework'` and `ApplicationError`
to `'error/application'`.  Additional mappings can be added through
[setErrorMapping](#seterrormapping).

Mapping keys match a class name *exactly*, but the lookup walks the thrown
error's prototype chain most-derived first, so a base-class mapping (e.g.
`'FrameworkError'`) also covers its subclasses while a subclass-specific
key takes precedence.  Unmapped errors fall back to
[defaultErrorView](#defaulterrorview).

## Extends

- [`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md)

## Constructors

### Constructor

> **new DefaultRouteErrorResolver**(`defaultErrorView?`): `DefaultRouteErrorResolver`

Create a resolver with sensible defaults for framework and application errors.

#### Parameters

##### defaultErrorView?

`string` = `'error/default'`

The fallback view name (defaults to `'error/default'`).

#### Returns

`DefaultRouteErrorResolver`

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`constructor`](AbstractRouteErrorResolver.md#constructor)

## Properties

### defaultErrorView

> **defaultErrorView**: `string`

View name used when no specific error mapping matches.

***

### errorMappings

> **errorMappings**: `Map`\<`string`, `string`\>

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

***

### setErrorMapping()

> **setErrorMapping**(`errorName`, `viewName`): `void`

Register an additional error-class-name-to-view-name mapping.

The key is matched exactly against each class name on the error's
prototype chain, most-derived first (see the class docs).

#### Parameters

##### errorName

`string`

The error class name (e.g. `'IllegalStateError'`).

##### viewName

`string`

The view name to render for this error.

#### Returns

`void`
