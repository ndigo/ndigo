# @blue/auth-playground — Blue Auth Playground

> Six authentication modes side by side, in one Node process: an opaque cookie
> session, short-lived JWTs with a refresh path, a role matrix over HTTP **and**
> sockets, login rate limiting, sessions that survive a restart, and a real
> OIDC authorization-code + PKCE flow against an issuer embedded in the same
> process.

One server (port `3110`) serves a small built browser client (`/static/client.js`)
that drives an auth-matrix UI; an embedded `oidc-provider` issuer listens on
`127.0.0.1:3111` so mode 6 needs no container and no external service. Every
mode is also reachable with `curl` — the transcripts below are real runs.

## Run

```bash
cd apps/18-blue-auth-playground
pnpm start              # server on http://127.0.0.1:3110 (client bundle served from dist/)
# or build the client and serve it in one go:
pnpm start:full
```

The client bundle is built by `pnpm build:client` (Vite lib build → `dist/client.js`).
For client work with HMR, run the server and the Vite dev server side by side:

```bash
pnpm start              # the server (and the embedded issuer)
pnpm dev                # client dev server on http://127.0.0.1:3440, proxying /auth /jwt /roles /oidc /static /health → 3110
```

Config is environment-driven, and every knob has a working default:

| Variable             | Default                                 | Meaning                                                       |
| -------------------- | --------------------------------------- | ------------------------------------------------------------- |
| `PORT`               | `3110`                                  | HTTP port                                                     |
| `SESSION_DB_URL`     | `file:./tmp/sessions.db`                | LibSQL session database (`tmp/` is git-ignored)               |
| `SESSION_TTL_MS`     | `1800000`                               | Opaque session lifetime (30 min)                              |
| `AUTH_COOKIE_SECURE` | `true`                                  | `Secure` attribute (and therefore the cookie name, see below) |
| `JWT_SECRET`         | a committed demo secret                 | HS256 signing key (set it in any real deployment)             |
| `JWT_ACCESS_TTL_MS`  | `60000`                                 | Access-token lifetime                                         |
| `JWT_REFRESH_TTL_MS` | `900000`                                | Refresh-token lifetime                                        |
| `OIDC_ENABLED`       | `true`                                  | Start the embedded issuer                                     |
| `OIDC_ISSUER_PORT`   | `3111`                                  | Its port                                                      |
| `OIDC_ISSUER_URL`    | `http://127.0.0.1:3111`                 | Issuer identifier (must match discovery exactly)              |
| `OIDC_CLIENT_ID`     | `blue-auth-playground`                  | The one registered public client                              |
| `OIDC_REDIRECT_URI`  | `http://127.0.0.1:<PORT>/oidc/callback` | Registered redirect URI                                       |
| `OIDC_ACCOUNT_ID`    | `oidc-demo`                             | The federated subject the issuer knows                        |

`GET /health` is the boot probe (`pnpm apps:smoke` convention).

## Modes

| #   | Mode                                | Endpoints                                                                             | How to try                                                                                                                                                                                                                                                                   |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Credentials + opaque session cookie | `POST /auth/login`, `GET /auth/me`, `POST /auth/elevate`, `POST /auth/logout`         | Log in at the UI, or `curl -c jar -X POST …/auth/login -d '{"username":"admin","password":"demo"}' -H 'content-type: application/json'`; watch the `Set-Cookie` flags; then `POST /auth/elevate` and watch the session id rotate                                             |
| 2   | JWT access + refresh                | `POST /jwt/login`, `GET /jwt/me`, `POST /jwt/refresh`                                 | `POST /jwt/login`, then `GET /jwt/me` with `Authorization: Bearer <accessToken>`; the UI's **GET /jwt/me** button shows the automatic refresh-once-and-retry flow                                                                                                            |
| 3   | Roles / permissions                 | `GET /roles/authenticated`, `GET /roles/admin`, `GET /roles/user`, `WS /roles/socket` | Same session id (cookie) or access token (Bearer): `admin` is refused `/roles/user`, `alice` is refused `/roles/admin`; the socket takes `?token=<id>` and fails closed with `1008`                                                                                          |
| 4   | Login rate limiting                 | `POST /auth/login`, `POST /jwt/login`                                                 | Six wrong logins from one address → the sixth is `429` + `Retry-After` (`urn:blue:rate-limited`); both credential endpoints share one budget per address                                                                                                                     |
| 5   | Durable sessions                    | `POST /auth/login`, `GET /auth/me`                                                    | Log in, `Ctrl-C` the server, start it again, then `GET /auth/me` with the same cookie — still `200`                                                                                                                                                                          |
| 6   | OIDC code + PKCE                    | `GET /oidc/start`, `GET /oidc/callback`, `GET /oidc/refresh`                          | Press **Start OIDC redirect** in the UI, or follow the transcript below; the issuer's dev-interaction pages ask for the login `oidc-demo`. The callback captures the provider refresh token server-side; `GET /oidc/refresh` with the session cookie rotates it (single-use) |

