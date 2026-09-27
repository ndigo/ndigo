[**@blue/auth-server v0.0.1**](../README.md)

***

[@blue/auth-server](../README.md) / CredentialsAuthAdapterOptions

# Interface: CredentialsAuthAdapterOptions

Options for [CredentialsAuthAdapter](../classes/CredentialsAuthAdapter.md).

## Properties

### passwordEncoder

> **passwordEncoder**: `PasswordEncoder`

Hash verifier/encoder (`DelegatingPasswordEncoder` for multi-scheme).

***

### sessionStore

> **sessionStore**: [`SessionStore`](#)

Backing store for the issued opaque sessions.

***

### sessionTtlMs?

> `optional` **sessionTtlMs?**: `number`

Session lifetime in milliseconds (default 30 minutes).

***

### userStore

> **userStore**: `UserStore`

First-party user lookup (app-owned store, typically over `blue-orm`).
