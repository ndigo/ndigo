[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractRouteErrorResolver

# Abstract Class: AbstractRouteErrorResolver

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:51

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

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:66

#### Returns

`AbstractRouteErrorResolver`

## Properties

### mappedHandlers

> **mappedHandlers**: `any`[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:55

Handlers explicitly targeted by this resolver, if any.

***

### mappedHandlerClasses

> **mappedHandlerClasses**: `Constructable`[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:60

Handler classes explicitly targeted by this resolver, if any.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:62

##### Returns

`string`

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

#### Implementation of

[`RouteErrorResolver`](../interfaces/RouteErrorResolver.md).[`resolveError`](../interfaces/RouteErrorResolver.md#resolveerror)

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

***

### \_resolveError()

> `abstract` `protected` **\_resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:125

Resolve the error once applicability has been established.

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

A resolved model and view, or `null` to continue resolution.