Demo accounts: `admin` (role `admin`), `alice` (role `user`), password `demo`.
`oidc-demo` exists as an account too, but carries **no password hash** — it is
reachable only through the embedded issuer.

## Security posture

What each mode actually demonstrates (and where the lines are):

- **Opaque sessions (mode 1).** The credential is a 32-byte random id issued by
  the store; the client holds it only as a cookie:
  `__Host-blue-session; HttpOnly; SameSite=Lax; Path=/; Secure`. `HttpOnly` means
  the demo's own JavaScript cannot read it (the UI shows the id only because the
  login _body_ returns it), `SameSite=Lax` blocks cross-site POSTs, and the
  `__Host-` prefix pins the cookie to this exact origin. `Secure` is the
  configurable flag: with `AUTH_COOKIE_SECURE=false` the cookie must drop the
  `__Host-` name (the prefix mandates `Secure`), so the app switches to
  `blue-session` — the "webpack/`http://` dev" trade is explicit, not implicit.
  Login is **JSON-only** (`415` otherwise): a cross-site HTML form cannot send
  `application/json`, so login is not cross-site-postable even without the opt-in
  CSRF interceptor. **Session fixation:** a privilege change
  (`POST /auth/elevate`) never adopts the old session id — the id is rotated
  (`SessionStore.rotate`, one atomic guarded `UPDATE`) and the old id is dead
  immediately, so an attacker who planted a known id before elevation does not
  hold the privileged session.
- **JWT (mode 2).** Access tokens live 60 s and are signed HS256; refresh
  **rotates the family**: `refresh` advances the account's `tokenVersion`, so the
  presented refresh token _and_ every access token already minted die at once — a
  replayed refresh token is rejected by construction (no ledger). Failures are
  distinguishable on purpose (`token_missing`, `token_expired`, `token_invalid`,
  `refresh_rejected`) so a client knows when to refresh; the expiry label is only
  applied after re-verifying that the token really is ours (a forged token with a
  past `exp` is `token_invalid`, not `token_expired`). Refresh tokens never
  authenticate a request.
- **Roles (mode 3).** `@authenticated` / `@authorized(…)` are enforced by a
  metadata guard: `401` without a credential, `403` with the wrong role, and on
  the socket surface the same denial as a `1008` close (`authentication required`
  / `insufficient role`). The two demo accounts hold _disjoint_ roles, so every
  row is a real denial — this is not a role hierarchy. Both schemes are accepted
  through `AuthServer.validateAny` with an explicit ordered adapter list (never
  "try every registered adapter"), and a **duplicated session cookie fails
  closed** as unauthenticated (cookie tossing).
- **Rate limiting (mode 4).** Credential endpoints are the brute-force surface:
  five attempts per minute per client address, denied as `429` + `Retry-After`.
  The key is the resolved client address, so with `BLUE_TRUSTED_PROXIES` set the
  app honours `X-Forwarded-For` only from a trusted peer (AD-37) — the live
  transcript below uses that to give each mode its own bucket.
