[**@ndigo/proxy v0.0.1**](../../README.md)

***

[@ndigo/proxy](../../README.md) / [chain](../README.md) / invokeChain

# Function: invokeChain()

> **invokeChain**(`interceptors`, `invocation`, `tail`): `unknown`

Runs the matched interceptor chain for one call and returns its result.

- `interceptors` must be pre-matched and pre-sorted.
- `tail` invokes the installed method on the target; it is called exactly
  once per full chain pass.
- An interceptor that never calls `next()` short-circuits the call.
- `next()` is *re-entrant*: every invocation starts a fresh advance from
  the caller's position, so around-advice may invoke it multiple times —
  that is the retry pattern (each re-entry re-runs the remaining advice
  and eventually the tail). Interceptors that must not re-execute are
  responsible for guarding their own state.

## Parameters

### interceptors

readonly [`MethodInterceptor`](../../interceptor/interfaces/MethodInterceptor.md)[]

The pre-matched, pre-sorted interceptor chain.

### invocation

[`MethodInvocation`](../../interceptor/interfaces/MethodInvocation.md)

The invocation passed to every interceptor.

### tail

() => `unknown`

Invokes the installed method on the target.

## Returns

`unknown`

The chain's final result.

## Example

```ts
const result = invokeChain(interceptors, invocation, () => method.apply(target, args));
```
