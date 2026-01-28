[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / NamePathHandlerMapping

# Class: NamePathHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:693

Implementation of the [HandlerMapping](../interfaces/RouteHandlerMapping.md) interface that map from paths to handlers with names that start with slash ("/").
<p>This is the default implementation used by Dispatcher\|the dispatcher along with [MetadataHandlerMapping](MetadataHandlerMapping.md).
<p>The mapping is from path to handler name. An incoming path "/foo" would map to a handler named "/foo".
<p>Supports direct matches and wildcard matches.

## Extends

- [`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md)

## Constructors

### Constructor

> **new NamePathHandlerMapping**(): `NamePathHandlerMapping`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:493

#### Returns

`NamePathHandlerMapping`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`constructor`](AbstractDetectingPathHandlerMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: [`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:281

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`applicationContext`](AbstractDetectingPathHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:282

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`defaultHandler`](AbstractDetectingPathHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: `RouteHandlerInterceptor`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:283

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`interceptors`](AbstractDetectingPathHandlerMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: [`PathMatcher`](../../../blue-core/src/interfaces/PathMatcher.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:284

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`pathMatcher`](AbstractDetectingPathHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:488

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`rootHandler`](AbstractDetectingPathHandlerMapping.md#roothandler)

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:489

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`useTrailingSlashMatch`](AbstractDetectingPathHandlerMapping.md#usetrailingslashmatch)

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`[$aware]`](AbstractDetectingPathHandlerMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/src/aware.ts:20

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`name`](AbstractDetectingPathHandlerMapping.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:694

##### Returns

`string`

#### Overrides

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`[toStringTag]`](AbstractDetectingPathHandlerMapping.md#tostringtag)

## Methods

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:312

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerExecutionChain`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`getHandler`](AbstractDetectingPathHandlerMapping.md#gethandler)

***

### \_getHandlerExecutionChain()

> `protected` **\_getHandlerExecutionChain**(`handler`, `route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:327

#### Parameters

##### handler

`any`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerExecutionChain`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_getHandlerExecutionChain`](AbstractDetectingPathHandlerMapping.md#_gethandlerexecutionchain)

***

### lookUpHandler()

> **lookUpHandler**(`path`, `route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:500

#### Parameters

##### path

`string`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerExecutionChain`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`lookUpHandler`](AbstractDetectingPathHandlerMapping.md#lookuphandler)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:550

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### pattern

`string`

#### Returns

[`RouteMatchResult`](RouteMatchResult.md)

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`match`](AbstractDetectingPathHandlerMapping.md#match)

***

### \_getHandler()

> `protected` **\_getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:564

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerExecutionChain`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_getHandler`](AbstractDetectingPathHandlerMapping.md#_gethandler)

***

### \_registerHandler()

> `protected` **\_registerHandler**(`path`, `handler`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:583

#### Parameters

##### path

`string` | `string`[]

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

#### Returns

`void`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_registerHandler`](AbstractDetectingPathHandlerMapping.md#_registerhandler)

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:623

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`setApplicationContext`](AbstractDetectingPathHandlerMapping.md#setapplicationcontext)

***

### \_detectHandlers()

> `protected` **\_detectHandlers**(): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:628

#### Returns

`void`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_detectHandlers`](AbstractDetectingPathHandlerMapping.md#_detecthandlers)

***

### \_determinePathsForHandler()

> `protected` **\_determinePathsForHandler**(`name`): `string`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:698

#### Parameters

##### name

`string`

#### Returns

`string`[]

#### Overrides

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`_determinePathsForHandler`](AbstractDetectingPathHandlerMapping.md#_determinepathsforhandler)

***

### setName()

> **setName**(`name`): `void`

Defined in: packages/blue-factory/src/aware.ts:21

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

[`AbstractDetectingPathHandlerMapping`](AbstractDetectingPathHandlerMapping.md).[`setName`](AbstractDetectingPathHandlerMapping.md#setname)
