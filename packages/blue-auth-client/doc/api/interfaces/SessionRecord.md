[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / SessionRecord

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

Account `tokenVersion` snapshot at issue time (AD-33 D-7). The JWT
`ver` claim is compared against the live account value on every
validation; opaque sessions deliberately do NOT compare it, because
that counter advances on JWT refresh rotation and must never log out
server sessions. Sessions revoke by deletion — see
[SessionStore.deleteForUser](SessionStore.md#deleteforuser).
