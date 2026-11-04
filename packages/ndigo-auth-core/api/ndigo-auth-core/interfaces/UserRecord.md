[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [ndigo-auth-core](../README.md) / UserRecord

# Interface: UserRecord

A framework-owned view of a first-party user account.

Implementations are app-owned: the classic Spring `UserDetailsService`
split — the framework owns the contract, the application owns the data
(typically a `@ndigo/orm`/Drizzle entity). The framework ships no
reference store; `packages/ndigo-auth-core/test/fixtures` provides an
in-memory implementation for tests and demos.

## Properties

### disabled?

> `readonly` `optional` **disabled?**: `boolean`

Disabled accounts never authenticate (single generic denial).

***

### id

> `readonly` **id**: `string`

Stable unique identifier (principal `id`).

***

### passwordHash

> `readonly` **passwordHash**: `string` \| `null`

Self-describing password hash (`PasswordEncoder` output), or `null`
when the account has no password (e.g. OAuth-only, or an admin
bootstrap pending). A `null` hash never matches a password attempt.

***

### roles?

> `readonly` `optional` **roles?**: readonly `string`[]

Roles attached to the account.

***

### tokenVersion?

> `readonly` `optional` **tokenVersion?**: `number`

Token version for JWT revocation (AD-33 D-7): access/refresh tokens
carry a `ver` claim that must equal `tokenVersion`; bumping the
version revokes every outstanding token for the account.

***

### username

> `readonly` **username**: `string`

Unique login name.
