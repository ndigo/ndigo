# Repository Remediation Plan

**Date:** 2026-09-04  
**Status:** Proposed  
**Scope:** Architecture, security, correctness, package design, conventions, documentation, and delivery controls across the BlueJS monorepo.

## 1. Baseline

The repository has a coherent package-oriented design and broad automated coverage. The current baseline is not release-ready:

- `pnpm build` succeeds for 28 library projects, entirely from the local Nx cache.
- `pnpm test` succeeds for 31 projects; Nx reports `@blue/auth-client:test` as flaky and one placeholder test is skipped.
- `pnpm lint` exits successfully while reporting 240 warnings because most quality and boundary rules are warnings.
- `pnpm format:check` fails and reports 2,913 files. The command includes generated documentation and local harness files as well as maintained source.
- `pnpm audit --prod --audit-level low` fails with 37 advisories: 19 high and 18 moderate. Runtime telemetry includes a vulnerable `@opentelemetry/core`; generator/Nx paths include vulnerable `minimatch` and `axios` versions.
- `pnpm doc` generates Markdown with 289 warnings, including nonexistent `blue-auth` and `blue-generators/src/index.ts` entry points and unresolved/obsolete TSDoc tags and links.

Existing strengths to preserve:

- Package public APIs are generally barrel-controlled.
- The prior dispatcher and event-emitter decompositions removed major oversized-file findings.
- Server JWT validation now uses `jose`, restricts algorithms, and validates issuer/audience/expiration.
- Platform-specific telemetry code has separate subpath entry points.
- CI builds, runs unit/integration tests, and exercises the todo application in Chromium.

## 2. Current Findings

