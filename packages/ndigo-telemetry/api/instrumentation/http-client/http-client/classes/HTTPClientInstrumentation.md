[**@ndigo/telemetry v0.0.1**](../../../../README.md)

***

[@ndigo/telemetry](../../../../README.md) / [instrumentation/http-client/http-client](../README.md) / HTTPClientInstrumentation

# Class: HTTPClientInstrumentation

An OpenTelemetry instrumentation for the `@ndigo/http` client.

Wraps `HTTP#request` so every outbound request produces a CLIENT span
carrying the method, target URL, response status, and duration. Child
spans of the request (transforms, fetch) nest under it.

## Extends

- [`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md)

## Constructors

### Constructor

> **new HTTPClientInstrumentation**(): `HTTPClientInstrumentation`

#### Returns

`HTTPClientInstrumentation`

#### Overrides

[`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md).[`constructor`](../../../base/classes/AbstractBaseInstrumentation.md#constructor)

## Methods

### disable()

> **disable**(): `void`

Restores the original `request` method.

#### Returns

`void`

#### Overrides

[`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md).[`disable`](../../../base/classes/AbstractBaseInstrumentation.md#disable)

***

### enable()

> **enable**(): `void`

Patches `HTTP#request` to record outbound request spans.

#### Returns

`void`

#### Overrides

[`AbstractBaseInstrumentation`](../../../base/classes/AbstractBaseInstrumentation.md).[`enable`](../../../base/classes/AbstractBaseInstrumentation.md#enable)
