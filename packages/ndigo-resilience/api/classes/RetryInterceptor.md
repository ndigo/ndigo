[**@ndigo/resilience v0.0.1**](../README.md)

***

[@ndigo/resilience](../README.md) / RetryInterceptor

# Class: RetryInterceptor

Around-advice that re-invokes `next()` after a failure. This interceptor
awaits `next()` — its result is only final after the whole inner chain —
so the value it returns is always a settled value (or a rejection).

Because `invoke` is async, a woven **sync** method advised by this
interceptor returns a Promise through the proxy (see [retry](../variables/retry.md)).

## See

AD-43 D-3 for the retry semantics and idempotency contract.

## Implements

- `MethodInterceptor`

## Constructors

### Constructor

> **new RetryInterceptor**(): `RetryInterceptor`

#### Returns

`RetryInterceptor`

## Methods

### invoke()

> **invoke**(`invocation`, `next`): `Promise`\<`unknown`\>

Runs for an intercepted call. Return `next()` to continue down the
chain (ultimately invoking the installed method on `invocation.target`),
or return a value / throw to short-circuit.

#### Parameters

##### invocation

`MethodInvocation`

##### next

() => `unknown`

#### Returns

`Promise`\<`unknown`\>

#### Implementation of

`MethodInterceptor.invoke`

***

### matches()

> **matches**(`method`): `boolean`

Whether this interceptor applies to `method`. Called once per managed
method while the processor prepares the entry — not per call.

#### Parameters

##### method

`MethodDescriptor`

#### Returns

`boolean`

#### Implementation of

`MethodInterceptor.matches`
