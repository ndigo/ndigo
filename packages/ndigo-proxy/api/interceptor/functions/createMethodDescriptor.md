[**@ndigo/proxy v0.0.1**](../../README.md)

***

[@ndigo/proxy](../../README.md) / [interceptor](../README.md) / createMethodDescriptor

# Function: createMethodDescriptor()

> **createMethodDescriptor**(`targetType`, `entryName`, `methodName`): [`MethodDescriptor`](../interfaces/MethodDescriptor.md)

Builds the immutable per-method descriptor readers use for selection and
annotation lookup. Annotations are read from `targetType` (the declaring
class) rather than the instance: when the instance is itself a proxy —
e.g. a service client over a class — the instance's `constructor` chain
would resolve to `Function` and miss the metadata.

## Parameters

### targetType

`Function`

### entryName

`string`

### methodName

`PropertyKey`

## Returns

[`MethodDescriptor`](../interfaces/MethodDescriptor.md)
