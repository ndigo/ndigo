# AD-33: Auth completion — credentials, server sessions, refresh/revocation

**Date:** 2026-09-26
**Status:** Accepted — D-1..D-7 ratified and landed 2026-09-26/27 (all five
waves; see [docs/plans/2026-09-26_AUTH_COMPLETION.md](../plans/2026-09-26_AUTH_COMPLETION.md)).

## Background

The Framework Gap Analysis §3 Auth row records five missing capabilities
over the existing stack (`blue-auth-core` adapter seam — `AuthAdapter`
{`id`, `validate`, `authenticate`, `refresh`, `logout`} — `AuthRegistry`,
`AuthServer.validateAny` fail-closed adapter lists, `AuthRouteGuard`,
`jose`-based JWT): **no credential/password auth, no first-party user
store, no server session auth, no refresh-token flow, no revocation**.
The credential seam is literally stubbed: `JWTAdapter.authenticate` throws
"use a proper auth flow". Coupled gaps: the audit's **server-side session
store** row (M4 — `Session`/`DefaultSession` exist, no backing store, no
TTL, no persistence) and **rate limiting** (SEC-6 — credential auth
without throttling is a brute-force hole). This ADR ratifies the shape for
closing all three.

The repo's settled pattern applies (AD-19, AD-29): **own the contract,
wrap the ecosystem standard, use platform standard APIs directly** — and
the design-space was narrowed in working session: `PasswordEncoder` names
follow JS/TS + BlueJS vocabulary, no speculative `Verifier` interface, and
the generalization point stays the existing `AuthAdapter` seam.

## Decisions

### D-1 — `PasswordEncoder` contract: Spring shape, BlueJS/JS names

`blue-auth-core` gains:

```ts
interface PasswordEncoder {
    encode(rawPassword: string): string; // self-describing hash
    verify(rawPassword: string, encodedPassword: string): boolean;
    needsRehash(encodedPassword: string): boolean; // scheme or params outdated
}
```

The shape mirrors Spring Security's `PasswordEncoder` (`encode`/`matches`);
the verify method is named **`verify`**, not `matches` — deliberate
deviation. `matches` is already BlueJS vocabulary for _pattern matching_
(`Matchable`, `MediaType.matches`, dispatcher conditions, interceptor
guards); `verify` is the repo's existing auth vocabulary (adapter JSDoc
"verify identities", route-guard, the wrapped `jose.jwtVerify`) and the JS
ecosystem's convergent name (`argon2.verify`). `needsRehash` follows the
JS password-lib convention and BlueJS's `can*` predicate shape; it is the
`upgradeEncoding` hook under a name that states the reason.

### D-2 — Self-describing format + delegating encoder; unknown scheme fails closed

Encoded hashes are prefixed with their scheme: `{scrypt}$ln=17,r=8,p=1$<salt>$<hash>`
(PHC-style serialization — formatting only, no crypto invented) with
**parameters embedded**, so cost bumps never invalidate stored hashes.
`DelegatingPasswordEncoder(encoders, defaultId)` dispatches `verify` on the
prefix and routes `encode` to the default. An unknown or malformed scheme
**throws** (`UnknownPasswordSchemeError` — Spring 5.8+ parity): loud
fail-closed, never a silent `false`, never a `{noop}`-style fallthrough.
`needsRehash` on the delegating encoder is the transparent-migration hook:
login flows rehash when the stored scheme/params no longer match the
configured default.

### D-3 — scrypt via `node:crypto` is the reference implementation; argon2id deferred

`ScryptPasswordEncoder` uses `node:crypto.scrypt` + a per-user 16-byte
random salt (`randomBytes`) + `timingSafeEqual` on the derived-key compare,
with `ln`/`r`/`p`/key-length configurable and serialized into the hash
string. Zero dependencies, platform-audited — the same reasoning that
picked AES-GCM for `{cipher:...}` (AD-29). **argon2id is deferred** as a
documented alternative adapter implementation (D-2's format commitment
makes adding it purely additive: new prefix, old hashes keep verifying,
`needsRehash` migrates logins). No native-binding dep enters the framework
for a preference.

### D-4 — No `Verifier` interface

