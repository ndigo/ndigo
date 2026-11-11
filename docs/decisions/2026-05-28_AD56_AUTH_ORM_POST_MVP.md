# AD-56: Auth & ORM post-MVP — pluggable authentication plus ORM relations, lifecycle, transactions, Drizzle adapter

**Date:** 2026-05-28
**Status:** Superseded in part — auth/ORM post-MVP superseded in part by AD-33/AD-30/AD-31
`ndigo-auth-core` / `ndigo-auth-server` / `ndigo-auth-client` (2026-06-24,
commit `148c92e9`); superseded in part by
[AD-33](2026-09-26_AD33_AUTH_CREDENTIALS_AND_SESSIONS.md) (credentials/
sessions subset, 2026-09-26).

## Context

Wave 9 added `@ndigo/auth` (new) and extended `@ndigo/orm` post-MVP with
relations, lifecycle hooks, `@transactional`, and the `@ndigo/orm-drizzle`
adapter. The auth plan specified a strategy-based abstraction
(pluggable/injectable strategies, `Principal`/`Session`, TC39 decorators,
HTTP + dispatcher guards) — **not** yet the OIDC/JWT/scheme-selection model
that later evolved: the OIDC authorization-code + PKCE, fail-closed
`validateAny`, `jose`-based JWT, and scheme-registry pieces verified in the
current tree arrived in subsequent iterations (the plan predates them).
This AD-56 is the historic record of the 2026-05-28 decision; AD-33 covers
the credentials/sessions subset of the eventual stack.

## Evidence

- Plan: `docs/plans/2026-05-28_AUTH_DESIGN.md` — §9a auth core interfaces,
  decorators, `AuthRouteGuard`, `AuthHeaderInterceptor`; §9b ORM relations/
  lifecycle/`@transactional`; §9c `@ndigo/orm-drizzle` adapter; demo gate.
- Original `@ndigo/auth` born commit `f23b8d13` (2026-05-29, wave-9) — 9
  source files (AuthenticationManager, SessionManager, PasswordHasher,
  AuthRouteGuard, `@authenticated`/`@role`/`@permission`, token session
  store) — verified via `git log --diff-filter=A -- path`.
- Re-architect split: commit `148c92e9` (2026-06-24,
  `feat: re-architect auth, telemetry, and router packages`) is the earliest
  commit touching all three of `packages/ndigo-auth-core/`,
  `ndigo-auth-server/`, `ndigo-auth-client/` (verified per-package
  `git log --reverse`).
- Current surface: `ndigo-auth-core/src/{principal,session,state,adapter,registry,password-encoder,delegating-password-encoder,scrypt-password-encoder,user-store,session-store}.ts` + `_decorators.ts`
  (exports `authenticated`, `authorized`, `AUTH_REQUIRED_KEY`,
  `AUTH_ROLES_KEY`); `ndigo-auth-server/src/{jwt-adapter,credentials-auth-adapter,in-memory-session-store,in-memory-user-store,route-guard}.ts`;
  `ndigo-auth-client/src/{oidc-adapter,client,auth-header-interceptor,client-guard}.ts`.
- OIDC/PKCE: `packages/ndigo-auth-client/src/oidc-adapter.ts` imports
  `jose` (`createRemoteJWKSet`, `jwtVerify`, `decodeJwt`) and `randomToken`/
  `base64url` (code verifier → PKCE); `JWTAdapter` (server, `jose`, ver
  claim/`tokenVersion` revocation). Fail-closed: `AuthServer.validateAny`
  evaluates every registered adapter (deny unless all pass) — documented in
  `credentials-auth-adapter.ts:41,57` and AD-33's background.

## Decision (2026-05-28)

- **D-1 — pluggable strategy abstraction:** `Principal` (with
  `hasRole`/`hasAnyRole`) + `AnonymousPrincipal`; `Session`,
  `DefaultSession`; `AuthenticationStrategy<C>` (`supports`/`authenticate`);
  `AuthenticationManager` (`register`/`authenticate`).
