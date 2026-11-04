[**@ndigo/cache v0.0.1**](../README.md)

***

[@ndigo/cache](../README.md) / getCachedSpec

# Function: getCachedSpec()

> **getCachedSpec**(`target`, `methodName`): [`NormalizedCachedSpec`](../interfaces/NormalizedCachedSpec.md) \| `undefined`

Reads the spec recorded by `@cached` for a method.

Metadata lives on the class constructor, so an instance is resolved
through its `constructor` (mirrors `getSymbolMetadata`); both forms
return the same spec.

## Parameters

### target

`object`

The decorated class constructor or an instance of it.

### methodName

`string`

The decorated method name.

## Returns

[`NormalizedCachedSpec`](../interfaces/NormalizedCachedSpec.md) \| `undefined`

The normalized spec, or `undefined` when not cached.
