[**@blue/auth-core v0.0.1**](../README.md)

***

[@blue/auth-core](../README.md) / PasswordEncoder

# Interface: PasswordEncoder

Verifies and produces self-describing password hashes.

The contract is Spring-shaped (encode + verify + rehash hook) with
BlueJS/JS names: `verify` not `matches` (`matches` is BlueJS vocabulary
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

#### Returns

`string`

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
