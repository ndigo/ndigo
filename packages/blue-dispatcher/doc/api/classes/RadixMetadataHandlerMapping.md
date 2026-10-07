[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / RadixMetadataHandlerMapping

# Class: RadixMetadataHandlerMapping

A handler mapping that can also report whether a route matches a pattern.

## Extends

- [`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

## Implements

- [`MatchableHandlerMapping`](../interfaces/MatchableHandlerMapping.md)

## Constructors

### Constructor

> **new RadixMetadataHandlerMapping**(): `RadixMetadataHandlerMapping`

Create a handler-method mapping with an empty registry.

#### Returns

`RadixMetadataHandlerMapping`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`constructor`](AbstractHandlerMethodMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`[$aware]`](AbstractHandlerMethodMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`applicationContext`](AbstractHandlerMethodMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`defaultHandler`](AbstractHandlerMethodMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`interceptors`](AbstractHandlerMethodMapping.md#interceptors)

***

### isAutoStartup

> `readonly` **isAutoStartup**: `true` = `true`

`SmartLifecycle` — handler mappings must be initialized once the context refreshes.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`isAutoStartup`](AbstractHandlerMethodMapping.md#isautostartup)

***

### mappingRegistry

> `readonly` **mappingRegistry**: [`MappingRegistry`](MappingRegistry.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>

Registry of route mappings and their handler methods.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`mappingRegistry`](AbstractHandlerMethodMapping.md#mappingregistry)

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`name`](AbstractHandlerMethodMapping.md#name)

***

### namingStrategy

> **namingStrategy**: [`RouteHandlerMethodMappingNamingStrategy`](../interfaces/RouteHandlerMethodMappingNamingStrategy.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\> = `defaultNamingStrategy`

Naming strategy used when exposing handler methods by name.

Defaults to [RouteMappingInfoHandlerMethodMappingNamingStrategy](RouteMappingInfoHandlerMethodMappingNamingStrategy.md)
(the mapping's own name, falling back to the handler + method).

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`namingStrategy`](AbstractHandlerMethodMapping.md#namingstrategy)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`pathMatcher`](AbstractHandlerMethodMapping.md#pathmatcher)

***

### phase

> `readonly` **phase**: `-100` = `-100`

`SmartLifecycle` — init runs before the dispatcher and server.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`phase`](AbstractHandlerMethodMapping.md#phase)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`[toStringTag]`](AbstractHandlerMethodMapping.md#tostringtag)

***

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

`SmartLifecycle` — whether the lifecycle has driven init.

##### Returns

`boolean`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`isRunning`](AbstractHandlerMethodMapping.md#isrunning)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandler`](AbstractHandlerMethodMapping.md#gethandler)

***

### getHandlerMethods()

> **getHandlerMethods**(): `Map`\<[`RouteMappingInfo`](RouteMappingInfo.md), [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

Return all registered handler methods.

#### Returns

`Map`\<[`RouteMappingInfo`](RouteMappingInfo.md), [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

The mapping-to-handler-method registry.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getHandlerMethods`](AbstractHandlerMethodMapping.md#gethandlermethods)

***

### getHandlerMethodsForMappingName()

> **getHandlerMethodsForMappingName**(`name`): [`RouteHandlerMethod`](RouteHandlerMethod.md)[]

Return handler methods registered under a mapping name.

Names are assigned at registration by [namingStrategy](#namingstrategy) (by
default the mapping's own name, e.g. its route pattern).

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

### getMappingEntries()

> **getMappingEntries**(): [`MappingEntry`](MappingEntry.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>[]

Return the registered mapping entries, in registration order.

Read-only introspection seam over [mappingRegistry](#mappingregistry): each entry
carries the mapping object, its resolved handler method, the mapping
name and any direct paths. Dispatch behavior is unchanged — this exists
for tooling that needs a pattern → handler read model (API docs,
`blue inspect`).

#### Returns

[`MappingEntry`](MappingEntry.md)\<[`RouteMappingInfo`](RouteMappingInfo.md)\>[]

A snapshot array of the registered mapping entries.

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`getMappingEntries`](AbstractHandlerMethodMapping.md#getmappingentries)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`init`](AbstractHandlerMethodMapping.md#init)

***

### match()

> **match**(`route`, `pattern`): [`RouteMatchResult`](RouteMatchResult.md) \| `null`

Check whether the route matches a pattern.

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

### registerMapping()

> **registerMapping**(`mapping`, `handler`, `method`): `void`

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`setApplicationContext`](AbstractHandlerMethodMapping.md#setapplicationcontext)

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

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`setName`](AbstractHandlerMethodMapping.md#setname)

***

### start()

> **start**(): `void`

`SmartLifecycle` — initialize handler discovery from the application
context. Runs on refresh, after every configuration has registered.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`start`](AbstractHandlerMethodMapping.md#start)

***

### stop()

> **stop**(): `void`

`SmartLifecycle` — mappings are immutable once initialized; nothing to
release. Present so this type is a well-behaved lifecycle bean.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`stop`](AbstractHandlerMethodMapping.md#stop)

***

### unregisterMapping()

> **unregisterMapping**(`mapping`): `void`

Remove a mapping from the registry.

#### Parameters

##### mapping

[`RouteMappingInfo`](RouteMappingInfo.md)

The mapping metadata to remove.

#### Returns

`void`

#### Inherited from

[`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md).[`unregisterMapping`](AbstractHandlerMethodMapping.md#unregistermapping)
