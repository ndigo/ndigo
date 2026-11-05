[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-error-resolver](../README.md) / MetadataErrorResolver

# Class: MetadataErrorResolver

An [AbstractRouteErrorResolver](AbstractRouteErrorResolver.md) that resolves exceptions through 'error:mapping' metadata.

## Extends

- [`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md)

## Implements

- `ApplicationContextAware`

## Constructors

### Constructor

> **new MetadataErrorResolver**(): `MetadataErrorResolver`

#### Returns

`MetadataErrorResolver`

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`constructor`](AbstractHandlerMethodErrorResolver.md#constructor)

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext` \| `null`

Application context used to discover error handlers.

***

### mappedHandlerClasses

> **mappedHandlerClasses**: `Constructable`[]

Handler classes explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`mappedHandlerClasses`](AbstractHandlerMethodErrorResolver.md#mappedhandlerclasses)

***

### mappedHandlers

> **mappedHandlers**: `object`[] \| `null`

Handlers explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`mappedHandlers`](AbstractHandlerMethodErrorResolver.md#mappedhandlers)

## Accessors

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

##### Returns

`boolean`

#### Implementation of

`ApplicationContextAware.[$aware]`

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`[toStringTag]`](AbstractHandlerMethodErrorResolver.md#tostringtag)

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

[`AbstractHandlerMethodErrorResolver`](AbstractHandlerMethodErrorResolver.md).[`resolveError`](AbstractHandlerMethodErrorResolver.md#resolveerror)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Store the application context for later error-handler lookup.

#### Parameters

##### applicationContext

`ApplicationContext`

The application context to use.

#### Returns

`void`

#### Implementation of

`ApplicationContextAware.setApplicationContext`
