[**@blue/telemetry v0.0.1**](../README.md)

***

[@blue/telemetry](../README.md) / getTracedSpanName

# Variable: getTracedSpanName

> `const` **getTracedSpanName**: (`target`, `propertyKey`) => `string` \| `undefined` = `getTraced`

Retrieves the span name associated with a traced method.

## Parameters

### target

`object`

The target object or prototype.

### propertyKey

`string` \| `symbol`

The name of the method.

## Returns

`string` \| `undefined`

The span name if the method is traced, otherwise `undefined`.
