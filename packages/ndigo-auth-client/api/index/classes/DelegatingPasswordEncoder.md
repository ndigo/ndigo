[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [index](../README.md) / DelegatingPasswordEncoder

# Class: DelegatingPasswordEncoder

Multi-scheme [PasswordEncoder](../interfaces/PasswordEncoder.md) that dispatches on the `{scheme}`
prefix of each hash (the `DelegatingPasswordEncoder` shape, without
the legacy `{noop}` fallthrough).

- `encode` routes to the configured default scheme and wraps the result
  with its id: `{scrypt}$ln=17,r=8,p=1$…`.
- `verify` parses the prefix and delegates; an **unknown or missing
  scheme throws** (`UnknownPasswordSchemeError`) — loud fail-closed,
  never a silent `false`, never an accept-as-plaintext path.
- `needsRehash` is `true` for any non-default scheme, plus whatever the
  underlying scheme reports (cost-parameter drift) — the transparent
  migration hook: new logins rehash onto the default scheme.

Usage:
```ts
const encoder = new DelegatingPasswordEncoder(
    { scrypt: new ScryptPasswordEncoder() },
    'scrypt',
);
```
Adding argon2id later (AD-33 D-3) is purely additive: register the
adapter under `'argon2id'`; old scrypt hashes keep verifying and
`needsRehash` migrates logins onto the new default.

## Implements

- [`PasswordEncoder`](../interfaces/PasswordEncoder.md)

## Constructors

### Constructor

> **new DelegatingPasswordEncoder**(`encoders`, `defaultId`): `DelegatingPasswordEncoder`

#### Parameters

##### encoders

`Readonly`\<`Record`\<`string`, [`PasswordEncoder`](../interfaces/PasswordEncoder.md)\>\>

##### defaultId

`string`

#### Returns

`DelegatingPasswordEncoder`

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
