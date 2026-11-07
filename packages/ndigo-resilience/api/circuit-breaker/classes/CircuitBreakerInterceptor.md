[**@ndigo/resilience v0.0.1**](../../README.md)

***

[@ndigo/resilience](../../README.md) / [circuit-breaker](../README.md) / CircuitBreakerInterceptor

# Class: CircuitBreakerInterceptor

Around-advice keeping a per-(entry, method) circuit. Awaits `next()` so it
observes the final outcome of the inner chain (AD-43 D-5) — when composed
outside a retry interceptor, one chain pass counts as one failure, not one
per retry attempt.

## Implements

- `MethodInterceptor`

## Constructors

### Constructor

> **new CircuitBreakerInterceptor**(`options?`): `CircuitBreakerInterceptor`

#### Parameters

##### options?

[`CircuitBreakerInterceptorOptions`](../interfaces/CircuitBreakerInterceptorOptions.md) = `{}`

#### Returns

`CircuitBreakerInterceptor`

## Methods

### invoke()

> **invoke**(`invocation`, `next`): `Promise`\<`unknown`\>

Runs the call through the per-method circuit.

#### Parameters

##### invocation

`MethodInvocation`

The woven method invocation.

##### next

() => `unknown`

Continues the inner interceptor chain.

#### Returns

`Promise`\<`unknown`\>

The call result, or a rejection from the call or the open circuit.

#### Implementation of

`MethodInterceptor.invoke`

***

### matches()

> **matches**(`method`): `boolean`

Whether the method carries a valid `@circuitBreaker` spec.

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
