[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MetadataErrorResolver

# Class: MetadataErrorResolver

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:175

An [AbstractRouteErrorResolver](AbstractRouteErrorResolver.md) that resolves exceptions through 'error:mapping' metadata.

## Extends

- [`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md)

## Implements

- [`ApplicationContextAware`](../../../blue-context/src/interfaces/ApplicationContextAware.md)

## Constructors

### Constructor

> **new MetadataErrorResolver**(): `MetadataErrorResolver`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:61

#### Returns

`MetadataErrorResolver`

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`constructor`](AbstractHandlerMethodErrorResolver.md#constructor)

## Properties

### mappedHandlers

> **mappedHandlers**: `any`[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:54

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`mappedHandlers`](AbstractHandlerMethodErrorResolver.md#mappedhandlers)

***

### mappedHandlerClasses

> **mappedHandlerClasses**: [`Constructable`](../../../blue-core/src/type-aliases/Constructable.md)[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:55

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`mappedHandlerClasses`](AbstractHandlerMethodErrorResolver.md#mappedhandlerclasses)

***

### applicationContext

> **applicationContext**: [`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:176

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:57

##### Returns

`string`

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`[toStringTag]`](AbstractHandlerMethodErrorResolver.md#tostringtag)

***

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:178

##### Returns

`boolean`

#### Implementation of

[`ApplicationContextAware`](../../../blue-context/src/interfaces/ApplicationContextAware.md).[`[$aware]`](../../../blue-context/src/interfaces/ApplicationContextAware.md#aware)

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

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`resolveError`](AbstractHandlerMethodErrorResolver.md#resolveerror)

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

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`_shouldApplyTo`](AbstractHandlerMethodErrorResolver.md#_shouldapplyto)

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

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`_resolveError`](AbstractHandlerMethodErrorResolver.md#_resolveerror)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:182

#### Parameters

##### applicationContext

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Implementation of

[`ApplicationContextAware`](../../../blue-context/src/interfaces/ApplicationContextAware.md).[`setApplicationContext`](../../../blue-context/src/interfaces/ApplicationContextAware.md#setapplicationcontext)

***

### \_getErrorHandlerMethod()

> `protected` **\_getErrorHandlerMethod**(`handlerMethod`, `error`): `ErrorHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:191

#### Parameters

##### handlerMethod

`RouteHandlerMethod`

##### error

`Error`

#### Returns

`ErrorHandlerMethod`

***

### \_resolveHandlerMethodError()

> `protected` **\_resolveHandlerMethodError**(`route`, `handlerMethod`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:221

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### handlerMethod

`RouteHandlerMethod`

##### error

`Error`

#### Returns

[`ModelAndView`](ModelAndView.md)

#### Overrides

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`_resolveHandlerMethodError`](AbstractHandlerMethodErrorResolver.md#_resolvehandlermethoderror)
