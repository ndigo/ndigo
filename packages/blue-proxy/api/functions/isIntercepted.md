[**@blue/proxy v0.0.1**](../README.md)

***

[@blue/proxy](../README.md) / isIntercepted

# Function: isIntercepted()

> **isIntercepted**(`instance`): `boolean`

Whether the instance (a woven proxy or the raw target it advises) was
already woven by this package. Guards against double-wrapping when
processing runs twice.

## Parameters

### instance

`object`

## Returns

`boolean`