| ID      | Severity | Area                     | Evidence and risk                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-1   | Critical | OIDC                     | `packages/blue-auth-client/src/oidc-adapter.ts` accepts tokens without signature verification when neither `jwksUrl` nor `tokenValidator` is supplied. That insecure mode is the default shown in the package README. Authorization state is optional, PKCE and nonce are absent, endpoints are constructed rather than discovered, and token response fields are used without schema validation. |
| SEC-2   | High     | Node HTTP                | `NodeHTTPServerAdapter.#readBody()` buffers an unbounded request before entering the dispatch `try` block. Large or aborted requests can exhaust memory or reject outside response handling. Internal exception messages are returned in 500 bodies. `listen()` does not reject on bind errors.                                                                                                   |
| SEC-3   | High     | Static files             | `StaticFileView` and the API `StaticController` use string-prefix containment checks. Sibling-prefix paths and filesystem symlinks can escape the intended root. Both force UTF-8 reads, corrupting binary files despite PNG MIME support.                                                                                                                                                        |
| COR-1   | High     | Authorization            | `AuthRouteGuard.preHandle()` only returns `false`. The dispatcher then completes with no model, and the Node adapter does not finalize a response; denied requests can remain open instead of receiving 401/403. The guard also validates a token against every registered adapter instead of selecting an explicit authentication scheme.                                                        |
| SEC-4   | High     | Dependencies             | Production audit reports 37 known advisories, including an OpenTelemetry baggage memory-allocation issue in runtime telemetry. The CI workflow does not run an audit.                                                                                                                                                                                                                             |
| ARCH-1  | High     | Platform boundary        | `@blue/boot` imports `NodeAutoConfiguration` and has a runtime dependency on `@blue/platform-node`. This contradicts the documented isomorphic tier and makes the shared bootstrap package Node-coupled.                                                                                                                                                                                          |
| COR-2   | High     | Request contract         | `NodeHTTPServerAdapter` initializes `cookies` and `session` as empty objects although `NodeRequest`, package docs, and argument resolvers advertise populated cookie/session data. Body parsing ignores content type and silently treats malformed JSON as a wildcard string. Repeated query values are overwritten.                                                                              |
| SEC-5   | Medium   | Management surface       | `/metrics` and detailed `/health` are registered without an access policy. Health check exceptions are returned to callers. No management bind-address, path, redaction, or authorization policy is documented.                                                                                                                                                                                   |
| SEC-6   | Medium   | Server hardening         | The Node server exposes no request/header/body timeout policy, security-header policy, rate-limit integration point, trusted-proxy policy, or centralized safe error response. CSRF cookies default without `Secure`, and cookie parsing is not wired into the default adapter.                                                                                                                   |
| ARCH-2  | Medium   | Telemetry packaging      | Telemetry subpaths prevent code re-export leakage, but the single package still installs Node SDK/exporters and declares both platform packages as peers. Package-level dependencies cannot be isolated by subpath exports, so the nominal isomorphic core retains platform installation weight and vulnerable runtime dependencies.                                                              |
| ARCH-3  | Medium   | CORS design              | `CORSInterceptor` is an outbound browser request interceptor. It cannot attach server response headers despite documentation claiming server-side/preflight handling, and its default constants are unused. The name and docs promise a security boundary it does not implement.                                                                                                                  |
| TYPE-1  | Medium   | Type safety              | Root and package TypeScript configurations enable `skipLibCheck` and do not enable `strict`. Public contracts still expose `any`; lint explicitly allows `no-explicit-any` and non-null assertions. This weakens library boundary guarantees.                                                                                                                                                     |
| QUAL-1  | Medium   | Quality gate             | Lint reports 240 warnings, including unused production imports/fields, dead abstractions, suspicious unused expressions, and boundary-rule warnings. CI accepts all warnings. Some sequential awaits are intentional and need documented rule exceptions rather than mechanical `Promise.all`.                                                                                                    |
| QUAL-2  | Medium   | Formatting               | Formatting is not enforced by CI. The check is also poorly scoped: generated `doc-html`, generated Markdown, scratch output, and harness configuration dominate its 2,913-file failure set.                                                                                                                                                                                                       |
| TEST-1  | Medium   | Verification             | Coverage configuration has no thresholds and CI does not collect coverage despite the architecture document claiming greater than 80%. Static-file security, body limits, malformed/aborted requests, auth-denial HTTP responses, and management access policy lack behavior-level coverage. One placeholder suite is skipped and auth-client tests are flaky.                                    |
| DOC-1   | Medium   | Documentation            | Root README tool versions are stale, says ESLint while the repository uses Oxlint, lists removed packages, and omits current packages. Platform/auth READMEs show obsolete APIs and insecure defaults. TypeDoc has stale entry points and 289 warnings.                                                                                                                                           |
| PKG-1   | Medium   | Package consistency      | Manifests mix `workspace:*`, `workspace:~`, and `~0.0.1`; use MIT and ISC inconsistently; alternate between `main` and export maps; and pin different TypeScript versions. The generator edits a central alias list with a fragile regular expression and does not update docs, TypeDoc, or other package metadata.                                                                               |
| BUILD-1 | Medium   | Supply chain and release | CI omits formatting, API report compatibility, documentation validation, dependency audit, and coverage. GitHub Actions use mutable major tags and workflow permissions are not minimized. There is no visible release/publish validation path.                                                                                                                                                   |
| CLEAN-1 | Low      | Repository hygiene       | Legacy root bundles/entry points, `.scratch` output, stale package output-only directories, generated documentation, old implementation summaries, and build metadata obscure the maintained source of truth.                                                                                                                                                                                     |
| DOC-2   | Low      | Governance               | No root `CONTRIBUTING`, `SECURITY`, or license file was found. The plans index is stale and does not list recent plans. Architecture guidance is long and partly generic, making enforceable package-boundary decisions difficult to find.                                                                                                                                                        |

## 3. Remediation Principles

1. Fail closed at authentication and authorization boundaries.
2. Put transport parsing, limits, and response finalization in the platform adapter, not controllers.
3. Enforce package boundaries with dependency topology and CI, not prose alone.
4. Make maintained source the only editable source of truth; generate artifacts in CI or release jobs.
5. Turn checks green before making them blocking. Do not hide warnings by blanket ignores.
6. Preserve sequential semantics where ordering is contractual; suppress `no-await-in-loop` only with a local reason.
7. Deliver clean cutovers. Remove obsolete aliases, insecure modes, and duplicate paths rather than deprecating them indefinitely.

## 4. Execution Plan

### Wave 1 — Close externally reachable security gaps

#### 1. Make OIDC verification mandatory

