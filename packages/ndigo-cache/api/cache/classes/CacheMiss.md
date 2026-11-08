[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [cache](../README.md) / CacheMiss

# Class: CacheMiss

Branded sentinel returned by [Cache#get](../interfaces/Cache.md#get) when no entry exists (or an
entry has expired). Distinguishes "no value cached" from a cached
`undefined` — compare with `=== CacheMiss.INSTANCE` or [isCacheMiss](../functions/isCacheMiss.md).

The constructor is private: the only instance is [CacheMiss.INSTANCE](#instance),
so identity comparison is reliable (prefer identity over `instanceof`,
which breaks if a bundle duplicates the class).

## Properties

### INSTANCE

> `readonly` `static` **INSTANCE**: `CacheMiss`

The sole miss sentinel instance.
