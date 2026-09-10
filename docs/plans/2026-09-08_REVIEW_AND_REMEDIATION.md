# Review and Remediation Plan

**Date:** 2026-09-08
**Status:** ✅ Implemented 2026-09-09 — every item landed (see §5 for the
per-item outcome); the certification gates in §3 Wave 5 all pass.
**Scope:** Repository-wide review (architecture, design, security, correctness,
conventions, quality gates) of the BlueJS monorepo, and the remediation plan
for every finding.
**Method:** Graft graph queries + targeted source review + live execution of
every documented gate (build, test, lint, format, audit, manifest, strict
type-check, doc, E2E) and static analysis of the security-relevant paths.

## 1. Verified baseline (what is healthy)

| Gate                   | Command                     | Result (2026-09-08, master)                                                                                            |
| ---------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Build                  | `pnpm build`                | ✅ 27 `build:lib` projects                                                                                             |
| Tests                  | `pnpm test`                 | ✅ 32 projects, no failures, no skips                                                                                  |
| Production audit       | `pnpm audit --prod`         | ✅ zero advisories                                                                                                     |
| E2E                    | `pnpm test:e2e`             | ⚠️ blocked locally — Playwright Chromium binary not installed (environment, not repo); CI installs it                  |
| OIDC/JWT auth          | —                           | ✅ fail-closed constructor, PKCE/state/nonce, jose signature+iss/aud/exp verification                                  |
| Node transport         | —                           | ✅ limits/timeouts, 400/408/413/431 mapping, bind rejection, denial finalization, cookie parsing, safe static resolver |
| Platform boundary      | `platform-boundary.spec.ts` | ✅ `@blue/boot` runtime is platform-neutral (graph edges come from dev/test deps only)                                 |
| Async handler JSON bug | integration spec            | ✅ fixed (login token round-trip asserted)                                                                             |

## 2. Findings

### 2.1 Security

**SEC-7 (High) — Request-body limit is checked _after_ the body is fully buffered.**
`packages/blue-platform-node/src/node-http-server-adapter.ts#readBody` L664–L688:
the loop pushes every chunk into `chunks` and only compares `received >
maxBodyBytes` after the stream ends (L670). A client streaming > 1 MiB keeps
the adapter buffering until EOF — unbounded memory growth, contradicting the
`413`/memory-bounded contract documented in `http-request-limits.ts` and the
method docstring. Fix: check inside the loop and stop reading at the limit.

**SEC-8 (Medium) — Well-formed JSON with a non-object shape returns 500, not 400.**
`parseBody` (`http-request-limits.ts` L94–L95) throws `TypeError` when a JSON
body is an array or primitive, but `#writeErrorResponse`
(`node-http-server-adapter.ts` L572–L607) maps only `SyntaxError`/`URIError`/
`RequestLimitError`; the `TypeError` falls through to a generic 500. A client
POSTing `[1,2]` gets an Internal Server Error + stack log. Should be 400
`malformed_body`.

**SEC-9 (Medium) — WebSocket upgrades have no Origin validation.**
`listen()` creates `new WebSocketServer({ server, verifyClient: undefined })`
(`node-http-server-adapter.ts` L134); `shouldHandle` gates on path/query only
(L136–L165). For socket routes authenticated via cookies/session headers this
exposes cross-site WebSocket hijacking (CSWSH). Add an allowlisted-origin /
`Sec-WebSocket-Origin` check option enforced at upgrade time.

**SEC-10 (Medium) — OIDC token-exchange POST is a bare `fetch`.**
`exchangeCodeForTokens` (`packages/blue-auth-client/src/oidc-adapter.ts`
L484–L499) uses plain `fetch`: no timeout, no response-size cap, `redirect`
default (follows), so a malicious/compromised token endpoint can hang the
process, return unbounded bodies, or (via 307/308) receive the POST body —
including `client_secret` — at an arbitrary URL. `#fetchJson` (L317–L365)
already implements the correct guards (HTTPS, timeout, size, `redirect:
'error'`); reuse it for the token endpoint.

**SEC-11 (Low) — CSRF cookie default lacks `Secure`.**
`CsrfInterceptor` default `cookieOptions` is `'SameSite=Lax; Path=/'`
(`csrf-interceptor.ts` L73). On HTTPS deployments served alongside an HTTP
listener the token cookie would be transmitted in clear. Default to
`Secure` (overridable), and validate option ranges.

