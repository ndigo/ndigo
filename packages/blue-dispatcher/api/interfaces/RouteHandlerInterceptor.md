[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / RouteHandlerInterceptor

# Interface: RouteHandlerInterceptor

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

[`ModelAndView`](../classes/ModelAndView.md)

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
