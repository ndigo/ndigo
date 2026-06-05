[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / LoggingRouteHandlerInterceptor

# Class: LoggingRouteHandlerInterceptor

Defined in: packages/blue-dispatcher/src/logging-interceptor.ts:42

A standard interceptor that logs the execution time and outcome of a route handler.
Useful for performance monitoring and debugging.

Accepts an optional [InterceptorLogger](../interfaces/InterceptorLogger.md) via the constructor. When no logger
is provided, falls back to `console`-based logging for backward compatibility.

## Implements

- [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)

## Constructors

### Constructor

> **new LoggingRouteHandlerInterceptor**(`logger?`): `LoggingRouteHandlerInterceptor`

Defined in: packages/blue-dispatcher/src/logging-interceptor.ts:58

Create a logging interceptor.

#### Parameters

##### logger?

[`InterceptorLogger`](../interfaces/InterceptorLogger.md)

Optional structured logger implementation.

#### Returns

`LoggingRouteHandlerInterceptor`

## Methods

### preHandle()

> **preHandle**(`route`, `handler`): `Promise`\<`boolean`\>

Defined in: packages/blue-dispatcher/src/logging-interceptor.ts:77

Record the start time and emit a "route started" log entry.

#### Parameters

##### route

`Route`

The current route.

##### handler

`any`

The route handler.

#### Returns

`Promise`\<`boolean`\>

`true` to continue execution.

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`preHandle`](../interfaces/RouteHandlerInterceptor.md#prehandle)

***

### postHandle()

> **postHandle**(`route`, `handler`, `modelAndView`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/logging-interceptor.ts:90

Emit a completion log entry after successful handler execution.

#### Parameters

##### route

`Route`

The current route.

##### handler

`any`

The route handler.

##### modelAndView

[`ModelAndView`](ModelAndView.md)

The model and view returned by the handler.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`postHandle`](../interfaces/RouteHandlerInterceptor.md#posthandle)

***

### completeHandle()

> **completeHandle**(`route`, `handler`, `error`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/logging-interceptor.ts:108

Emit a failure log entry and clear the recorded start time.

#### Parameters

##### route

`Route`

The current route.

##### handler

`any`

The route handler.

##### error

`Error`

The error thrown during execution.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`completeHandle`](../interfaces/RouteHandlerInterceptor.md#completehandle)