- **Objective:** Replace the claim-only OIDC mode with a standards-compliant, fail-closed authorization-code flow.
- **Changes:**
    - Require a trusted discovery document/JWKS source or an explicit validator at construction; remove unsigned-token acceptance.
    - Resolve authorization, token, JWKS, and end-session endpoints from validated discovery metadata.
    - Generate and verify `state`, PKCE `code_verifier`/`code_challenge`, and OIDC `nonce`.
    - Validate token response shape, issuer, audience, authorized party where applicable, expiration/not-before, nonce, and allowed algorithms before constructing a principal.
    - Bound remote discovery/JWKS fetches with HTTPS requirements, timeouts, size limits, and cache behavior.
    - Replace the insecure README example and document public-versus-confidential client handling.
- **Files:** `packages/blue-auth-client/src/oidc-adapter.ts`, auth-client public types/exports, README, behavior tests.
- **Acceptance:** Forged, unsigned, wrong-issuer, wrong-audience, stale-state, missing-PKCE, wrong-nonce, and malformed token responses all fail without mutating auth state.
- **Verify:** Targeted auth-client tests plus a throwaway local OIDC/JWKS flow using signed tokens.
- **Depends:** None.

#### 2. Bound and normalize the Node request pipeline

- **Objective:** Ensure every request is bounded, parsed predictably, and receives a completed response.
- **Changes:**
    - Add configurable body-byte, header, request, headers, keep-alive, and shutdown limits with conservative defaults.
    - Wrap URL construction, body streaming, parsing, dispatch, and response finalization in one error boundary.
    - Return 400 for malformed input, 408 for timed-out requests, 413 for oversized bodies, and a generic 500 body with internal details logged separately.
    - Parse only declared supported content types; reject malformed JSON instead of silently changing its shape.
    - Preserve repeated query parameters using the existing multi-value contract.
    - Make `listen()` reject on bind errors and make close/start state transitions race-safe.
- **Files:** `packages/blue-platform-node/src/node-http-server-adapter.ts`, `http-server.ts`, request/error types, integration tests, README.
- **Acceptance:** Oversized, aborted, malformed-host, malformed-JSON, duplicate-query, bind-failure, and timeout scenarios terminate deterministically with documented statuses and bounded memory.
- **Verify:** Launch the actual HTTP server and exercise each boundary over a real socket/fetch client.
- **Depends:** None.

#### 3. Define cookie, session, CSRF, and denial contracts

- **Objective:** Make advertised request and authorization features real and fail closed.
- **Changes:**
    - Parse RFC-compatible cookies into `NodeRequest.cookies` with count/size limits.
    - Remove `session` from the default populated contract or add an explicit session-provider interface; never advertise an always-empty session as implemented.
    - Introduce an explicit interceptor-denial result/response contract so Node auth denials finalize as 401/403 and browser denials can redirect.
    - Select an auth adapter/scheme explicitly rather than attempting every registered adapter.
    - Harden CSRF cookie defaults for production (`Secure`, `SameSite`, host-only naming guidance), validate option ranges, and document the deliberate absence of `HttpOnly` for double-submit use.
- **Files:** node request/adapter/resolvers, dispatcher interception contract, auth-server guard/server, CSRF interceptor, platform/auth docs and tests.
- **Acceptance:** Missing/invalid credentials always produce 401, insufficient roles produce 403, cookie parameters resolve in a real HTTP request, and no denied request remains open.
- **Verify:** Real-server integration scenarios, not boolean-only guard tests.
- **Depends:** Task 2 for the centralized response boundary.

#### 4. Replace static-file path checks

- **Objective:** Guarantee that static resources cannot escape their configured root and preserve raw bytes.
- **Changes:**
    - Centralize one static-resource resolver used by both `StaticFileView` and the demo controller.
    - Resolve and canonicalize the base and candidate paths; require `candidate === base` or containment by `base + sep`.
    - Resolve filesystem symlinks and reject any real path outside the canonical base.
    - Stream or return `Buffer` data, set MIME from a maintained allowlist, set `nosniff`, and distinguish forbidden/not-found/internal failures without leaking paths.
- **Files:** `packages/blue-platform-node/src/static-file-view.ts`, a shared internal resolver, demo static controller, response target, tests.
- **Acceptance:** Parent traversal, sibling-prefix, encoded traversal, absolute path, and escaping symlink cases are denied; PNG/SVG/text round-trip byte-for-byte.
- **Verify:** Launch the demo/server against a temporary fixture tree including an escaping symlink.
- **Depends:** Task 2 response semantics.

