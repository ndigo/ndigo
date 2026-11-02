# Comprehensive Review and Remediation — 2026-11-02 (Code, design, architecture, security, docs)

Scope: full-repository sweep across code correctness, design/architecture, security,
and documentation. Method: mechanical gates (lint/audit/manifest/doc-links), direct
deep-read of the security-critical surface (auth-core/server/client, platform-node
transport controls, redis, rate-limit, locks), dependency-graph analysis
(cycles/layering/manifest convention), and parallel read-only reviewers for docs
freshness and code correctness. One architecture reviewer crashed mid-report; its
scope was re-performed directly — nothing left unreviewed.

## 0. Gate baseline (run at `e732baf4`, 2026-11-01/02)

| Gate                                            | Result                                          |
| ----------------------------------------------- | ----------------------------------------------- |
| `pnpm lint` (oxlint, type-aware, deny-warnings) | ✅ exit 0                                       |
| `pnpm audit --prod`                             | ✅ no known vulnerabilities                     |
| `pnpm manifest:check`                           | ✅ all packages + root conform                  |
| `node scripts/check-doc-links.mjs`              | ✅ 338 files, 1383 relative links OK            |
| Secrets / injection / dangerous-API scan        | ✅ none in source                               |
| Timer/resource-leak sweep                       | ✅ imbalances are terminal delays or test-local |
| Dependency cycles (runtime+peer graph)          | ✅ none                                         |

## 1. Findings

### M1 — blue-http README documents a non-exported symbol (Medium, docs)

- `packages/blue-http/README.md:55` presents `EqualsURLMatcher` as public API.
- It exists at `src/url-matcher.ts:67` but is **not** exported from `src/index.ts`;
  it is absent from the generated `api/` tree. A consumer copying the README gets a
  broken import.
