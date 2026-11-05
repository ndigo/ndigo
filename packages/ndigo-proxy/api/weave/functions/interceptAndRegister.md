[**@ndigo/proxy v0.0.1**](../../README.md)

***

[@ndigo/proxy](../../README.md) / [weave](../README.md) / interceptAndRegister

# Function: interceptAndRegister()

> **interceptAndRegister**(`target`, `specs`, `owner?`): `object`

Weaves `target` and records the result as intercepted — the single
registration point for the double-wrap guard, shared by the container
processor and standalone [interceptMethods](interceptMethods.md).

## Parameters

### target

`object`

The object to weave.

### specs

readonly [`MethodChainSpec`](../interfaces/MethodChainSpec.md)[]

The pre-matched method specs.

### owner?

`object`

The `interception(...)` processor that owns this weaving,
  when there is one; standalone weaving omits it so provenance stays
  empty (`wovenBy` returns `undefined`).

## Returns

`object`

The woven proxy.
