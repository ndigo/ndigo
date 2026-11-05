[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [aes-gcm-cipher](../README.md) / AESGCMCipher

# Class: AESGCMCipher

AES-256-GCM [SecretCipher](#) implementation (AD-29 rung 1).

The reference backend for at-rest config secrets: zero dependencies
(platform-standard `node:crypto`), versioned marker, key-path AAD binding.

## Implements

- [`SecretCipher`](#)

## Constructors

### Constructor

> **new AESGCMCipher**(`key`): `AESGCMCipher`

Creates a cipher over the given raw key.

#### Parameters

##### key

`string` \| `Buffer`\<`ArrayBufferLike`\> \| `Uint8Array`\<`ArrayBufferLike`\>

Base64 encoding of exactly 32 bytes, or the raw 32-byte
buffer/array. Any other length or non-base64 input fails loudly here.

#### Returns

`AESGCMCipher`

#### Throws

When the key is not exactly 32 bytes.

## Properties

### capabilities

> `readonly` **capabilities**: `Readonly`\<\{ `aad`: `true`; \}\>

Capabilities: AAD-binding supported (required by the wiring gate).

#### Implementation of

`SecretCipher.capabilities`

***

### scheme

> `readonly` **scheme**: `"cipher"` = `SCHEME`

The scheme id dispatched on markers: `cipher`.

#### Implementation of

`SecretCipher.scheme`

## Methods

### decrypt()

> **decrypt**(`marker`, `aad?`): `string`

Decrypts a `{cipher:v1:...}` marker back to plaintext.

#### Parameters

##### marker

`string`

The stored marker.

##### aad?

`string`

The additional authenticated data the value was bound to
(the key path). A mismatch fails auth.

#### Returns

`string`

The plaintext value.

#### Throws

On tamper, wrong key, wrong AAD, or an
unsupported scheme/version.

#### Implementation of

`SecretCipher.decrypt`

***

### encrypt()

> **encrypt**(`plain`, `aad?`): `string`

Encrypts a plaintext value into a `{cipher:v1:...}` marker.

#### Parameters

##### plain

`string`

The plaintext value.

##### aad?

`string`

Additional authenticated data (the key path).

#### Returns

`string`

The secret marker to store in configuration.

#### Implementation of

`SecretCipher.encrypt`

***

### fromEnvironment()

> `static` **fromEnvironment**(`environment?`): `AESGCMCipher`

Creates a cipher from `NDIGO_SECRET_KEY` in the environment.

#### Parameters

##### environment?

`Record`\<`string`, `string` \| `undefined`\> = `process.env`

The environment to read the key from (defaults to
`process.env`).

#### Returns

`AESGCMCipher`

The configured cipher.

#### Throws

When `NDIGO_SECRET_KEY` is missing or malformed.
