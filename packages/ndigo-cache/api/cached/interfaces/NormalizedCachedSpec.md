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

The resolved cache name.

***

### key

> **key**: `string` \| ((...`args`) => `string`) \| `undefined`

The resolved key strategy, when one was supplied.

***

### ttl

> **ttl**: `number` \| `undefined`

The entry lifetime in milliseconds, when set.
