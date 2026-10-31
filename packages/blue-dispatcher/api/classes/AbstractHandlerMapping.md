[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / AbstractHandlerMapping

# Abstract Class: AbstractHandlerMapping

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

Create a handler mapping with default path matching behavior.

#### Returns

`AbstractHandlerMapping`

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).[$aware]`

***

### applicationContext

> **applicationContext**: `ApplicationContext`

Application context used to resolve named handlers.

***

### defaultHandler

> **defaultHandler**: `object` \| `null` = `null`

Default handler used when no specific mapping matches.

***

### interceptors

> **interceptors**: [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)[]

Interceptors applied to matched handlers.

***

### name

> `readonly` **name**: `string`

The name of the value in the factory.

#### Inherited from

`AsNameAware(AsApplicationContextAware(Null)).name`

***

### pathMatcher

> **pathMatcher**: `PathMatcher`

Path matcher used by path-based mappings.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

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

[`RouteHandlerMapping`](../interfaces/RouteHandlerMapping.md).[`getHandler`](../interfaces/RouteHandlerMapping.md#gethandler)

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

#### Overrides

`AsNameAware(AsApplicationContextAware(Null)).setApplicationContext`

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

`AsNameAware(AsApplicationContextAware(Null)).setName`