**SEC-12 (Medium, open from SEC-5) — Management surface has no access policy.**
`ManagementAutoConfiguration` registers `/metrics` and `/health` with no
authentication/authorization option (`management-auto-configuration.ts`),
health probes run on every request, and indicator error messages are echoed
into `/health` (`health.ts` L96–L104). Provide an optional access guard /
redaction policy and document the default-open posture in the package README.

**SEC-13 (Info) — Demo-auth `tokenValidator: async () => true`**
(`apps/blue-todo/src/auth-store.ts` L52) is documented as non-security and the
adapter remains fail-closed. No action beyond keeping the demo credential
warning visible; `updateAuthNav` interpolates `principal.name` into
`innerHTML` (`apps/blue-todo/src/index.ts` L36–L48) but the name comes from
the fixed `DEMO_USERS` table — not user-controlled.

### 2.2 Correctness

**COR-3 (High) — CI's "Strict type-check" lane fails deterministically.**
`.github/workflows/ci.yml` L68 runs `pnpm -r exec tsc -b tsconfig.build.json`;
`packages/blue-generators` and `packages/blue-page` have no
`tsconfig.build.json` (page is manifest-only, generators ships `src/`), so the
recursive exec aborts with TS5083 on every run (verified locally, exit 1).
Either scope `-r` to packages with the build config, or give both packages
(empty) build configs.

### 2.3 CI / quality gates

| ID   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                    | Evidence (verified)   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| CI-1 | **Lint "zero warnings" lane is not enforced.** `pnpm lint` exits 0 with 10 warnings (unused `T` in `blue-context/src/configuration.ts:206`; unused `inferTarget` in `blue-boot/src/configuration-properties.ts:250`; `no-await-in-loop` in `config-file-loader.ts:118,131,140`, `stream-to-signal.spec.ts:16`, `island.spec.ts:109,130,139` without the CONTRIBUTING-mandated rationale comments). CI runs `pnpm lint` and accepts exit 0. | Lint run              |
| CI-2 | **Formatting lane fails on 66 files**, including maintained sources (`nx.json`, `ARCHITECTURE.md`, `docs/**/*.md`, `packages/blue-context/src/generic-application-context.ts`, `packages/blue-dispatcher/src/parameters.ts`, …) and tooling output (`packages/blue-boot/graft/.graph/wiring.json`). `.prettierignore` ignores `doc/` but not `docs/`, and only root-anchored `/graft/`.                                                    | `pnpm format:check`   |
| CI-3 | **Manifest gate fails**: `@blue/page` (private concept stub, `private: true`, no exports) is treated as publishable by `scripts/check-manifests.mjs` (no `private` skip).                                                                                                                                                                                                                                                                  | `pnpm manifest:check` |
| CI-4 | **TypeDoc gate unenforced + stale**: `pnpm doc` exits 0 with 20 warnings; entry globs still reference deleted `blue-model`/`blue-domain`/`blue-validate`; README links `packages/blue-domain/README.md` and `packages/blue-parser/README.md` are dead; CONTRIBUTING promises "0 errors, 0 warnings".                                                                                                                                       | `pnpm doc`            |
| CI-5 | **Type safety partially rolled out**: all packages now enable `strict` ✅ (progress on the 2026-09-04 plan Task 9), but `skipLibCheck` remains everywhere, apps (`blue-api`, `blue-hello-node`, `blue-todo`) are not strict, lint still disables `no-explicit-any`/`no-non-null-assertion`, and the strict lane is broken (COR-3).                                                                                                         | tsconfig sweep        |

### 2.4 Architecture / design

**ARCH-4 (Medium) — Out-of-tree workspace membership.**
`pnpm-workspace.yaml` includes `../todomvc/examples/*` and `nx.json` registers
`@blue/todomvc` at `../todomvc/examples/bluejs`; root scripts (`build:all`,
`test:benchmark*`, `build:bluejs` — the last with a `todomcv` typo) hardcode
sibling-repo paths. A fresh clone of this repository alone cannot reproduce
install/build behavior; CI depends on pnpm tolerating the missing directories.
Vendor the benchmark/examples or document the sibling checkout as a hard
prerequisite.

