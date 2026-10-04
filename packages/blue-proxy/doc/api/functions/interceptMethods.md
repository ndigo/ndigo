[**@blue/proxy v0.0.1**](../README.md)

***

[@blue/proxy](../README.md) / interceptMethods

# Function: interceptMethods()

> **interceptMethods**\<`T`\>(`instance`, `interceptors`): `T`

Standalone weaving: returns a proxy over `instance` intercepting every
method an interceptor matches — no container required (AD-43 D-6).

Service clients and other hand-constructed objects use this where factory
processors (`interception(...)`) cannot see them. The instance is
described under its constructor name.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### instance

`T`

The object to advise.

### interceptors

readonly [`MethodInterceptor`](../interfaces/MethodInterceptor.md)[]

The advice to apply (matched per method).

## Returns

`T`

A woven proxy, or `instance` itself when nothing matches or it
  was already intercepted.
