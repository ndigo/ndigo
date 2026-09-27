[**@blue/auth-core v0.0.1**](../README.md)

***

[@blue/auth-core](../README.md) / ScryptPasswordEncoder

# Class: ScryptPasswordEncoder

The reference [PasswordEncoder](../interfaces/PasswordEncoder.md) implementation: scrypt via
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

- [`PasswordEncoder`](../interfaces/PasswordEncoder.md)

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

Hashes a raw password into a self-describing string.

#### Parameters

##### rawPassword

`string`

#### Returns

`string`

#### Implementation of

[`PasswordEncoder`](../interfaces/PasswordEncoder.md).[`encode`](../interfaces/PasswordEncoder.md#encode)

***

### needsRehash()

> **needsRehash**(`encodedPassword`): `boolean`

Returns `true` when the stored hash would not be produced by the
current configuration — a different scheme, or outdated cost
parameters/key length. Login flows rehash on `true` to migrate
stored hashes forward.

#### Parameters

##### encodedPassword

`string`

#### Returns

`boolean`

#### Implementation of

[`PasswordEncoder`](../interfaces/PasswordEncoder.md).[`needsRehash`](../interfaces/PasswordEncoder.md#needsrehash)

***

### verify()

> **verify**(`rawPassword`, `encodedPassword`): `boolean`

Returns `true` only when `rawPassword` derives to `encodedPassword`.
Never throws for a mismatch; fails loud (`UnknownPasswordSchemeError`)
on an unrecognized scheme.

#### Parameters

##### rawPassword

`string`

##### encodedPassword

`string`

#### Returns

`boolean`

#### Implementation of

[`PasswordEncoder`](../interfaces/PasswordEncoder.md).[`verify`](../interfaces/PasswordEncoder.md#verify)
