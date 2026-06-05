[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / LinearMetadataHandlerMapping

# Class: LinearMetadataHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1033

Map handler methods using route mapping metadata.

## Extends

- [`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

## Implements

- [`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md)

## Constructors

### Constructor

> **new LinearMetadataHandlerMapping**(): `LinearMetadataHandlerMapping`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:500

Create a handler-method mapping with an empty registry.

#### Returns

`LinearMetadataHandlerMapping`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`constructor`](AbstractHandlerMethodMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:351

Application context used to resolve named handlers.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`applicationContext`](AbstractHandlerMethodMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:356

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`defaultHandler`](AbstractHandlerMethodMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:361

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`interceptors`](AbstractHandlerMethodMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:366

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`pathMatcher`](AbstractHandlerMethodMapping.md#pathmatcher)

***

### namingStrategy

> **namingStrategy**: `RouteHandlerMethodMappingNamingStrategy`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:485

Naming strategy used when exposing handler methods by name.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`namingStrategy`](AbstractHandlerMethodMapping.md#namingstrategy)

***

### mappingRegistry

> `readonly` **mappingRegistry**: `MappingRegistry`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:490

Registry of route mappings and their handler methods.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`mappingRegistry`](AbstractHandlerMethodMapping.md#mappingregistry)

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`[$aware]`](AbstractHandlerMethodMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/lib/aware.d.ts:31

The name of the value in the factory.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`name`](AbstractHandlerMethodMapping.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1037

##### Returns

`string`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`[toStringTag]`](AbstractHandlerMethodMapping.md#tostringtag)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:407

Store the application context for later handler resolution.

#### Parameters

##### applicationContext

`ApplicationContext`

The application context to use.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`setApplicationContext`](AbstractHandlerMethodMapping.md#setapplicationcontext)

***

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

#### Implementation of

[`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md).[`getHandler`](../interfaces/MatchableHandlerMapping.md#gethandler)

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandler`](AbstractHandlerMethodMapping.md#gethandler)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getHandlerExecutionChain`](AbstractHandlerMethodMapping.md#_gethandlerexecutionchain)

***

### init()

> **init**(): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:513

Detect and register handler methods from the application context.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`init`](AbstractHandlerMethodMapping.md#init)

***

### getHandlerMethods()

> **getHandlerMethods**(): `Map`\<[`RouteMappingInfo`](RouteMappingInfo.md), `RouteHandlerMethod`\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:526

Return all registered handler methods.

#### Returns

`Map`\<[`RouteMappingInfo`](RouteMappingInfo.md), `RouteHandlerMethod`\>

The mapping-to-handler-method registry.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandlerMethods`](AbstractHandlerMethodMapping.md#gethandlermethods)

***

### getHandlerMethodsForMappingName()

> **getHandlerMethodsForMappingName**(`name`): `RouteHandlerMethod`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:536

Return handler methods registered under a mapping name.

#### Parameters

##### name

`string`

The mapping name.

#### Returns

`RouteHandlerMethod`[]

The matching handler methods.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandlerMethodsForMappingName`](AbstractHandlerMethodMapping.md#gethandlermethodsformappingname)

***

### unregisterMapping()

> **unregisterMapping**(`mapping`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:557

Remove a mapping from the registry.

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

The mapping metadata to remove.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`unregisterMapping`](AbstractHandlerMethodMapping.md#unregistermapping)

***

### \_createRequestHandlerMethod()

> `protected` **\_createRequestHandlerMethod**(`handler`, `method`): `RouteHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:568

Create a handler method reference from a handler object and method name.

#### Parameters

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

##### method

`string`

The handler method name.

#### Returns

`RouteHandlerMethod`

The resolved handler method.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_createRequestHandlerMethod`](AbstractHandlerMethodMapping.md#_createrequesthandlermethod)

***

### \_detectHandlerMethods()

> `protected` **\_detectHandlerMethods**(`handler`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:590

Scan a handler for mapped methods and register them.

#### Parameters

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_detectHandlerMethods`](AbstractHandlerMethodMapping.md#_detecthandlermethods)

***

### \_getHandler()

> `protected` **\_getHandler**(`route`): `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:611

Resolve a route by looking up the best handler method.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`any`

The resolved handler method, or `null`.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getHandler`](AbstractHandlerMethodMapping.md#_gethandler)

***

### \_lookupHandlerMethod()

> `protected` **\_lookupHandlerMethod**(`path`, `route`): `RouteHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:623

Find the best handler method for a path.

#### Parameters

##### path

`string`

The request path.

##### route

`Route`

The current route.

#### Returns

`RouteHandlerMethod`

The best matching handler method, or `null`.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_lookupHandlerMethod`](AbstractHandlerMethodMapping.md#_lookuphandlermethod)

***

### \_registerHandlerMethod()

> `protected` **\_registerHandlerMethod**(`handler`, `method`, `mapping`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:673

Register a handler method for the given mapping.

#### Parameters

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

##### method

`string`

The method name.

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

The mapping metadata.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_registerHandlerMethod`](AbstractHandlerMethodMapping.md#_registerhandlermethod)

***

### \_getMappingForMethod()

> `protected` **\_getMappingForMethod**(`method`, `handler`): [`RouteMappingInfo`](RouteMappingInfo.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:701

Build a [RouteMappingInfo](RouteMappingInfo.md) for the given handler method.

Reads `@routeMapping` metadata from both the method and the containing class,
constructs [QueryParamCondition](QueryParamCondition.md) and [MatrixParamCondition](MatrixParamCondition.md) from the
`params` and `matrixParams` fields respectively, and merges class-level and
method-level mappings when both are present.

#### Parameters

##### method

`string`

The method name to inspect.

##### handler

`any`

The handler instance whose prototype carries the metadata.

#### Returns

[`RouteMappingInfo`](RouteMappingInfo.md)

The combined [RouteMappingInfo](RouteMappingInfo.md), or `undefined` if no mapping exists.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getMappingForMethod`](AbstractHandlerMethodMapping.md#_getmappingformethod)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1048

Check whether the route matches a mapping pattern.

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

#### Implementation of

[`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md).[`match`](../interfaces/MatchableHandlerMapping.md#match)

***

### \_getMappingComparator()

> `protected` **\_getMappingComparator**(`route`): `Comparator`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1064

Create a comparator for route mapping metadata.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`Comparator`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

A comparator for route mapping info.

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getMappingComparator`](AbstractHandlerMethodMapping.md#_getmappingcomparator)

***

### \_getMatchingMapping()

> `protected` **\_getMatchingMapping**(`mapping`, `route`): [`RouteMappingInfo`](RouteMappingInfo.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1077

Return the mapping when it matches the current route.

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

The mapping to test.

##### route

`Route`

The current route.

#### Returns

[`RouteMappingInfo`](RouteMappingInfo.md)

A matching mapping, or `null`.

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getMatchingMapping`](AbstractHandlerMethodMapping.md#_getmatchingmapping)

***

### \_handleMatch()

> `protected` **\_handleMatch**(`mapping`, `path`, `route`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1088

Record the best route pattern and attach it to the route.

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

The matched mapping.

##### path

`string`

The matched path.

##### route

`Route`

The current route.

#### Returns

`void`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_handleMatch`](AbstractHandlerMethodMapping.md#_handlematch)

***

### \_handleNoMatch()

> `protected` **\_handleNoMatch**(`mappings`, `path`, `route`): `RouteHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1117

Handle the no-match case for metadata mappings.

#### Parameters

##### mappings

`any`

Candidate mappings.

##### path

`string`

The requested path.

##### route

`Route`

The current route.

#### Returns

`RouteHandlerMethod`

Always `null`.

***

### \_isHandler()

> `protected` **\_isHandler**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1127

Determine whether a value can be treated as a mapped handler.

#### Parameters

##### value

`any`

The candidate value.

#### Returns

`boolean`

`true` when route mapping metadata is present.

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_isHandler`](AbstractHandlerMethodMapping.md#_ishandler)

***

### registerMapping()

> **registerMapping**(`mapping`, `handler`, `method`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:1138

Register a single mapping and handler method.

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

The mapping metadata.

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

##### method

`string`

The handler method name.

#### Returns

`void`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`registerMapping`](AbstractHandlerMethodMapping.md#registermapping)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`setName`](AbstractHandlerMethodMapping.md#setname)
