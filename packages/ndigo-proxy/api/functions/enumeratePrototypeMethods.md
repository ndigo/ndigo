[**@ndigo/proxy v0.0.1**](../README.md)

***

[@ndigo/proxy](../README.md) / enumeratePrototypeMethods

# Function: enumeratePrototypeMethods()

> **enumeratePrototypeMethods**(`target`): readonly `string`[]

String method names defined as data properties on the target's surface:
the target itself plus its prototype chain (excluding `Object.prototype`
and `constructor`). For instances the surface walk is the class prototype
chain above them; for class prototypes (service-client surfaces) it starts
on the prototype itself. The processor and the weaver must agree on this
enumeration so interception and target-binding cover the same method set.

## Parameters

### target

`object`

## Returns

readonly `string`[]
