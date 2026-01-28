[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / SimplePathHandlerMapping

# Class: SimplePathHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:829

Implementation of the [HandlerMapping](../interfaces/RouteHandlerMapping.md) interface to map from paths to handlers.



## Extends

- [`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md)

## Constructors

### Constructor

> **new SimplePathHandlerMapping**(): `SimplePathHandlerMapping`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:836

#### Returns

`SimplePathHandlerMapping`

#### Overrides

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`constructor`](AbstractPathHandlerMapping.md#constructor)

## Properties

### applicationContext

> **applicationContext**: [`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:281

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`applicationContext`](AbstractPathHandlerMapping.md#applicationcontext)

***

### defaultHandler

> **defaultHandler**: `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:282

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`defaultHandler`](AbstractPathHandlerMapping.md#defaulthandler)

***

### interceptors

> **interceptors**: `RouteHandlerInterceptor`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:283

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`interceptors`](AbstractPathHandlerMapping.md#interceptors)

***

### pathMatcher

> **pathMatcher**: [`PathMatcher`](../../../blue-core/src/interfaces/PathMatcher.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:284

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`pathMatcher`](AbstractPathHandlerMapping.md#pathmatcher)

***

### rootHandler

> **rootHandler**: `object`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:488

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`rootHandler`](AbstractPathHandlerMapping.md#roothandler)

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:489

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`useTrailingSlashMatch`](AbstractPathHandlerMapping.md#usetrailingslashmatch)

***

### mappings

> **mappings**: `Map`\<`string`, [`MaybeHandler`](../type-aliases/MaybeHandler.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:830

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`[$aware]`](AbstractPathHandlerMapping.md#aware)

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/src/aware.ts:20

#### Inherited from

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`name`](AbstractPathHandlerMapping.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:832

##### Returns

`string`

#### Overrides

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`[toStringTag]`](AbstractPathHandlerMapping.md#tostringtag)

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`getHandler`](AbstractPathHandlerMapping.md#gethandler)

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`_getHandlerExecutionChain`](AbstractPathHandlerMapping.md#_gethandlerexecutionchain)

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`lookUpHandler`](AbstractPathHandlerMapping.md#lookuphandler)

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`match`](AbstractPathHandlerMapping.md#match)

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`_getHandler`](AbstractPathHandlerMapping.md#_gethandler)

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`_registerHandler`](AbstractPathHandlerMapping.md#_registerhandler)

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:846

#### Parameters

##### context

[`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

The application context to be set.

#### Returns

`void`

#### Overrides

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`setApplicationContext`](AbstractPathHandlerMapping.md#setapplicationcontext)

***

### setMappings()

> **setMappings**(`mappings`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:856

Map paths to handlers or handler names, merging it into the existing mappings if any.
    *

#### Parameters

##### mappings

The path mappings

#### Returns

`void`

***

### registerHandlers()

> **registerHandlers**(`mappings`): `void`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:863

#### Parameters

##### mappings

`Map`\<`string`, [`MaybeHandler`](../type-aliases/MaybeHandler.md)\>

#### Returns

`void`

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

[`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md).[`setName`](AbstractPathHandlerMapping.md#setname)
