[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [request-id-correlation](../README.md) / RequestIdCorrelation

# Interface: RequestIdCorrelation

Interface for request-ID correlation across service calls.

## Since

1.0.0

## Author

Jeff Rose

## Methods

### generateRequestId()

> **generateRequestId**(): `string`

Generates a new unique request ID.

#### Returns

`string`

A unique request ID.

***

### getCorrelationId()

> **getCorrelationId**(): `string`

Returns the current correlation ID.

#### Returns

`string`

The current correlation ID.

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
