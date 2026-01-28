[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractHandlerMethodMapping

# Abstract Class: AbstractHandlerMethodMapping\<T\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:354

## Extends

- [`AbstractHandlerMapping`](AbstractHandlerMapping.md)

## Extended by

- [`MetadataHandlerMapping`](MetadataHandlerMapping.md)

## Type Parameters

### T

`T`

## Implements

- [`Initializable`](../../../blue-factory/src/interfaces/Initializable.md)

## Constructors

### Constructor

> **new AbstractHandlerMethodMapping**\<`T`\>(): `AbstractHandlerMethodMapping`\<`T`\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:359

#### Returns

`AbstractHandlerMethodMapping`\<`T`\>

#### Overrides

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`constructor`](AbstractHandlerMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: [`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:281

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`applicationContext`](AbstractHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:282

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`defaultHandler`](AbstractHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: `RouteHandlerInterceptor`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:283

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`interceptors`](AbstractHandlerMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: [`PathMatcher`](../../../blue-core/src/interfaces/PathMatcher.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:284

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`pathMatcher`](AbstractHandlerMapping.md#pathmatcher)

***

### namingStrategy

> **namingStrategy**: `RouteHandlerMethodMappingNamingStrategy`\<`T`\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:355

***

### mappingRegistry

> `readonly` **mappingRegistry**: `MappingRegistry`\<`T`\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:357

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`[$aware]`](AbstractHandlerMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/src/aware.ts:20

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`name`](AbstractHandlerMapping.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:286

##### Returns

`string`

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`[toStringTag]`](AbstractHandlerMapping.md#tostringtag)

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

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`setApplicationContext`](AbstractHandlerMapping.md#setapplicationcontext)

***

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:312

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerExecutionChain`

#### Inherited from

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`getHandler`](AbstractHandlerMapping.md#gethandler)

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

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`_getHandlerExecutionChain`](AbstractHandlerMapping.md#_gethandlerexecutionchain)

***

### init()

> **init**(): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:369

#### Returns

`void`

#### Implementation of

[`Initializable`](../../../blue-factory/src/interfaces/Initializable.md).[`init`](../../../blue-factory/src/interfaces/Initializable.md#init)

***

### getHandlerMethods()

> **getHandlerMethods**(): `Map`\<`T`, `RouteHandlerMethod`\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:377

#### Returns

`Map`\<`T`, `RouteHandlerMethod`\>

***

### getHandlerMethodsForMappingName()

> **getHandlerMethodsForMappingName**(`name`): `RouteHandlerMethod`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:381

#### Parameters

##### name

`string`

#### Returns

`RouteHandlerMethod`[]

***

### registerMapping()

> **registerMapping**(`mapping`, `handler`, `method`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:385

#### Parameters

##### mapping

`T`

##### handler

[`MaybeHandler`](../type-aliases/MaybeHandler.md)

##### method

`string`

#### Returns

`void`

***

### unregisterMapping()

> **unregisterMapping**(`mapping`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:389

#### Parameters

##### mapping

`T`

#### Returns

`void`

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

[AbstractHandlerMethodMapping#\_getMappingForMethod](#_getmappingformethod)

***

### \_getHandler()

> `protected` **\_getHandler**(`route`): `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:425

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`any`

#### Overrides

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`_getHandler`](AbstractHandlerMapping.md#_gethandler)

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

***

### \_handleMatch()

> `protected` **\_handleMatch**(`mapping`, `path`, `route`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:462

#### Parameters

##### mapping

`T`

##### path

`string`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`void`

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

`T`

#### Returns

`void`

***

### \_isHandler()

> `abstract` `protected` **\_isHandler**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:481

#### Parameters

##### value

`any`

#### Returns

`boolean`

***

### \_getMappingComparator()

> `abstract` `protected` **\_getMappingComparator**(`route`): [`Comparator`](../../../blue-core/src/interfaces/Comparator.md)\<`T`\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:482

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

[`Comparator`](../../../blue-core/src/interfaces/Comparator.md)\<`T`\>

***

### \_getMappingForMethod()

> `abstract` `protected` **\_getMappingForMethod**(`method`, `handler`): `T`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:483

#### Parameters

##### method

`string`

##### handler

`any`

#### Returns

`T`

***

### \_getMatchingMapping()

> `abstract` `protected` **\_getMatchingMapping**(`mapping`, `route`): `T`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:484

#### Parameters

##### mapping

`T`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`T`

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

[`AbstractHandlerMapping`](AbstractHandlerMapping.md).[`setName`](AbstractHandlerMapping.md#setname)
