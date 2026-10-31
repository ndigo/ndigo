[**@blue/resilience v0.0.1**](../README.md)

***

[@blue/resilience](../README.md) / CircuitBreakerInterceptor

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
