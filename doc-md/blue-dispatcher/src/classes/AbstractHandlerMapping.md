[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractHandlerMapping

# Abstract Class: AbstractHandlerMapping

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:53

Base class for handler mappings that resolve a route to a handler.

## Extends

- `NameAware` & `ApplicationContextAware` & `Null`\<`this`\>

## Extended by

- [`AbstractHandlerMethodMapping`](AbstractHandlerMethodMapping.md)
- [`AbstractPathHandlerMapping`](AbstractPathHandlerMapping.md)

## Implements

- [`RouteHandlerMapping`](../interfaces/RouteHandlerMapping.md)

## Constructors

### Constructor

> **new AbstractHandlerMapping**(): `AbstractHandlerMapping`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:89

Create a handler mapping with default path matching behavior.

#### Returns

`AbstractHandlerMapping`

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).constructor`

## Properties

### applicationContext

> **applicationContext**: `ApplicationContext`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:60

Application context used to resolve named handlers.

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:65

Default handler used when no specific mapping matches.

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:70

Interceptors applied to matched handlers.

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:75

Path matcher used by path-based mappings.

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).[$aware]`

***

### name

> `readonly` **name**: `string`

Defined in: packages/blue-factory/lib/aware.d.ts:31

The name of the value in the factory.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).name`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:82

##### Returns

`string`

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

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).setApplicationContext`

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

[`RouteHandlerMapping`](../interfaces/RouteHandlerMapping.md).[`getHandler`](../interfaces/RouteHandlerMapping.md#gethandler)

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

***

### \_getHandler()

> `abstract` `protected` **\_getHandler**(`route`): `any`

Defined in: packages/blue-dispatcher/src/abstract-handler-mapping.ts:172

Resolve the handler for a route without applying defaults or interceptors.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`any`

The handler or execution chain, or `null`.

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

`AsNameAware(AsApplicationContextAware(Null)).setName`