- Resolution (revised during Wave 1): git history shows `url-matcher.ts` was
  **never** exported from `index.ts` (JSDIP-era orphan, zero importers/tests/callers),
  and the README bullet came from a doc regeneration (`b461dfcc`) — a generated
  vestige, not an API decision. Per the "prune to the consumed surface" precedent
  (#49), the module is **retired** and the bullet dropped rather than promoting a
  dead, untested class into public API.

### M2 — blue-redis README entry-point count wrong; `/rate-limit` undocumented (Medium, docs)

- `packages/blue-redis/README.md:27-35` says "five entry points" (`.`, `/cache`,
  `/pubsub`, `/jobs`, `/locks`); `package.json` exports **six** — `./rate-limit`
  (`RedisRateLimiter`) is missing from the docs although the package description
  advertises it.
- Fix: add the `/rate-limit` row, correct the count, one-line usage note.

### M3 — AGENTS.md Node version stale (Medium, docs)

- `AGENTS.md` §1 says "Node Version: >= 22.0.0"; root `package.json` engines and
  every package README/template require `>= 24.0.0`. Misleads agents into
  Node-22 attempts that engine-strict rejects.
- Fix: `>= 24.0.0`.

### M4 — AGENTS.md cross-package dependency convention contradicts the repo (Medium, docs/convention)

- `AGENTS.md` §4 "Dependencies" mandates: "Cross-Package: List `@blue/*`
  dependencies in **both** `devDependencies` and `peerDependencies`."
- Reality (verified 2026-11-02 across all 43 packages with `@blue/*` deps):
  **0 follow it.** 41 list cross-package deps in `dependencies`; `@blue/redis`
  additionally models optional driver subpaths (`/cache`, `/jobs`, `/locks`,
  `/rate-limit`, `/pubsub` integrations) as `peerDependencies` — a deliberate,
  sound adapter pattern. `auto-install-peers=true` + workspace linking keeps
  dev resolution correct either way.
- Fix: rewrite §4 Dependencies to document the **actual** convention — framework
  deps in `dependencies`; optional subpath drivers as `peerDependencies` with
  `@blue/redis` as the canonical example. Do not "fix" the packages: the
  current manifests match mainstream publishable-framework practice (Angular/Nest
  style).

### L1 — jwt-adapter revocation cache grows unboundedly (Low, correctness/robustness)

- `packages/blue-auth-server/src/jwt-adapter.ts:145` `#versionCache` is a plain
  Map keyed by account `sub`, populated at `:452-469`. Expired entries are only
  overwritten on re-access — never evicted. A long-running server with many
  distinct subjects accumulates one stale entry per `sub` ever seen.
- Fix: bound it — reuse `@blue/core`'s LRU pattern (size cap, e.g. 10 000) and/or
  delete-on-expiry in `#currentVersion`; add a growth-cap unit test.

### L2 — demo auth `refresh()` never persists the TTL extension (Low, app correctness/teaching)

- `apps/03-blue-todo/src/auth-store.ts:64-68`: `DemoAuthAdapter.refresh()` computes
  `expiresAt = Date.now() + TOKEN_TTL_MS` and returns it, but never writes it back
  to `tokenStore`. `validate()` (`:53-62`) still checks the original expiry, so a
  refreshed token dies at the old deadline — client and server disagree on lifetime.
  In the flagship tutorial this encodes the wrong refresh contract.
- Fix: `tokenStore.set(token, { principal, expiresAt })` inside `refresh()`; spec
  asserting server-side expiry moved after refresh.

### L3 — blue-dom README missing standard prerequisite line (Low, docs)

- `packages/blue-dom/README.md:9-11` omits the "Node ≥ 24 / pnpm ≥ 11" paragraph
  present in the template and every sibling README.

### L4 — STYLE_GUIDE.md section-numbering gap (Low, docs)

- Sections jump `## 5` → `## 7` (`STYLE_GUIDE.md:4491`); no `## 6`. No current doc
  cites §6, so risk is ambiguity only. Renumber or restore.

### F1 — OIDC refresh-token grant unimplemented (feature gap, tracked)

- `packages/blue-auth-client/src/oidc-adapter.ts:703-707`: `refresh()` throws
  "not implemented" (and `authenticate()` throws by design). Callers discover this
  only at runtime.
- Fix: file a GitHub issue (Ready lane) for the `grant_type=refresh_token` exchange
  with the adapter's full verification discipline. Interim: point the throw
  messages at the issue.

## 2. Verified good (no action)

- **Security surface** (deep-read, all correct as documented in SECURITY.md):
  ScryptPasswordEncoder (PHC format, constant-time compare, attacker-influence cost
  caps SEC-1, fail-loud schemes); DelegatingPasswordEncoder (no `{noop}`
  fallthrough); OIDCAdapter (fail-closed construction, HTTPS enforcement with
  loopback exemption, PKCE S256 + state + nonce, algorithm allowlist, body-size and
  timeout caps, `redirect: 'error'` protects `client_secret`); CSRFInterceptor
  (`__Host-` cookie, constant-time compare SEC-9, length-guarded); CORSInterceptor
  (wildcard+credentials rejected at construction, `Vary` extension PLN-F8);
  trusted-proxy XFF resolution (rightmost-first walk, spoof-proof default-off);
  RedisConnection (protocol allowlist, no credential logging, bounded queues);
  FixedWindowRateLimiter (bounded buckets SEC-2); locks/jobs (atomic Lua fencing,
  lease-race guards); resilience (generation-epoch circuit breaker, correct jitter);
  scheduler (single-flight, `MAX_TIMER_DELAY_MS` cap).
- **Architecture**: no dependency cycles; layering sound (core in=26 / util·log
  in=20; apps and adapters in=0; `@blue/redis` peers pattern is coherent).
- **Retired packages**: zero residual code references to `@blue/validate`.
- **API hygiene**: internal `_*.ts` leak rules are lint-enforced (error) and green;
  cross-package `@link` targets centralized in `scripts/external-symbol-links.json`
  (0 sprinkled into code); sampled `api/` trees fresh; all 19 example apps have
  tests; conduit/upload apps teach good auth + path-traversal habits.
- **Prose hygiene**: single `TODO` in `blue-dispatcher/src/matrix-param-condition.ts:82`
  is a legitimate Rule-of-Three note, not debt.

## 3. Waves

### Wave 1 — doc-contract fixes (single PR, no code)

1. M1 export `EqualsURLMatcher` + `pnpm doc:api` regenerate + commit `api/` tree.
2. M2 blue-redis README entry points.
3. M3 + M4 AGENTS.md corrections (§1 engine, §4 dependency convention).
4. L3 blue-dom prerequisite line; L4 STYLE_GUIDE §6 renumber.

Verify: `pnpm manifest:check`, `pnpm docs:links`, `pnpm doc:check`, `pnpm lint`.

### Wave 2 — correctness fixes (two PRs, independent)

5. L2 todo `auth-store.refresh()` persist + spec → `nx run @blue/todo:test` (or app test lane).
6. L1 jwt-adapter bounded version cache + cap test → `nx run @blue/auth-server:test`.

Verify: `pnpm build`, `pnpm lint`, package test lanes; `pnpm typecheck`.

### Wave 3 — tracked gap

7. F1 open GitHub issue for the OIDC refresh grant; sharpen the throw message
   (ride along in Wave 2's jwt/auth PR or standalone one-liner).

## 4. Verification (whole plan)

- `pnpm lint && pnpm build && pnpm test`
- `pnpm manifest:check && pnpm docs:links && pnpm doc:check`
- `pnpm audit --prod` stays clean (no dependency changes are proposed)
- After merge: `graft build` to refresh the graph; per AGENTS.md §8 one issue =
  one branch = one worktree per wave.
