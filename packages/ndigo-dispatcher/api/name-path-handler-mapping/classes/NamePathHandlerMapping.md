[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [name-path-handler-mapping](../README.md) / NamePathHandlerMapping

# Class: NamePathHandlerMapping

Map handlers by application-context names that start with `/`.

## Extends

- [`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md)

## Constructors

### Constructor

> **new NamePathHandlerMapping**(): `NamePathHandlerMapping`

Create a path handler mapping with empty path registrations.

#### Returns

`NamePathHandlerMapping`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`constructor`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`[$aware]`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`applicationContext`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`defaultHandler`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../../route-handler-interceptor/interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`interceptors`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#interceptors)

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`name`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#name)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`pathMatcher`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object` \| `null` = `null`

Handler mapped to the root path.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`rootHandler`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#roothandler)

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean` = `false`

Whether trailing slash variants should be considered matches.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`useTrailingSlashMatch`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#usetrailingslashmatch)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`[toStringTag]`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#tostringtag)

## Methods

### getHandler()

> **getHandler**(`route`): [`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

Resolve a route to a handler execution chain.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

[`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

The execution chain, or `null` when no handler matches.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`getHandler`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#gethandler)

***

### lookUpHandler()

> **lookUpHandler**(`path`, `route`): [`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

Look up the handler for a path.

#### Parameters

##### path

`string`

The request path.

##### route

[`Route`](#)

The current route.

#### Returns

[`default`](../../route-handler-execution-chain/classes/default.md) \| `null`

The resolved execution chain, or `null`.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`lookUpHandler`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#lookuphandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](../../route-match-result/classes/RouteMatchResult.md) \| `null`

Check whether a route matches a path pattern.

#### Parameters

##### route

[`Route`](#)

The current route.

##### pattern

`string`

The pattern to test.

#### Returns

[`RouteMatchResult`](../../route-match-result/classes/RouteMatchResult.md) \| `null`

A match result, or `null`.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`match`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#match)

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

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`setApplicationContext`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#setapplicationcontext)

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

[`AbstractDetectingPathHandlerMapping`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md).[`setName`](../../abstract-path-handler-mapping/classes/AbstractDetectingPathHandlerMapping.md#setname)
