[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-execution-chain](../README.md) / default

# Class: default

Executes a handler through a chain of route interceptors.

## Constructors

### Constructor

> **new default**(`handler`, `interceptors?`): `RouteHandlerExecutionChain`

Create a new execution chain for a handler or copy an existing chain.

#### Parameters

##### handler

`object` \| `RouteHandlerExecutionChain`

A handler instance or an existing execution chain.

##### interceptors?

[`RouteHandlerInterceptor`](../../route-handler-interceptor/interfaces/RouteHandlerInterceptor.md)[] = `[]`

Optional interceptors to append to the chain.

#### Returns

`RouteHandlerExecutionChain`

## Properties

### handler

> **handler**: `object` \| `undefined`

The resolved handler instance.

***

### interceptorIndex

> **interceptorIndex**: `number`

Index of the last interceptor that completed pre-handle processing.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`RouteHandlerInterceptor`](../../route-handler-interceptor/interfaces/RouteHandlerInterceptor.md)[]

Return the configured interceptors in execution order.

##### Returns

[`RouteHandlerInterceptor`](../../route-handler-interceptor/interfaces/RouteHandlerInterceptor.md)[]

The interceptor list, or `null` when none were configured.

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Add a single interceptor to the chain.

#### Parameters

##### interceptor

[`RouteHandlerInterceptor`](../../route-handler-interceptor/interfaces/RouteHandlerInterceptor.md)

The interceptor to add.

#### Returns

`void`

***

### addInterceptors()

> **addInterceptors**(`interceptors`): `void`

Add multiple interceptors to the chain.

#### Parameters

##### interceptors

[`RouteHandlerInterceptor`](../../route-handler-interceptor/interfaces/RouteHandlerInterceptor.md)[]

The interceptors to add.

#### Returns

`void`

***

### applyPostHandle()

> **applyPostHandle**(`route`, `mv`): `Promise`\<`void`\>

Run post-handle callbacks in registration order.

#### Parameters

##### route

[`Route`](#)

The current route.

##### mv

[`ModelAndView`](../../model-and-view/classes/ModelAndView.md)

The model and view produced by the handler.

#### Returns

`Promise`\<`void`\>

A promise that resolves once every interceptor has run.

***

### applyPreHandle()

> **applyPreHandle**(`route`): `Promise`\<`boolean`\>

Run pre-handle callbacks until one denies. Denial outcomes (bare
`false` or an explicit [InterceptorDenial](../../route-handler-denial/interfaces/InterceptorDenial.md)) are recorded on the
route via `resolvePreHandleOutcome`.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`Promise`\<`boolean`\>

`true` when all interceptors allow processing to continue.

***

### triggerCompleteHandle()

> **triggerCompleteHandle**(`route`, `error?`): `Promise`\<`void`\>

Run completion callbacks in reverse order.

#### Parameters

##### route

[`Route`](#)

The current route.

##### error?

`Error` \| `null` = `null`

The error that terminated execution, if any.

#### Returns

`Promise`\<`void`\>

A promise that resolves once every completion callback has run.