- **Durable sessions (mode 5).** Sessions live in `blue_sessions` on a
  file-backed LibSQL database (`@blue/orm-drizzle`'s `LibSQLSessionStore`), not in
  a `Map`: the store also owns atomic rotation, strict record decoding, expiry
  sweeps and a live-session cap (`maxSessions: 256`). A restart does not log
  anyone out, and a session logged out before the restart stays dead.
- **OIDC (mode 6).** Full authorization-code + PKCE: `state` (single-use), a
  `nonce`, an S256 verifier, discovery, and ID-token verification (signature via
  JWKS, issuer, audience, expiry, nonce) before a principal exists. A federated
  subject must map to an **enabled local account** or no session is issued
  (`403 oidc_account_unknown`) — federation never conjures an identity the app
  does not know. The provider's refresh token (the flow requests
  `offline_access` with `prompt=consent`) is captured **server-side**, keyed by
  the playground session — the browser never sees it — and `GET /oidc/refresh`
  redeems it with single-use rotation, re-verifying the refreshed ID token
  (no nonce) and failing closed as `oidc_refresh_unavailable` /
  `oidc_refresh_failed`.

### Framework gaps found while building this

1. **`AuthRouteGuard` is single-scheme.** It validates against one adapter id and
   extracts the token from one place, so a route set that accepts _both_ an
   opaque session cookie and a `Bearer` access token cannot be guarded by it
   (the first guard denies a request that only carries the other scheme). This app
   ships a thin app-owned `AuthMatrixGuard` over the same metadata keys and
   `AuthServer.validateAny`; the framework would benefit from an official
   multi-scheme guard (or a scheme-list variant of the existing one).
2. **Handler-returned 4xx headers are dropped.** `ResponseEntityView` renders a
   4xx/5xx `ResponseEntity` with a fixed header set
   (`Content-Type: application/problem+json`), so a handler's
   `ResponseEntity.unauthorized(body, {'WWW-Authenticate': 'Bearer'})` silently
   loses the header. Interceptor denials are unaffected (the platform's denial
   finalizer writes it) — which is why `WWW-Authenticate` is asserted on
   `/roles/*` (guard denial) and not on `/jwt/me` (handler denial).
3. **A second, third-party HTTP application cannot be mounted inside a Blue
   server.** Mounting the embedded issuer's Koa app on the managed `HTTPServer`
   would need a raw-middleware escape hatch the platform does not have; this demo
   therefore runs the issuer on its own loopback listener in the same process.

## Tests

```bash
pnpm --filter @blue/auth-playground test     # builds the client, then runs 12 spec files / 70 tests
```

The lane boots the **real** composition (`NodeAutoConfiguration`,
`ManagementAutoConfiguration`, `PlaygroundConfiguration`) with a throwaway
file-backed session database, installs the production pipeline
(`applyAuthPipeline`), and drives it through `@blue/test`'s `MockHTTP` — or a real
listener where the wire matters (sockets, the OIDC redirect chain, static bytes).
Configuration is injected through the environment, exactly as in production.
Cases:

