[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ControllerHandlerAdapter

# Class: ControllerHandlerAdapter

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:91

This implementation expects the handler to be a HandlerMethod\|HandlerMethod.

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

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:92

##### Returns

`string`

## Methods

### handle()

> **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](ModelAndView.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:103

Invoke a controller's [Controller.handleRoute](../interfaces/Controller.md#handleroute) method for the current route.

#### Parameters

##### route

`Route`

The current route.

##### handler

`object` \| `undefined`

The controller instance.

#### Returns

`Promise`\<[`ModelAndView`](ModelAndView.md)\>

The model and view returned by the controller.

#### Implementation of

[`RouteHandlerAdapter`](../interfaces/RouteHandlerAdapter.md).[`handle`](../interfaces/RouteHandlerAdapter.md#handle)

***

### supports()

> **supports**(`handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:113

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
