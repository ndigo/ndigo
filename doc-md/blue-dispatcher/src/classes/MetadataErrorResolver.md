[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MetadataErrorResolver

# Class: MetadataErrorResolver

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:234

An [AbstractRouteErrorResolver](AbstractRouteErrorResolver.md) that resolves exceptions through 'error:mapping' metadata.

## Implements

module:context.ApplicationContextAware

## Implements

module:context.Initializable

## Extends

- [`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md)

## Implements

- `ApplicationContextAware`

## Constructors

### Constructor

> **new MetadataErrorResolver**(): `MetadataErrorResolver`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:66

#### Returns

`MetadataErrorResolver`

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`constructor`](AbstractHandlerMethodErrorResolver.md#constructor)

## Properties

### mappedHandlers

> **mappedHandlers**: `any`[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:55

Handlers explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`mappedHandlers`](AbstractHandlerMethodErrorResolver.md#mappedhandlers)

***

### mappedHandlerClasses

> **mappedHandlerClasses**: `Constructable`[]

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:60

Handler classes explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`mappedHandlerClasses`](AbstractHandlerMethodErrorResolver.md#mappedhandlerclasses)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:238

Application context used to discover error handlers.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:62

##### Returns

`string`

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`[toStringTag]`](AbstractHandlerMethodErrorResolver.md#tostringtag)

***

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:240

##### Returns

`boolean`

#### Implementation of

`ApplicationContextAware.[$aware]`

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

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`resolveError`](AbstractHandlerMethodErrorResolver.md#resolveerror)

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

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`_shouldApplyTo`](AbstractHandlerMethodErrorResolver.md#_shouldapplyto)

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

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`_resolveError`](AbstractHandlerMethodErrorResolver.md#_resolveerror)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:249

Store the application context for later error-handler lookup.

#### Parameters

##### applicationContext

`ApplicationContext`

The application context to use.

#### Returns

`void`

#### Implementation of

`ApplicationContextAware.setApplicationContext`

***

### \_getErrorHandlerMethod()

> `protected` **\_getErrorHandlerMethod**(`handlerMethod`, `error`): `ErrorHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:265

Find the first error handler method that matches the thrown error.

#### Parameters

##### handlerMethod

`RouteHandlerMethod`

The handler method that failed.

##### error

`Error`

The thrown error.

#### Returns

`ErrorHandlerMethod`

A matching error handler method, or `null`.

***

### \_resolveHandlerMethodError()

> `protected` **\_resolveHandlerMethodError**(`route`, `handlerMethod`, `error`): [`ModelAndView`](ModelAndView.md)

Defined in: packages/blue-dispatcher/src/route-error-resolver.ts:303

Resolve an error by invoking a matching error handler method.

#### Parameters

##### route

`Route`

The current route.

##### handlerMethod

`RouteHandlerMethod`

The failed handler method.

##### error

`Error`

The thrown error.

#### Returns

[`ModelAndView`](ModelAndView.md)

The error handler's model and view, or `null`.

#### Overrides

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`_resolveHandlerMethodError`](AbstractHandlerMethodErrorResolver.md#_resolvehandlermethoderror)
