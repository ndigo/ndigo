[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [telemetry-hooks](../README.md) / EventEmitterTelemetryHooks

# Class: EventEmitterTelemetryHooks

Telemetry hooks implementation that uses an EventEmitter to notify about service events.

## Implements

- [`TelemetryHooks`](../interfaces/TelemetryHooks.md)

## Constructors

### Constructor

> **new EventEmitterTelemetryHooks**(`emitter`): `EventEmitterTelemetryHooks`

Creates a new telemetry hooks implementation.

#### Parameters

##### emitter

`EventEmitter`

The event emitter to use for notifications.

#### Returns

`EventEmitterTelemetryHooks`

## Methods

### onError()

> **onError**(`error`): `void`

Records a service request failure.

#### Parameters

##### error

`Error`

The error that occurred.

#### Returns

`void`

#### Implementation of

[`TelemetryHooks`](../interfaces/TelemetryHooks.md).[`onError`](../interfaces/TelemetryHooks.md#onerror)

***

### onRequest()

> **onRequest**(`request`): `void`

Records the start of a service request.

#### Parameters

##### request

`Request`

The HTTP request.

#### Returns

`void`

#### Implementation of

[`TelemetryHooks`](../interfaces/TelemetryHooks.md).[`onRequest`](../interfaces/TelemetryHooks.md#onrequest)

***

### onResponse()

> **onResponse**(`response`): `void`

Records the completion of a service request.

#### Parameters

##### response

`Response`

The HTTP response.

#### Returns

`void`

#### Implementation of

[`TelemetryHooks`](../interfaces/TelemetryHooks.md).[`onResponse`](../interfaces/TelemetryHooks.md#onresponse)
