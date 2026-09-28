# 2026-09-26 Auth Completion — credentials, server sessions, refresh/revocation

**Status:** ✅ **All five waves implemented 2026-09-26/27** — Wave 1
(password hashing) + Wave 2 (server sessions/credentials) + Wave 3 (rate
limiting) + Wave 4 (JWT refresh/revocation) + Wave 5 (hardening, docs,
audit flip) landed; ratified by
[AD-33](../decisions/2026-09-26_AD33_AUTH_CREDENTIALS_AND_SESSIONS.md)
(D-1..D-7); supersedes the §9a `@blue/auth`
design sketch of `docs/plans/2026-05-28_AUTH_DESIGN.md` where they conflict
(the adapter seam evolved from `AuthenticationStrategy` to `AuthAdapter` /
`AuthRegistry` / `AuthServer.validateAny`).

**Scope:** The Framework Gap Analysis rows: §3 **Auth** ("No
credential/password auth or first-party user store, no refresh-token flow,
no revocation, no server session auth"), §2.2 **server-side session store**
(audit M4), and §2.1 **rate limiting** (SEC-6, "named missing … not
landed") — the latter because credential auth without throttling is a
brute-force exposure. Out of scope (documented deferrals): WebAuthn/
passkeys, MFA, SAML, provider federation, RBAC beyond `@authorized`,
trusted-proxy client-IP resolution — **IMPLEMENTED 2026-09-28 (AD-37)**:
the limiter keys on the resolved client behind explicitly trusted proxies.

**Companion docs:** [AD-33](../decisions/2026-09-26_AD33_AUTH_CREDENTIALS_AND_SESSIONS.md)
(decisions D-1..D-7), [Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md)
§2/§3, remediation plan SEC-5/SEC-6 (`docs/plans/2026-09-04_REPOSITORY_REMEDIATION.md`),
AD-19 (contract → ecosystem → platform pattern).

---

## 1. Problem

The auth seam is complete (`AuthAdapter` {`id`, `validate`, `authenticate`,
`refresh`, `logout`}, `AuthRegistry`, fail-closed `AuthServer.validateAny`,
`AuthRouteGuard`, JWT via `jose`) — but the credential path is a stub
(`JWTAdapter.authenticate` throws "use a proper auth flow"), sessions are
in-memory per-request (`DefaultAuthSession`, no store, no TTL — audit M4),
JWT has no refresh or revocation, and nothing throttles credentials
(SEC-6). Delivering first-party auth means: password hashing + user store,
opaque server sessions, and refresh/revocation semantics on the existing
adapter contract — with the rate limiter alongside, or the whole feature is
unsafe to ship.

## 2. Decisions (ratified by AD-33)

- **D-1 — `PasswordEncoder` contract** in `blue-auth-core`: `encode(raw)`,
  `verify(raw, encoded)`, `needsRehash(encoded)`. Spring shape; `verify`
  not `matches` (BlueJS `matches` = pattern matching; `verify` = existing
  auth vocabulary + `jose.jwtVerify`).
- **D-2 — Self-describing format:** `{scrypt}$ln=17,r=8,p=1$<salt>$<hash>`,
  parameters embedded; `DelegatingPasswordEncoder` dispatches on prefix,
  unknown scheme **throws** (fail-closed, Spring 5.8+ parity); `needsRehash`
  drives transparent migration.
- **D-3 — scrypt via `node:crypto`** (zero-dep, platform-audited) is the
  reference implementation; argon2id deferred as a documented additive
  adapter.
- **D-4 — No `Verifier` interface.** Boolean verify stays on
  `PasswordEncoder`; identity verification stays on `AuthAdapter`. Extract
  only when a second boolean verifier consumer materializes.
- **D-5 — `CredentialsAuthAdapter`** (`id: 'credentials'`) implements the
  existing `AuthAdapter` unchanged: `authenticate` (UserStore +
  PasswordEncoder, dummy-hash timing equalization, generic
  `InvalidCredentialsError`), `validate` (SessionStore), `refresh`
  (rotation), `logout` (delete).
- **D-6 — Opaque server sessions:** 32-byte random tokens, HttpOnly /
  SameSite=Lax / Secure cookies, rotation on login (fixation),
  `SessionStore` contract with `kind` (in-memory first; Redis/LibSQL
  later, `QueueMessageStore` precedent). M4 narrows to "persistent
  backend".
- **D-7 — JWT refresh/revocation via `ver` claim + user-record
  `tokenVersion`:** single-use rotating refresh tokens, reuse detection
  revokes the family, `logout` bumps the version.

## 3. Risks

| Risk                                             | Mitigation                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Brute force on login                             | Wave 3 rate limiter; login routes carry `@rateLimit` in the demo              |
| User enumeration via timing/messages             | Dummy-hash verify; one generic 401 message                                    |
| Session fixation/hijack                          | Rotation on login; cookie flags; Secure in prod config                        |
| Unknown-scheme strings at runtime                | Loud throw + `needsRehash` migration path                                     |
| CSRF on cookie-session mutations                 | Existing double-submit-cookie interceptor; Wave 4 pins specs for login/logout |
| Revocation costs a store read per JWT validation | Documented short-TTL cache option (implemented in Wave 4)                     |
| Proxy deployments break IP keying                | **CLOSED 2026-09-28 (AD-37)** — allowlist-gated X-Forwarded-For chain walk; limiter keys on the resolved client                                          |

## 4. Sequencing

### Wave 1 — Password hashing contracts ✅ implemented 2026-09-26

- `src/password-encoder.ts` — `PasswordEncoder` interface (D-1).
- `src/delegating-password-encoder.ts` — prefix dispatch, default scheme,
  `UnknownPasswordSchemeError` on unknown/malformed prefix (D-2).
- `src/scrypt-password-encoder.ts` — `node:crypto.scrypt`, 16-byte salt,
  `timingSafeEqual`, PHC-style serialization with embedded `ln/r/p`/key
  length; params configurable; `needsRehash` true when scheme ≠ default or
  params differ (D-3).
- `src/user-store.ts` — `UserRecord { id, username, passwordHash, roles?,
tokenVersion?, disabled? }` + `UserStore { findByUsername, findById }`.
  Apps implement the store over `blue-orm`/Drizzle entities;
  `test/fixtures/in-memory-user-store.ts` is the shipped test/demo fixture
  (no framework-owned reference store in v1 — user storage is app data).
- Specs `test/password-encoder.spec.ts` (20): encode/verify round-trip,
  prefix dispatch, unknown-scheme throw, malformed-string throw,
  wrong-password `false`, tampered-hash `false`, `needsRehash` on
  scheme/param/key-length drift, cost-parameter round-trip through the
  string (a default-param encoder verifies an `ln=15` hash), option
  validation.

**As-built notes (execution-discovered):**

- `scryptSync(password, salt, keylen, options)` — the key length is a
  positional argument, NOT an options field (the initial implementation
  passed it inside the options object; TS picked the `keylen: number`
  overload and the runtime failed). `maxmem` must be raised explicitly:
  Node's 32 MiB default rejects the recommended cost
  (`128 * r * N` bytes); the implementation passes `128*r*N*2`.
- **`verify` derives with the hash's stored parameters, never the
  encoder's configured ones.** Parsing params for rehash-detection but
  deriving with configured defaults would silently reject every
  pre-bump hash — the self-describing format exists precisely so cost
  bumps are backward-compatible. `needsRehash` compares stored params to
  configured ones (the migration trigger); `verify` follows the stored
  string.
- The delegating encoder's `encode` **always** wraps with `{scheme}`
  (including for custom schemes): the prefix is the dispatch key, so
  unwrapped output would later throw on `verify`.

- **Gate:** `vitest run` 53/53 + `tsc -b` green in `blue-auth-core`;
  dependent packages re-run — `blue-auth-client` 70/70,
  `blue-auth-server` 42/42, all four `tsc -b` builds green (additive
  exports only).

### Wave 2 — Server sessions + credentials adapter ✅ implemented 2026-09-27

- `@blue/auth-core` `src/session-store.ts` — `SessionRecord { principal,
tokenVersion?, issuedAt }` + `SessionStore { kind, create(record, ttlMs),
get, rotate, delete }` (D-6). **As-built: the contract lives in
  `blue-auth-core`, not `blue-auth-server`** — the node platform's
  `NodeSessionInterceptor` types against it, and platform-node's
  peer-dependency surface is `auth-core` only.
- `blue-auth-server` `src/in-memory-session-store.ts` — Map + expiry-on-read
    - opportunistic sweep (past 512 entries); rotate deletes the old id first
      (fixation), throws on unknown (fail closed); 32-byte `randomBytes` ids.
- `blue-auth-server` `src/credentials-auth-adapter.ts` — `CredentialsAuthAdapter`
  (D-5): one generic `InvalidCredentialsError`, dummy-hash timing
  equalization, disabled/no-hash denial, validate/refresh(rotation)/logout
  on the existing `AuthAdapter` seam.
- `blue-auth-server` `src/in-memory-user-store.ts` — packaged convenience
  store for tests/demos, **moved from the Wave-1 `auth-core/test/fixtures`
  location** so applications can import it.
- `blue-platform-node` `src/session-cookie.ts` — `SESSION_COOKIE =
'blue-session'`, HttpOnly + SameSite=Lax + Path=/ (+ Secure by default,
  opt-out for localhost), clear value with Max-Age=0 + epoch Expires;
  `setSessionCookie`/`clearSessionCookie` write the node response.
- `blue-platform-node` `src/node-session-interceptor.ts` — reads the cookie,
  resolves the store, fills the documented `request.session` bag
  (`principal`/`token`) before dispatch; absent/unknown/expired ⇒ empty bag
  (anonymous, guard denies).
- `blue-api` demo: `auth-store.ts` rewritten on the real machinery (demo
  users with scrypt `'demo'` hashes, adapter registered on `AuthRegistry`);
  `AuthController` login issues body token + HttpOnly cookie, logout clears
    - invalidates, `GET /auth/me` is the protected route (cookie →
      adapter.validate → 401/200).

**As-built notes (execution-discovered):**

- **The store issues session ids, not the adapter.** The first cut generated
  `randomBytes(32)` in `CredentialsAuthAdapter` and ignored `create`'s
  return — `validate` then never matched (spec caught it). The store is the
  single source of truth for ids; `rotate` returns the new id.
- **`lookupPrincipal` went async** (session-store backed): every demo
  consumer (`note-controller`, `drizzle-note-controller` ×3,
  `config-secrets-controller`, socket authenticator) had
  `!lookupPrincipal(x)` truthiness guards that silently pass for a Promise.
  All six sites fixed with `await`; sync handlers became async. The socket
  authenticator returns the promise (the platform awaits it, and its
  `authenticate` signature already allows `Promise<…>`).
- **Mapping-level `AuthRouteGuard` wiring is one-owner-per-bean:** the
  strategy reads the `handlerMappings` collection via `setValue`-style
  registration — a second `handlerMappings` bean would clobber
  `ManagementAutoConfiguration`'s. The demo therefore enforces `/auth/me`
  in-handler through the adapter and exercises `@authenticated` +
  `AuthRouteGuard` in the auth-server spec suite (existing). Mapping wiring
  stays a documented application pattern with a single collection owner.
- **MockHTTP models cookies separately from headers** (`request.cookies` /
  `.cookies({...})`); the `Cookie:` request header never reaches
  `NodeRequest.cookies`, so cookie specs must use the builder's `.cookies()`.
  The real adapter parses the header (verified in the live curl smoke).
- `Promise.withResolvers` is the repo-wide delay idiom (`@types/node`
  provides the declaration; the base tsconfig's ES2022 lib is fine).

- **Gate:** `vitest run` + `tsc -b` in `blue-auth-server` (63/63 incl. 21
  new) and `blue-platform-node` (399/399 incl. 9 new); `blue-api` 59/59
  (8 files, incl. 7 new cookie-session specs: cookie flags, fixation
  rotation, `/auth/me` 200/401 matrix, logout invalidation + clear, login
  body contract preserved); live smoke on `apps/blue-api` (PORT=3100):
  curl login → HttpOnly cookie jar → `/auth/me` 200 → logout
  `Max-Age=0` → `/auth/me` 401.

### Wave 3 — Rate limiting ✅ implemented 2026-09-27 (SEC-6)

- `blue-platform-node` `src/rate-limit.ts` — `RateLimitPolicy { limit,
windowMs }`, `RateLimitResult { allowed, retryAfterMs }`, `RateLimiter`
  contract (distributed-backend seam) + `FixedWindowRateLimiter` reference
  (per-(key, window) counters, window slides on expiry, opportunistic
  sweep past 10 000 entries, `validateRateLimitPolicy` shared
  decoration/call-time validation).
- `blue-platform-node` `src/rate-limit-interceptor.ts` — `RATE_LIMIT_KEY
= 'rate:limit'`, `@rateLimit({ limit, windowMs })` passive metadata
  decorator (class- and method-scoped, method wins, validates at
  decoration), `RateLimitInterceptor` enforcing **429 + `Retry-After`
  (seconds)** problem documents (`ProblemTypes.rateLimited`, which already
  existed).
- **Default-on, metadata-gated:** `NodeAutoConfiguration.handlerMapping`
  pushes the interceptor plus a `rateLimiter()` bean — same posture as
  `SecurityHeadersInterceptor`; routes without `@rateLimit` pass through
  untouched (zero behavior change for existing apps).
- `NodeRequest.remoteAddress` (new field) populated by the adapter from
  `req.socket.remoteAddress`; the limiter keys on it.
- `blue-test` `MockHTTP`: `.remoteAddress()` fluent setter +
  per-request-unique default (`mock-peer-<n>`) so tests never share
  budgets accidentally; sharing is opt-in for rate-limit specs.
- Demo: `@rateLimit({ limit: 5, windowMs: 60_000 })` on `/auth/login` —
  the brute-force surface (Wave-2 credential auth + Wave-3 throttle are
  one story).

**As-built notes (execution-discovered):**

- **`X-Forwarded-For` was untouched here** (a spoofing hole if trusted
  unconditionally): the trusted-proxy feature (AD-37, 2026-09-28) later
  added allowlist-gated resolution — until then, proxy deployments shared
  the proxy's address (documented caveat: raise the limit or defer).
- **Client address was not available anywhere** — `NodeRequest` gained
  `remoteAddress` (additive; the adapter populates it; sockets don't need
  it). Without this seam the interceptor would have keyed on nothing.
- **Denial writing follows the CSRF precedent:** the interceptor writes
  the problem + `Retry-After` itself and returns `denialOf(429, …)` for
  the record — the platform's `#finalizeDenial` skips ended responses, so
  the header survives. `Retry-After` is `max(1, ceil(ms/1000))`.
- **MockHTTP header keys are normalized lowercase** — specs must read
  `headers['retry-after']`, not `'Retry-After'`.
- **Isolation default proved necessary:** without unique mock peers, the
  demo's `login()` helper (7+ logins per suite) would share one
  `mock-peer` bucket and trip the demo limit mid-suite.

- **Gate:** `vitest run` + `tsc -b` in `blue-platform-node` (410/410 incl.
  11 new rate-limit specs: boundary 3-ok/4-deny, window reset over time,
  per-key independence, policy validation, metadata passthrough, 429
  write + `Retry-After`, per-address isolation, method-over-class,
  unknown-address fallback key) and `blue-test` (17/17, builder changes
  additive); `blue-api` 60/60 incl. the demo block spec (5×401 →
  6th 429 + retry-after; other peer unaffected); live smoke on
  `apps/blue-api` (PORT=3101): five bad logins from 127.0.0.1 → 401 ×5,
  sixth → `HTTP/1.1 429`, `Retry-After: 59`, `urn:blue:rate-limited`
  body.

### Wave 4 — JWT refresh + revocation ✅ implemented 2026-09-27

- `UserStore` contract (auth-core) gained `incrementTokenVersion(id):
Promise<number>` — the revocation **write** the contract lacked (Wave 2
  deferred writes; revocation is impossible without one). Documented as a
  single atomic `UPDATE … SET token_version = token_version + 1`; the
  in-memory store + spec stubs implement it. Breaking-ish (pre-1.0,
  flagged for the API-freeze review; all implementers updated).
- `JWTAdapter` (auth-server):
    - `issueTokens(subject)` — mints access + refresh JWTs
      (`token_use` + `ver` claims), HS* configs only (asymmetric configs
      hold no signing key — external IdPs own issuance; loud `JWTTokenError`
      otherwise); with a store wired the account must exist + be enabled and
      `ver` snapshots the store's live `tokenVersion`, never a caller value.
    - `validate` — after crypto verification, a **`ver`-claim check** when a
      store is wired: framework-issued tokens whose version no longer
      matches are `null`. Tokens WITHOUT `ver` (external IdP) skip the check
      — revocation never rejects tokens this adapter didn't version
      (non-breaking for OIDC/JWKS validation).
    - `refresh(token)` — **version-advancing rotation**: verifies +
      requires `token_use: 'refresh'` + user enabled + version current, then
      `incrementTokenVersion` and issues a new pair at the new version.
      Reuse detection is by construction: any refresh advances the family,
      so a rotated-out refresh (or pre-refresh access token) fails the
      version comparison. Returns `JWTRefreshResult` (`token` = access +
      `refreshToken`).
    - `logout(token)` — verifies (access or refresh) then bumps the user's
      version: the whole family dies. Unverifiable tokens throw (revoke
      nothing).
    - `revocationCacheTtlMs` — optional short-TTL `tokenVersion` cache
      (default 0 = always read; invalidation on refresh/logout). JWT
      validation in the demo reads the store per request otherwise.
- `JWTTokenError` for the whole failure family; `refresh`/`logout`
  without a store throw (fail closed).

**As-built notes (execution-discovered):**

- **No rotation ledger — version-advancing rotation instead.** OAuth2 uses
  a `jti` ledger with family revocation; here every refresh advances
  `tokenVersion`, which kills ALL older tokens (not just the rotated
  refresh). That is the correct trade for short-lived access tokens
  (refresh happens on expiry; concurrent access validation after a refresh
  fails — bounded and documented). The ledger-free design is
  restart-safe; a persistent rotation ledger would only be needed for
  long-lived access tokens.
- **The version cache needs priming:** a `revocationCacheTtlMs` only
  defers visibility of bumps AFTER a first validation populated it (the
  first-cut spec asserted otherwise — fixed).
- **Two pinned stub tests deleted** (`refresh` throws, `logout` stateless
  no-op) — the behavior they pinned is the deliberate change (Wave 4
  deliverable), so they were removed, not re-pinned.

- **Gate:** `vitest run` 77/77 (16 new: issuance claims/version snapshot/
  unknown-user/asymmetric rejection, family-bump revocation, external-token
  passthrough, disabled accounts, rotation + new-pair validity, rotated-out
  reuse rejection, access-as-refresh rejection, junk/ghost rejection,
  storeless failure, logout bump + junk no-op, cache prime/defer/expire)
    - `tsc -b` green in `blue-auth-server`; dependents re-run — auth-client
      70/70, blue-api 60/60 over the rebuilt libs.

### Wave 5 — Hardening, docs, audit flip ✅ implemented 2026-09-27

- **CSRF pinned on auth mutations:** `CSRFInterceptor` renamed per the
  repo's acronym convention (was `CsrfInterceptor`; file name unchanged —
  matches `HTTPServer`/`AESGCMCipher`/`OIDCAdapter`). Integration pin in
  `apps/blue-api/test/auth.spec.ts`: a dedicated boot pushes the
  interceptor onto the platform mapping (the mapping has one owner — the
  default demo boot stays without it, documented), then asserts the
  double-submit flow end to end: first POST without a token → **403 +
  minted `blue-csrf` cookie**; cookie + matching `X-CSRF-Token` → login
  proceeds (200); mismatched header → 403. Auth mutations never run
  without a genuine token.
- **SEC-5 guidance:** `ManagementAutoConfigurationOptions.accessGuard`
  JSDoc now carries the production recommendation — wire `AuthRouteGuard`
  over the `'credentials'` adapter; bind-address separation and response
  redaction remain open deferrals.
- **Guide:** `docs/guides/11-authentication-and-sessions.md` — password
  hashing (scheme format, `needsRehash` migration, argon2id deferral),
  app-owned `UserStore` over blue-orm (incl. the atomic
  `incrementTokenVersion` update), cookie session flags + fixation, login
  rate limiting, CSRF wiring, JWT issuance/refresh/revocation semantics
  (incl. the no-ledger rotation trade), management endpoint posture,
  deferrals.
- **Gap analysis flipped to IMPLEMENTED:** §2.1 rate limiting row,
  §2.2 session-store row (M4 narrowed to "persistent backend"), §3 Auth
  row (argon2id noted deferred), §5 sequencing items 3 + 6; AD-33 + plan
    - guide added to References. ADR-33 status → "ratified and landed".

**As-built notes (execution-discovered):**

- **Acronym capitalization is the repo convention** (`HTTPServer`,
  `AESGCMCipher`, `OIDCAdapter`, `URLComparator`) — `CsrfInterceptor` was
  the outlier; renamed (user-confirmed). Historical plan docs keep the
  old spelling (dated records).
- **The §2.2 table is two-column** — the first IMPLEMENTED edit added a
  third column to the row; corrected to keep the marker inside the Notes
  cell.
- The CSRF wiring pin required its own boot: pushing the interceptor onto
  the shared demo mapping would block every mutating route in the shared
  suite; the dedicated boot isolates it and documents the one-owner
  constraint in the test comment.

- **Gate:** renamed class re-run (platform-node 410/410, tsc clean);
  blue-api 61/61 incl. the CSRF pin; final sweep across auth-core
  53/53, auth-server 77/77, auth-client 70/70, platform-node 410/410,
  blue-test 17/17, blue-api 61/61; `graft build` refreshed.

## 5. Verification

Per wave: changed-package `vitest run` + `tsc -b`, dependent packages
re-run where consumers exist, demo smoke on `apps/blue-api` for Waves 2–3,
`graft build` at the end. Final repo gate `pnpm build` if any cross-package
surface changed.
