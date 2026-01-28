[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractHandlerMethodErrorResolver

# Abstract Class: AbstractHandlerMethodErrorResolver

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:100

## Extends

- [`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md)

## Extended by

- [`MetadataErrorResolver`](MetadataErrorResolver.md)

## Constructors

### Constructor

> **new AbstractHandlerMethodErrorResolver**(): `AbstractHandlerMethodErrorResolver`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:61

#### Returns

`AbstractHandlerMethodErrorResolver`

#### Inherited from

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

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:57

##### Returns

`string`

#### Inherited from

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

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:101

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handler

`object`

#### Returns

`boolean`

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_shouldApplyTo`](AbstractRouteErrorResolver.md#_shouldapplyto)

***

### \_resolveError()

> `protected` **\_resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:111

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handler

`object`

##### error

`Error`

#### Returns

[`ModelAndView`](ModelAndView.md)

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_resolveError`](AbstractRouteErrorResolver.md#_resolveerror)

***

### \_resolveHandlerMethodError()

> `abstract` `protected` **\_resolveHandlerMethodError**(`route`, `handlerMethod`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:115

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handlerMethod

`RouteHandlerMethod`

##### error

`Error`

#### Returns

[`ModelAndView`](ModelAndView.md)
