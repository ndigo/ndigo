[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [secret-cipher](../README.md) / SecretCipher

# Interface: SecretCipher

A secret-at-rest cipher backend (AD-29 D-3/D-4).

Implementations are identified by their [SecretCipher#scheme](#scheme) —
the marker's dispatch key. The contract is intentionally narrow:
`encrypt(plain, aad?) → marker`, `decrypt(marker, aad?) → plain`.

## Properties

### capabilities

> `readonly` **capabilities**: [`SecretCipherCapabilities`](SecretCipherCapabilities.md)

Capabilities for the wiring capability gate.

***

### scheme

> `readonly` **scheme**: `string`

The scheme id dispatched on markers (`cipher`, `jwe`, `age`, `kms`).

## Methods

### decrypt()

> **decrypt**(`marker`, `aad?`): `string`

Decrypts a secret marker back to plaintext.

#### Parameters

##### marker

`string`

The stored marker (`{scheme[:version]:payload}`).

##### aad?

`string`

The additional authenticated data the value was bound to.

#### Returns

`string`

The plaintext value.

#### Throws

On tamper, wrong key, or unknown scheme/version.

***

### encrypt()

> **encrypt**(`plain`, `aad?`): `string`

Encrypts a plaintext value into a secret marker.

#### Parameters

##### plain

`string`

The plaintext value.

##### aad?

`string`

Optional additional authenticated data (the key path).

#### Returns

`string`

The versioned secret marker to store in configuration.