#### 5. Eliminate known dependency advisories

- **Objective:** Reach a clean production audit or document a time-bound exception with no reachable exploit path.
- **Changes:**
    - Upgrade the OpenTelemetry family coherently to versions containing `@opentelemetry/core >= 2.8.0`, including API compatibility work.
    - Upgrade Nx/generator dependency paths to patched `minimatch` and `axios` versions; avoid blind overrides across incompatible majors.
    - Add automated update tooling and an advisory triage policy.
- **Files:** package manifests, lockfile, telemetry compatibility code, CI.
- **Acceptance:** `pnpm audit --prod --audit-level high` succeeds; moderate exceptions, if any, name owner, reachability evidence, and expiry.
- **Verify:** Production audit, build, telemetry smoke test, generator smoke test.
- **Depends:** None; coordinate with Wave 2 telemetry packaging to avoid duplicate lockfile churn.

### Wave 2 — Restore package and platform boundaries

#### 6. Make `@blue/boot` platform-neutral

- **Objective:** Remove Node and DOM platform dependencies from shared bootstrap code.
- **Changes:**
    - Remove the static `NodeAutoConfiguration` import and `@blue/platform-node` dependency from boot.
    - Move Node auto-registration to a Node bootstrap entry/package or require platform configuration as an explicit application source.
    - Keep browser auto-configuration in `@blue/platform-web`; do not reintroduce it through the boot root.
    - Add a dependency-boundary test/lint rule that rejects `node:`/DOM/platform imports from isomorphic packages.
- **Files:** boot application/package manifest, platform-node bootstrap, consuming apps, custom lint rules/tests.
- **Acceptance:** Importing `@blue/boot` in a browser and Node process loads no opposite-platform module; Nx dependency graph contains no boot-to-platform edge.
- **Verify:** Minimal browser bundle and Node import smoke tests plus dependency graph assertion.
- **Depends:** None.

#### 7. Complete telemetry separation

- **Objective:** Make the isomorphic telemetry core independent at installation and runtime.
- **Changes:**
    - Split Node SDK/exporters/instrumentations into `@blue/telemetry-node` and browser setup/instrumentation into `@blue/telemetry-web`, unless a package-manager-supported optional-dependency design proves equivalent.
    - Keep `@blue/telemetry` limited to API, logger, metrics, severity, and platform-free instrumentation bases.
    - Remove unconditional platform peers and Node SDK dependencies from the core manifest.
    - Migrate every consumer and TypeDoc entry without compatibility shims.
- **Files:** telemetry packages, consumers, workspace/TypeDoc/test aliases, docs.
- **Acceptance:** Installing/importing core telemetry does not install or resolve either platform package or Node SDK exporters.
- **Verify:** Pack/install each package into clean temporary browser and Node consumers, then bundle/import it.
- **Depends:** Coordinate with dependency upgrades in Task 5.

#### 8. Separate client CORS policy from server CORS enforcement

- **Objective:** Stop presenting an outbound browser helper as server-side CORS protection.
- **Changes:**
    - Rename the browser helper to describe request credential/mode behavior, or remove it where Fetch already provides the behavior.
    - Implement a Node response interceptor for allowlisted origins, methods, headers, credentials, `Vary: Origin`, and preflight short-circuiting.
    - Reject invalid wildcard-plus-credentials configurations at startup.
- **Files:** platform-web interceptor/tests/docs; platform-node interceptor/tests/docs.
- **Acceptance:** Browser helper documentation makes no server claims; real Node preflight/actual responses enforce configured policy.
- **Verify:** Cross-origin integration matrix against a launched server.
- **Depends:** Task 2 response pipeline.

### Wave 3 — Tighten contracts, types, and package metadata

#### 9. Introduce strict TypeScript incrementally

- **Objective:** Make exported package contracts type-safe without one unreviewable flag-day change.
- **Changes:**
    - Enable `strict` first in leaf packages, then move upward through core, context, dispatcher, platforms, and apps.
    - Replace public `any` with `unknown`, generics, discriminated unions, or typed context tokens.
    - Disable `skipLibCheck` in a dedicated CI type-check lane before changing the default developer loop.
    - Treat `@ts-ignore` as forbidden; require narrowly explained `@ts-expect-error` only in compatibility tests.
