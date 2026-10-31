[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / parameterMappingKind

# Function: parameterMappingKind()

> **parameterMappingKind**(`target`, `propertyKey`): [`ParameterMappingKind`](../type-aliases/ParameterMappingKind.md)

Determine a method's mapping kind from its metadata.

## Parameters

### target

`unknown`

The class prototype or constructor.

### propertyKey

`string` \| `symbol`

The method name.

## Returns

[`ParameterMappingKind`](../type-aliases/ParameterMappingKind.md)

`'socket'` for socket-mapped methods, `'request'` when a verb is
  set (requestMapping/getMapping/…), else `'route'`.
