[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [secret-cipher](../README.md) / SecretDecryptContext

# Interface: SecretDecryptContext

Context passed to a [SecretDecryptor](SecretDecryptor.md) for each resolved value.

## Properties

### key

> `readonly` **key**: `string`

The key path the value was resolved under (`db.password`) — the AAD
binding (ciphertext moved between key paths fails auth at lookup).