Password verification is boolean-shaped; the repo's other verification
seam — `AuthAdapter.validate(token): Promise<Principal | null>` — is
identity-shaped. There is no consumer that needs polymorphism over
boolean verifiers, and TS structural typing makes the deferral free: a
future TOTP/captcha check with the same shape is assignable wherever a
consumer wants it. The generalization point is the existing `AuthAdapter`,
not a new `blue-core` contract. Extract a `Verifier` (next to `Matchable`)
only if a second boolean-shaped credential verifier materializes.

### D-5 — First-party credentials adapter on the existing seam

`CredentialsAuthAdapter` (`id: 'credentials'`) implements `AuthAdapter`
unchanged:

- `authenticate({ username, password })` → `UserStore.findByUsername` +
  `PasswordEncoder.verify` (with a dummy-hash verify when the user is
  missing, equalizing timing and preventing user enumeration) → issues an
  **opaque session token**; failure throws `InvalidCredentialsError` (one
  generic message for wrong password, unknown user, disabled account).
- `validate(token)` → `SessionStore.get` → principal, or `null`.
- `refresh(token)` → session **rotation** (new id, old deleted).
- `logout(token)` → session delete.

Registered via the existing `AuthRegistry`; `AuthServer.validateAny` and
`AuthRouteGuard` consume it without change.

### D-6 — Opaque server sessions in HttpOnly cookies; store contract open

First-party, server-rendered auth uses **opaque tokens** (32 bytes
`randomBytes`, base64url), not JWTs: trivially revocable, no replay
window. `SessionStore` contract in `blue-auth-server` (mirroring the
`QueueMessageStore` shape — `kind` string, in-memory first, Redis/LibSQL
later): `create(record, ttlMs)`, `get(id)`, `rotate(id, record)`,
`delete(id)`; TTL checked on read, opportunistic sweep on create. Cookie
flags: `HttpOnly`, `SameSite=Lax`, `Secure` when configured (production),
`Path=/`. **Session id rotates on login** (fixation protection) and on
privilege change. The M4 gap narrows to "persistent backend" — the
contract is the deliverable; the server-rendered feature works in-memory.

### D-7 — JWT refresh and revocation via token version

`JWTAdapter` gains real `refresh`/`logout` semantics (currently stubs):
JWTs carry a `ver` claim mirrored in the user record's `tokenVersion`
(`UserStore.findById`/`findByUsername`). Validation checks `ver` when the
store is configured (revocation costs one user-record read per
validation; a short-TTL cache is the documented mitigation). Refresh
tokens are **single-use and rotate**: a new access token + new refresh
token on every refresh; presenting a rotated-out refresh token revokes the
whole family (reuse detection). `logout` bumps `tokenVersion`, invalidating
all outstanding tokens for that user — the same mechanism serves both
revocation and rotation.

## Risks

| Risk                                           | Mitigation                                                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Unknown-scheme throw breaks legacy strings     | Loud failure is the point (Spring 5.8+ parity); migration path is `needsRehash` on login — zero-downtime rehash |
| Wrong-password timing leaks username existence | Dummy-hash verify on missing user; constant-time compare via `timingSafeEqual`                                  |
| Session fixation / hijack                      | Rotation on login (D-5/D-6); HttpOnly + SameSite cookies; `Secure` in production config                         |
| Brute force on credentials                     | Wave 3 rate limiter (SEC-6) — mandated for login routes, see plan                                               |
| CSRF over cookie sessions                      | Existing double-submit-cookie interceptor applies to login/logout (mutating); plan pins specs for it            |
| Revocation read cost per JWT validation        | `ver` check behind `UserStore` with documented short-TTL cache option                                           |
| Trusted-proxy absence limits client-IP keying  | Rate limiter keys on socket remote address; `X-Forwarded-For` support stays a Tier-2 deferral, documented       |

## Verification

Per-wave gates in the plan (package `vitest run` + `tsc -b`, demo smoke on
`apps/blue-api`, security matrix: fail-closed scheme handling, fixation
rotation, reuse detection, 429 + `Retry-After`, CSRF on login/logout).
On landing: gap-analysis §2.1 rate-limiting row, §2.2 session-store row and
§3 Auth row flipped to IMPLEMENTED with ADR/plan links; `graft build`
refreshed.
