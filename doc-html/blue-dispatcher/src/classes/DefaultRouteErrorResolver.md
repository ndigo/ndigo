[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / DefaultRouteErrorResolver

# Class: DefaultRouteErrorResolver

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:209](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-209)

The default implementation of the [RouteErrorResolver](../interfaces/RouteErrorResolver.md) interface, resolving standard BlueJS exceptions.

This error resolver is enabled by default in the `WebDispatcher`.

Error classes are mapped to view names via `errorMappings`.  Out of the box it
maps `FrameworkError` to `'error/framework'` and `ApplicationError`
to `'error/application'`.  Additional mappings can be added through
[setErrorMapping](#seterrormapping).

## Extends

- [`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md)

## Constructors

### Constructor

> **new DefaultRouteErrorResolver**(`defaultErrorView?`): `DefaultRouteErrorResolver`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:229](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-229)

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

### mappedHandlers

> **mappedHandlers**: `any`[] \| `null`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:55](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-55)

Handlers explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`mappedHandlers`](AbstractRouteErrorResolver.md#mappedhandlers)

***

### mappedHandlerClasses

> **mappedHandlerClasses**: `Constructable`[]

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-60)

Handler classes explicitly targeted by this resolver, if any.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`mappedHandlerClasses`](AbstractRouteErrorResolver.md#mappedhandlerclasses)

***

### defaultErrorView

> **defaultErrorView**: `string`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:213](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-213)

View name used when no specific error mapping matches.

***

### errorMappings

> **errorMappings**: `Map`\<`string`, `string`\>

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:218](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-218)

Error-name-to-view-name mappings.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:220](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-220)

##### Returns

`string`

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`[toStringTag]`](AbstractRouteErrorResolver.md#tostringtag)

## Methods

### resolveError()

> **resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md) \| `null`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:79](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-79)

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

[`ModelAndView`](ModelAndView.md) \| `null`

A resolved model and view, or `null` when this resolver does not apply.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`resolveError`](AbstractRouteErrorResolver.md#resolveerror)

***

### \_shouldApplyTo()

> `protected` **\_shouldApplyTo**(`route`, `handler`): `boolean`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:95](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-95)

Determine whether this resolver should be applied to the given handler.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

`object` \| `null`

The candidate handler.

#### Returns

`boolean`

`true` when the resolver should handle the error.

#### Inherited from

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_shouldApplyTo`](AbstractRouteErrorResolver.md#_shouldapplyto)

***

### setErrorMapping()

> **setErrorMapping**(`errorName`, `viewName`): `void`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:257](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-257)

Register an additional error-class-name-to-view-name mapping.

#### Parameters

##### errorName

`string`

The error class name (e.g. `'IllegalStateError'`).

##### viewName

`string`

The view name to render for this error.

#### Returns

`void`

***

### \_resolveError()

> `protected` **\_resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md) \| `null`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:272](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-272)

Resolve built-in framework errors to configured error views.

Looks up the error's constructor name in [errorMappings](#errormappings).
Falls back to [defaultErrorView](#defaulterrorview) when no mapping is found.

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

[`ModelAndView`](ModelAndView.md) \| `null`

A model and view for the error, or `null` on failure.

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_resolveError`](AbstractRouteErrorResolver.md#_resolveerror)
