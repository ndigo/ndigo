[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / DefaultRouteErrorResolver

# Class: DefaultRouteErrorResolver

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:194

The default implementation of the [RouteErrorResolver](../interfaces/RouteErrorResolver.md) interface, resolving standard BlueJS exceptions.

This error resolver is enabled by default in the WebDispatcher\|WebDispatcher.

## Extends

- [`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md)

## Constructors

### Constructor

> **new DefaultRouteErrorResolver**(): `DefaultRouteErrorResolver`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:66

#### Returns

`DefaultRouteErrorResolver`

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`constructor`](AbstractRouteErrorResolver.md#constructor)

## Properties

### mappedHandlers

> **mappedHandlers**: `any`[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:55

Handlers explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`mappedHandlers`](AbstractRouteErrorResolver.md#mappedhandlers)

***

### mappedHandlerClasses

> **mappedHandlerClasses**: `Constructable`[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:60

Handler classes explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`mappedHandlerClasses`](AbstractRouteErrorResolver.md#mappedhandlerclasses)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:62

##### Returns

`string`

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`[toStringTag]`](AbstractRouteErrorResolver.md#tostringtag)

## Methods

### resolveError()

> **resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:79

Resolve an error only when this resolver applies to the current handler.

#### Parameters

##### route

`Route`

The current route.

##### handler

`any`

The handler that was executing when the error occurred.

##### error

`Error`

The thrown error.

#### Returns

[`ModelAndView`](ModelAndView.md)

A resolved model and view, or `null` when this resolver does not apply.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`resolveError`](AbstractRouteErrorResolver.md#resolveerror)

***

### \_shouldApplyTo()

> `protected` **\_shouldApplyTo**(`route`, `handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:95

Determine whether this resolver should be applied to the given handler.

#### Parameters

##### route

`Route`

The current route.

##### handler

`object`

The candidate handler.

#### Returns

`boolean`

`true` when the resolver should handle the error.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_shouldApplyTo`](AbstractRouteErrorResolver.md#_shouldapplyto)

***

### \_resolveError()

> `protected` **\_resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:203

Resolve built-in framework errors to the default error view.

#### Parameters

##### route

`Route`

The current route.

##### handler

`object`

The handler that was executing when the error occurred.

##### error

`Error`

The thrown error.

#### Returns

[`ModelAndView`](ModelAndView.md)

A default model and view when the error is recognized, otherwise `null`.

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_resolveError`](AbstractRouteErrorResolver.md#_resolveerror)
