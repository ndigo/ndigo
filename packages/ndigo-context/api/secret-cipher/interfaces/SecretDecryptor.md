[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [secret-cipher](../README.md) / SecretDecryptor

# Interface: SecretDecryptor

Decrypts raw resolved values against a scheme registry.

Implementations are injected into the property resolver (`ResolverOptions
.secretDecryptor`) and consulted for every string value after placeholder
resolution. Values that are not well-formed markers pass through unchanged;
marker values with an unknown scheme fail loud (never plaintext fallback).

## Methods

### decrypt()

> **decrypt**(`value`, `context`): `string`

Decrypts one resolved value.

#### Parameters

##### value

`string`

The resolved value (post-placeholder).

##### context

[`SecretDecryptContext`](SecretDecryptContext.md)

The resolution context (key path for AAD).

#### Returns

`string`

The decrypted value, or the value unchanged when not a marker.
