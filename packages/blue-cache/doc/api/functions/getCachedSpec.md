[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / getCachedSpec

# Function: getCachedSpec()

> **getCachedSpec**(`target`, `methodName`): [`NormalizedCachedSpec`](../interfaces/NormalizedCachedSpec.md) \| `undefined`

Reads the spec recorded by `@cached` for a method.

## Parameters

### target

`object`

The decorated class constructor (or instance).

### methodName

`string`

The decorated method name.

## Returns

[`NormalizedCachedSpec`](../interfaces/NormalizedCachedSpec.md) \| `undefined`

The normalized spec, or `undefined` when not cached.
