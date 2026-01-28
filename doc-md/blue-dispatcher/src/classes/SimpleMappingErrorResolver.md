[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / SimpleMappingErrorResolver

# Class: SimpleMappingErrorResolver

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:241

[RouteErrorResolver](../interfaces/RouteErrorResolver.md) implementation that allows for mapping exception class names to view names, either for a set of given handlers or for all handlers in the Dispatcher\|Dispatcher.

## See

Dispatcher

## Extends

- [`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md)

## Constructors

### Constructor

> **new SimpleMappingErrorResolver**(`defaultErrorView?`): `SimpleMappingErrorResolver`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:249

#### Parameters

##### defaultErrorView?

`string`

#### Returns

`SimpleMappingErrorResolver`

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`constructor`](AbstractRouteErrorResolver.md#constructor)

## Properties

### mappedHandlers

> **mappedHandlers**: `any`[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:54

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`mappedHandlers`](AbstractRouteErrorResolver.md#mappedhandlers)

***

### mappedHandlerClasses

> **mappedHandlerClasses**: [`Constructable`](../../../blue-core/src/type-aliases/Constructable.md)[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:55

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`mappedHandlerClasses`](AbstractRouteErrorResolver.md#mappedhandlerclasses)

***

### defaultErrorView

> **defaultErrorView**: `string`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:242

***

### errorMappings

> **errorMappings**: `Map`\<`string`, `string`\>

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:243

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:245

##### Returns

`string`

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`[toStringTag]`](AbstractRouteErrorResolver.md#tostringtag)

## Methods

### resolveError()

> **resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:66

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handler

`any`

##### error

`Error`

#### Returns

[`ModelAndView`](ModelAndView.md)

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`resolveError`](AbstractRouteErrorResolver.md#resolveerror)

***

### \_shouldApplyTo()

> `protected` **\_shouldApplyTo**(`route`, `handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:75

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handler

`object`

#### Returns

`boolean`

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_shouldApplyTo`](AbstractRouteErrorResolver.md#_shouldapplyto)

***

### \_resolveError()

> `protected` **\_resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:282

Actually resolve the given error that got thrown during on handler execution, returning a `ModelAndView` that represents a specific error page if appropriate.

May be overridden in subclasses, in order to apply specific error checks.

    *

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

The current route.

##### handler

`object`

The executed handler or `null` if none chosen at the time of the error.

##### error

`Error`

The error that was thrown during execution.

#### Returns

[`ModelAndView`](ModelAndView.md)

The corresponding `ModelAndView` to forward to or `null` for default processing in the resolution chain.

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_resolveError`](AbstractRouteErrorResolver.md#_resolveerror)
