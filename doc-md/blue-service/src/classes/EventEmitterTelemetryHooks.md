[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / EventEmitterTelemetryHooks

# Class: EventEmitterTelemetryHooks

Defined in: packages/blue-service/src/telemetry-hooks.ts:35

Telemetry hooks implementation that uses an EventEmitter to notify about service events.

## Implements

- [`TelemetryHooks`](../interfaces/TelemetryHooks.md)

## Constructors

### Constructor

> **new EventEmitterTelemetryHooks**(`emitter`): `EventEmitterTelemetryHooks`

Defined in: packages/blue-service/src/telemetry-hooks.ts:43

Creates a new telemetry hooks implementation.

#### Parameters

##### emitter

`EventEmitter`

The event emitter to use for notifications.

#### Returns

`EventEmitterTelemetryHooks`

## Methods

### onRequest()

> **onRequest**(`request`): `void`

Defined in: packages/blue-service/src/telemetry-hooks.ts:52

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

Defined in: packages/blue-service/src/telemetry-hooks.ts:64

Records the completion of a service request.

#### Parameters

##### response

`Response`

The HTTP response.

#### Returns

`void`

#### Implementation of

[`TelemetryHooks`](../interfaces/TelemetryHooks.md).[`onResponse`](../interfaces/TelemetryHooks.md#onresponse)

***

### onError()

> **onError**(`error`): `void`

Defined in: packages/blue-service/src/telemetry-hooks.ts:76

Records a service request failure.

#### Parameters

##### error

`Error`

The error that occurred.

#### Returns

`void`

#### Implementation of

[`TelemetryHooks`](../interfaces/TelemetryHooks.md).[`onError`](../interfaces/TelemetryHooks.md#onerror)
