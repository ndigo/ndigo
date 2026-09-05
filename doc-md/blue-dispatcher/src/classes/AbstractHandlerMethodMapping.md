[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractHandlerMethodMapping

# Abstract Class: AbstractHandlerMethodMapping\<T\>

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-28)

Base class for mappings that resolve handler methods from application context values.

## Extends

- [`AbstractHandlerMapping`](AbstractHandlerMapping.md)

## Extended by

- [`LinearMetadataHandlerMapping`](LinearMetadataHandlerMapping.md)
- [`RadixMetadataHandlerMapping`](RadixMetadataHandlerMapping.md)

## Type Parameters

### T

`T` *extends* [`RouteMappingInfo`](RouteMappingInfo.md)

## Implements

- [`Initializable`](#)

## Constructors

### Constructor

> **new AbstractHandlerMethodMapping**\<`T`\>(): `AbstractHandlerMethodMapping`\<`T`\>

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-50)

Create a handler-method mapping with an empty registry.

#### Returns

`AbstractHandlerMethodMapping`\<`T`\>

#### Overrides

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`constructor`](AbstractHandlerMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-60)

Application context used to resolve named handlers.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`applicationContext`](AbstractHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-65)

Default handler used when no specific mapping matches.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`defaultHandler`](AbstractHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-70)

Interceptors applied to matched handlers.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`interceptors`](AbstractHandlerMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:75](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-75)

Path matcher used by path-based mappings.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`pathMatcher`](AbstractHandlerMapping.md#pathmatcher)

***

### namingStrategy

> **namingStrategy**: [`RouteHandlerMethodMappingNamingStrategy`](../interfaces/RouteHandlerMethodMappingNamingStrategy.md)\<`T`\>

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:35](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-35)

Naming strategy used when exposing handler methods by name.

***

### mappingRegistry

> `readonly` **mappingRegistry**: `MappingRegistry`\<`T`\>

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-40)

Registry of route mappings and their handler methods.

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

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:82](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-82)

##### Returns

`string`

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`[toStringTag]`](AbstractHandlerMapping.md#tostringtag)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-101)

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

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:117](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-117)

Resolve a route to a handler execution chain.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`RouteHandlerExecutionChain` \| `null`

The execution chain, or `null` when no handler matches.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`getHandler`](AbstractHandlerMapping.md#gethandler)

***

### \_getHandlerExecutionChain()

> `protected` **\_getHandlerExecutionChain**(`handler`, `route`): `RouteHandlerExecutionChain`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:142](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-142)

Build an execution chain for a resolved handler and route.

#### Parameters

##### handler

`any`

The resolved handler or existing execution chain.

##### route

[`Route`](#)

The current route.

#### Returns

`RouteHandlerExecutionChain`

The execution chain to invoke.

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`_getHandlerExecutionChain`](AbstractHandlerMapping.md#_gethandlerexecutionchain)

***

### init()

> **init**(): `void`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:63](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-63)

Detect and register handler methods from the application context.

No-op when the application context has not been injected yet (the DI
container auto-initializes initializable beans during refresh, which can
run before `setApplicationContext`). Callers that need handlers registered
must set the context first, then re-run `init`.

#### Returns

`void`

#### Implementation of

`Initializable.init`

***

### getHandlerMethods()

> **getHandlerMethods**(): `Map`\<`T`, [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:81](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-81)

Return all registered handler methods.

#### Returns

`Map`\<`T`, [`RouteHandlerMethod`](RouteHandlerMethod.md)\>

The mapping-to-handler-method registry.

***

### getHandlerMethodsForMappingName()

> **getHandlerMethodsForMappingName**(`name`): [`RouteHandlerMethod`](RouteHandlerMethod.md)[]

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:91](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-91)

Return handler methods registered under a mapping name.

#### Parameters

##### name

`string`

The mapping name.

#### Returns

[`RouteHandlerMethod`](RouteHandlerMethod.md)[]

The matching handler methods.

***

### registerMapping()

> **registerMapping**(`mapping`, `handler`, `method`, `directPaths?`): `void`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:103](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-103)

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

### unregisterMapping()

> **unregisterMapping**(`mapping`): `void`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:112](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-112)

Remove a mapping from the registry.

#### Parameters

##### mapping

`T`

The mapping metadata to remove.

#### Returns

`void`

***

### \_createRequestHandlerMethod()

> `protected` **\_createRequestHandlerMethod**(`handler`, `method`): [`RouteHandlerMethod`](RouteHandlerMethod.md)

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:123](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-123)

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

***

### \_detectHandlerMethods()

> `protected` **\_detectHandlerMethods**(`handler`): `void`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:143](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-143)

Scan a handler for mapped methods and register them.

#### Parameters

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

#### Returns

`void`

***

### \_getHandler()

> `protected` **\_getHandler**(`route`): [`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:168](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-168)

Resolve a route by looking up the best handler method.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

[`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

The resolved handler method, or `null`.

#### Overrides

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`_getHandler`](AbstractHandlerMapping.md#_gethandler)

***

### \_lookupHandlerMethod()

> `protected` **\_lookupHandlerMethod**(`path`, `route`): [`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:180](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-180)

Find the best handler method for a path.

#### Parameters

##### path

`string`

The request path.

##### route

[`Route`](#)

The current route.

#### Returns

[`RouteHandlerMethod`](RouteHandlerMethod.md) \| `null`

The best matching handler method, or `null`.

***

### \_handleMatch()

> `protected` **\_handleMatch**(`mapping`, `path`, `route`): `void`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:218](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-218)

Record route metadata for a successful mapping match.

#### Parameters

##### mapping

`T`

The matched mapping.

##### path

`string`

The matched path.

##### route

[`Route`](#)

The current route.

#### Returns

`void`

***

### \_registerHandlerMethod()

> `protected` **\_registerHandlerMethod**(`handler`, `method`, `mapping`): `void`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:232](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-232)

Register a handler method for the given mapping.

#### Parameters

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

The handler instance or application-context name.

##### method

`string`

The method name.

##### mapping

`T`

The mapping metadata.

#### Returns

`void`

***

### \_isHandler()

> `abstract` `protected` **\_isHandler**(`value`): `boolean`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:249](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-249)

#### Parameters

##### value

`any`

#### Returns

`boolean`

***

### \_getMappingComparator()

> `abstract` `protected` **\_getMappingComparator**(`route`): `Comparator`\<`T`\>

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:250](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-250)

#### Parameters

##### route

[`Route`](#)

#### Returns

`Comparator`\<`T`\>

***

### \_getMappingForMethod()

> `protected` **\_getMappingForMethod**(`method`, `handler`): `T` \| `undefined`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:263](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-263)

Build a [RouteMappingInfo](RouteMappingInfo.md) for the given handler method.

Reads `routeMapping` metadata from both the method and the containing class,
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

`T` \| `undefined`

The combined [RouteMappingInfo](RouteMappingInfo.md), or `undefined` if no mapping exists.

***

### \_getMatchingMapping()

> `abstract` `protected` **\_getMatchingMapping**(`mapping`, `route`): `T` \| `null`

Defined in: [packages/blue-dispatcher/src/abstract-handler-method-mapping.ts:316](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-method-mapping.ts#lines-316)

#### Parameters

##### mapping

`T`

##### route

[`Route`](#)

#### Returns

`T` \| `null`

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
