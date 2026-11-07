[**@ndigo/resilience v0.0.1**](../../README.md)

***

[@ndigo/resilience](../../README.md) / [retry](../README.md) / RetryInterceptor

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

Re-invokes the inner chain until it succeeds, the attempts run out, or
the error is not retryable.

#### Parameters

##### invocation

`MethodInvocation`

The woven method invocation.

##### next

() => `unknown`

Continues the inner interceptor chain.

#### Returns

`Promise`\<`unknown`\>

The settled call result.

#### Implementation of

`MethodInterceptor.invoke`

***

### matches()

> **matches**(`method`): `boolean`

Whether the method carries a valid `@retry` spec.

#### Parameters

##### method

`MethodDescriptor`

The method descriptor being woven.

#### Returns

`boolean`

`true` when the interceptor should advise the method.

#### Throws

When the annotation carries an invalid spec (fail loud at weave time).

#### Implementation of

`MethodInterceptor.matches`