| Spec                        | Pins down                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-cookie.spec.ts`    | The `Set-Cookie` flags on the wire (`__Host-`, HttpOnly, SameSite=Lax, Path=/, Secure), the response's own cookie report, fresh ids per login, `/auth/me` (cookie, Bearer id, unknown id, 401), logout clearing + invalidating, JSON-only login (`415`), one generic `401` for bad credentials, unknown-vs-wrong-password parity, and the privilege-change rotation (old id dead, new id carries `admin`, other sessions untouched)                                                                      |
| `plain-http-cookie.spec.ts` | `AUTH_COOKIE_SECURE=false`: unprefixed `blue-session`, no `Secure`, everything else unchanged; login/logout round-trip                                                                                                                                                                                                                                                                                                                                                                                   |
| `jwt.spec.ts`               | 60 s TTL + expiry timestamp, `/jwt/me` verification, `token_missing` / `token_invalid` (garbage, forged signature, refresh token presented), rotation killing the replaced tokens, replayed refresh → `refresh_rejected`, header-borne refresh, bad credentials, and that the federated account cannot trade a password for tokens                                                                                                                                                                       |
| `jwt-expiry.spec.ts`        | A token that really expires → `401 token_expired`, then refresh + retry recovers; a forged token with a past `exp` stays `token_invalid`                                                                                                                                                                                                                                                                                                                                                                 |
| `roles-http.spec.ts`        | The full matrix (401 / 403 / 200) for admin and alice, over **both** schemes, the duplicated-cookie fail-closed path, refresh tokens refused, and logout ending guarded access                                                                                                                                                                                                                                                                                                                           |
| `roles-socket.spec.ts`      | Real `ws` clients: no token → `1008 authentication required`, unknown token → same, alice → `1008 insufficient role`, admin session id → greeting + echo + `1000`, admin access token → opens too                                                                                                                                                                                                                                                                                                        |
| `rate-limit.spec.ts`        | Five attempts then `429` + `Retry-After` + `urn:blue:rate-limited`, per-address budgets, both credential endpoints sharing one budget, metadata-free routes unlimited, and the advertised policy pinned                                                                                                                                                                                                                                                                                                  |
| `durability.spec.ts`        | Boot → login → **close the app** → boot again on the same file → `/auth/me` still authenticates (and `stack.sessions.kind === 'libsql'`); logged-out sessions stay dead; unknown ids stay `401`; a rotated/elevated session survives                                                                                                                                                                                                                                                                     |
| `oidc.spec.ts`              | Real embedded issuer: discovery, `/oidc/start`'s PKCE/state/nonce parameters, the complete browser flow (login + consent interactions), the issued session resolving at `/auth/me`, single-use state, unknown state, missing code/state, the browser `303`, a tampered code failing the exchange, the callback capturing the provider refresh token server-side (never in the summary), `/oidc/refresh` rotating it (twice, proving the rotation is tracked) and refusing anonymous or non-OIDC sessions |
| `oidc-disabled.spec.ts`     | `OIDC_ENABLED=false` → `503 oidc_disabled` from both routes, rest of the app unaffected                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `page-and-assets.spec.ts`   | The EJS shell renders every catalog mode, `/static/client.js` is served as JavaScript, `/health` is `200`, unknown paths are problem documents                                                                                                                                                                                                                                                                                                                                                           |
| `client-bundle.spec.ts`     | The built bundle parses as an ES module (`node --check`) and really is this app's client                                                                                                                                                                                                                                                                                                                                                                                                                 |

No test sleeps for more than the one legitimate expiry wait (4.6 s) and none of
them depend on wall-clock precision beyond whole-second JWT claims.

## OIDC setup notes

The mode is **fully self-contained**: `oidc-issuer.ts` starts
[`oidc-provider`](https://www.npmjs.com/package/oidc-provider) (a dev dependency —
this demo is its only consumer) on its own loopback listener
(`OIDC_ISSUER_PORT`, default `3111`), with:

- one RS256 signing key generated at startup (so its tokens do not survive a
  restart — the rotation semantics of a real IdP), advertised through `/jwks`;
- one **public** client (`token_endpoint_auth_method: 'none'`, authorization
  code + PKCE required, `refresh_token` allowed) whose `redirect_uris` is
  exactly `OIDC_REDIRECT_URI` — public clients rotate the refresh token on
  every use, which is the rotation `/oidc/refresh` tracks;
- one account (`OIDC_ACCOUNT_ID`, default `oidc-demo`) whose `claims()` supplies
  `sub`, `name`, `preferred_username` and `roles`;
- **dev interactions enabled** (`features.devInteractions`): the provider renders
  its own login and consent pages and accepts the `login` value as the subject.
  That is a development-only convenience — the provider prints a warning for it
  and for its in-memory adapter, and both warnings are expected here.

Because the issuer lives in the same process, everything is exercised for real.
The transcript below is that flow driven from `test/oidc-interaction.ts`'s
sequence (discovery → `/oidc/start` → provider login + consent → `/oidc/callback`),
run against a live `pnpm start`:

```console
GET http://127.0.0.1:3110/oidc/start → 302
  provider        http://127.0.0.1:3111
  client_id       blue-auth-playground
  redirect_uri    http://127.0.0.1:3110/oidc/callback
  scope           openid profile offline_access
  prompt          consent
  code_challenge  iUa7Uon_s6nk77npIYA_TZoWGbnWa1SUV59Ngrz0a6c
  method          S256
  state           -LVGF_iDJHanl8Vp…
  303 /interaction/lXrm6tRIYRY6DtwO9fzyDqq8AsWUefGq7aW_5hMAZeF
  GET  http://127.0.0.1:3111/interaction/lXrm6tRIYRY6… (dev interaction: login)
  303 http://127.0.0.1:3111/auth/lXrm6tRIYRY6DtwO9fzyDqq8AsWUefGq7aW_5hMAZeF
  303 /interaction/C91qxSnFH6a0CytJLhPFGJ49ox0tfCq4eCmWxls4MHr
  GET  http://127.0.0.1:3111/interaction/C91qxSnFH6a0… (dev interaction: consent)
  303 http://127.0.0.1:3111/auth/C91qxSnFH6a0CytJLhPFGJ49ox0tfCq4eCmWxls4MHr
  code            L0Hbai0aqsVt3PYJ…
