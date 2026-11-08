[**@ndigo/proxy v0.0.1**](../../README.md)

***

[@ndigo/proxy](../../README.md) / [chain](../README.md) / sortInterceptors

# Function: sortInterceptors()

> **sortInterceptors**(`interceptors`): [`MethodInterceptor`](../../interceptor/interfaces/MethodInterceptor.md)[]

Stable sort of interceptors by `order` (missing order counts as `0`);
equal orders keep registration order.

## Parameters

### interceptors

readonly [`MethodInterceptor`](../../interceptor/interfaces/MethodInterceptor.md)[]

The interceptors to sort.

## Returns

[`MethodInterceptor`](../../interceptor/interfaces/MethodInterceptor.md)[]

A new array in execution order.
