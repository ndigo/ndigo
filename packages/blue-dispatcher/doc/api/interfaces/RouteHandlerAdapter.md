[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / RouteHandlerAdapter

# Interface: RouteHandlerAdapter

Adapts a handler instance into route execution.

Implementations decide whether they support a handler type and how to invoke it for the current route.

## Methods

### handle()

> **handle**(`route`, `handler`): `Promise`\<[`ModelAndView`](../classes/ModelAndView.md)\>

Handle a route with the given handler.

The handler should already have been accepted by [RouteHandlerAdapter.supports](#supports).

#### Parameters

##### route

[`Route`](#)

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

Tests whether this adapter supports the given handler.

#### Parameters

##### handler

`object` \| `undefined`

The handler instance to test.

#### Returns

`boolean`

`true` when the handler is supported.
