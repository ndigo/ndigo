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

The class the method was resolved from.

### entryName

`string`

The container entry name.

### methodName

`PropertyKey`

The method name.

## Returns

[`MethodDescriptor`](../interfaces/MethodDescriptor.md)

A frozen descriptor with annotation lookup bound to `targetType`.

## Example

```ts
const descriptor = createMethodDescriptor(OrderService, 'orderService', 'submit');
```
