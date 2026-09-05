[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / SimpleMappingErrorResolver

# Class: SimpleMappingErrorResolver

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:390](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-390)

[RouteErrorResolver](../interfaces/RouteErrorResolver.md) implementation that allows for mapping exception class names to view names, either for a set of given handlers or for all handlers in the `Dispatcher`.

## See

`Dispatcher`

## Extends

- [`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md)

## Constructors

### Constructor

> **new SimpleMappingErrorResolver**(`defaultErrorView?`): `SimpleMappingErrorResolver`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:410](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-410)

Create a resolver backed by simple error-name mappings.

#### Parameters

##### defaultErrorView?

`string`

The fallback view name to use when no mapping matches.

#### Returns

`SimpleMappingErrorResolver`

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

> **defaultErrorView**: `string` \| `null`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:394](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-394)

View name used when no specific error mapping matches.

***

### errorMappings

> **errorMappings**: `Map`\<`string`, `string`\> \| `null`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:399](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-399)

Error-name-to-view-name mappings.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:401](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-401)

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

### \_resolveError()

> `protected` **\_resolveError**(`route`, `handler`, `error`): [`ModelAndView`](ModelAndView.md) \| `null`

Defined in: [packages/blue-dispatcher/src/route-error-resolver.ts:451](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-error-resolver.ts#lines-451)

Resolve an error by matching its name against configured view mappings.

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

The mapped model and view, or `null` when no mapping applies.

#### Overrides

[`AbstractRouteErrorResolver`](AbstractRouteErrorResolver.md).[`_resolveError`](AbstractRouteErrorResolver.md#_resolveerror)
