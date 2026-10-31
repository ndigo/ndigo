[**@blue/proxy v0.0.1**](../README.md)

***

[@blue/proxy](../README.md) / MethodInterceptor

# Interface: MethodInterceptor

A unit of cross-cutting policy. Implementations choose which methods they
apply to and what runs around the call.

## Properties

### order?

> `readonly` `optional` **order?**: `number`

Order relative to other interceptors; lower runs closer to the caller
(outermost). Missing order is `0`; ties keep registration order.

## Methods

### invoke()

> **invoke**(`invocation`, `next`): `unknown`

Runs for an intercepted call. Return `next()` to continue down the
chain (ultimately invoking the installed method on `invocation.target`),
or return a value / throw to short-circuit.

#### Parameters

##### invocation

[`MethodInvocation`](MethodInvocation.md)

##### next

() => `unknown`

#### Returns

`unknown`

***

### matches()

> **matches**(`method`): `boolean`

Whether this interceptor applies to `method`. Called once per managed
method while the processor prepares the entry — not per call.

#### Parameters

##### method

[`MethodDescriptor`](MethodDescriptor.md)

#### Returns

`boolean`
