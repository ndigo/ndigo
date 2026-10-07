[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / createViewCacheKey

# Function: createViewCacheKey()

> **createViewCacheKey**(`name`, `language?`): `string`

Builds an unambiguous cache key for a view name/language pair.

The key MUST distinguish every distinct pair: a naive
`` `${name}_${language}` `` join collides — `('user_en', 'US')` and
`('user', 'en_US')` both yield `user_en_US` — and would serve the first
resolved view for the second pair. JSON-encoding the tuple preserves the
`_` characters inside each component while keeping them separate.

## Parameters

### name

`string`

The view name.

### language?

`unknown`

Optional language/locale hint.

## Returns

`string`

A collision-free cache key.
