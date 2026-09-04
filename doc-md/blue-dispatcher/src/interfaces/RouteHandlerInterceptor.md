[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteHandlerInterceptor

# Interface: RouteHandlerInterceptor

Defined in: packages/blue-dispatcher/src/route-handler-interceptor.ts:9

## Methods

### completeHandle()

> **completeHandle**(`route`, `handler`, `error`): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/route-handler-interceptor.ts:10

#### Parameters

##### route

`Route`

##### handler

`object` \| `undefined`

##### error

`Error`

#### Returns

`void` \| `Promise`\<`void`\>

***

### postHandle()

> **postHandle**(`route`, `handler`, `modelAndView`): `void` \| `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/route-handler-interceptor.ts:11

#### Parameters

##### route

`Route`

##### handler

`object` \| `undefined`

##### modelAndView

[`ModelAndView`](../classes/ModelAndView.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### preHandle()

> **preHandle**(`route`, `handler`): `boolean` \| `Promise`\<`boolean`\>

Defined in: packages/blue-dispatcher/src/route-handler-interceptor.ts:12

#### Parameters

##### route

`Route`

##### handler

`object` \| `undefined`

#### Returns

`boolean` \| `Promise`\<`boolean`\>
