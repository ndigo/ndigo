[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / NamePathHandlerMapping

# Class: NamePathHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1007

Map handlers by application-context names that start with `/`.

## Extends

- [`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md)

## Constructors

### Constructor

> **new NamePathHandlerMapping**(): `NamePathHandlerMapping`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:761

Create a path handler mapping with empty path registrations.

#### Returns

`NamePathHandlerMapping`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`constructor`](AbstractDetectingPathHandlerMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:351

Application context used to resolve named handlers.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`applicationContext`](AbstractDetectingPathHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:356

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`defaultHandler`](AbstractDetectingPathHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:361

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`interceptors`](AbstractDetectingPathHandlerMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:366

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`pathMatcher`](AbstractDetectingPathHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:749

Handler mapped to the root path.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`rootHandler`](AbstractDetectingPathHandlerMapping.md#roothandler)

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:754

Whether trailing slash variants should be considered matches.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`useTrailingSlashMatch`](AbstractDetectingPathHandlerMapping.md#usetrailingslashmatch)

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`[$aware]`](AbstractDetectingPathHandlerMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/lib/aware.d.ts:31

The name of the value in the factory.

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`name`](AbstractDetectingPathHandlerMapping.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1008

##### Returns

`string`

#### Overrides

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`[toStringTag]`](AbstractDetectingPathHandlerMapping.md#tostringtag)

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

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`getHandler`](AbstractDetectingPathHandlerMapping.md#gethandler)

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

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_getHandlerExecutionChain`](AbstractDetectingPathHandlerMapping.md#_gethandlerexecutionchain)

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

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`lookUpHandler`](AbstractDetectingPathHandlerMapping.md#lookuphandler)

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

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`match`](AbstractDetectingPathHandlerMapping.md#match)

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

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_getHandler`](AbstractDetectingPathHandlerMapping.md#_gethandler)

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

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_registerHandler`](AbstractDetectingPathHandlerMapping.md#_registerhandler)

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

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`setApplicationContext`](AbstractDetectingPathHandlerMapping.md#setapplicationcontext)

***

### \_detectHandlers()

> `protected` **\_detectHandlers**(): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:933

Scan the application context for handlers and register their paths.

#### Returns

`void`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_detectHandlers`](AbstractDetectingPathHandlerMapping.md#_detecthandlers)

***

### \_determinePathsForHandler()

> `protected` **\_determinePathsForHandler**(`name`): `string`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1018

Use slash-prefixed application-context names as route paths.

#### Parameters

##### name

`string`

The application-context name.

#### Returns

`string`[]

The derived paths.

#### Overrides

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_determinePathsForHandler`](AbstractDetectingPathHandlerMapping.md#_determinepathsforhandler)

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

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`setName`](AbstractDetectingPathHandlerMapping.md#setname)
