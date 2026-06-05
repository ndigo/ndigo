[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractDetectingPathHandlerMapping

# Abstract Class: AbstractDetectingPathHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:919

Base class for path mappings that discover handlers from the application context.

## Extends

- [`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md)

## Extended by

- [`NamePathHandlerMapping`](NamePathHandlerMapping.md)

## Constructors

### Constructor

> **new AbstractDetectingPathHandlerMapping**(): `AbstractDetectingPathHandlerMapping`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:761

Create a path handler mapping with empty path registrations.

#### Returns

`AbstractDetectingPathHandlerMapping`

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`constructor`](AbstractPathHandlerMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:351

Application context used to resolve named handlers.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`applicationContext`](AbstractPathHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:356

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`defaultHandler`](AbstractPathHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:361

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`interceptors`](AbstractPathHandlerMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:366

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`pathMatcher`](AbstractPathHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:749

Handler mapped to the root path.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`rootHandler`](AbstractPathHandlerMapping.md#roothandler)

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:754

Whether trailing slash variants should be considered matches.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`useTrailingSlashMatch`](AbstractPathHandlerMapping.md#usetrailingslashmatch)

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`[$aware]`](AbstractPathHandlerMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/lib/aware.d.ts:31

The name of the value in the factory.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`name`](AbstractPathHandlerMapping.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:373

##### Returns

`string`

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`[toStringTag]`](AbstractPathHandlerMapping.md#tostringtag)

## Methods

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:423

Resolve a route to a handler execution chain.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`RouteHandlerExecutionChain`

The execution chain, or `null` when no handler matches.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`getHandler`](AbstractPathHandlerMapping.md#gethandler)

***

### \_getHandlerExecutionChain()

> `protected` **\_getHandlerExecutionChain**(`handler`, `route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:445

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`_getHandlerExecutionChain`](AbstractPathHandlerMapping.md#_gethandlerexecutionchain)

***

### lookUpHandler()

> **lookUpHandler**(`path`, `route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:775

Look up the handler for a path.

#### Parameters

##### path

`string`

The request path.

##### route

`Route`

The current route.

#### Returns

`RouteHandlerExecutionChain`

The resolved execution chain, or `null`.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`lookUpHandler`](AbstractPathHandlerMapping.md#lookuphandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:832

Check whether a route matches a path pattern.

#### Parameters

##### route

`Route`

The current route.

##### pattern

`string`

The pattern to test.

#### Returns

[`RouteMatchResult`](RouteMatchResult.md)

A match result, or `null`.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`match`](AbstractPathHandlerMapping.md#match)

***

### \_getHandler()

> `protected` **\_getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:852

Resolve the most appropriate handler for a route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`RouteHandlerExecutionChain`

The execution chain, or `null`.

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`_getHandler`](AbstractPathHandlerMapping.md#_gethandler)

***

### \_registerHandler()

> `protected` **\_registerHandler**(`path`, `handler`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:877

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

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`_registerHandler`](AbstractPathHandlerMapping.md#_registerhandler)

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:925

Store the application context and detect handlers immediately.

#### Parameters

##### context

`ApplicationContext`

The application context to use.

#### Returns

`void`

#### Overrides

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`setApplicationContext`](AbstractPathHandlerMapping.md#setapplicationcontext)

***

### \_detectHandlers()

> `protected` **\_detectHandlers**(): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:933

Scan the application context for handlers and register their paths.

#### Returns

`void`

***

### \_determinePathsForHandler()

> `abstract` `protected` **\_determinePathsForHandler**(`name`): `string`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:947

Determine the paths for a handler name.

#### Parameters

##### name

`string`

The application-context name.

#### Returns

`string`[]

The paths to register.

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-factory/lib/aware.d.ts:38

Set the name of the value in the factory that created it.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### name

`string`

The name of the value in the factory.

#### Returns

`void`

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`setName`](AbstractPathHandlerMapping.md#setname)
