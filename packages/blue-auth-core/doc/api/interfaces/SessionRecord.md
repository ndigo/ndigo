[**@blue/auth-core v0.0.1**](../README.md)

***

[@blue/auth-core](../README.md) / SessionRecord

# Interface: SessionRecord

A stored server-side session.

Sessions are **opaque**: the session id (a random token) is the only
credential held by the client; the record below lives in the store.
Opaque sessions are trivially revocable (delete the record) and carry no
replay window — the deliberate contrast to JWTs, which stay for the
client/OIDC path (AD-33 D-6).

## Properties

### issuedAt

> `readonly` **issuedAt**: `number`

Issue timestamp in milliseconds.

***

### principal

> `readonly` **principal**: [`Principal`](Principal.md)

The authenticated principal.

***

### tokenVersion

> `readonly` **tokenVersion**: `number`

Token version at issue time (AD-33 D-7): the JWT `ver` claim must
match the user record's `tokenVersion`; sessions snapshot the value
they were issued under.