**ARCH-5 (Low) — Stale architecture documentation.**
`ARCHITECTURE.md` layer table lists removed packages (`@blue/parser`,
`blue-domain`), omits newer ones (`auth-*`, `orm*`, `telemetry*`,
`management`, `platform-node`), and the layer diagram still shows a layered
graph with `Boot → Dispatcher` while the real graph has `boot →
platform-node/platform-web` at the top and no cycles (verified with the Nx
dependency graph: 36 nodes, 184 edges, 0 SCCs > 1). The docs describe the
target architecture, not the shipped one.

**ARCH-6 (Low) — `HealthController` mutates shared registry per request.**
`packages/blue-management/src/health-controller.ts` L38 registers a fresh
`TelemetryHealthIndicator` on every request. Correctness is saved by
`Map#set`-replace semantics, but request-time mutation of a shared entry is a
state smell; register once (or construct per-request registries).

**ARCH-7 (Info, resolved) — Previously open items now fixed.** Boot platform
boundary (runtime clean), cookie/session contract (cookies parsed, session
still documented-empty — Session provider remains an open contract gap),
CORS server-side enforcement, async-handler JSON serialization, listen()
bind rejection, 401/403 denial finalization: all verified fixed.

### 2.5 Conventions / hygiene

| ID  | Finding                                                                                                                                                                                                                                                                                    | Evidence                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| H-1 | `pnpm-workspace.yaml` line 25: `cypress: set this to true or false` — literal placeholder text in `allowBuilds`.                                                                                                                                                                           | file                      |
| H-2 | Root `label-graph`/`label-labels` scripts call `label_injector.js` / `label_writer.js`, which do not exist at the root.                                                                                                                                                                    | `ls`                      |
| H-3 | Generated config artifacts are committed in `packages/blue-util`: `vitest.config.js`, `vitest.config.d.ts`, `vitest.config.d.ts.map` are tracked (the `.ts` source is the maintained one).                                                                                                 | `git ls-files`            |
| H-4 | Tooling left `packages/blue-boot/graft/` (632 KB wiring cache + `.ignore`/`.gitignore`) untracked; root `.gitignore` ignores only root-anchored `/graft/`, so nested graft caches are unignored and appear in `format:check`. Either ignore `**/graft/` or move the cache out of the tree. | `git status` + format run |
| H-5 | Root `README.md` versions are stale (TS 5.7.2 → 6.0.3, Nx 20.3.2 → 23.2.0, Vitest 2.1.8 → 4.0.18, Vite 6.0.7) and the package list still includes deleted `blue-domain` and `blue-parser`.                                                                                                 | file + doc run            |
| H-6 | `@blue/page` is a package-shaped concept stub (README: "no code", AD-3). It fails the manifest check and adds a workspace project with no build. Move it to `docs/decisions`/`archive` or add a manifest-check allowlist entry.                                                            | manifest run              |

## 3. Remediation plan

### Wave 1 — Transport security (fail closed, bounded, deterministic)

1. **Bound `#readBody` at the limit (SEC-7).**
   Check `received` inside the streaming loop; on overflow stop reading,
   respond 413, and destroy the stream. Keep the 408 timer.
    - Acceptance: streaming > 1 MiB over a real socket never buffers past the
      cap and always yields 413.
    - Verify: extend `http-boundaries.spec.ts` with a chunked-body test.
2. **Map malformed-shape JSON to 400 (SEC-8).**
   Throw `RequestLimitError(400, 'malformed_body', …)` (or a dedicated typed
   error) from `parseBody` for array/primitive JSON instead of `TypeError`.
    - Acceptance: POST `[1]` / `"s"` → 400 problem doc; invalid JSON → 400;
      server logs no stack for either.
    - Verify: boundary spec cases.
3. **Origin-validate WebSocket upgrades (SEC-9).**
   Add a `verifyClient`/origin option (allowlist or same-origin check
   against `Host`); default fail-closed when configured, documented as
   optional for public sockets.
    - Acceptance: forged-Origin upgrade with the option enabled is rejected
      with 403 before `connection` fires.
    - Verify: websocket spec with a hostile `Origin` header.
4. **Route the OIDC token exchange through the guarded fetch (SEC-10).**
   Extract `#fetchJson`'s transport discipline (HTTPS assert, timeout, size
   cap, `redirect: 'error'`) into a shared `#fetchJson(url, label,
{ method, body, headers })` and use it for the token-endpoint POST.
    - Acceptance: hanging/infinite token endpoints fail with `OIDCError`
      within `fetchTimeoutMs`; oversized responses reject; no redirect
      carries `client_secret`.
    - Verify: `oidc-flow.spec.ts` additions with a stalling/slow endpoint.
