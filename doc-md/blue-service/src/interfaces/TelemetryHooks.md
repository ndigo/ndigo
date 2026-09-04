[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / TelemetryHooks

# Interface: TelemetryHooks

Defined in: packages/blue-service/src/telemetry-hooks.ts:11

Interface for telemetry hooks that track service request lifecycles.

## Methods

### onRequest()

> **onRequest**(`request`): `void`

Defined in: packages/blue-service/src/telemetry-hooks.ts:17

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

Defined in: packages/blue-service/src/telemetry-hooks.ts:23

Called after a service response is received.

#### Parameters

##### response

`Response`

The HTTP response.

#### Returns

`void`

***

### onError()

> **onError**(`error`): `void`

Defined in: packages/blue-service/src/telemetry-hooks.ts:29

Called when a service request fails.

#### Parameters

##### error

`Error`

The error that occurred.

#### Returns

`void`
