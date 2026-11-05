[**@ndigo/cache v0.0.1**](../../README.md)

***

[@ndigo/cache](../../README.md) / [keys](../README.md) / serializeCacheKeyStrict

# Function: serializeCacheKeyStrict()

> **serializeCacheKeyStrict**(...`args`): `string`

Type-preserving alternative to [serializeCacheKey](serializeCacheKey.md): each argument is
tagged with its kind before serialization, so values that `JSON` silently
merges are keyed distinctly. This resolves the `[undefined]`/`[null]`
collision (M1) and makes primitive types explicit.

Semantics vs [serializeCacheKey](serializeCacheKey.md):
- `undefined` and `null` are distinct (`[undefined]` ≠ `[null]`)
- primitives carry their type (`1` ≠ `"1"` ≠ `true`; `NaN`/`Infinity` stable)
- objects/arrays fall back to `JSON.stringify`, tagged as such (object key
  order remains significant — canonicalise caller-side if that matters)
- circular structures throw, matching [serializeCacheKey](serializeCacheKey.md)

The per-argument tags are non-null strings, so wrapping them in an array and
serializing never reintroduces JSON's undefined/`null` collapse.

Use this via the `key:` option of [memoize](../../memoize/README.md) / the `@cached` decorator
when the default's JSON semantics would be a footgun.

## Parameters

### args

...`unknown`[]

The method/function arguments.

## Returns

`string`

The cache key.
