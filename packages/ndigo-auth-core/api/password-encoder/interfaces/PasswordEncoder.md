[**@ndigo/auth-core v0.0.1**](../../README.md)

***

[@ndigo/auth-core](../../README.md) / [password-encoder](../README.md) / PasswordEncoder

# Interface: PasswordEncoder

Verifies and produces self-describing password hashes.

The contract follows the reference shape (encode + verify + rehash hook) with
Ndigo/JS names: `verify` not `matches` (`matches` is Ndigo vocabulary
for pattern matching; `verify` is the auth vocabulary — see the wrapped
`jose.jwtVerify`).

Hash strings are **self-describing**: they carry their scheme and
parameters (`{scrypt}$ln=17,r=8,p=1$<salt>$<hash>` — PHC-style
serialization), so cost-parameter bumps never invalidate stored hashes
and `needsRehash` drives transparent migration at login time.

Implementations MUST verify in constant time relative to the hash
(constant-time compare on the derived key) and MUST fail closed on
malformed input.

Note: encoding/verification is CPU-bound synchronous work (scrypt,
~100ms at default cost). Frame it behind rate limiting on credential
endpoints (see the auth completion plan, Wave 3).

## Methods

### encode()

> **encode**(`rawPassword`): `string`

Hashes a raw password into a self-describing string.

#### Parameters

##### rawPassword

`string`

The plaintext password.

#### Returns

`string`

The self-describing hash.

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

The stored hash to inspect.

#### Returns

`boolean`

Whether a rehash is recommended.

***

### verify()

> **verify**(`rawPassword`, `encodedPassword`): `boolean`

Returns `true` only when `rawPassword` derives to `encodedPassword`.
Never throws for a mismatch; fails loud (`UnknownPasswordSchemeError`)
on an unrecognized scheme.

#### Parameters

##### rawPassword

`string`

The plaintext password to verify.

##### encodedPassword

`string`

The stored self-describing hash.

#### Returns

`boolean`

Whether the password matches.
