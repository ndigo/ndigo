[**@ndigo/proxy v0.0.1**](../../README.md)

***

[@ndigo/proxy](../../README.md) / [weave](../README.md) / MethodChainSpec

# Interface: MethodChainSpec

One method to intercept on a target: its static descriptor plus the
pre-matched, pre-sorted interceptor chain.

## Properties

### descriptor

> `readonly` **descriptor**: [`MethodDescriptor`](../../interceptor/interfaces/MethodDescriptor.md)

The method's static descriptor.

***

### interceptors

> `readonly` **interceptors**: readonly [`MethodInterceptor`](../../interceptor/interfaces/MethodInterceptor.md)[]

The pre-matched, pre-sorted interceptor chain.