- **D-2 — TC39 decorators:** `@authenticated` and `@authorized(role)`
  (class + method forms, camelCase), storing metadata under `auth:required`
  / `auth:roles` keys.
- **D-3 — transport guards:** `AuthRouteGuard` implements
  `RouteHandlerInterceptor` (dispatcher `preHandle`, checks class/method
  metadata, requires authenticated session, verifies roles);
  `AuthHeaderInterceptor` implements `RequestAwareHTTPInterceptor` (injects
  `Authorization: Bearer <token>`, no-op when unauthenticated).
- **D-4 — ORM relations:** `@oneToMany`/`@manyToOne`/`@manyToMany`/
  `@oneToOne` accumulating into `orm:relations` metadata with lazy
  `targetEntity` refs.
- **D-5 — lifecycle hooks:** `@prePersist`/`@postLoad`/`@preUpdate`/
  `@postRemove` into `orm:lifecycle` metadata; `InMemoryEntityManager`
  invokes them.
- **D-6 — `@transactional`:** method decorator wrapping the call in
  `unitOfWork.begin()/commit()/rollback()`.
- **D-7 — `@ndigo/orm-drizzle` adapter:** dynamic schema reading
  `@entity`/`@column` metadata → `sqliteTable()`; `DrizzleDataSource`/
  `DrizzleEntityManager`; deps `drizzle-orm`, `better-sqlite3`.
- **Demo gate:** `POST /auth/login`, `GET /notes`, `POST /notes` in
  `ndigo-demo-node` with an `@entity` `Note`.

## Supersession (in part)

[AD-33](2026-09-26_AD33_AUTH_CREDENTIALS_AND_SESSIONS.md) covers the
credentials/sessions subset that followed the 2026-06-24 split:
credential/password auth, first-party user store, server-session auth,
refresh/revocation — building on the `AuthAdapter` seam and `AuthRegistry`
that the split produced. The `@authenticated`/`@authorized` guard contract
survives (`ndigo-auth-core` `_decorators.ts`); the ORM post-MVP surface was
carried by AD-55's successors ([AD-30](2026-09-26_AD30_ORM_MIGRATIONS.md) /
[AD-31](archive/2026-09-26_AD31_ORM_RELATION_FETCH.md)).

## Consequences

- `@ndigo/auth` became three packages on 2026-06-24 (`148c92e9`): core
  contracts/adapters in `ndigo-auth-core`, server-side guards, stores and
  JWT/credentials in `ndigo-auth-server`, browser-side client + OIDC +
  header interceptor in `ndigo-auth-client`.
- OIDC authorization-code + PKCE (client), `jose`-based JWT with versioned
  revocation and issuer/audience checks (server), and fail-closed
  `validateAny` are the realized architecture — none specified verbatim in
  the 2026-05-28 plan, which left strategy choice open (`[INFERENCE]` for
  the exact timing/OIDC decision point between 05-28 and the split).
- ORM relations, lifecycle hooks, `@transactional`, and the Drizzle adapter
  landed per the plan preamble.

## References

- Plan: `docs/plans/2026-05-28_AUTH_DESIGN.md`
- Birth: commit `f23b8d13` (2026-05-29, `@ndigo/auth`);
  ORM wave-9 extensions same commit
- Split: commit `148c92e9` (2026-06-24)
- Implementation: `packages/ndigo-auth-core/src/`, `ndigo-auth-server/src/`,
  `ndigo-auth-client/src/`
- Related: [AD-33](2026-09-26_AD33_AUTH_CREDENTIALS_AND_SESSIONS.md),
  [AD-30](2026-09-26_AD30_ORM_MIGRATIONS.md),
  [AD-31](archive/2026-09-26_AD31_ORM_RELATION_FETCH.md)

## Revisit Trigger

Revisit if the `AuthAdapter` seam (`validate`/`authenticate`/`refresh`/
`logout`) can no longer absorb a new scheme (e.g. non-OIDC federation or a
scheme needing non-`validateAny` semantics), or if a third auth package
boundary emerges from the client/server split.