5. **Harden CSRF cookie defaults (SEC-11).**
   Default `cookieOptions` to `SameSite=Lax; Secure; Path=/` (configurable);
   validate `tokenBytes` range.
    - Acceptance: default-produced `Set-Cookie` includes `Secure`.
    - Verify: CSRF spec assertion.

### Wave 2 — Make CI gates actually gate

6. **Fix the strict type-check lane (COR-3).**
   Give `@blue/generators` and `@blue/page` build configs (page: resolve its
   fate first — see 10), or switch the lane to `pnpm -r --filter
…/tsconfig.build.json`-scoped invocation / nx `build:lib` set. The lane
   must fail on a deliberate type error.
    - Verify: introduce a throwaway type error, expect lane failure, then
      remove it.
7. **Enforce zero-warning lint (CI-1).**
   Run `oxlint --deny-warnings` in CI and locally; fix the 10 warnings —
   keep sequential-await loops sequential with line-scoped
   `oxlint-disable-next-line no-await-in-loop` + reason (CONTRIBUTING rule 5),
   delete the unused `T`/`inferTarget`.
    - Acceptance: `pnpm lint` exit code non-zero on any warning.
8. **Formatting baseline (CI-2).**
   Fix `.prettierignore` (`docs/` policy decision: format maintained docs or
   ignore generated/archival docs; `**/graft/`); format the 66 files in one
   commit; keep the check in CI.
    - Verify: `pnpm format:check` clean locally and in CI.
9. **TypeDoc gate (CI-4).**
   Remove the three deleted-package entry globs, fix the two README links
   (or drop the dead package entries — see 11), resolve or `externalSymbolLinkMappings`
   the 15 link warnings, and add `--treatWarningsAsErrors`-style enforcement
   via the existing `typedoc-tags-plugin`/CI lane.
    - Acceptance: `pnpm doc` emits 0 warnings and fails otherwise.
10. **`@blue/page` decision (CI-3, H-6).**
    Move the stub into `docs/decisions/AD-3` (delete the package dir) or
    allowlist private stubs in `check-manifests.mjs`. Recommend the former —
    the workspace gains a real project and the manifest gate is restored.
    - Verify: `pnpm manifest:check` passes; `nx graph` no longer contains
      `@blue/page`.
11. **Strict-mode remainder (CI-5).**
    After Wave 2 is green: enable `strict` for the three apps; convert lint
    `no-explicit-any`/`no-non-null-assertion` to errors and burn down the
    remaining `any` in public contract positions; keep `skipLibCheck` as a
    documented tradeoff (CI declaration-build lane).
    - Acceptance: `tsc -b` clean under strict for all packages and apps;
      public declarations `any`-free.

### Wave 3 — Repository hygiene

12. **Config/script repairs (H-1, H-2, H-3).**
    Delete the `cypress: set this to true or false` placeholder (add real
    cypress entry only if used); remove the two broken root `label-*` scripts
    or point them at the real tooling; `git rm` the generated
    `vitest.config.js/.d.ts/.map` in `blue-util` and extend `.gitignore`.
13. **Nested graft cache (H-4).**
    Change the ignore to `**/graft/` + `**/graft/.graph/`, delete the
    `packages/blue-boot/graft/` cache.
14. **Out-of-tree workspace (ARCH-4).**
    Decision required: vendor `todomvc` benchmarks/examples into the repo, or
    document the sibling checkout as a prerequisite and make CI skip the
    missing projects explicitly (`pnpm-workspace.yaml` + `nx.json` +
    root scripts, fixing the `todomcv` typo). Acceptance: a fresh clone
    either installs cleanly or fails with a documented, actionable message.

### Wave 4 — Documentation and design debt

15. **Docs refresh (ARCH-5, H-5).**
    Update root README versions + package inventory (drop `blue-domain`/
    `blue-parser`); update ARCHITECTURE.md layer table/diagram to the shipped
    graph (36 nodes — add auth/orm/telemetry/management/platform packages,
    remove parser/domain, show boot→platform edges), or label the section
    "target architecture" and link the generated graph.
16. **Management policy (SEC-12).**
    Add an optional access guard to `ManagementAutoConfiguration` (reuse
    `AuthRouteGuard` or an interceptor), document the default-open posture,
    and move indicator registration to context/boot time (ARCH-6).
