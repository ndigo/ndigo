[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-adapter](../README.md) / AbstractHandlerMethodAdapter

# Abstract Class: AbstractHandlerMethodAdapter

Adapts a handler instance into route execution.

Implementations decide whether they support a handler type and how to invoke it for the current route.

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Extended by

- [`MetadataHandlerAdapter`](MetadataHandlerAdapter.md)

## Implements

- [`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md)

## Constructors

### Constructor

> **new AbstractHandlerMethodAdapter**(): `AbstractHandlerMethodAdapter`

#### Returns

`AbstractHandlerMethodAdapter`

#### Inherited from

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> **applicationContext**: `ApplicationContext` \| `null`

Application context used to discover handlers and argument resolvers.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### handle()

> `abstract` **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)\>

Handle a route with a method-backed handler.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

[`RouteHandlerMethod`](../../route-handler-method/classes/RouteHandlerMethod.md)

The resolved route handler method.

#### Returns

`Promise`\<[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)\>

The model and view produced by invoking the handler.

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`handle`](../interfaces/RouteHandlerAdapter.md#handle)

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AsApplicationContextAware(Null).setApplicationContext`

***

### supports()

> **supports**(`handler`): `boolean`

Whether this adapter can handle the given handler.

#### Parameters

##### handler

`object` \| `undefined`

The resolved handler.

#### Returns

`boolean`

`true` when the adapter supports it.

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`supports`](../interfaces/RouteHandlerAdapter.md#supports)
