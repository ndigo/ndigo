[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-interceptor](../README.md) / RouteHandlerInterceptor

# Interface: RouteHandlerInterceptor

Around-handler hooks, run in chain order: `preHandle` before the handler
(its outcome may short-circuit the chain), `postHandle` after a successful
return, and `completeHandle` once the request is done — including the error
path. Every hook may be async; the chain awaits each in turn.

## Methods

### completeHandle()

> **completeHandle**(`route`, `handler`, `error`): `void` \| `Promise`\<`void`\>

Callback after the request completes, including the error path.

#### Parameters

##### route

[`Route`](#)

The completed route.

##### handler

`object` \| `undefined`

The handler instance, when known.

##### error

`Error`

The error raised during handling, if any.

#### Returns

`void` \| `Promise`\<`void`\>

***

### postHandle()

> **postHandle**(`route`, `handler`, `modelAndView`): `void` \| `Promise`\<`void`\>

Callback after the handler returns successfully but before the view renders.

#### Parameters

##### route

[`Route`](#)

The resolved route.

##### handler

`object` \| `undefined`

The handler instance, when known.

##### modelAndView

[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)

The handler's result.

#### Returns

`void` \| `Promise`\<`void`\>

***

### preHandle()

> **preHandle**(`route`, `handler`): [`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md) \| `Promise`\<[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md)\>

Callback after the handler is resolved but before it is invoked.

#### Parameters

##### route

[`Route`](#)

The resolved route.

##### handler

`object` \| `undefined`

The handler instance, when known.

#### Returns

[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md) \| `Promise`\<[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md)\>

`true` to continue, or a denial outcome.
