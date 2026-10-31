[**@blue/service v0.0.1**](../README.md)

***

[@blue/service](../README.md) / CryptoRequestIdCorrelation

# Class: CryptoRequestIdCorrelation

Request-ID correlation implementation using crypto.randomUUID().

## Implements

- [`RequestIdCorrelation`](../interfaces/RequestIdCorrelation.md)

## Constructors

### Constructor

> **new CryptoRequestIdCorrelation**(): `CryptoRequestIdCorrelation`

#### Returns

`CryptoRequestIdCorrelation`

## Methods

### generateRequestId()

> **generateRequestId**(): `string`

Generates a new unique request ID using crypto.randomUUID().

#### Returns

`string`

A unique request ID.

#### Implementation of

[`RequestIdCorrelation`](../interfaces/RequestIdCorrelation.md).[`generateRequestId`](../interfaces/RequestIdCorrelation.md#generaterequestid)

***

### getCorrelationId()

> **getCorrelationId**(): `string`

Returns the current correlation ID.

#### Returns

`string`

The current correlation ID, or a new one if none is set.

#### Implementation of

[`RequestIdCorrelation`](../interfaces/RequestIdCorrelation.md).[`getCorrelationId`](../interfaces/RequestIdCorrelation.md#getcorrelationid)

***

### setCorrelationId()

> **setCorrelationId**(`id`): `void`

Sets the current correlation ID.

#### Parameters

##### id

`string`

The correlation ID to set.

#### Returns

`void`

#### Implementation of

[`RequestIdCorrelation`](../interfaces/RequestIdCorrelation.md).[`setCorrelationId`](../interfaces/RequestIdCorrelation.md#setcorrelationid)
