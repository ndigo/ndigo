[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [radix-metadata-handler-mapping](../README.md) / RadixMetadataHandlerMapping

# Class: RadixMetadataHandlerMapping

A handler mapping that can also report whether a route matches a pattern.

## Extends

- [`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md)\<[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md)\>

## Implements

- [`MatchableHandlerMapping`](../../abstract-handler-mapping/interfaces/MatchableHandlerMapping.md)

## Constructors

### Constructor

> **new RadixMetadataHandlerMapping**(): `RadixMetadataHandlerMapping`

Create a handler-method mapping with an empty registry.

#### Returns

`RadixMetadataHandlerMapping`

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`constructor`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`[$aware]`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`applicationContext`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`defaultHandler`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../../route-handler-interceptor/interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`interceptors`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#interceptors)

***

### isAutoStartup

> `readonly` **isAutoStartup**: `true` = `true`

`SmartLifecycle` — handler mappings must be initialized once the context refreshes.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`isAutoStartup`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#isautostartup)

***

### mappingRegistry

> `readonly` **mappingRegistry**: [`MappingRegistry`](../../mapping-registry/classes/MappingRegistry.md)\<[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md)\>

Registry of route mappings and their handler methods.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`mappingRegistry`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#mappingregistry)

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`name`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#name)

***

### namingStrategy

> **namingStrategy**: [`RouteHandlerMethodMappingNamingStrategy`](../../route-handler-method/interfaces/RouteHandlerMethodMappingNamingStrategy.md)\<[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md)\> = `defaultNamingStrategy`

Naming strategy used when exposing handler methods by name.

Defaults to [RouteMappingInfoHandlerMethodMappingNamingStrategy](../../route-mapping-info-naming-strategy/classes/RouteMappingInfoHandlerMethodMappingNamingStrategy.md)
(the mapping's own name, falling back to the handler + method).

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`namingStrategy`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#namingstrategy)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`pathMatcher`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#pathmatcher)

***

### phase

> `readonly` **phase**: `-100` = `-100`

`SmartLifecycle` — init runs before the dispatcher and server.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`phase`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#phase)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`[toStringTag]`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#tostringtag)

***

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

`SmartLifecycle` — whether the lifecycle has driven init.

##### Returns

`boolean`

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`isRunning`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#isrunning)

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

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`getHandler`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#gethandler)

***

### getHandlerMethods()

> **getHandlerMethods**(): `Map`\<[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md), [`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md)\>

Return all registered handler methods.

#### Returns

`Map`\<[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md), [`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md)\>

The mapping-to-handler-method registry.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`getHandlerMethods`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#gethandlermethods)

***

### getHandlerMethodsForMappingName()

> **getHandlerMethodsForMappingName**(`name`): [`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md)[]

Return handler methods registered under a mapping name.

Names are assigned at registration by [namingStrategy](#namingstrategy) (by
default the mapping's own name, e.g. its route pattern).

#### Parameters

##### name

`string`

The mapping name.

#### Returns

[`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md)[]

The matching handler methods.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`getHandlerMethodsForMappingName`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#gethandlermethodsformappingname)

***

### getMappingEntries()

> **getMappingEntries**(): [`MappingEntry`](../../mapping-registry/classes/MappingEntry.md)\<[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md)\>[]

Return the registered mapping entries, in registration order.

Read-only introspection seam over [mappingRegistry](#mappingregistry): each entry
carries the mapping object, its resolved handler method, the mapping
name and any direct paths. Dispatch behavior is unchanged — this exists
for tooling that needs a pattern → handler read model (API docs,
`ndigo inspect`).

#### Returns

[`MappingEntry`](../../mapping-registry/classes/MappingEntry.md)\<[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md)\>[]

A snapshot array of the registered mapping entries.

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`getMappingEntries`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#getmappingentries)

***

### init()

> **init**(): `void`

Detect and register handler methods from the application context.

No-op when the application context has not been injected yet (the DI
container auto-initializes initializable beans during refresh, which can
run before `setApplicationContext`). Idempotent: handlers already
detected on a previous init are skipped.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`init`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#init)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](../../route-match-result/classes/RouteMatchResult.md) \| `null`

Check whether the route matches a pattern.

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

### registerMapping()

> **registerMapping**(`mapping`, `handler`, `method`): `void`

Register a single mapping and handler method.

#### Parameters

##### mapping

[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md)

The mapping metadata.

##### handler

[`MaybeHandler`](#)

The handler instance or application-context name.

##### method

`string`

The handler method name.

#### Returns

`void`

#### Overrides

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`registerMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#registermapping)

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

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`setApplicationContext`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#setapplicationcontext)

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

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`setName`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#setname)

***

### start()

> **start**(): `void`

`SmartLifecycle` — initialize handler discovery from the application
context. Runs on refresh, after every configuration has registered.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`start`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#start)

***

### stop()

> **stop**(): `void`

`SmartLifecycle` — mappings are immutable once initialized; nothing to
release. Present so this type is a well-behaved lifecycle bean.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`stop`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#stop)

***

### unregisterMapping()

> **unregisterMapping**(`mapping`): `void`

Remove a mapping from the registry.

#### Parameters

##### mapping

[`RouteMappingInfo`](../../route-mapping-info-model/classes/RouteMappingInfo.md)

The mapping metadata to remove.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md).[`unregisterMapping`](../../abstract-handler-method-mapping/classes/AbstractHandlerMethodMapping.md#unregistermapping)