GET http://127.0.0.1:3110/oidc/callback → 200
  {"id":"oidc-demo","name":"OIDC Demo User","roles":["user","oidc"]}  session YiZszGZDC1tVXYn7… (refresh token captured server-side)
GET http://127.0.0.1:3110/oidc/refresh (with the federated session cookie) → 200
  {"mode":"oidc","refreshed":true,"rotated":true,"principal":{"id":"oidc-demo","name":"OIDC Demo User","roles":["user","oidc"]},"expiresAt":…}
GET http://127.0.0.1:3110/auth/me (with the federated session cookie) → 200
  {"mode":"cookie-session","surface":"http","principal":{"id":"oidc-demo","name":"OIDC Demo User","roles":["user","oidc"]}, …}
```

In a browser, `/oidc/start` is a plain navigation (`GET /oidc/callback` answers
`303` back to `/?mode=oidc` when the client does not ask for JSON); the
`Accept: application/json` arm above is what makes the flow scriptable, and it is
what the test lane uses.

To point the app at a **different** issuer (a real Keycloak/Auth0 instance),
register a public PKCE client there and set
`OIDC_ISSUER_URL`/`OIDC_CLIENT_ID`/`OIDC_REDIRECT_URI`, then start with
`OIDC_ENABLED=false` so no embedded issuer is started. The client half
(`@blue/auth-client`'s `OIDCAdapter`) is unchanged — it only ever speaks
discovery + HTTP to the configured issuer. `OIDCAdapter`'s default pending
authorization store is in-memory and scoped to its instance, which is correct for
this single-process demo; a multi-instance deployment injects a shared store
(a restart between redirect and callback would otherwise fail closed with
`invalid_state`).

## Live transcript (real `pnpm start`)

```console
$ curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3110/health      # boot probe
200
$ curl -s http://127.0.0.1:3110/health | jq -c '{status, components: (.components|keys)}'
{"status":"UP","components":["telemetry"]}
$ curl -s -o /dev/null -w '%{http_code} %{size_download} bytes\n' http://127.0.0.1:3110/static/client.js
200 11207 bytes

# ── mode 1 ───────────────────────────────────────────────────────────────────
$ curl -s -X POST $B/auth/login -H 'content-type: application/json' -d '{"username":"admin","password":"wrong"}'
{"status":401,"title":"Unauthorized","detail":"invalid_credentials","instance":"/auth/login"}

