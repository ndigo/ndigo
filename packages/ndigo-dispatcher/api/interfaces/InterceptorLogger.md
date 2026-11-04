[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / InterceptorLogger

# Interface: InterceptorLogger

A minimal logger interface for the [LoggingRouteHandlerInterceptor](../classes/LoggingRouteHandlerInterceptor.md).

This interface is intentionally simple so that callers may supply any logger
implementation without depending on `@ndigo/telemetry`. When a `@ndigo/telemetry`
logger is provided, trace context (traceId, spanId) is automatically injected.

## Methods

### error()

> **error**(`message`, `error?`, `attributes?`): `void`

Log an error message.

#### Parameters

##### message

`string`

The log message.

##### error?

`unknown`

The error, if any.

##### attributes?

`Record`\<`string`, `unknown`\>

Structured attributes for the event.

#### Returns

`void`

***

### info()

> **info**(`message`, `attributes?`): `void`

Log an informational message.

#### Parameters

##### message

`string`

The log message.

##### attributes?

`Record`\<`string`, `unknown`\>

Structured attributes for the event.

#### Returns

`void`
