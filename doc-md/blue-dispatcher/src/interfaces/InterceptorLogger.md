[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / InterceptorLogger

# Interface: InterceptorLogger

Defined in: [packages/blue-dispatcher/src/logging-interceptor.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/logging-interceptor.ts#lines-16)

A minimal logger interface for the [LoggingRouteHandlerInterceptor](../classes/LoggingRouteHandlerInterceptor.md).

This interface is intentionally simple so that callers may supply any logger
implementation without depending on `@blue/telemetry`. When a `@blue/telemetry`
logger is provided, trace context (traceId, spanId) is automatically injected.

## Methods

### info()

> **info**(`message`, `attributes?`): `void`

Defined in: [packages/blue-dispatcher/src/logging-interceptor.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/logging-interceptor.ts#lines-23)

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

***

### error()

> **error**(`message`, `error?`, `attributes?`): `void`

Defined in: [packages/blue-dispatcher/src/logging-interceptor.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/logging-interceptor.ts#lines-32)

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