$ curl -s -D- -o body -X POST $B/auth/login -c jar -H 'content-type: application/json' -d '{"username":"admin","password":"demo"}' | grep -i set-cookie
Set-Cookie: __Host-blue-session=AJZbNyLoXqXT5-mwXMjrostndYyJEKqr-up31FUmAtk; HttpOnly; SameSite=Lax; Path=/; Secure
$ jq -c '{mode, principal, cookie: .session.cookie}' body
{"mode":"cookie-session","principal":{"id":"admin","name":"admin","roles":["admin"]},"cookie":{"name":"__Host-blue-session","httpOnly":true,"sameSite":"Lax","path":"/","secure":true}}

$ curl -s -b jar $B/auth/me | jq -c '{principal, session: (.session.id[0:16] + "…")}'
{"principal":{"id":"admin","name":"admin","roles":["admin"]},"session":"AJZbNyLoXqXT5-mw…"}

$ curl -s -X POST $B/auth/elevate -b jar | jq -c '.fixation'        # privilege change → rotation
{"previousSessionId":"AJZbNyLoXqXT5-mwXMjrostndYyJEKqr-up31FUmAtk","sessionId":"bqLJD-hZJGzXba9w39zFxSTiURAmn07OvSXwmpkQ28U","rotated":true}
$ curl -s -o /dev/null -w '%{http_code}\n' -H 'Authorization: Bearer <old id>' $B/auth/me
401
$ curl -s -o /dev/null -w '%{http_code}\n' -H 'Authorization: Bearer <new id>' $B/roles/admin
200

$ curl -s -X POST $B/auth/logout -b jar2 | jq -c .                 # alice's session
{"mode":"cookie-session","surface":"http","loggedOut":true,"clearedCookie":"__Host-blue-session","cookie":{…}}
$ curl -s -o /dev/null -w 'after logout: %{http_code}\n' -b jar2 $B/auth/me
after logout: 401

# ── mode 2 (JWT_ACCESS_TTL_MS=3000 for this run) ──────────────────────────────
$ curl -s -X POST $B/jwt/login -d '{"username":"alice","password":"demo"}' | jq -c '{tokenType, expiresInMs, principal}'
{"tokenType":"Bearer","expiresInMs":3000,"principal":{"id":"alice","name":"alice","roles":["user"]}}
$ curl -s -H 'Authorization: Bearer <access>' $B/jwt/me | jq -c '{mode, principal, accessTokenExpiresAt}'
{"mode":"jwt","principal":{"id":"alice","name":"alice","roles":["user"]},"accessTokenExpiresAt":1791387802000}
$ curl -s $B/jwt/me | jq -c '{code, detail}'
{"code":"token_missing","detail":"No Authorization: Bearer header — POST /jwt/login for an access token"}
$ curl -s -H 'Authorization: Bearer nope' $B/jwt/me | jq -c '{code, detail}'
{"code":"token_invalid","detail":"The access token did not verify (signature, issuer, audience, revocation, or it is a refresh token)"}
$ sleep 4                                    # past the 3 s lifetime
$ curl -s -H 'Authorization: Bearer <access>' $B/jwt/me | jq -c '{code, detail}'
{"code":"token_expired","detail":"The access token is past its exp — POST /jwt/refresh with the refresh token"}
$ curl -s -X POST $B/jwt/refresh -d '{"refreshToken":"<refresh>"}' | jq -c '{rotated, principal}'
{"rotated":true,"principal":{"id":"alice","name":"alice","roles":["user"]}}
$ curl -s -H 'Authorization: Bearer <new access>' $B/jwt/me | jq -c '{principal}'
{"principal":{"id":"alice","name":"alice","roles":["user"]}}
$ curl -s -X POST $B/jwt/refresh -d '<the rotated-out refresh>' | jq -c '{code, detail}'
{"code":"refresh_rejected","detail":"Refresh token superseded or revoked"}

