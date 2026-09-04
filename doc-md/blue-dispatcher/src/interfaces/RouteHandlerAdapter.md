[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteHandlerAdapter

# Interface: RouteHandlerAdapter

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:29

Adapts a handler instance into route execution.

Implementations decide whether they support a handler type and how to invoke it for the current route.

## Methods

### handle()

> **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](../classes/ModelAndView.md)\>

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:39

Handle a route with the given handler.

The handler should already have been accepted by [RouteHandlerAdapter.supports](#supports).

#### Parameters

##### route

`Route`

The current route.

##### handler

`object` \| `undefined`

The handler instance selected for the route.

#### Returns

`Promise`\<[`ModelAndView`](../classes/ModelAndView.md)\>

The model and view produced by handler execution.

***

### supports()

> **supports**(`handler`): `boolean`

Defined in: packages/blue-dispatcher/src/route-handler-adapter.ts:47

Tests whether this adapter supports the given handler.

#### Parameters

##### handler

`object` \| `undefined`

The handler instance to test.

#### Returns

`boolean`

`true` when the handler is supported.
