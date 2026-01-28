[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractRouteErrorResolver

# Abstract Class: AbstractRouteErrorResolver

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:53

## Extended by

- [`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md)
- [`DefaultRouteErrorResolver`](DefaultRouteErrorResolver.md)
- [`SimpleMappingErrorResolver`](SimpleMappingErrorResolver.md)

## Implements

- [`RouteErrorResolver`](../interfaces/RouteErrorResolver.md)

## Constructors

### Constructor

> **new AbstractRouteErrorResolver**(): `AbstractRouteErrorResolver`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:61

#### Returns

`AbstractRouteErrorResolver`

## Properties

### mappedHandlers

> **mappedHandlers**: `any`[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:54

***

### mappedHandlerClasses

> **mappedHandlerClasses**: [`Constructable`](../../../blue-core/src/type-aliases/Constructable.md)[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:55

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:57

##### Returns

`string`

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

#### Implementation of

[`RouteErrorResolver`](../interfaces/RouteErrorResolver.md).[`resolveError`](../interfaces/RouteErrorResolver.md#resolveerror)

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

***

### \_resolveError()

> `abstract` `protected` **\_resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:97

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handler

`object`

##### error

`Error`

#### Returns

[`ModelAndView`](ModelAndView.md)
