[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RadixMetadataHandlerMapping

# Class: RadixMetadataHandlerMapping

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:22

A handler mapping that can also report whether a route matches a pattern.

## Extends

- [`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

## Implements

- [`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md)

## Constructors

### Constructor

> **new RadixMetadataHandlerMapping**(): `RadixMetadataHandlerMapping`

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:43

Create a handler-method mapping with an empty registry.

#### Returns

`RadixMetadataHandlerMapping`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`constructor`](AbstractHandlerMethodMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:60

Application context used to resolve named handlers.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`applicationContext`](AbstractHandlerMethodMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:65

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`defaultHandler`](AbstractHandlerMethodMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:70

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`interceptors`](AbstractHandlerMethodMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:75

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`pathMatcher`](AbstractHandlerMethodMapping.md#pathmatcher)

***

### namingStrategy

> **namingStrategy**: [`RouteHandlerMethodMappingNamingStrategy`](../interfaces/RouteHandlerMethodMappingNamingStrategy.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:28

Naming strategy used when exposing handler methods by name.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`namingStrategy`](AbstractHandlerMethodMapping.md#namingstrategy)

***

### mappingRegistry

> `readonly` **mappingRegistry**: `MappingRegistry`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:33

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

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:38

##### Returns

`string`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`[toStringTag]`](AbstractHandlerMethodMapping.md#tostringtag)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`setApplicationContext`](AbstractHandlerMethodMapping.md#setapplicationcontext)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandler`](AbstractHandlerMethodMapping.md#gethandler)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getHandlerExecutionChain`](AbstractHandlerMethodMapping.md#_gethandlerexecutionchain)

***

### init()

> **init**(): `void`

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:51

Detect and register handler methods from the application context.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`init`](AbstractHandlerMethodMapping.md#init)

***

### getHandlerMethods()

> **getHandlerMethods**(): `Map`\<[`RouteMappingInfo`](RouteMappingInfo.md), [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:64

Return all registered handler methods.

#### Returns

`Map`\<[`RouteMappingInfo`](RouteMappingInfo.md), [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

The mapping-to-handler-method registry.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandlerMethods`](AbstractHandlerMethodMapping.md#gethandlermethods)

***

### getHandlerMethodsForMappingName()

> **getHandlerMethodsForMappingName**(`name`): [`RouteHandlerMethod`](RouteHandlerMethod.md)[]

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:74

Return handler methods registered under a mapping name.

#### Parameters

##### name

`string`

The mapping name.

#### Returns

[`RouteHandlerMethod`](RouteHandlerMethod.md)[]

The matching handler methods.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandlerMethodsForMappingName`](AbstractHandlerMethodMapping.md#gethandlermethodsformappingname)

***

### unregisterMapping()

> **unregisterMapping**(`mapping`): `void`

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:95

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

> `protected` **\_createRequestHandlerMethod**(`handler`, `method`): [`RouteHandlerMethod`](RouteHandlerMethod.md)

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:106

Create a handler method reference from a handler object and method name.

#### Parameters

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

##### method

`string`

The handler method name.

#### Returns

[`RouteHandlerMethod`](RouteHandlerMethod.md)

The resolved handler method.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_createRequestHandlerMethod`](AbstractHandlerMethodMapping.md#_createrequesthandlermethod)

***

### \_detectHandlerMethods()

> `protected` **\_detectHandlerMethods**(`handler`): `void`

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:126

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

### \_lookupHandlerMethod()

> `protected` **\_lookupHandlerMethod**(`path`, `route`): [`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:163

Find the best handler method for a path.

#### Parameters

##### path

`string`

The request path.

##### route

`Route`

The current route.

#### Returns

[`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

The best matching handler method, or `null`.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_lookupHandlerMethod`](AbstractHandlerMethodMapping.md#_lookuphandlermethod)

***

### \_registerHandlerMethod()

> `protected` **\_registerHandlerMethod**(`handler`, `method`, `mapping`): `void`

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:215

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

> `protected` **\_getMappingForMethod**(`method`, `handler`): [`RouteMappingInfo`](RouteMappingInfo.md) \| `undefined`

Defined in: packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:246

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

[`RouteMappingInfo`](RouteMappingInfo.md) \| `undefined`

The combined [RouteMappingInfo](RouteMappingInfo.md), or `undefined` if no mapping exists.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getMappingForMethod`](AbstractHandlerMethodMapping.md#_getmappingformethod)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md) \| `null`

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:42

Check whether the route matches a pattern.

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

### \_getMappingComparator()

> `protected` **\_getMappingComparator**(`route`): `Comparator`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:52

#### Parameters

##### route

`Route`

#### Returns

`Comparator`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getMappingComparator`](AbstractHandlerMethodMapping.md#_getmappingcomparator)

***

### \_getMatchingMapping()

> `protected` **\_getMatchingMapping**(`mapping`, `route`): [`RouteMappingInfo`](RouteMappingInfo.md) \| `null`

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:58

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

##### route

`Route`

#### Returns

[`RouteMappingInfo`](RouteMappingInfo.md) \| `null`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getMatchingMapping`](AbstractHandlerMethodMapping.md#_getmatchingmapping)

***

### \_getHandler()

> `protected` **\_getHandler**(`route`): [`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:62

Resolve a route by looking up the best handler method.

#### Parameters

##### route

`Route`

The current route.

#### Returns

[`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

The resolved handler method, or `null`.

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getHandler`](AbstractHandlerMethodMapping.md#_gethandler)

***

### \_handleNoMatch()

> `protected` **\_handleNoMatch**(`mappings`, `path`, `route`): [`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:111

#### Parameters

##### mappings

`any`

##### path

`string`

##### route

`Route`

#### Returns

[`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

***

### \_isHandler()

> `protected` **\_isHandler**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:115

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_isHandler`](AbstractHandlerMethodMapping.md#_ishandler)

***

### \_handleMatch()

> `protected` **\_handleMatch**(`mapping`, `path`, `route`): `void`

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:119

Record route metadata for a successful mapping match.

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

### registerMapping()

> **registerMapping**(`mapping`, `handler`, `method`): `void`

Defined in: packages/blue-dispatcher/src/radix-route-handler-mapping.ts:123

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

Defined in: packages/blue-factory/lib/aware.d.ts:36

Sets the name of the value in the factory.

#### Parameters

##### name

`string`

The name to set.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`setName`](AbstractHandlerMethodMapping.md#setname)
