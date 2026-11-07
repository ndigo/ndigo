[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service](../README.md) / Service

# Class: Service

A service that provides a high-level API for interacting with remote endpoints.

## Implements

- `AsyncDestroyable`

## Constructors

### Constructor

> **new Service**(`name`, `http`, `registry`, `telemetry`, `correlation`): `Service`

#### Parameters

##### name

`string`

##### http

`HTTP`

##### registry

[`ServiceRegistry`](../../service-registry/interfaces/ServiceRegistry.md)

##### telemetry

[`TelemetryHooks`](../../telemetry-hooks/interfaces/TelemetryHooks.md)

##### correlation

[`RequestIdCorrelation`](../../request-id-correlation/interfaces/RequestIdCorrelation.md)

#### Returns

`Service`

## Properties

### destroyed

> **destroyed**: `boolean`

Whether [Service.destroy](#destroy) has run.

#### Implementation of

`AsyncDestroyable.destroyed`

***

### id

> **id**: `number`

Monotonic identifier assigned when the service is created.

***

### name

> **name**: `string`

The service name, used for correlation headers and diagnostics.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Adds a service interceptor to the chain.

#### Parameters

##### interceptor

[`ServiceInterceptor`](../type-aliases/ServiceInterceptor.md)

Interceptor to add.

#### Returns

`void`

***

### call()

> **call**(`token`, `data`, `init?`): `Promise`\<`Response`\>

Executes a service call.

#### Parameters

##### token

`string`

The service token to resolve.

##### data

`unknown`

Request payload.

##### init?

[`ServiceInit`](../type-aliases/ServiceInit.md) = `{}`

Service initialization settings.

#### Returns

`Promise`\<`Response`\>

A promise that resolves to the service response.

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Marks the service as destroyed.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the service is marked destroyed.

#### Implementation of

`AsyncDestroyable.destroy`
