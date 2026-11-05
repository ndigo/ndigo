[**@ndigo/util v0.0.1**](../../README.md)

***

[@ndigo/util](../../README.md) / [crypto](../README.md) / default

# Variable: default

> **default**: `object`

## Type Declaration

## Crypto

#### randomHex

> **randomHex**: (`byteLength`) => `string`

Generates a cryptographically secure random lowercase hex string of
`byteLength` bytes — 2 hex characters per byte.

Backed by `globalThis.crypto.getRandomValues` (Node.js 15+, all modern
browsers) with the same fail-closed contract as [randomToken](../random-token/functions/randomToken.md): if
Web Cryptography is unavailable it throws instead of degrading to an
insecure PRNG. Use it for collision-resistant filenames, request ids, and
other non-secret unique names; use [randomToken](../random-token/functions/randomToken.md) when the value is a
secret that benefits from base64url's entropy per character.

##### Parameters

###### byteLength

`number`

Number of random bytes to draw; must be a positive integer.

##### Returns

`string`

A lowercase hex string of `byteLength * 2` characters.

##### Throws

If `byteLength` is not a positive integer.

##### Throws

If the Web Cryptography API is unavailable.

##### Example

```ts
randomHex(8);
//=> 'a3f09c12de45b7e8' (16 chars)
```

#### randomToken

> **randomToken**: (`bytes`) => `string`

Generates a cryptographically secure random token of `bytes` length,
encoded as unpadded base64url (RFC 4648 §5).

Backed by `globalThis.crypto.getRandomValues`, which is available in
Node.js 15+ and all modern browsers; throws if the Web Cryptography API is
unavailable (fail closed rather than degrade to an insecure PRNG).

The output length is `ceil(bytes * 4 / 3)`, with no `=`, `+`, or `/`
characters. For a fixed byte count the encoding is identical to Node's
`Buffer#toString('base64url')`, so call sites can migrate without changing
token format.

##### Parameters

###### bytes

`number`

Number of random bytes to draw; must be a positive integer.

##### Returns

`string`

A base64url string with no padding.

##### Throws

If `bytes` is not a positive integer.

##### Throws

If the Web Cryptography API is unavailable.

##### Example

```ts
randomToken(32);
//=> 'U2xpoMkrQaQj2mZs6D4fJf9FmWP0nN1rQkzL7mBc3d8' (43 chars)
```
