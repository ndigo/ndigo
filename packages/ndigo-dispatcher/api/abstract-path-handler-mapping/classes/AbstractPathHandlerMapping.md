[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [abstract-path-handler-mapping](../README.md) / AbstractPathHandlerMapping

# Abstract Class: AbstractPathHandlerMapping

Base class for path-based handler mappings.

## Extends

- [`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md)

## Extended by

- [`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md)
- [`SimplePathHandlerMapping`](../../simple-path-handler-mapping/classes/SimplePathHandlerMapping.md)

## Implements

- [`MatchableHandlerMapping`](../../abstract-handler-mapping/interfaces/MatchableHandlerMapping.md)

## Constructors

### Constructor

> **new AbstractPathHandlerMapping**(): `AbstractPathHandlerMapping`

Create a path handler mapping with empty path registrations.

#### Returns

`AbstractPathHandlerMapping`

#### Overrides

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`constructor`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`[$aware]`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

#### Inherited from

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`applicationContext`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`defaultHandler`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../../route-handler-interceptor/interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`interceptors`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#interceptors)

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`name`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#name)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`pathMatcher`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#pathmatcher)

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

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`[toStringTag]`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#tostringtag)

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

#### Implementation of

[`MatchableHandlerMapping`](../../abstract-handler-mapping/interfaces/MatchableHandlerMapping.md).[`getHandler`](../../abstract-handler-mapping/interfaces/MatchableHandlerMapping.md#gethandler)

#### Inherited from

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`getHandler`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#gethandler)

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

#### Implementation of

[`MatchableHandlerMapping`](../../abstract-handler-mapping/interfaces/MatchableHandlerMapping.md).[`match`](../../abstract-handler-mapping/interfaces/MatchableHandlerMapping.md#match)

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

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`setApplicationContext`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#setapplicationcontext)

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

[`AbstractHandlerMapping`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md).[`setName`](../../abstract-handler-mapping/classes/AbstractHandlerMapping.md#setname)
