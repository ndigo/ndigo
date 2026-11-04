[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / AbstractPathHandlerMapping

# Abstract Class: AbstractPathHandlerMapping

Base class for path-based handler mappings.

## Extends

- [`AbstractHandlerMapping`](AbstractHandlerMapping.md)

## Extended by

- [`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md)
- [`SimplePathHandlerMapping`](SimplePathHandlerMapping.md)

## Implements

- [`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md)

## Constructors

### Constructor

> **new AbstractPathHandlerMapping**(): `AbstractPathHandlerMapping`

Create a path handler mapping with empty path registrations.

#### Returns

`AbstractPathHandlerMapping`

#### Overrides

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`constructor`](AbstractHandlerMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`[$aware]`](AbstractHandlerMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`applicationContext`](AbstractHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`defaultHandler`](AbstractHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`interceptors`](AbstractHandlerMapping.md#interceptors)

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`name`](AbstractHandlerMapping.md#name)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`pathMatcher`](AbstractHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object` \| `null` = `null`

Handler mapped to the root path.

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean` = `false`

Whether trailing slash variants should be considered matches.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`[toStringTag]`](AbstractHandlerMapping.md#tostringtag)

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

#### Implementation of

[`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md).[`getHandler`](../interfaces/MatchableHandlerMapping.md#gethandler)

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`getHandler`](AbstractHandlerMapping.md#gethandler)

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

#### Implementation of

[`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md).[`match`](../interfaces/MatchableHandlerMapping.md#match)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Store the application context for later handler resolution.

#### Parameters

##### applicationContext

`ApplicationContext`

The application context to use.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`setApplicationContext`](AbstractHandlerMapping.md#setapplicationcontext)

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

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`setName`](AbstractHandlerMapping.md#setname)
