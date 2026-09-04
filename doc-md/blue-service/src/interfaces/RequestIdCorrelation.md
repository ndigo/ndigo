[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-service/src](../README.md) / RequestIdCorrelation

# Interface: RequestIdCorrelation

Defined in: packages/blue-service/src/request-id-correlation.ts:8

Interface for request-ID correlation across service calls.

## Methods

### generateRequestId()

> **generateRequestId**(): `string`

Defined in: packages/blue-service/src/request-id-correlation.ts:14

Generates a new unique request ID.

#### Returns

`string`

A unique request ID.

***

### getCorrelationId()

> **getCorrelationId**(): `string`

Defined in: packages/blue-service/src/request-id-correlation.ts:20

Returns the current correlation ID.

#### Returns

`string`

The current correlation ID.

***

### setCorrelationId()

> **setCorrelationId**(`id`): `void`

Defined in: packages/blue-service/src/request-id-correlation.ts:26

Sets the current correlation ID.

#### Parameters

##### id

`string`

The correlation ID to set.

#### Returns

`void`
