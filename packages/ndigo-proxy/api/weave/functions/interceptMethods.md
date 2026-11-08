[**@ndigo/proxy v0.0.1**](../../README.md)

***

[@ndigo/proxy](../../README.md) / [weave](../README.md) / interceptMethods

# Function: interceptMethods()

> **interceptMethods**\<`T`\>(`instance`, `interceptors`): `T`

Standalone weaving: returns a proxy over `instance` intercepting every
method an interceptor matches — no container required (AD-43 D-6).

Service clients and other hand-constructed objects use this where factory
processors (`interception(...)`) cannot see them. The instance is
described under its constructor name.

Function targets are treated as class proxies and advised through their
`.prototype`. Arrow and bound functions have no prototype surface, so —
like any target whose methods do not match — they pass through unchanged.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### instance

`T`

The object to advise.

### interceptors

readonly [`MethodInterceptor`](../../interceptor/interfaces/MethodInterceptor.md)[]

The advice to apply (matched per method).

## Returns

`T`

A woven proxy; the existing proxy when `instance` (or the raw
  target it advises) was already woven; or `instance` itself when nothing
  matches.

## Example

```ts
const audited = interceptMethods(service, [new AuditInterceptor()]);
```
