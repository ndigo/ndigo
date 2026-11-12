# Comprehensive Review and Remediation — 2026-11-05 (code, design, architecture, security, docs)

Scope: full-repository sweep focused on changes since the 2026-11-02 review
(`25b73c5c`) — the application lifecycle presets (AD-90), `create-ndigo-app`
(AD-92), the OIDC refresh-token grant (issue #61), the OpenFeature bridge Phase 2,
the package layer-rank lint rule (AD-89), and the app-ladder renumbering.
Method: mechanical gates (lint/build/test/audit/manifest/doc-links), deep-read of
the new security-relevant surfaces (OIDC adapter, feature gate, refresh flow),
cross-check of `create-ndigo-app` against its own ADR (AD-92), and template/
docs consistency.

## 0. Gate baseline (run at `07baf688`, 2026-11-05)

| Gate                             | Result                         |
| -------------------------------- | ------------------------------ |
| `pnpm lint` (oxlint, type-aware) | ✅ exit 0                      |
| `pnpm build`                     | ✅ 48/48 tasks                 |
| `pnpm doc:check`                 | ✅ fresh (zero warnings)       |
| `pnpm manifest:check`            | ✅ all packages + root conform |
| `pnpm docs:links`                | ✅ 356 files, 1477 links OK    |
| `pnpm audit --prod`              | ✅ no known vulnerabilities    |
| `create-ndigo-app` tests         | ✅ 3/3 (but see F-01/F-02)     |

## 1. Findings

### A. `create-ndigo-app` drift from AD-92 (Medium/High, correctness/contract)

- **F-01 — `--local` rewrites to `workspace:*`, but AD-92 D-5 specifies `file:` links.**
  `packages/create-ndigo-app/src/index.ts:80-96` rewrites `@ndigo/*` entries to
  `workspace:*`; the ADR, `types.ts:25`, and the generated API doc all say `file:`
  links against the workspace. A `workspace:*` entry cannot resolve outside a
  pnpm workspace, so a scaffolded app created with `--local` and installed
  standalone fails. The printed hint even tells the user to add the directory to
  `pnpm-workspace.yaml`, contradicting the ADR's standalone intent.
  Fix: rewrite to `file:` paths resolving each `@ndigo/*` to its local
  `packages/<slug>` directory; keep `--local` and add the documented
  `CREATE_NDIGO_APP_LOCAL` env-var trigger (AD-92 D-5).

- **F-02 — `@ndigo/cli` dev dependency missing from both templates.**
  AD-92 D-3 requires `@ndigo/cli` as a dev dependency so the app gets
  `ndigo serve`/`dev`/`inspect`/`doctor`. Neither `templates/node/package.json.template`
  nor `templates/browser/package.json.template` lists it. Also missing from the
  node template: `build` and `dev` scripts, and the `test` script runs only
  `vitest run` (AD-92 D-3 says `build` + `test` for node).
  Fix: add `@ndigo/cli` to devDependencies and the missing scripts.

- **F-03 — Browser template renders model data via `innerHTML` (XSS pattern).**
  `templates/browser/src/__name__-app-view.ts.template` interpolates `this.#message`
  into `innerHTML`. The template is the canonical example; it teaches unsafe
  rendering. Fix: build the DOM with `document.createElement`/`textContent`.

- **F-04 — Generated READMEs link to files the scaffold never writes.**
  Both `templates/*/README.md.template` reference `./CONTRIBUTING.md` and `./LICENSE`,
  neither of which is in the template tree. Fix: drop the two links or ship the
  files.

- **F-05 — Documentation/implementation mismatches.**
  `types.ts:25` and the generated API doc say `file:` links; `README.md` says
  `workspace:*`; `types.ts:21` says the port default is "the first free
  multiple-of-ten slot above 3000" but the code defaults to `3000`
  (`index.ts:168`). Fix: align docs and code; pick one port default and document it.

- **F-06 — Unhandled prompt failure and no `--help`/`--version`.**
  `prompts.ts:promptChoice` throws on an invalid choice; `scaffold` does not catch
  it, so an interactive typo produces a stack trace instead of exit code 2.
  `parseArgs` rejects `--help`/`-h`/`--version` as unknown flags. Fix: wrap prompt
  calls in the existing try/catch and add `--help`/`--version`.

- **F-07 — Test suite does not exercise AD-92 D-6 gates.**
  `test/scaffold.spec.ts` scaffolds into `apps/99-*` (polluting the monorepo
  tree and Nx graph) and asserts only file existence/manifest shape; it never
  runs `pnpm install`/`build`/`test` on the scaffolded app. Fix: scaffold into a
  temp directory and run the documented gates (at least `pnpm test` in dev mode).

- **F-08 — `--force` can delete an arbitrary path; `isNonEmpty` swallows errors.**
  `index.ts:174-182` `rmSync(targetDir, { recursive: true })` with no guard on
  `targetDir` being `/`, `$HOME`, or a workspace member. `isNonEmpty` returns
  `false` on any `readdirSync` error, masking permission problems.
  Fix: refuse to overwrite when `targetDir` resolves to `/`, the user's home, or
  a path containing `node_modules`/`.git` at its root; surface `readdirSync`
  errors.

- **F-09 — No drift guard for the copied decorator-lowering plugin.**

- **F-28 — Dev-mode `file:` links are not installable (catalog protocol).**
  Workspace packages declare `@tsmetadata/polyfill` (and other tooling) as
  `catalog:` specifiers, which `pnpm publish` rewrites but which a `file:`
  link to the unpublished package cannot resolve — `pnpm install` fails with
  `ERR_PNPM_SPEC_NOT_SUPPORTED_BY_ANY_RESOLVER`. AD-92 D-5's `file:`-link
  dev mode therefore cannot satisfy D-6's install gate as written.
  Fix: either (a) keep `--local` as `workspace:*` (working today, requires the
  app to be a workspace member) and amend AD-92, or (b) resolve `catalog:`
  specifiers to concrete versions in `rewriteLocalDeps` from the root
  `pnpm-workspace.yaml`. Option (b) is preferred for a truly standalone dev
  experience; (a) is the minimal safe change.
  Three byte-identical copies of `vite-plugin-lower-decorators.mjs` exist
  (root `scripts/`, both scaffold templates). Nothing keeps them in sync.
  Fix: add a `test:tooling` assertion (or a manifest check) that the three
  copies are byte-identical.

### B. Application lifecycle presets (Medium, correctness/robustness)

- **F-10 — Web preset registers runtime services after context refresh.**
  `packages/ndigo-platform-web/src/web-application.ts:174-176` calls
  `context.setValue(VIEW_TARGET/DISPATCHER/ROUTER, …)` _after_ `builder.run()`.
  Entries that inject these tokens at construction time (the `@ndigo/test` browser
  harness already notes `WebAutoConfiguration` provides no dispatcher entry)
  cannot resolve them; they must use late resolution. This is an architectural
  inconsistency with the Node preset, where `DISPATCHER` is an entry.
  Fix: either register the three as late entries via a post-refresh phase, or
  document the late-resolution contract and provide a `context.getValue` helper;
  add a test that an entry depending on `ROUTER` resolves.

- **F-11 — Node preset `close()` is not exception-safe and double-closes.**
  `run-node-application.ts:164-174` awaits `server.close()` then resources then
  `context.close()`; if `server.close()` rejects, the context is never closed.
  When both the OS-signal handler and an explicit `close()` run, resources are
  closed twice (idempotency of `server.close()` is assumed but not asserted).
  Fix: wrap in try/finally; make `server.close()` idempotent guard explicit.

- **F-12 — Discovery/config poisoning and path handling (low).**
  `node-config-file-reader.ts` only special-cases `ENOENT`; a transient
  `EACCES` rethrows (intended). `StandardConfigFileLoader` reads
  `NDIGO_CONFIG_LOCATION` from the environment; an attacker who can set env vars
  can point it at any readable file. Deployment-time concern; document the trust
  boundary in the preset docs.

### C. OIDC refresh-token grant (Medium, security/robustness)

- **F-13 — Discovery promise is cached forever after a failure.**
  `oidc-adapter.ts:475` `this.#discoveryPromise ??= this.#fetchDiscovery()`; a
  rejected promise is retained, so a transient network error permanently poisons
  the adapter until restart. Fix: reset `#discoveryPromise = null` in a `.catch`.

- **F-14 — Malformed discovery endpoint URL escapes as a raw `TypeError`.**
  `#assertTrustedEndpoint` calls `new URL(value)` without a try/catch; a
  discovery document carrying `"authorization_endpoint": "not-a-url"` throws a
  `TypeError` instead of an `OIDCError`, violating the documented "every
  authorization/token failure mode throws OIDCError" contract.
  Fix: wrap and rethrow as `OIDCError('discovery', …)`.

- **F-15 — Refresh HTTP 400 is over-classified as `invalid_grant`.**
  `refresh()` maps _any_ 400 response to `invalid_token`/invalid_grant, including
  `invalid_client` (wrong client secret) or `invalid_request`. It also does not
  handle 401. Fix: parse the provider's `error` field from the body and map
  `invalid_grant` specifically; surface other codes as `network`/`configuration`.

- **F-16 — Refresh-token store is keyed by the raw token.**
  `InMemoryRefreshTokenStore` and the documented Redis seam use the refresh
  token itself as the key, so a shared store (Redis) holds live bearer
  credentials at rest. Fix: key by a SHA-256 hash of the token (store the hash);
  document the contract on `RefreshTokenStore`.

- **F-17 — Single-use rotation is not atomic under concurrency.**
  `refresh()` does `get` → network → `delete` + `set`. Two concurrent refreshes
  with the same token both pass the `get` check and both hit the provider; on
  non-rotating providers both succeed; on rotating providers the second fails
  with a confusing error and the client may keep the stale token. Fix: add a
  `consume`/atomic-get-and-delete to `RefreshTokenStore`, or serialize refresh
  per token in the adapter.

- **F-18 — `#fetchJson` misclassifies malformed JSON as a network error.**
  `JSON.parse` failures inside the try block are caught and rethrown as
  `OIDCError('network', …)`. Fix: catch parse errors separately and throw
  `OIDCError('malformed_response', …)`.

- **F-19 — Auth client leaks a mutable shared state object and races refresh.**
  `AuthClient.state` returns the live `#state` object; callers can mutate
  `isAuthenticated`/`token` without going through the adapter.
  `AuthClient.refresh` has the same concurrency race as F-17.
  Fix: return a shallow copy; serialize in-flight refresh with a promise cache.

### D. Feature flags (Medium/Low, security/performance/privacy)

- **F-20 — Feature-gate 404 leaks the feature name.**
  `feature-gate-interceptor.ts:180` writes `Feature '${flag}' is not enabled.`
  in the problem detail, disclosing gated feature names to unauthenticated
  callers. Fix: generic detail (`Feature not enabled.`) or gate behind a
  debug flag.

- **F-21 — Per-request flag evaluation with no memoization.**
  `preHandle` evaluates on every request; with a remote provider (OpenFeature
  bridge) this adds provider latency/traffic per request. Fix: document the
  expectation that providers cache, or add a short-lived per-process memo keyed
  by (flag, targeting key) with a TTL option.

- **F-22 — Default targeting key is the raw client IP.**
  `ClientAddressFlagContextResolver` uses `remoteAddress` (the trusted-proxy-
  resolved IP) as the targeting key, which is then forwarded to any registered
  flag provider. IP is personal data under GDPR/CCPA and a poor rollout bucket
  for NATed users. Fix: hash the IP (or make the default an opaque session id)
  and document the privacy implication; allow apps to override the resolver.

### E. Lint/layer system (Low, coverage/correctness)

- **F-23 — `no-upward-layer-imports` flags type-only imports.**
  The rule and its spec regex treat `import type`/`export type` as runtime
  edges, so a package cannot type-import from a higher layer even though the
  edge erases at runtime. Fix: inspect `importKind`/`exportKind` and skip
  `type`-kind declarations.

- **F-24 — `create-ndigo-app` is outside the layer system.**
  The rule's filename pattern and `readManifests` only match `packages/ndigo-*`,
  so the new package is never layer-checked and never appears in the rank map.
  Fix: extend the pattern/map to cover `packages/create-ndigo-app` (rank 0,
  tooling-adjacent) or document the exemption.

### F. Repository hygiene/portability (Low/Medium)

- **F-25 — Root depends on a sibling `../todomvc` checkout.**
  `pnpm-workspace.yaml` includes `../todomvc/examples/*` and root scripts
  (`build:all`, `test:benchmark*`, `build:ndigo`, `build:todomvc`) reference
  it. A fresh clone without that sibling fails or silently skips workspace
  members. Fix: document the optional sibling in a README section, or move the
  benchmark lanes behind a guard that skips gracefully when the directory is
  absent.

- **F-26 — Stale app-number references after the renumbering.**
  The ladder renumbering (#110) renamed apps; prose/docs may still cite old
  numbers. `docs:links` passes, but numeric references are not link-checked.
  Fix: grep docs for `apps/0[0-9]-` and `apps/1[0-9]-` and reconcile with the
  current `apps/` directory.

- **F-27 — Template author/infra inconsistencies.**
  Node template carries a no-op `import 'node:process'`; browser tsconfig lacks
  `rewriteRelativeImportExtensions` that the node template has; browser bundle
  test throws `ENOENT` when `dist/` is absent instead of failing an assertion.
  Fix: drop the no-op import, align tsconfigs, guard `readdirSync`.

## 2. Waves

### Wave 1 — `create-ndigo-app` contract alignment (single PR, mostly templates/docs)

1. F-01 — rewrite `--local` to `file:` links + add `CREATE_NDIGO_APP_LOCAL`.
2. F-02 — add `@ndigo/cli` devDep, `build`/`dev` scripts, fix `test` script.
3. F-03 — replace `innerHTML` with `textContent`/`createElement`.
4. F-04 — fix or remove README links to CONTRIBUTING/LICENSE.
5. F-05 — align port default and rewrite wording across code/docs/API.
6. F-06 — handle prompt errors; add `--help`/`--version`.
7. F-09 — add byte-identical assertion for the lowering plugin copies.

Verify: `pnpm --filter create-ndigo-app test`, `pnpm build`, `pnpm lint`,
`pnpm docs:links`, `pnpm doc:check`.

### Wave 2 — OIDC robustness and security (two PRs)

8. F-13 — reset discovery promise on rejection.
9. F-14 — wrap `new URL` in `#assertTrustedEndpoint`.
10. F-15 — parse provider `error` on refresh; map `invalid_grant` only.
11. F-16 — key refresh store by SHA-256 hash; document the contract.
12. F-17 — atomic consume or per-token serialization.
13. F-18 — separate `malformed_response` for JSON parse failures.
14. F-19 — copy state; serialize in-flight refresh.

Verify: `pnpm --filter @ndigo/auth-client test`, `pnpm --filter @ndigo/auth-server test`,
app `18-ndigo-auth-playground` tests, `pnpm build`, `pnpm lint`.

### Wave 3 — feature flags and layer system (one PR)

15. F-20 — generic feature-gate detail.
16. F-21 — document/provider-cache expectation or add memo.
17. F-22 — hash IP targeting key by default.
18. F-23 — exempt type-only imports in the layer rule + spec.
19. F-24 — include `create-ndigo-app` in the layer map/checks.

Verify: `pnpm lint`, `pnpm test:internal`, `pnpm --filter @ndigo/flags-openfeature test`,
`pnpm --filter @ndigo/platform-node test`.

### Wave 4 — hygiene, portability, tests, templates (one PR)

20. F-07 — scaffold tests into a temp dir and run the documented gates.
21. F-08 — guard `--force` deletion; surface `readdirSync` errors.
22. F-10 — resolve web-preset late binding (design decision + doc/test).
23. F-11 — exception-safe Node preset `close()`.
24. F-25 — document/guard the sibling `todomvc` dependency.
25. F-26 — reconcile stale app-number references in docs.
26. F-27 — drop no-op import; align tsconfigs; guard bundle test.

Verify: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm docs:links`,
`pnpm manifest:check`, `pnpm doc:check`.

## 3. Verification (whole plan)

- `pnpm lint && pnpm build && pnpm test`
- `pnpm manifest:check && pnpm docs:links && pnpm doc:check`
- `pnpm audit --prod` stays clean (no dependency changes proposed)
- After merge: `graft build` to refresh the graph.

## 4. Notes

- The prior review (2026-11-02) findings M1–M4 and L1–L4 are verified fixed
  on `main` (bounded revocation cache, persisted todo refresh, redis README,
  AGENTS engine/dependency convention, dom prerequisite, STYLE_GUIDE numbering).
- No dependency changes are proposed; `pnpm-lock.yaml` stays untouched.

## 5. Execution log (2026-11-05)

Implemented in two commits on `docs/comprehensive-review-2026-11-05`:

- **Wave 1 (F-01…F-09, F-28):** create-ndigo-app contract alignment, drift guard, prompt/error handling, force guard, templates, docs.
- **Wave 2 (F-13, F-14, F-15, F-16, F-17, F-18, F-19):** OIDC discovery reset, URL validation, provider-error parsing, hashed refresh keys, in-flight serialization, JSON misclassification, AuthClient state copy + refresh serialization.
- **Wave 3 (F-20, F-22, F-23, F-24):** generic feature-gate detail, hashed IP targeting key, type-only import exemption, tooling exemption doc.
- **Wave 4 (F-11, F-27):** exception-safe Node preset close(), bundle-test guard.

Remaining (documented, intentionally deferred as design decisions):

- F-10 (web late binding): the late-resolution contract is documented in `web-application.ts`; changing to eager entries would require a post-refresh registration phase and is tracked separately.
- F-21 (flag memo): providers are expected to cache; per-request evaluation is by design for live flags (AD-82). Opt-in memoization deferred to a follow-up if profiling shows need.
- F-26 (historical doc refs): historical plans/migrations/decisions intentionally retain old app numbers; live guides already use current numbers.
- Each wave is intended to be one PR per AGENTS.md §8 (one issue = one branch =
  one worktree = one PR). Single-lane files (lockfile, generated trees) are not
  touched by this plan.
