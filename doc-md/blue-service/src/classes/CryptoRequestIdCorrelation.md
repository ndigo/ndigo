[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / CryptoRequestIdCorrelation

# Class: CryptoRequestIdCorrelation

Defined in: [packages/blue-service/src/request-id-correlation.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/request-id-correlation.ts#lines-32)

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

Defined in: [packages/blue-service/src/request-id-correlation.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/request-id-correlation.ts#lines-40)

Generates a new unique request ID using crypto.randomUUID().

#### Returns

`string`

A unique request ID.

#### Implementation of

[`RequestIdCorrelation`](../interfaces/RequestIdCorrelation.md).[`generateRequestId`](../interfaces/RequestIdCorrelation.md#generaterequestid)

***

### getCorrelationId()

> **getCorrelationId**(): `string`

Defined in: [packages/blue-service/src/request-id-correlation.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/request-id-correlation.ts#lines-49)

Returns the current correlation ID.

#### Returns

`string`

The current correlation ID, or a new one if none is set.

#### Implementation of

[`RequestIdCorrelation`](../interfaces/RequestIdCorrelation.md).[`getCorrelationId`](../interfaces/RequestIdCorrelation.md#getcorrelationid)

***

### setCorrelationId()

> **setCorrelationId**(`id`): `void`

Defined in: [packages/blue-service/src/request-id-correlation.ts:61](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-service/src/request-id-correlation.ts#lines-61)

Sets the current correlation ID.

#### Parameters

##### id

`string`

The correlation ID to set.

#### Returns

`void`

#### Implementation of

[`RequestIdCorrelation`](../interfaces/RequestIdCorrelation.md).[`setCorrelationId`](../interfaces/RequestIdCorrelation.md#setcorrelationid)