- **Acceptance:** Every package opts into strict mode; public declarations contain no unexplained `any`; full declaration build succeeds without skipped library checks in CI.
- **Verify:** Per-package `tsc -b` during migration, then the workspace build/type-check lane.
- **Depends:** Waves 1–2 contracts stabilized.

#### 10. Standardize package manifests and generation

- **Objective:** Make every publishable package follow one release contract.
- **Changes:**
    - Decide one license and add the matching root license file.
    - Standardize export maps, `types`, files, side-effects declarations, workspace protocols, package versions, repository metadata, engines, and scripts.
    - Align TypeScript/Vitest/Nx versions at the workspace root.
    - Replace regex mutation of `vitest.config.ts` with generated project metadata or a single discovered alias source.
    - Make the generator update TypeDoc/package indexes through structured data, then test generation in an isolated tree.
- **Acceptance:** A manifest conformance script reports no differences; every package can be packed and imported from its declared exports.
- **Verify:** `pnpm pack --dry-run` and clean-consumer import/type smoke tests for every publishable package.
- **Depends:** Task 7 determines telemetry package names.

#### 11. Preserve error causes and explicit lifecycle state

- **Objective:** Stop losing actionable failures at framework boundaries.
- **Changes:**
    - Preserve the original cause when `Application.run()` wraps startup failures.
    - Define errors for bind, parse, dispatch, auth, and configuration failures with safe public messages and internal causes.
    - Validate port ranges and lifecycle transitions.
    - Review generic `Error` usage only where callers need classification; do not create a taxonomy for internal programmer errors.
- **Acceptance:** Startup and transport failures retain inspectable causes while HTTP clients receive non-sensitive errors.
- **Verify:** Failure-path behavior tests and a startup smoke scenario with a deliberate bind/config error.
- **Depends:** Task 2.

### Wave 4 — Make quality and release controls trustworthy

#### 12. Establish a maintained-file formatting boundary

- **Objective:** Make formatting deterministic and enforceable.
- **Changes:**
    - Exclude generated docs/assets, build outputs, caches, scratch work, vendored workers, archives, and harness-owned configuration from Prettier.
    - Format maintained source/config/docs once in package-sized commits.
    - Add `pnpm format:check` to CI after the baseline is clean.
- **Acceptance:** The check covers maintained files only and returns zero differences locally and in CI.
- **Verify:** `pnpm format:check` plus a deliberate unformatted fixture in a CI-script test if the scope script is custom.
- **Depends:** Repository cleanup in Task 16 may reduce churn; scope configuration can land first.

#### 13. Burn down lint warnings and enforce boundaries

- **Objective:** Make a successful lint result mean zero actionable diagnostics.
- **Changes:**
    - Remove unused production code/imports and investigate each unused expression.
    - Delete the unused `AuthRouterInterceptor.#guard`/duplicate middleware path or route all authorization through the guard.
    - Promote package-boundary, browser-global, unsafe optional chaining, caught-error preservation, and unused production code rules to errors.
    - Locally document intentional sequential-await loops; do not parallelize ordering-sensitive interceptors/resolvers.
    - Run Oxlint with a zero-warning threshold in CI.
- **Acceptance:** `pnpm lint` reports zero warnings/errors and a boundary-violation fixture fails.
- **Verify:** Lint plus rule tests in `@blue/eslint-plugin`.
- **Depends:** Waves 1–3 remove several warned paths.

#### 14. Add release-grade CI lanes

- **Objective:** Detect security, compatibility, documentation, and packaging regressions before merge.
- **Changes:**
    - Add format, strict type-check, production audit, API Extractor report, TypeDoc validation, package conformance, and package smoke-test lanes.
    - Add meaningful coverage thresholds around critical framework paths rather than a repository-wide vanity number.
    - Remove the skipped placeholder and make the flaky auth-client test deterministic before enabling retry policy.
    - Set minimal workflow permissions and pin third-party actions to reviewed commit SHAs.
    - Keep expensive E2E after fast quality/security lanes.
- **Acceptance:** Every lane is deterministic, required, and fails on a deliberate representative defect.
- **Verify:** CI workflow dispatch on the remediation branch and local execution of each underlying command.
- **Depends:** Tasks 5, 9, 10, 12, and 13.

