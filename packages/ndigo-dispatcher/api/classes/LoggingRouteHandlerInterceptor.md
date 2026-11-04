[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / LoggingRouteHandlerInterceptor

# Class: LoggingRouteHandlerInterceptor

A standard interceptor that logs the execution time and outcome of a route handler.
Useful for performance monitoring and debugging.

## Implements

- [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)

## Constructors

### Constructor

> **new LoggingRouteHandlerInterceptor**(`logger`): `LoggingRouteHandlerInterceptor`

Create a logging interceptor.

#### Parameters

##### logger

[`InterceptorLogger`](../interfaces/InterceptorLogger.md)

Structured logger implementation.

#### Returns

`LoggingRouteHandlerInterceptor`

## Methods

### completeHandle()

> **completeHandle**(`route`, `handler`, `error`): `Promise`\<`void`\>

Emit a failure log entry and clear the recorded start time.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

`object` \| `undefined`

The route handler.

##### error

`Error`

The error thrown during execution.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`completeHandle`](../interfaces/RouteHandlerInterceptor.md#completehandle)

***

### postHandle()

> **postHandle**(`route`, `handler`, `modelAndView`): `Promise`\<`void`\>

Emit a completion log entry after successful handler execution.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

`object` \| `undefined`

The route handler.

##### modelAndView

[`ModelAndView`](ModelAndView.md)

The model and view returned by the handler.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`postHandle`](../interfaces/RouteHandlerInterceptor.md#posthandle)

***

### preHandle()

> **preHandle**(`route`, `handler`): `Promise`\<`boolean`\>

Record the start time and emit a "route started" log entry.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

`object` \| `undefined`

The route handler.

#### Returns

`Promise`\<`boolean`\>

`true` to continue execution.

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`preHandle`](../interfaces/RouteHandlerInterceptor.md#prehandle)
