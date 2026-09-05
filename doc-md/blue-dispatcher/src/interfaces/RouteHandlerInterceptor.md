[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteHandlerInterceptor

# Interface: RouteHandlerInterceptor

Defined in: [packages/blue-dispatcher/src/route-handler-interceptor.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-interceptor.ts#lines-17)

## Methods

### completeHandle()

> **completeHandle**(`route`, `handler`, `error`): `void` \| `Promise`\<`void`\>

Defined in: [packages/blue-dispatcher/src/route-handler-interceptor.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-interceptor.ts#lines-18)

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

Defined in: [packages/blue-dispatcher/src/route-handler-interceptor.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-interceptor.ts#lines-19)

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

Defined in: [packages/blue-dispatcher/src/route-handler-interceptor.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-interceptor.ts#lines-20)

#### Parameters

##### route

[`Route`](#)

##### handler

`object` \| `undefined`

#### Returns

[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md) \| `Promise`\<[`PreHandleOutcome`](../type-aliases/PreHandleOutcome.md)\>
