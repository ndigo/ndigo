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

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

##### error

`Error`

#### Returns

`void` \| `Promise`\<`void`\>

***

### postHandle()

> **postHandle**(`route`, `handler`, `modelAndView`): `void` \| `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

##### modelAndView

[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### preHandle()

> **preHandle**(`route`, `handler`): [`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md) \| `Promise`\<[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md)\>

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

#### Returns

[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md) \| `Promise`\<[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md)\>
