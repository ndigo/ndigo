[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractHandlerMethodAdapter

# Abstract Class: AbstractHandlerMethodAdapter

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:60

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

### applicationContext

> **applicationContext**: `ApplicationContext` \| `null`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:67

Application context used to discover handlers and argument resolvers.

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:69

##### Returns

`string`

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/lib/context.d.ts:145

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

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:73

Tests whether this adapter supports the given handler.

#### Parameters

##### handler

`object` \| `undefined`

The handler instance to test.

#### Returns

`boolean`

`true` when the handler is supported.

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`supports`](../interfaces/RouteHandlerAdapter.md#supports)

***

### handle()

> `abstract` **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](ModelAndView.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:84

Handle a route with a method-backed handler.

#### Parameters

##### route

`Route`

The current route.

##### handler

[`RouteHandlerMethod`](RouteHandlerMethod.md)

The resolved route handler method.

#### Returns

`Promise`\<[`ModelAndView`](ModelAndView.md)\>

The model and view produced by invoking the handler.

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`handle`](../interfaces/RouteHandlerAdapter.md#handle)

***

### \_supports()

> `abstract` `protected` **\_supports**(`handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:85

#### Parameters

##### handler

[`RouteHandlerMethod`](RouteHandlerMethod.md)

#### Returns

`boolean`
