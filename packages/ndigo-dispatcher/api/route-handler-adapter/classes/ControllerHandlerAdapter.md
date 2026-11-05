[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-adapter](../README.md) / ControllerHandlerAdapter

# Class: ControllerHandlerAdapter

This implementation expects the handler to be a `HandlerMethod`.

## Implements

- [`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md)

## Constructors

### Constructor

> **new ControllerHandlerAdapter**(): `ControllerHandlerAdapter`

#### Returns

`ControllerHandlerAdapter`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### handle()

> **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)\>

Invoke a controller's [Controller.handleRoute](../../controller/interfaces/Controller.md#handleroute) method for the current route.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

`object` \| `undefined`

The controller instance.

#### Returns

`Promise`\<[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)\>

The model and view returned by the controller.

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`handle`](../interfaces/RouteHandlerAdapter.md#handle)

***

### supports()

> **supports**(`handler`): `boolean`

Controllers are supported when they expose a `handleRoute` method.

#### Parameters

##### handler

`object` \| `undefined`

The handler instance to test.

#### Returns

`boolean`

`true` when the handler is controller-like.

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`supports`](../interfaces/RouteHandlerAdapter.md#supports)
