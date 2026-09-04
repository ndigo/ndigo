[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractPathHandlerMapping

# Abstract Class: AbstractPathHandlerMapping

Defined in: packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:17

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

Defined in: packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:33

Create a path handler mapping with empty path registrations.

#### Returns

`AbstractPathHandlerMapping`

#### Overrides

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`constructor`](AbstractHandlerMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:60

Application context used to resolve named handlers.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`applicationContext`](AbstractHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:65

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`defaultHandler`](AbstractHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:70

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`interceptors`](AbstractHandlerMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:75

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`pathMatcher`](AbstractHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object` \| `null` = `null`

Defined in: packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:21

Handler mapped to the root path.

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean` = `false`

Defined in: packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:26

Whether trailing slash variants should be considered matches.

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`[$aware]`](AbstractHandlerMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/lib/aware.d.ts:31

The name of the value in the factory.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`name`](AbstractHandlerMapping.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:82

##### Returns

`string`

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`[toStringTag]`](AbstractHandlerMapping.md#tostringtag)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:101

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

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain` \| `null`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:117

Resolve a route to a handler execution chain.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`RouteHandlerExecutionChain` \| `null`

The execution chain, or `null` when no handler matches.

#### Implementation of

[`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md).[`getHandler`](../interfaces/MatchableHandlerMapping.md#gethandler)

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`getHandler`](AbstractHandlerMapping.md#gethandler)

***

### \_getHandlerExecutionChain()

> `protected` **\_getHandlerExecutionChain**(`handler`, `route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:142

Build an execution chain for a resolved handler and route.

#### Parameters

##### handler

`any`

The resolved handler or existing execution chain.

##### route

`Route`

The current route.

#### Returns

`RouteHandlerExecutionChain`

The execution chain to invoke.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`_getHandlerExecutionChain`](AbstractHandlerMapping.md#_gethandlerexecutionchain)

***

### lookUpHandler()

> **lookUpHandler**(`path`, `route`): `RouteHandlerExecutionChain` \| `null`

Defined in: packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:47

Look up the handler for a path.

#### Parameters

##### path

`string`

The request path.

##### route

`Route`

The current route.

#### Returns

`RouteHandlerExecutionChain` \| `null`

The resolved execution chain, or `null`.

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md) \| `null`

Defined in: packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:108

Check whether a route matches a path pattern.

#### Parameters

##### route

`Route`

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

### \_getHandler()

> `protected` **\_getHandler**(`route`): `RouteHandlerExecutionChain` \| `null`

Defined in: packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:128

Resolve the most appropriate handler for a route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`RouteHandlerExecutionChain` \| `null`

The execution chain, or `null`.

#### Overrides

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`_getHandler`](AbstractHandlerMapping.md#_gethandler)

***

### \_registerHandler()

> `protected` **\_registerHandler**(`path`, `handler`): `void`

Defined in: packages/blue-dispatcher/src/abstract-path-handler-mapping.ts:155

Register a handler against one or more paths.

#### Parameters

##### path

`string` \| `string`[]

One path or many paths to register.

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

#### Returns

`void`

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-factory/lib/aware.d.ts:36

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`setName`](AbstractHandlerMapping.md#setname)