17. **Session contract.**
    Document `NodeRequest.session` as reserved-but-unpopulated or implement a
    session-provider hook; update `node-request.ts` docs to match reality.

### Wave 5 — Certification

18. **End-to-end verification.**
    Fresh uncached `pnpm build`, `pnpm test`, `pnpm lint` (deny-warnings),
    `pnpm format:check`, `pnpm audit --prod`, `pnpm manifest:check`, strict
    type-check lane, `pnpm doc` (0 warnings), and the node/http/auth/websocket
    boundary specs from Waves 1–2; run `pnpm test:e2e` in CI (Chromium
    available there). Then `pnpm graft:build` and commit the refreshed graph
    state.

## 4. Dependencies and sequencing

- Wave 1 items 1–2 share `node-http-server-adapter.ts`; do them in one commit.
- Item 4 (oidc) is independent after Wave 1's shared fetch helper if reusing
  cross-package is desired — keep it local to the auth-client otherwise.
- Items 6–10 are independent but all touch CI; batch them so the workflow
  receives one review.
- Item 14 (out-of-tree) is a decision gate for anything touching
  `pnpm-workspace.yaml` — schedule before 12 if the cypress entry is related.
- Item 11 depends on 6–9 (must have green lanes to raise severities).
- Archive the 2026-09-04 plan's completed tasks (SEC-1…4, COR-1/2, ARCH-1/2/3,
  BUILD-1 partial) as resolved when this plan lands.

## 5. Outcome (2026-09-09)

All items implemented. Notable decisions and results:

- **SEC-7**: `#readBody` now cuts off at the cap _inside_ the streaming loop;
  stream is not destroyed (destroyed requests cannot deliver the 413 to the
  client — verified empirically); 413 + follow-up keep-alive requests verified
  clean. New streaming-body boundary test.
- **SEC-8**: malformed-shape JSON (`[1,2]`, `"s"`, `42`) → 400
  `urn:blue:malformed-body` (same problem type as syntax errors).
- **SEC-9**: `allowedWebSocketOrigins` option (fail-closed when set, 403 at
  upgrade, FIFO-safe) — verified with hostile/missing/allowlisted Origin.
- **SEC-10**: token exchange routed through the guarded `#fetchJson` (HTTPS
  assert, timeout, size cap, `redirect: 'error'`) — stalling endpoint, 307
  redirect, and oversized-response tests added.
- **SEC-11**: CSRF cookie defaults to `SameSite=Lax; Secure; Path=/`,
  `tokenBytes` validated 16–1024.
- **COR-3/CI-5**: strict lane now `--filter`-scoped (packages + blue-todo
    - blue-api + blue-hello-node; all three apps strict; blue-todo build config
      fixed — it had never compiled). Lane fails on a deliberate type error
      (verified).
- **CI-1**: `oxlint --deny-warnings`; all warnings fixed (incl. a real bug —
  `targetFor` infinite recursion in `configuration-properties.ts`).
- **CI-2**: `.prettierignore` covers `**/graft/`; full baseline formatted.
- **CI-4**: TypeDoc dead links/symbols fixed, `treatWarningsAsErrors: true`,
  docs lane added to CI.
- **CI-3/H-6**: `@blue/page` stub deleted; AD-3 is the single source of truth.
- **H-1/H-2/H-3**: cypress placeholder removed, dead `label-*` scripts removed,
  generated vitest config artifacts untracked.
- **ARCH-4**: sibling `../todomvc` documented as a hard prerequisite (README),
  `todomcv` typo fixed.
- **ARCH-5/H-5**: layer table + mermaid diagram updated to the shipped 28-node
  graph; README versions + package list refreshed (TS 6.0.3, Nx 23.2.0,
  Vitest 4.0.18, Vite 8.2.2).
- **SEC-12/ARCH-6**: `ManagementAutoConfiguration({ accessGuard })` —
  path-scoped interceptor wrapper on a `handlerMappings` entry (immune to
  registration-order clobbering); telemetry indicator registered once at
  context refresh; README documents the default-open posture.
- **Session contract**: `NodeRequest.session` documented reserved-but-empty.
- **any/`!` burn-down**: rules are now errors repo-wide; ~1,900 explicit
  `any` + non-null assertions removed (src + test + bench, incl. root
  benchmark scripts); only TS-mandated mixin-constructor sites carry
  line-scoped disables (~16 total, each with a reason).
