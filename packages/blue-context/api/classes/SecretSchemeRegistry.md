[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / SecretSchemeRegistry

# Class: SecretSchemeRegistry

Registry mapping marker schemes to cipher backends.

Instances are immutable-safe by construction: ciphers are registered once
at wiring time; `get` performs the dispatch lookup.

## Implements

- [`SecretDecryptor`](../interfaces/SecretDecryptor.md)

## Constructors

### Constructor

> **new SecretSchemeRegistry**(): `SecretSchemeRegistry`

#### Returns

`SecretSchemeRegistry`

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

The number of registered cipher schemes.

##### Returns

`number`

## Methods

### decrypt()

> **decrypt**(`value`, `context`): `string`

Decrypts a raw resolved value by dispatching on its marker scheme.

Values that are not well-formed secret markers pass through unchanged.
A marker whose scheme is not registered throws `IllegalStateError`
naming the scheme — never a plaintext fallback for something that
declares itself a secret.

#### Parameters

##### value

`string`

The resolved value (post-placeholder resolution).

##### context

[`SecretDecryptContext`](../interfaces/SecretDecryptContext.md)

The resolution context (key path, used as AAD).

#### Returns

`string`

The decrypted value or the value passed through.

#### Throws

On unknown scheme, tamper, or wrong key.

#### Implementation of

[`SecretDecryptor`](../interfaces/SecretDecryptor.md).[`decrypt`](../interfaces/SecretDecryptor.md#decrypt)

***

### register()

> **register**(`cipher`): `void`

Registers a cipher backend, enforcing the capability gate.

A backend that cannot supply key-path AAD binding is refused with an
`IllegalStateError` naming the scheme — pluggability must never quietly
downgrade the threat model. Duplicate schemes replace (re-registration
wins), so rotating an implementation in place is a plain re-wire.

#### Parameters

##### cipher

[`SecretCipher`](../interfaces/SecretCipher.md)

The cipher backend to register.

#### Returns

`void`

#### Throws

When `cipher.capabilities.aad` is false.
