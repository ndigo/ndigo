[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractHandlerMapping

# Abstract Class: AbstractHandlerMapping

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:277

## Extends

- [`NameAware`](../../../blue-factory/src/interfaces/NameAware.md) & [`ApplicationContextAware`](../../../blue-context/src/interfaces/ApplicationContextAware.md) & [`Null`](../../../blue-core/src/classes/Null.md)\<`this`\>

## Extended by

- [`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md)
- [`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md)

## Implements

- [`RouteHandlerMapping`](../interfaces/RouteHandlerMapping.md)

## Constructors

### Constructor

> **new AbstractHandlerMapping**(): `AbstractHandlerMapping`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:290

#### Returns

`AbstractHandlerMapping`

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).constructor`

## Properties

### applicationContext

> **applicationContext**: [`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:281

***

### defaultHandler

> **defaultHandler**: `any`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:282

***

### interceptors

> **interceptors**: `RouteHandlerInterceptor`[]

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:283

***

### pathMatcher

> **pathMatcher**: [`PathMatcher`](../../../blue-core/src/interfaces/PathMatcher.md)

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:284

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).[$aware]`

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/src/aware.ts:20

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).name`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:286

##### Returns

`string`

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

`AsNameAware(AsApplicationContextAware(Null)).setApplicationContext`

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

[`RouteHandlerMapping`](../interfaces/RouteHandlerMapping.md).[`getHandler`](../interfaces/RouteHandlerMapping.md#gethandler)

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

***

### \_getHandler()

> `abstract` `protected` **\_getHandler**(`route`): `RouteHandlerExecutionChain`

Defined in: packages/blue-dispatcher/src/route-handler-mapping.ts:351

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteHandlerExecutionChain`

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

`AsNameAware(AsApplicationContextAware(Null)).setName`
