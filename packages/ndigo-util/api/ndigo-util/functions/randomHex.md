[**@ndigo/util v0.0.1**](../../README.md)

***

[@ndigo/util](../../README.md) / [ndigo-util](../README.md) / randomHex

# Function: randomHex()

> **randomHex**(`byteLength`): `string`

Generates a cryptographically secure random lowercase hex string of
`byteLength` bytes — 2 hex characters per byte.

Backed by `globalThis.crypto.getRandomValues` (Node.js 15+, all modern
browsers) with the same fail-closed contract as [randomToken](randomToken.md): if
Web Cryptography is unavailable it throws instead of degrading to an
insecure PRNG. Use it for collision-resistant filenames, request ids, and
other non-secret unique names; use [randomToken](randomToken.md) when the value is a
secret that benefits from base64url's entropy per character.

## Parameters

### byteLength

`number`

Number of random bytes to draw; must be a positive integer.

## Returns

`string`

A lowercase hex string of `byteLength * 2` characters.

## Throws

If `byteLength` is not a positive integer.

## Throws

If the Web Cryptography API is unavailable.

## Example

```ts
randomHex(8);
//=> 'a3f09c12de45b7e8' (16 chars)
```
