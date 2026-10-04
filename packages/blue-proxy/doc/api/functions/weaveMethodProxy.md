[**@blue/proxy v0.0.1**](../README.md)

***

[@blue/proxy](../README.md) / weaveMethodProxy

# Function: weaveMethodProxy()

> **weaveMethodProxy**(`target`, `specs`): `object`

Wraps `target` in a proxy intercepting the given method specs.

Returns `target` unchanged when `specs` is empty — nothing to advise means
no proxy, so unadvised entries keep their identity.

## Parameters

### target

`object`

The original instance; always the `this` of installed
  methods and getters.

### specs

readonly [`MethodChainSpec`](../interfaces/MethodChainSpec.md)[]

Per-method interception specs (method names must be strings).

## Returns

`object`

A proxy, or `target` itself when there is nothing to intercept.
