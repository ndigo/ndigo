[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / AbstractHandlerMethodMapping

# Abstract Class: AbstractHandlerMethodMapping\<T\>

Base class for mappings that resolve handler methods from application context values.

## Extends

- [`AbstractHandlerMapping`](AbstractHandlerMapping.md)

## Extended by

- [`RadixMetadataHandlerMapping`](RadixMetadataHandlerMapping.md)

## Type Parameters

### T

`T` *extends* [`RouteMappingInfo`](RouteMappingInfo.md)

## Implements

- [`Initializable`](#)
- `SmartLifecycle`

## Constructors

### Constructor

> **new AbstractHandlerMethodMapping**\<`T`\>(): `AbstractHandlerMethodMapping`\<`T`\>

Create a handler-method mapping with an empty registry.

#### Returns

`AbstractHandlerMethodMapping`\<`T`\>

#### Overrides

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`constructor`](AbstractHandlerMapping.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`[$aware]`](AbstractHandlerMapping.md#aware)

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`applicationContext`](AbstractHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`defaultHandler`](AbstractHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`interceptors`](AbstractHandlerMapping.md#interceptors)

***

### isAutoStartup

> `readonly` **isAutoStartup**: `true` = `true`

`SmartLifecycle` — handler mappings must be initialized once the context refreshes.

#### Implementation of

`SmartLifecycle.isAutoStartup`

***

### mappingRegistry

> `readonly` **mappingRegistry**: [`MappingRegistry`](MappingRegistry.md)\<`T`\>

Registry of route mappings and their handler methods.

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`name`](AbstractHandlerMapping.md#name)

***

### namingStrategy

> **namingStrategy**: [`RouteHandlerMethodMappingNamingStrategy`](../interfaces/RouteHandlerMethodMappingNamingStrategy.md)\<`T`\> = `defaultNamingStrategy`

Naming strategy used when exposing handler methods by name.

Defaults to [RouteMappingInfoHandlerMethodMappingNamingStrategy](RouteMappingInfoHandlerMethodMappingNamingStrategy.md)
(the mapping's own name, falling back to the handler + method).

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`pathMatcher`](AbstractHandlerMapping.md#pathmatcher)

***

### phase

> `readonly` **phase**: `-100` = `-100`

`SmartLifecycle` — init runs before the dispatcher and server.

#### Implementation of

`SmartLifecycle.phase`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`[toStringTag]`](AbstractHandlerMapping.md#tostringtag)

***

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

`SmartLifecycle` — whether the lifecycle has driven init.

##### Returns

`boolean`

#### Implementation of

`SmartLifecycle.isRunning`

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

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`getHandler`](AbstractHandlerMapping.md#gethandler)

***

### getHandlerMethods()

> **getHandlerMethods**(): `Map`\<`T`, [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

Return all registered handler methods.

#### Returns

`Map`\<`T`, [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

The mapping-to-handler-method registry.

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

***

### getMappingEntries()

> **getMappingEntries**(): [`MappingEntry`](MappingEntry.md)\<`T`\>[]

Return the registered mapping entries, in registration order.

Read-only introspection seam over [mappingRegistry](#mappingregistry): each entry
carries the mapping object, its resolved handler method, the mapping
name and any direct paths. Dispatch behavior is unchanged — this exists
for tooling that needs a pattern → handler read model (API docs,
`blue inspect`).

#### Returns

[`MappingEntry`](MappingEntry.md)\<`T`\>[]

A snapshot array of the registered mapping entries.

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

#### Implementation of

`Initializable.init`

***

### registerMapping()

> **registerMapping**(`mapping`, `handler`, `method`, `directPaths?`): `void`

Register a single mapping and handler method.

#### Parameters

##### mapping

`T`

The mapping metadata.

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

##### method

`string`

The handler method name.

##### directPaths?

`string`[]

Paths that map directly to this entry.

#### Returns

`void`

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

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`setApplicationContext`](AbstractHandlerMapping.md#setapplicationcontext)

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

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`setName`](AbstractHandlerMapping.md#setname)

***

### start()

> **start**(): `void`

`SmartLifecycle` — initialize handler discovery from the application
context. Runs on refresh, after every configuration has registered.

#### Returns

`void`

#### Implementation of

`SmartLifecycle.start`

***

### stop()

> **stop**(): `void`

`SmartLifecycle` — mappings are immutable once initialized; nothing to
release. Present so this type is a well-behaved lifecycle bean.

#### Returns

`void`

#### Implementation of

`SmartLifecycle.stop`

***

### unregisterMapping()

> **unregisterMapping**(`mapping`): `void`

Remove a mapping from the registry.

#### Parameters

##### mapping

`T`

The mapping metadata to remove.

#### Returns

`void`
