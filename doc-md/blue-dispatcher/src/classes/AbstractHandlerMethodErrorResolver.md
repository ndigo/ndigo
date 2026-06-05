[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractHandlerMethodErrorResolver

# Abstract Class: AbstractHandlerMethodErrorResolver

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:128

Resolves exceptions into a route-specific response.

## Extends

- [`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md)

## Extended by

- [`MetadataErrorResolver`](MetadataErrorResolver.md)

## Constructors

### Constructor

> **new AbstractHandlerMethodErrorResolver**(): `AbstractHandlerMethodErrorResolver`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:66

#### Returns

`AbstractHandlerMethodErrorResolver`

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

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:136

Narrow applicability to wrapped route handler methods.

#### Parameters

##### route

`Route`

The current route.

##### handler

`object`

The candidate handler.

#### Returns

`boolean`

`true` when the wrapped handler method should be considered.

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_shouldApplyTo`](AbstractRouteErrorResolver.md#_shouldapplyto)

***

### \_resolveError()

> `protected` **\_resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:154

Delegate resolution to the wrapped handler method.

#### Parameters

##### route

`Route`

The current route.

##### handler

`object`

The wrapped handler method's target.

##### error

`Error`

The thrown error.

#### Returns

[`ModelAndView`](ModelAndView.md)

A resolved model and view, or `null`.

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_resolveError`](AbstractRouteErrorResolver.md#_resolveerror)

***

### \_resolveHandlerMethodError()

> `abstract` `protected` **\_resolveHandlerMethodError**(`route`, `handlerMethod`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:166

Resolve an error for a specific handler method.

#### Parameters

##### route

`Route`

The current route.

##### handlerMethod

`RouteHandlerMethod`

The handler method that failed.

##### error

`Error`

The thrown error.

#### Returns

[`ModelAndView`](ModelAndView.md)

A model and view, or `null` when the error is not handled.
