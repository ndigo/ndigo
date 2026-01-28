[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MetadataHandlerMapping

# Class: MetadataHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:710

Creates RequestMappingInfo\|RequestMappingInfo instances from class-level `route:handler` metadata and method-level `route:mapping` metadata. Metadata is usually applied using RequestMapping\|@RequestHandler and RequestMapping\|@RequestMapping decorators.

## Extends

- [`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

## Implements

- [`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md)

## Constructors

### Constructor

> **new MetadataHandlerMapping**(): `MetadataHandlerMapping`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:359

#### Returns

`MetadataHandlerMapping`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`constructor`](AbstractHandlerMethodMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: [`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:281

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`applicationContext`](AbstractHandlerMethodMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:282

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`defaultHandler`](AbstractHandlerMethodMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: `RouteHandlerInterceptor`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:283

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`interceptors`](AbstractHandlerMethodMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: [`PathMatcher`](../../../blue-core/src/interfaces/PathMatcher.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:284

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`pathMatcher`](AbstractHandlerMethodMapping.md#pathmatcher)

***

### namingStrategy

> **namingStrategy**: `RouteHandlerMethodMappingNamingStrategy`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:355

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`namingStrategy`](AbstractHandlerMethodMapping.md#namingstrategy)

***

### mappingRegistry

> `readonly` **mappingRegistry**: `MappingRegistry`\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:357

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`mappingRegistry`](AbstractHandlerMethodMapping.md#mappingregistry)

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`[$aware]`](AbstractHandlerMethodMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/src/aware.ts:20

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`name`](AbstractHandlerMethodMapping.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:714

##### Returns

`string`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`[toStringTag]`](AbstractHandlerMethodMapping.md#tostringtag)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/src/context.ts:57

#### Parameters

##### applicationContext

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`setApplicationContext`](AbstractHandlerMethodMapping.md#setapplicationcontext)

***

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:312

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerExecutionChain`

#### Implementation of

[`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md).[`getHandler`](../interfaces/MatchableHandlerMapping.md#gethandler)

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandler`](AbstractHandlerMethodMapping.md#gethandler)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getHandlerExecutionChain`](AbstractHandlerMethodMapping.md#_gethandlerexecutionchain)

***

### init()

> **init**(): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:369

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`init`](AbstractHandlerMethodMapping.md#init)

***

### getHandlerMethods()

> **getHandlerMethods**(): `Map`\<[`RouteMappingInfo`](RouteMappingInfo.md), `RouteHandlerMethod`\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:377

#### Returns

`Map`\<[`RouteMappingInfo`](RouteMappingInfo.md), `RouteHandlerMethod`\>

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandlerMethods`](AbstractHandlerMethodMapping.md#gethandlermethods)

***

### getHandlerMethodsForMappingName()

> **getHandlerMethodsForMappingName**(`name`): `RouteHandlerMethod`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:381

#### Parameters

##### name

`string`

#### Returns

`RouteHandlerMethod`[]

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandlerMethodsForMappingName`](AbstractHandlerMethodMapping.md#gethandlermethodsformappingname)

***

### registerMapping()

> **registerMapping**(`mapping`, `handler`, `method`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:385

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

##### method

`string`

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`registerMapping`](AbstractHandlerMethodMapping.md#registermapping)

***

### unregisterMapping()

> **unregisterMapping**(`mapping`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:389

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`unregisterMapping`](AbstractHandlerMethodMapping.md#unregistermapping)

***

### \_createRequestHandlerMethod()

> `protected` **\_createRequestHandlerMethod**(`handler`, `method`): `RouteHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:393

#### Parameters

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

##### method

`string`

#### Returns

`RouteHandlerMethod`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_createRequestHandlerMethod`](AbstractHandlerMethodMapping.md#_createrequesthandlermethod)

***

### \_detectHandlerMethods()

> `protected` **\_detectHandlerMethods**(`handler`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:410

Look for methods in the specified handler.

#### Parameters

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

Either a name or an actual handler instance.

#### Returns

`void`

#### See

[AbstractHandlerMethodMapping#\_getMappingForMethod](AbstractHandlerMethodMapping.md#_getmappingformethod)

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_detectHandlerMethods`](AbstractHandlerMethodMapping.md#_detecthandlermethods)

***

### \_getHandler()

> `protected` **\_getHandler**(`route`): `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:425

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`any`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getHandler`](AbstractHandlerMethodMapping.md#_gethandler)

***

### \_lookupHandlerMethod()

> `protected` **\_lookupHandlerMethod**(`path`, `route`): `RouteHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:430

#### Parameters

##### path

`string`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerMethod`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_lookupHandlerMethod`](AbstractHandlerMethodMapping.md#_lookuphandlermethod)

***

### \_registerHandlerMethod()

> `protected` **\_registerHandlerMethod**(`handler`, `method`, `mapping`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:467

#### Parameters

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

##### method

`string`

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_registerHandlerMethod`](AbstractHandlerMethodMapping.md#_registerhandlermethod)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:718

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### pattern

`string`

#### Returns

[`RouteMatchResult`](RouteMatchResult.md)

#### Implementation of

[`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md).[`match`](../interfaces/MatchableHandlerMapping.md#match)

***

### \_getMappingForMethod()

> `protected` **\_getMappingForMethod**(`method`, `handler`): [`RouteMappingInfo`](RouteMappingInfo.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:728

#### Parameters

##### method

`string`

##### handler

`any`

#### Returns

[`RouteMappingInfo`](RouteMappingInfo.md)

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getMappingForMethod`](AbstractHandlerMethodMapping.md#_getmappingformethod)

***

### \_getMappingComparator()

> `protected` **\_getMappingComparator**(`route`): [`Comparator`](../../../blue-core/src/interfaces/Comparator.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:746

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

[`Comparator`](../../../blue-core/src/interfaces/Comparator.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getMappingComparator`](AbstractHandlerMethodMapping.md#_getmappingcomparator)

***

### \_getMatchingMapping()

> `protected` **\_getMatchingMapping**(`mapping`, `route`): [`RouteMappingInfo`](RouteMappingInfo.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:752

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

[`RouteMappingInfo`](RouteMappingInfo.md)

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_getMatchingMapping`](AbstractHandlerMethodMapping.md#_getmatchingmapping)

***

### \_handleMatch()

> `protected` **\_handleMatch**(`mapping`, `path`, `route`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:756

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

##### path

`string`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`void`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_handleMatch`](AbstractHandlerMethodMapping.md#_handlematch)

***

### \_handleNoMatch()

> `protected` **\_handleNoMatch**(`mappings`, `path`, `route`): `RouteHandlerMethod`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:777

#### Parameters

##### mappings

`any`

##### path

`string`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerMethod`

***

### \_isHandler()

> `protected` **\_isHandler**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:781

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`_isHandler`](AbstractHandlerMethodMapping.md#_ishandler)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`setName`](AbstractHandlerMethodMapping.md#setname)
