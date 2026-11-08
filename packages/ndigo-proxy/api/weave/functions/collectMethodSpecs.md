[**@ndigo/proxy v0.0.1**](../../README.md)

***

[@ndigo/proxy](../../README.md) / [weave](../README.md) / collectMethodSpecs

# Function: collectMethodSpecs()

> **collectMethodSpecs**(`instance`, `entryName`, `interceptors`): [`MethodChainSpec`](../interfaces/MethodChainSpec.md)[]

Enumerates the instance's prototype methods, builds a descriptor per
method, and keeps the ones at least one interceptor matches. Shared by the
container processor and standalone [interceptMethods](interceptMethods.md) so both weave
the same method set.

Interceptors are sorted once per entry by [sortInterceptors](../../chain/functions/sortInterceptors.md) (missing
order counts as 0; ties keep registration order) — the `order` contract
holds on every path.

## Parameters

### instance

`object`

The object whose method surface is enumerated.

### entryName

`string`

The container entry name recorded on each descriptor.

### interceptors

readonly [`MethodInterceptor`](../../interceptor/interfaces/MethodInterceptor.md)[]

The advice to match against each method.

## Returns

[`MethodChainSpec`](../interfaces/MethodChainSpec.md)[]

The matched method specs, in prototype enumeration order.
