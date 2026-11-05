[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [secret-cipher](../README.md) / SecretCipherCapabilities

# Interface: SecretCipherCapabilities

Capability flags a cipher backend may declare.

## Properties

### aad

> `readonly` **aad**: `boolean`

Whether the backend supports additional authenticated data (AAD).
The decrypt path REQUIRES AAD binding (key-path AAD, AD-29 D-4); a
backend without it must be refused at wiring, never downgraded.
Compact JWE and age have no AAD slot — a hypothetical adapter for
them must return `false` here and be rejected by the capability gate.
