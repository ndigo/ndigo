[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [telemetry-hooks](../README.md) / TelemetryHooks

# Interface: TelemetryHooks

Interface for telemetry hooks that track service request lifecycles.

## Methods

### onError()

> **onError**(`error`): `void`

Called when a service request fails.

#### Parameters

##### error

`Error`

The error that occurred.

#### Returns

`void`

***

### onRequest()

> **onRequest**(`request`): `void`

Called before a service request is sent.

#### Parameters

##### request

`Request`

The HTTP request.

#### Returns

`void`

***

### onResponse()

> **onResponse**(`response`): `void`

Called after a service response is received.

#### Parameters

##### response

`Response`

The HTTP response.

#### Returns

`void`
