[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [scrypt-password-encoder](../README.md) / ScryptPasswordEncoder

# Class: ScryptPasswordEncoder

The reference [PasswordEncoder](../../password-encoder/interfaces/PasswordEncoder.md) implementation: scrypt via
`node:crypto` — a platform-audited primitive, zero dependencies (the
same reasoning that picked AES-GCM for `{cipher:...}`, AD-29).

Serialization is PHC-style with **parameters embedded** in the string:
`$ln=17,r=8,p=1$<salt>$<hash>`. Verification parses the stored
parameters, so older hashes keep verifying after a cost bump.
Argon2id is a documented future alternative implementation (AD-33 D-3);
the self-describing format keeps adding it purely additive.

Security properties:
- per-user 16-byte random salt (`randomBytes`);
- constant-time derived-key comparison (`timingSafeEqual`);
- malformed strings throw `UnknownPasswordSchemeError` — never a silent
  `false` that could mask a bad migration.

## Implements

- [`PasswordEncoder`](../../password-encoder/interfaces/PasswordEncoder.md)

## Constructors

### Constructor

> **new ScryptPasswordEncoder**(`options?`): `ScryptPasswordEncoder`

#### Parameters

##### options?

[`ScryptOptions`](../interfaces/ScryptOptions.md) = `{}`

#### Returns

`ScryptPasswordEncoder`

## Methods

### encode()

> **encode**(`rawPassword`): `string`

Hashes a password with a fresh salt using the configured scrypt
parameters.

#### Parameters

##### rawPassword

`string`

The plaintext password.

#### Returns

`string`

The PHC-style scrypt hash.

#### Implementation of

[`PasswordEncoder`](../../password-encoder/interfaces/PasswordEncoder.md).[`encode`](../../password-encoder/interfaces/PasswordEncoder.md#encode)

***

### needsRehash()

> **needsRehash**(`encodedPassword`): `boolean`

Whether the stored parameters differ from the current configuration.

#### Parameters

##### encodedPassword

`string`

The stored scrypt hash.

#### Returns

`boolean`

Whether a rehash is recommended.

#### Implementation of

[`PasswordEncoder`](../../password-encoder/interfaces/PasswordEncoder.md).[`needsRehash`](../../password-encoder/interfaces/PasswordEncoder.md#needsrehash)

***

### verify()

> **verify**(`rawPassword`, `encodedPassword`): `boolean`

Verifies a password against a PHC-style scrypt hash in constant time.

#### Parameters

##### rawPassword

`string`

The plaintext password.

##### encodedPassword

`string`

The stored scrypt hash.

#### Returns

`boolean`

Whether the password matches.

#### Implementation of

[`PasswordEncoder`](../../password-encoder/interfaces/PasswordEncoder.md).[`verify`](../../password-encoder/interfaces/PasswordEncoder.md#verify)
