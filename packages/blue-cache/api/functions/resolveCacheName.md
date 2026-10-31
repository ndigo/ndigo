[**@blue/cache v0.0.1**](../README.md)

***

[@blue/cache](../README.md) / resolveCacheName

# Function: resolveCacheName()

> **resolveCacheName**(`nameOrToken`, `context`): `string`

Resolves a cache store name from a string or a typed store token (AD-34
D7): a token-identified store uses the token's description as its name.
The single validation shared by every name/token entry point.

## Parameters

### nameOrToken

`string` \| [`ContextToken`](#)\<[`Cache`](../interfaces/Cache.md)\<`unknown`\>\>

The cache name or typed store token.

### context

`string`

Caller name used as the validation error prefix.

## Returns

`string`

The non-empty store name.

## Throws

When the resolved name is not a non-empty string.
