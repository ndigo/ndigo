[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [cached](../README.md) / NormalizedCachedSpec

# Interface: NormalizedCachedSpec

Canonical `@cached` specification: validated by
[resolveCachedSpec](../functions/resolveCachedSpec.md) at decoration time and recorded on
`Symbol.metadata` for introspection.

## Properties

### cacheName

> **cacheName**: `string`

***

### key

> **key**: `string` \| ((...`args`) => `string`) \| `undefined`

***

### ttl

> **ttl**: `number` \| `undefined`