# ── mode 3 (HTTP) ────────────────────────────────────────────────────────────
$ curl -s -o /dev/null -w '%{http_code}\n' $B/roles/admin                       # no credential
401
$ curl -s -D- -o /dev/null $B/roles/authenticated | grep -iE '^(HTTP|www-authenticate)'
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
# alice (role user), cookie then JWT — same matrix, two schemes
authenticated → 200    admin → 403    user → 200      (cookie)
authenticated → 200    admin → 403    user → 200      (Bearer access token)
$ curl -s -b jar2 $B/roles/user | jq -c .
{"mode":"roles","surface":"http","requirement":"@authenticated + @authorized(user)","principal":{"id":"alice","name":"alice","roles":["user"]}}

# ── mode 3 (socket) ──────────────────────────────────────────────────────────
no credential                  → close 1008 "authentication required"  frames: []
alice session id (role user)   → close 1008 "insufficient role"        frames: []
admin session id               → close 1000 "probe done"  frames: ["{…\"principal\":{\"id\":\"admin\",\"roles\":[\"admin\"]}}","{\"echo\":\"ping\",\"principalId\":\"admin\"}"]
admin access token             → close 1000 "probe done"  frames: ["{…\"principal\":{\"id\":\"admin\"…}}"]

# ── mode 4 (BLUE_TRUSTED_PROXIES=127.0.0.1 + X-Forwarded-For per client) ──────
attempt 1 → 401   attempt 2 → 401   attempt 3 → 401   attempt 4 → 401   attempt 5 → 401   attempt 6 → 429
$ curl -s -D- -X POST $B/auth/login -H 'x-forwarded-for: 198.51.100.99' -d '{correct password}' | grep -iE '^(HTTP|retry-after)'
HTTP/1.1 429 Too Many Requests
Retry-After: 59
{"status":429,"type":"urn:blue:rate-limited","title":"Too Many Requests","detail":"Rate limit exceeded — retry in 59 seconds"}
$ curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/auth/login -H 'x-forwarded-for: 203.0.113.42' -d '{correct}'
200

# ── mode 5: restart the process, keep the session ────────────────────────────
$ curl -s -X POST $B/auth/login -c jar -d '{"username":"admin","password":"demo"}' | jq -r '.session.id'
wqa-8mo7H_qjf7bD0zrvY7IQv8WSR2sd6GiPTWI8jn4
$ curl -s -o /dev/null -w '%{http_code}\n' -b jar $B/auth/me
200
$ kill <server>; pnpm start            # same SESSION_DB_URL (./tmp/sessions.db)
$ curl -s -b jar $B/auth/me | jq -c '{principal, session: .session.id}'
{"principal":{"id":"admin","name":"admin","roles":["admin"]},"session":"wqa-8mo7H_qjf7bD0zrvY7IQv8WSR2sd6GiPTWI8jn4"}
$ curl -s -o /dev/null -w 'guarded after restart: %{http_code}\n' -b jar $B/roles/admin
guarded after restart: 200
$ curl -s -o /dev/null -w 'unknown id: %{http_code}\n' -H 'cookie: __Host-blue-session=not-a-session' $B/auth/me
unknown id: 401
```

Reading the middle of that transcript top to bottom shows the two properties the
app exists for: the session id **changes** exactly when privilege changes (and the
old id immediately stops working), and the session id **does not change** across
a process restart — while an unknown id is refused in both worlds.

## See Also

- [apps/README](../README.md) — the application progression and the port registry
- [Guide 11 — Authentication and Sessions](../../docs/guides/11-authentication-and-sessions.md)
- [Guide 16 — Persistence and Distributed Backends](../../docs/guides/16-persistence-and-distributed-backends.md)
- [Guide 19 — Testing](../../docs/guides/19-testing.md) · [Guide 20 — HTTP Client](../../docs/guides/20-http-client.md)
- [04-blue-api](../04-blue-api/README.md) — the canonical Node auth wiring this app mirrors
- [06-blue-island](../06-blue-island/README.md) — the server + built-client layout (shell, `/static/`, dev client)
- [@blue/auth-core](../../packages/blue-auth-core/README.md) · [@blue/auth-server](../../packages/blue-auth-server/README.md) · [@blue/auth-client](../../packages/blue-auth-client/README.md) · [@blue/orm-drizzle](../../packages/blue-orm-drizzle/README.md)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
