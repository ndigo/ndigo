[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / NamePathHandlerMapping

# Class: NamePathHandlerMapping

Map handlers by application-context names that start with `/`.

## Extends

- [`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md)

## Constructors

### Constructor

> **new NamePathHandlerMapping**(): `NamePathHandlerMapping`

Create a path handler mapping with empty path registrations.

#### Returns

`NamePathHandlerMapping`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`constructor`](AbstractDetectingPathHandlerMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`[$aware]`](AbstractDetectingPathHandlerMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`applicationContext`](AbstractDetectingPathHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`defaultHandler`](AbstractDetectingPathHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`interceptors`](AbstractDetectingPathHandlerMapping.md#interceptors)

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`name`](AbstractDetectingPathHandlerMapping.md#name)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`pathMatcher`](AbstractDetectingPathHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object` \| `null` = `null`

Handler mapped to the root path.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`rootHandler`](AbstractDetectingPathHandlerMapping.md#roothandler)

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean` = `false`

Whether trailing slash variants should be considered matches.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`useTrailingSlashMatch`](AbstractDetectingPathHandlerMapping.md#usetrailingslashmatch)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`[toStringTag]`](AbstractDetectingPathHandlerMapping.md#tostringtag)

## Methods

### getHandler()

> **getHandler**(`route`): [`RouteHandlerExecutionChain`](#) \| `null`

Resolve a route to a handler execution chain.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

[`RouteHandlerExecutionChain`](#) \| `null`

The execution chain, or `null` when no handler matches.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`getHandler`](AbstractDetectingPathHandlerMapping.md#gethandler)

***

### lookUpHandler()

> **lookUpHandler**(`path`, `route`): [`RouteHandlerExecutionChain`](#) \| `null`

Look up the handler for a path.

#### Parameters

##### path

`string`

The request path.

##### route

[`Route`](#)

The current route.

#### Returns

[`RouteHandlerExecutionChain`](#) \| `null`

The resolved execution chain, or `null`.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`lookUpHandler`](AbstractDetectingPathHandlerMapping.md#lookuphandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md) \| `null`

Check whether a route matches a path pattern.

#### Parameters

##### route

[`Route`](#)

The current route.

##### pattern

`string`

The pattern to test.

#### Returns

[`RouteMatchResult`](RouteMatchResult.md) \| `null`

A match result, or `null`.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`match`](AbstractDetectingPathHandlerMapping.md#match)

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Store the application context and detect handlers immediately.

#### Parameters

##### context

`ApplicationContext`

The application context to use.

#### Returns

`void`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`setApplicationContext`](AbstractDetectingPathHandlerMapping.md#setapplicationcontext)

***

### setName()

> **setName**(`name`): `void`

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`setName`](AbstractDetectingPathHandlerMapping.md#setname)