### Wave 5 — Repair documentation and governance

#### 15. Rebuild documentation from current contracts

- **Objective:** Make the docs accurate enough to be used as the framework contract.
- **Changes:**
    - Update root versions, package inventory, Oxlint commands/configuration, platform model, and security posture.
    - Rewrite auth docs around the fail-closed OIDC flow; mark demo credentials/tokens as non-security examples and isolate them from production guidance.
    - Update Node docs to the actual decorator names, bootstrap flow, request limits, cookie/session support, and error semantics.
    - Fix TypeDoc entry points, obsolete JSDoc tags, and unresolved links; remove `skipErrorChecking` and treat documentation warnings as errors.
    - Reduce `ARCHITECTURE.md` to repository-specific boundaries and rationale; move durable choices into ADRs and remove stale generic textbook material.
    - Update the plans/audits indexes and status fields.
- **Acceptance:** All documented commands run; every linked package/path exists; TypeDoc emits zero warnings.
- **Verify:** Link check, command smoke checks, and `pnpm doc` under warning-as-error settings.
- **Depends:** Waves 1–3 finalize contracts.

#### 16. Add contributor and security governance

- **Objective:** Define how changes, vulnerabilities, releases, and compatibility are handled.
- **Changes:**
    - Add root `CONTRIBUTING`, `SECURITY`, and license files.
    - Document supported Node/pnpm versions, vulnerability reporting, dependency-update SLA, release/versioning policy, API compatibility review, and generated-file policy.
- **Acceptance:** A new contributor can install, validate, change one package, and prepare a release using only repository documentation.
- **Verify:** Follow the documented clean-checkout workflow in a temporary clone/worktree.
- **Depends:** Task 10 license/version decisions and Task 14 final commands.

### Wave 6 — Remove obsolete state and certify the repository

#### 17. Delete stale and generated repository state

- **Objective:** Leave one obvious source of truth.
- **Changes:**
    - Determine ownership of root `index.js`/maps, `src/index.*`, `.scratch`, output-only directories, generated docs, old implementation reports, and build metadata.
    - Delete obsolete tracked files; generate required release/docs artifacts only in designated jobs.
    - Extend ignores narrowly for reproducible outputs, including OS metadata and scratch output.
- **Acceptance:** A clean build/test/doc run does not create untracked source-tree artifacts and no stale package appears in workspace tooling or docs.
- **Verify:** Clean-worktree artifact diff after all generators/builds and package inventory comparison.
- **Depends:** Tasks 10, 12, and 15 define the retained outputs.

#### 18. Final certification

- **Objective:** Prove the remediated repository end to end.
- **Acceptance and verification:**
    - Fresh, uncached library and application builds succeed.
    - Unit/integration suites pass with no skipped placeholders or flaky-task report.
    - Todo browser E2E passes.
    - Real Node HTTP smoke suite covers successful dispatch, malformed/oversized/aborted input, cookies, auth 401/403, CSRF, CORS, static files, management policy, and graceful shutdown.
    - Lint and maintained-file formatting are clean.
    - Strict type checking and API reports are clean.
    - TypeDoc emits zero warnings and links resolve.
    - Production audit has no high advisories and every remaining lower-severity exception is documented and time-bounded.
    - Package packing/import smoke tests pass in clean browser and Node consumers.
- **Depends:** All prior tasks.

## 5. Delivery Order

Use small, reviewable pull requests. Security/correctness changes should not be mixed with bulk formatting.

1. PR A: OIDC fail-closed flow.
2. PR B: Node request limits/error boundary/listen lifecycle.
3. PR C: auth denial + cookie/session/CSRF contracts.
4. PR D: static-resource resolver.
5. PR E: dependency upgrades.
6. PR F: boot platform separation.
7. PR G: telemetry package separation.
8. PR H: CORS split.
9. PR series I: strict typing by dependency layer.
10. PR J: manifest/generator conformance.
11. PR K: formatter scope and package-sized formatting commits.
12. PR L: lint cleanup and zero-warning gate.
13. PR M: CI/release controls.
14. PR N: documentation/governance.
15. PR O: obsolete-state cleanup and final certification.

Security PRs A–E may proceed in parallel where they do not share manifests/lockfiles. Serialize dependency/telemetry manifest work and defer bulk formatting until functional diffs are merged.
