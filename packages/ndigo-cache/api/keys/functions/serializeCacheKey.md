[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [keys](../README.md) / serializeCacheKey

# Function: serializeCacheKey()

> **serializeCacheKey**(...`args`): `string`

Stable string key for an argument list (memoization and `@cached` default
key semantics): JSON serialization of the argument array.

Semantics are JSON's: `undefined` and `null` collapse, object key
insertion order is significant (`{a:1,b:2}` ≠ `{b:2,a:1}`), and circular
structures throw (a programming error that surfaces loudly rather than
producing colliding keys).

**Collision classes** — values JSON merges map to one key, which can serve
the wrong cached entry:
- `undefined` and `null` collapse (`[undefined]` and `[null]` are equal)
- object key insertion order is significant (see above)

Callers that must not merge these should pass [serializeCacheKeyStrict](serializeCacheKeyStrict.md)
as the `key:` option of [memoize](../../memoize/README.md) / the `@cached` decorator.

## Parameters

### args

...`unknown`[]

The method/function arguments.

## Returns

`string`

The cache key.
