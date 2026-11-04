[**@ndigo/proxy v0.0.1**](../README.md)

***

[@ndigo/proxy](../README.md) / collectMethodSpecs

# Function: collectMethodSpecs()

> **collectMethodSpecs**(`instance`, `entryName`, `interceptors`): [`MethodChainSpec`](../interfaces/MethodChainSpec.md)[]

Enumerates the instance's prototype methods, builds a descriptor per
method, and keeps the ones at least one interceptor matches. Shared by the
container processor and standalone [interceptMethods](interceptMethods.md) so both weave
the same method set.

Interceptors are sorted once per entry by [sortInterceptors](sortInterceptors.md) (missing
order counts as 0; ties keep registration order) — the `order` contract
holds on every path.

## Parameters

### instance

`object`

### entryName

`string`

### interceptors

readonly [`MethodInterceptor`](../interfaces/MethodInterceptor.md)[]

## Returns

[`MethodChainSpec`](../interfaces/MethodChainSpec.md)[]
