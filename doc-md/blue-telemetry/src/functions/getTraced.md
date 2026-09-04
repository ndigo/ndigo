[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / getTraced

# Function: getTraced()

> **getTraced**(`target`, `propertyKey`): `string` \| `undefined`

Defined in: packages/blue-telemetry/src/trace/decorators.ts:23

Retrieves the span name associated with a traced method.

## Parameters

### target

`any`

The target object or prototype.

### propertyKey

`string` \| `symbol`

The name of the method.

## Returns

`string` \| `undefined`

The span name if the method is traced, otherwise `undefined`.
