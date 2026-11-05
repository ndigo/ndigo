# AD-68: User-wide revocation — explicit session deletion, account version epoch for JWTs

**Date:** 2026-10-06
**Status:** Accepted — implemented (2026-10-06)

## Context

SE-7 residual from the 2026-10-06 review: disabling an account already revoked
its live credentials at validation, but there was no way to revoke _all_ live
credentials of an account on demand (password change, stolen device, admin
action). `SessionStore` exposed only per-id operations, and the account
`tokenVersion` epoch — already the JWT revocation primitive — was not wired to
opaque sessions. Digging in surfaced a second credential-family defect:
`JWTAdapter.validate` accepted framework **refresh** tokens (7-day TTL) as
access credentials because it never inspected `token_use`.

## Evidence

- `ndigo-auth-core/src/session-store.ts`: `SessionRecord` snapshots
  `tokenVersion` at issue, but nothing ever compared it; the contract had
  `create`/`get`/`rotate`/`delete` only — no user-wide operation.
- `ndigo-auth-server/src/jwt-adapter.ts`: `refresh` advances `tokenVersion`
  via CAS on **every** rotation (single-use reuse detection, SEC-6) and
  `logout` bumps it too — the counter is a rotation/revocation family
  counter, so it cannot double as an opaque-session epoch without logging
  sessions out on every JWT refresh.
- `validate` (pre-fix) returned `principalFromPayload` for any verified
  token with `sub`+`exp`; `[exec]` probe: a framework refresh token
  (`{sub, ver, token_use:'refresh', exp: +7d}`) validated as a principal —
  the short access-TTL control was bypassable with the long-lived refresh
  credential. Post-fix: `validate(refresh) → null`.
- No user-wide API existed anywhere: `AuthServer` holds no stores (the
  app owns `UserStore`), and `UserStore.incrementTokenVersion` was reachable
  only by holding the store directly.

## Decision

- **D-1** `SessionStore.deleteForUser(userId): Promise<number>` — required
  contract method (pre-1.0 hard cutover). Deletes every live session of the
  account and returns the count; expired-but-unswept entries are purged
  without being counted as live; idempotent. Implemented in
  `InMemorySessionStore` (map sweep) and `LibSQLSessionStore`
  (`DELETE … WHERE principal_id = ? AND expires_at > ?`).
- **D-2** `CredentialsAuthAdapter.logoutAll(userId)` — the app-facing
  user-wide revocation: deletes sessions first, then advances
  `tokenVersion`, so one call kills every opaque session **and** every
  outstanding JWT of the account. Fail-closed for unknown accounts.
- **D-3** Opaque sessions do **not** compare `tokenVersion`; the snapshot
  stays informational and is documented as such. Rejected: session-vs-version
  comparison (a JWT refresh would log out all server sessions) and a separate
  per-user session epoch (a second counter on the app-owned `UserStore` for
  an outcome explicit deletion already delivers immediately).
- **D-4** `validate`/`refresh` reject disabled/deleted accounts (SE-7
  parity), and `validate` accepts only `token_use: 'access'` — a present
  claim that is anything else fails closed (refresh tokens can never
  authenticate), while external IdP tokens without the claim are unaffected.

## Consequences

- Operators revoke a user everywhere with one call; disabling or deleting
  the account still revokes without any call (live account checks).
- `SessionStore` implementations must add `deleteForUser` (breaking,
  pre-1.0; both shipped stores implement it).
- JWT rotation semantics are unchanged; the cross-adapter behavior is now
  explicit: a user-wide revoke kills both credential families, while a JWT
  refresh never touches server sessions.

**Revisit trigger:** if applications need revocation without a per-request
user-record read, add an optional revocation list/cache behind the same
contract; if a second credential family ever needs its own epoch, revisit
D-3 rather than overloading `tokenVersion`.
