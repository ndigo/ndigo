[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / getTracedSpanName

# Variable: getTracedSpanName

> `const` **getTracedSpanName**: (`target`, `propertyKey`) => `string` \| `undefined` = `getTraced`

Defined in: packages/blue-telemetry/src/trace/decorators.ts:126

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
