[**@blue/telemetry v0.0.1**](../README.md)

***

[@blue/telemetry](../README.md) / getCounted

# Function: getCounted()

> **getCounted**(`target`, `propertyKey`): [`CountedMethodConfig`](../interfaces/CountedMethodConfig.md) \| `undefined`

Retrieves the configuration for a counted method, including its name and attributes.

## Parameters

### target

`object`

The target object or prototype.

### propertyKey

`string` \| `symbol`

The name of the method.

## Returns

[`CountedMethodConfig`](../interfaces/CountedMethodConfig.md) \| `undefined`

The counter configuration if the method is counted, otherwise `undefined`.
