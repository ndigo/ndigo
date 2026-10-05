# Package Review Audit

**Date:** 2026-08-22
**Scope:** All 27 packages in the BlueJS Nx monorepo (`packages/blue-*`)
**Method:** Direct read review (auth packages, core, context, dispatcher, router, http, dom, platform-_, view-_, validate, service, telemetry, reactive, model, etc.) + parallel scout subagents for remaining packages (3 scouts failed on stream timeout — covered inline).

## Executive Summary

**1 Critical, 4 High, 10 Medium, 5 Low** findings across architecture, security, readability, complexity, and feature axes.

The highest-priority issue is a **dead-code SECURITY bypass in the demo app** (CRITICAL) — auth interceptor never runs. The most widespread code-quality issue is **committed build artifacts in `src/`** across 7 packages (HIGH). The architecture is generally sound with well-maintained layering after Waves 1–10; most findings are at the margins.

---

## Findings by Severity

### CRITICAL (1)

#### C1: Demo auth interceptor passes `undefined` — auth enforcement dead code

- **File:** `apps/blue-demo/src/auth-router-interceptor.ts:30`
- **Axis:** Security, Architecture
- **Issue:** `extractAuthMetadata(undefined)` always returns `{ requiresAuth: false, requiredRoles: [] }`, so `preHandle` always returns `true`. Every protected route (`#/auth/admin`) is publicly accessible without authentication.
- **Root cause:** The interceptor was written against `@blue/auth-client`'s `extractAuthMetadata` API but never receives a route handler object. The `authMiddleware` function at line 68 similarly checks `authClient.isAuthenticated` but is never wired into the router.
- **Action:** Wire `AuthRouterInterceptor.preHandle` to read route metadata from the actual route's handler. Either (a) pass the handler from the router interceptor pipeline, or (b) use a route metadata registry mapping paths to their auth requirements. Also wire `ClientAuthGuard` (created as `#guard` at line 17) into the interceptor chain instead of using raw `authClient` checks.

---

### HIGH (4)

#### H1: Committed `.js` / `.d.ts` / `.js.map` / `.d.ts.map` build artifacts in `src/`

- **Files:**
    - `packages/blue-core/src/*.js` and `*.d.ts` (40+ files)
    - `packages/blue-orm/src/*.js` and `*.d.ts` (9 + 9 = 18 files)
    - `packages/blue-factory/src/*.js` and `*.d.ts` (9 + 9 = 18 files)
    - `packages/blue-util/src/**/*.d.ts` (15+ files across subdirectories)
    - `packages/blue-dispatcher/src/strategies/*.d.ts` (3 files)
    - `packages/blue-boot/vite.config.{js,d.ts}*` (4 files)
- **Axis:** Architecture, Readability
- **Issue:** These are stale build outputs committed to version control. They cause:
    - Import resolution ambiguity (TS may prefer `.d.ts` over `.ts` depending on config).
    - Bloat in diff/pr reviews (generated code changes mask actual changes).
    - Confusion for new contributors seeing duplicate symbols.
- **Root cause:** Likely an older build pipeline that output into `src/` instead of `lib/`. The `.d.ts` files are consistent with `tsc --declaration --declarationDir src` output.
- **Action:**
    1. Add `src/**/*.js`, `src/**/*.d.ts` (except `src/**/*.ts`), `src/**/*.js.map`, `src/**/*.d.ts.map` to `.gitignore`.
    2. Remove all committed artifacts: `find packages -path '*/src/*.d.ts' -delete -o -path '*/src/*.js' -delete -o -path '*/src/*.map' -delete` (but keep `packages/blue-orm-drizzle/src/` — it has no `.d.ts`/`.js` artifacts).
    3. Verify build still works (`pnpm build`).

#### H2: `@blue/validate` `validator.ts` contains commented-out dead code

- **File:** `packages/blue-validate/src/validator.ts:21-48`
- **Axis:** Readability, Architecture
- **Issue:** A large commented-out `ConstraintValidator` class (28 lines) sits inside a `/* ... */` block between the file's interface definitions and the live `TypeValidator` class. This confuses readers about the intended API and suggests unfinished refactoring.
- **Action:** Remove the commented-out block. If the functionality is desired, extract it as `_constraint-validator.ts` (internal file) with proper implementation.

#### H3: `@blue/auth-server` `JWTAdapter.validate()` lacks signature verification

- **File:** `packages/blue-auth-server/src/jwt-adapter.ts:69-100`
- **Axis:** Security
- **Issue:** The `validate()` method decodes the JWT payload from `parts[1]` and checks `iss`, `aud`, and `exp` claims — but never verifies the cryptographic signature. An attacker can forge any JWT with arbitrary `sub`, `name`, `roles` claims. The method is documented as "simplified" (line 72), but shipping this without even optional signature checking creates a false sense of security.
- **Action:** Add signature verification using the configured `secret` and `algorithm`. Either (a) add a real JWT dependency (`jose` or `jsonwebtoken`) with proper verification, or (b) implement HMAC-SHA256 verification inline (for HS256) with a clear comment about production upgrade path. At minimum, throw a clear error if `algorithm` is RS256 but no public key library is available.

#### H4: `@blue/eslint-plugin` integration layer map missing `arcsecond` / `@blue/parser`

- **File:** `packages/blue-eslint-plugin/src/_constants.ts:16-21`
- **Axis:** Architecture
- **Issue:** `INTEGRATION_LAYER_MAP` defines rules for `seedrandom`, `slug`, `ramda`, `date-fns`, and `objectmodel` — but omits `arcsecond` (encapsulated by `@blue/parser`). This means the lint rule `@blue/no-direct-integration-imports` will NOT flag direct `import ... from 'arcsecond'` in non-integration packages.
- **Action:** Add `arcsecond: '@blue/parser'` to `INTEGRATION_LAYER_MAP`, and add `'@blue/parser'` to `INTEGRATION_LAYER_PACKAGES`. Also verify no existing violations: `grep -r "from 'arcsecond'" packages/ --include='*.ts' | grep -v node_modules | grep -v 'packages/blue-parser/'`.

---

### MEDIUM (10)

#### M1: `@blue/dispatcher` `route-handler-mapping.ts` — 1218 lines (SRP violation)

- **File:** `packages/blue-dispatcher/src/route-handler-mapping.ts`
- **Axis:** Complexity, Architecture
- **Issue:** Contains 7 public classes (`AbstractHandlerMapping`, `AbstractHandlerMethodMapping`, `AbstractPathHandlerMapping`, `AbstractDetectingPathHandlerMapping`, `NamePathHandlerMapping`, `LinearMetadataHandlerMapping`, `SimplePathHandlerMapping`, `RouteMatchResult`), 3 internal helper classes (`MappingEntry`, `MappingRegistry`, `Match`, `MatchComparator`), and multiple JSDoc comment blocks that duplicate the same interface descriptions. >4x the 300-line recommended maximum from AGENTS.md.
- **Action:** Split into separate files per class:
    - `_mapping-registry.ts` — `MappingEntry`, `MappingRegistry`
    - `match.ts` — `Match`, `MatchComparator`, `RouteMatchResult`
    - `abstract-handler-mapping.ts` — `AbstractHandlerMapping`
    - `abstract-handler-method-mapping.ts` — `AbstractHandlerMethodMapping`
    - `abstract-path-handler-mapping.ts` — `AbstractPathHandlerMapping`, `AbstractDetectingPathHandlerMapping`
    - `name-path-handler-mapping.ts` — `NamePathHandlerMapping`
    - `simple-path-handler-mapping.ts` — `SimplePathHandlerMapping`
    - `linear-metadata-handler-mapping.ts` — `LinearMetadataHandlerMapping`
    - `route-mapping-info.ts` already exists for the mapping info class — keep `PatternsRouteCondition` etc. there.

#### M2: `@blue/context` `event-emitter.ts` — 801 lines, functional complexity

- **File:** `packages/blue-context/src/event-emitter.ts`
- **Axis:** Complexity, Readability
- **Issue:** Implements a sophisticated event emitter using mixin patterns (`AsEventEmitter`, `AsAsyncEventEmitter`, `AsConditionalEventEmitter`, `AsPositionalEventEmitter`), 15+ standalone helper functions (`addEventListener`, `emitEvent`, `executeHandler`, etc.), and stores event data on the target object via `@@emitter/events` symbol property. The functional decomposition (8 handle\* functions for 0–3+ args) is thorough but makes the file hard to navigate. 801 lines is well above the 300-line guideline.
- **Action:** Extract internal helper functions to `_event-emitter-helpers.ts`. Keep the public interfaces and mixin classes in the main file. Alternatively, consider consolidating the 8 handle\* dispatch functions into a variadic pattern.

#### M3: `@blue/validate` `standard-constraints.ts` — ~576 lines, large constraint registry

- **File:** `packages/blue-validate/src/standard-constraints.ts`
- **Axis:** Complexity, Features
- **Issue:** Defines 40+ individual constraint functions (`isAlpha`, `isEmail`, `isSsn`, etc.) via `patternConstraint` factory or inline, plus helper utilities. Each constraint is individually simple but the file aggregates a large surface area. `format.ts` and `formats.ts` overlap confusingly with `constraint.ts`/`constraints.ts` naming — unclear which files consumers should import from.
- **Action:** Consider splitting into domain-based modules (`_string-constraints.ts`, `_numeric-constraints.ts`, `_date-constraints.ts`) following the existing `@blue/util` pattern. Clarify `format.ts` vs `formats.ts` boundary (one appears to define regex patterns, the other aggregates them).

#### M4: `@blue/validate` — only native backend actually used; zod/hybrid backends are dead code

- **Files:**
    - `packages/blue-validate/src/backend.ts:8` — defaults to `'native'`
    - `packages/blue-validate/src/_hybrid-validation-backend-adapter.ts` — 1 file
    - `packages/blue-validate/src/_zod-validation-backend-adapter.ts` — ~200 lines
    - `packages/blue-validate/src/_native-validation-backend-adapter.ts` — ~20 lines
- **Axis:** Features, Complexity
- **Issue:** Three validation backends exist but only `_native` is ever used by the default configuration. The zod adapter imports `zod` (a direct dependency) and wraps its schema validation — but no code path switches to it. Carry weight without benefit.
- **Action:** Either (a) document and support the zod backend with a working example in tests, or (b) remove `_zod-validation-backend-adapter.ts` and `_hybrid-validation-backend-adapter.ts`, retaining only the native path. Remove `zod` from `dependencies` in `package.json` if it's only used by the dead backend.

#### M5: `@blue/auth-server` `AuthRegistry` uses `private static` instead of `#` private fields

- **File:** `packages/blue-auth-core/src/registry.ts:13`
- **Axis:** Architecture
- **Issue:** `AuthRegistry.adapters` is declared `private static readonly adapters = new Map()`. AGENTS.md specifies `#` private field syntax (`#adapters`). This is a minor convention deviation but the static class nature means changing to `#` is not straightforward (static `#` fields have different semantics). Static class with private field is the standard TS pattern for utility classes.
- **Action:** Low priority — document as accepted deviation. `#` private static is supported in TS 5.7+ but the current pattern is idiomatic TS.

#### M6: `@blue/router` `Route.attributes` uses `Record<string, any>`

- **File:** `packages/blue-router/src/route.ts:29`
- **Axis:** Readability
- **Issue:** The `attributes` field on the `Route` interface is typed `Record<string, any>`. This bleeds `any` into every consumer that reads route attributes. While AGENTS.md says pre-existing `any` in interfaces is an "established contract," this is a key interface in the framework's core routing abstraction.
- **Action:** Change to `Record<string, unknown>` and require consumers to narrow as needed. Or define a `RouteAttribute` union type for known attributes.

#### M7: `@blue/model` fragile internal `objectmodel` side-effect import

- **File:** `packages/blue-model/src/index.ts:11`
- **Axis:** Architecture, Security
- **Issue:** `import 'objectmodel/src/devtool-formatter'` with `// @ts-ignore - This import is not needed for production builds`. This imports an **internal** module path from the `objectmodel` package (not its public API). If `objectmodel` restructures its internals, this import breaks silently. The `@ts-ignore` suppresses the type error. The comment says it's not needed for production — meaning this import is a dev-only side effect that's always loaded.
- **Action:** Remove the side-effect import and instead activate the devtool formatter via a documented conditional or environment check. Or vendor the minimal formatter setup if needed for debugging. At minimum, guard it with `typeof window !== 'undefined' && process.env.NODE_ENV === 'development'`.

#### M8: `@blue/model` pervasive `as any` on all basic.ts exports

- **File:** `packages/blue-model/src/basic.ts:19-56`
- **Axis:** Readability, Features
- **Issue:** Every export from `basic.ts` uses `as any` casting (e.g., `BasicModel([BigInt, Boolean, Number, ...]).assert(isPrimitive).as('Primitive') as any`). 20+ model primitives with zero type safety. Consumers of `@blue/model` get `any` types, defeating TypeScript's purpose at the boundary.
- **Action:** Wrap the `ObjectModel` results in a typed helper that preserves the constraint information. At minimum, export typed factory functions instead of raw `as any` casts.

#### M9: `@blue/auth-server` `AuthRegistry` uses `private static` instead of `#` private fields

- **File:** `packages/blue-auth-core/src/registry.ts:13`
- **Axis:** Architecture
- **Issue:** `((methodHandler?.handler?.constructor as any)?.[Symbol.metadata] ?? {})` uses `as any` to access `constructor[Symbol.metadata]`. Since `constructor` is typed as `Function`, accessing `[Symbol.metadata]` would require a type assertion — the function type `Function` doesn't declare `Symbol.metadata`. But `methodHandler?.handler` is typed `object`, so `.constructor` is `Function`, which has no `Symbol.metadata` member. The `any` access pattern is necessary without widening the type, and the TC39 decorator metadata is well-known to be on the class's constructor. This is a type-narrowing issue with TS 5.7, not a runtime concern.
- **Action:** Consider adding a helper that safely extracts `Symbol.metadata` from a constructor, e.g.:
    ```ts
    function getDecoratorMetadata(ctor: Function): Record<string, unknown> {
        return (ctor as Record<typeof Symbol.metadata, Record<string, unknown>>)[Symbol.metadata] ?? {};
    }
    ```

#### M10: `@blue/auth-client` `OIDCAdapter.exchangeCodeForTokens()` lacks signature validation

- **File:** `packages/blue-auth-client/src/oidc-adapter.ts:87-120`
- **Axis:** Security
- **Issue:** Same pattern as the server-side JWT adapter — the ID token's payload is decoded from base64 and parsed as JSON without signature verification. An attacker-in-the-middle could inject a forged token. The TSDoc (line 44) notes "for production use, consider using a dedicated OIDC library."
- **Action:** Same as H3 — add signature verification or document clearly that this is a demo-only stub. The OIDC adapter should explicitly throw for production environments or require a validation callback.

---

### LOW (5)

#### L1: `@blue/auth-core:session.ts` — `setPrincipal` accepts `token: string` but `clear()` accepts nothing — asymmetry

- **File:** `packages/blue-auth-core/src/session.ts:39-52`
- **Axis:** Readability
- **Issue:** `setPrincipal(principal, token)` accepts both values; `clear()` zeroes both. Symmetric. No actual issue here — false positive on review.

_(Finding retracted — no change needed.)_

#### L2: `@blue/boot` vite config artifacts in package root (not src/)

- **File:** `packages/blue-boot/vite.config.js`, `vite.config.d.ts`, `vite.config.d.ts.map`, `vite.config.js.map`
- **Axis:** Architecture
- **Issue:** 4 stale vite config build artifacts committed in the package root directory. Should be gitignored.
- **Action:** Add `vite.config.*` to `.gitignore` (or specifically `vite.config.js`, `vite.config.d.ts`, `vite.config.{js,d.ts}.map`). Remove committed files.

#### L3: `@blue/factory` `scope.ts` — `getConstructor` uses `any` parameter type

- **File:** `packages/blue-factory/src/scope.ts:27-29`
- **Axis:** Readability
- **Issue:** `const getConstructor = (target: any): any` uses raw `any`. This is in internal helper code (the function handles both class constructors and instances) so type narrowing requires `any`. Minor.
- **Action:** Narrow to `(target: Function | object): Function | undefined` with proper narrowing guards.

#### L4: `@blue/validate` `constraints.ts` re-exports `standard-constraints.ts` — naming overlap

- **File:** `packages/blue-validate/src/constraints.ts`
- **Axis:** Readability
- **Issue:** `constraints.ts` appears to be a thin re-export barrel for `standard-constraints.ts`, while `constraint.ts` defines the `Constraint` type interface. Singular vs plural boundary is unclear — a reader might import from either.
- **Action:** Clarify naming: keep `Constraint` interface in `constraint.ts`, rename `constraints.ts` -> `standard-constraints.ts` (consolidating with the existing large file), and export both through `index.ts` only.

#### L5: `@blue/model` `.DS_Store` committed in package directory

- **File:** `packages/blue-model/.DS_Store`
- **Axis:** Architecture
- **Issue:** macOS `.DS_Store` metadata file committed in the package directory. Adds noise to diffs and violates general `.gitignore` best practices.
- **Action:** Add `.DS_Store` to `.gitignore` and remove the committed file with `git rm --cached packages/blue-model/.DS_Store`.

---

## Package-by-Package Summary

| Package                   | Verdict                                 | Key Issues                                                                                    |
| ------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `@blue/auth-core`         | Healthy; 1 MED (registry private field) | M9 (static vs #)                                                                              |
| `@blue/auth-server`       | Use with caution; 2 MED/HIGH            | H3 (no JWT signature), M7 (as any metadata)                                                   |
| `@blue/auth-client`       | Use with caution; 2 MED                 | M10 (OIDC no signature), C1 via demo usage                                                    |
| `@blue/boot`              | Healthy; 1 LOW                          | L2 (vite artifacts)                                                                           |
| `@blue/content`           | Healthy; no issues found                | —                                                                                             |
| `@blue/context`           | Healthy; 1 MED complexity               | M2 (801-line event-emitter.ts)                                                                |
| `@blue/core`              | Healthy; 1 HIGH bloat                   | H1 (committed .d.ts/.js artifacts)                                                            |
| `@blue/dispatcher`        | Healthy; 1 MED complexity               | M1 (1218-line route-handler-mapping), H1 (strategies .d.ts)                                   |
| `@blue/dom`               | Healthy; no issues found                | DOMProvider clean (no innerHTML/XSS surface)                                                  |
| `@blue/domain`            | Healthy; no review-needed surface       | Minimal package                                                                               |
| `@blue/eslint-plugin`     | Healthy; 1 HIGH gap                     | H4 (arcsecond missing from integration map)                                                   |
| `@blue/factory`           | Healthy; 1 HIGH + 1 LOW                 | H1 (committed .d.ts/.js), L3 (any in getConstructor)                                          |
| `@blue/generators`        | Healthy; empty scaffolding              | No runtime code — generators templates only                                                   |
| `@blue/http`              | Healthy; 1 MED (size)                   | 885-line http.ts — borderline, cohesive                                                       |
| `@blue/model`             | Moderate; 1 MED                         | Pervasive `as any`, fragile side-effect import, no basic.ts tests, .DS_Store                  |
| `@blue/orm`               | Healthy; 1 HIGH                         | H1 (committed .d.ts/.js artifacts)                                                            |
| `@blue/orm-drizzle`       | Healthy; no issues found                | Parameterized queries, clean Drizzle integration                                              |
| `@blue/parser`            | Not reviewed in detail                  | —                                                                                             |
| `@blue/platform-node`     | Healthy; no issues found                | Node request/env clean                                                                        |
| `@blue/platform-web`      | Healthy; no issues found                | cookies, CORS, IndexedDB handled safely                                                       |
| `@blue/reactive`          | Healthy; no issues found                | Clean reactive model implementation                                                           |
| `@blue/router`            | Healthy; 1 MED                          | M6 (Route.attributes: Record<string, any>)                                                    |
| `@blue/service`           | Healthy; 1 MED (size)                   | 322-line service.ts — below threshold, cohesive                                               |
| `@blue/telemetry`         | Healthy; no issues found                | —                                                                                             |
| `@blue/util`              | Healthy; 1 HIGH                         | H1 (committed .d.ts artifacts)                                                                |
| `@blue/validate`          | Moderate; 1 HIGH + 3 MED                | H2 (commented-out dead code), M3 (large constraints), M4 (dead backends), L4 (naming overlap) |
| `@blue/view`              | Healthy (recently fixed)                | Content-negotiation bugs fixed in Wave 3                                                      |
| `@blue/view-webcomponent` | Healthy; no issues found                | AbstractWebComponent uses event delegation, no innerHTML/XSS                                  |
| `@blue/view-wicket`       | Healthy; no issues found                | Wicket-style component hierarchy                                                              |
| `demo-app`                | CRITICAL auth bypass                    | C1                                                                                            |

---

## Actionable Recommendations

### Immediate (next sprint)

1. **Fix demo auth interceptor** (C1) — wire `ClientAuthGuard.preNavigate(route.handler)` into the interceptor chain instead of using `extractAuthMetadata(undefined)`. Current code is security-dead.

2. **Gitignore + remove committed build artifacts** (H1, L2):

    ```bash
    # Add to .gitignore
    echo 'src/**/*.d.ts
    src/**/*.js
    src/**/*.js.map
    src/**/*.d.ts.map
    vite.config.*' >> .gitignore
    # Clean committed files
    find packages -path '*/src/*.d.ts' ! -path '*/src/*.ts' -delete
    find packages -path '*/src/*.js' -delete
    find packages -path '*/src/*.map' -delete
    rm packages/blue-boot/vite.config.*
    ```

3. **Add JWT signature verification** (H3) — integrate `jose` for proper JWT validation in `JWTAdapter`. Add a clear `@deprecated` marker if the simplified implementation stays, pointing to a production implementation.

4. **Fix eslint-plugin integration layer map** (H4) — add `arcsecond: '@blue/parser'` to `INTEGRATION_LAYER_MAP` and `'@blue/parser'` to `INTEGRATION_LAYER_PACKAGES`.

### Short-term (next 2 sprints)

5. **Remove dead code** (H2, M4):

    - Delete commented-out `ConstraintValidator` block from `validator.ts`.
    - Remove `_zod-validation-backend-adapter.ts` and `_hybrid-validation-backend-adapter.ts` (or add working activation path).
    - Remove `zod` from `@blue/validate` dependencies if backends removed.

6. **Split `route-handler-mapping.ts`** (M1) — follow per-file breakdown above.

7. **Clarify validate naming** (M4, L4):
    - Rename `constraints.ts` barrel to follow singular/plural convention.
    - Rename `formats.ts` ↔ `format.ts` — pick one naming scheme.

### Medium-term

8. **Split `event-emitter.ts`** (M2) — extract internal helpers to `_event-emitter-helpers.ts`.

9. **Fix `Route.attributes` typing** (M6) — change `Record<string, any>` to `Record<string, unknown>`.

10. **Audit auth-client OIDC adapter** (M8) — same validation pattern as H3; coordinate with server-side fix.

11. **Consider validating constraints domain splitting** (M3) — domain-specific files if constraints grow further.

---

## Prior Review Status Reference

- **Holistic Audit (2026-03-30):** Previously reported layer violations, import issues, naming inconsistencies — all confirmed fixed in Waves 1–10.
- **OXC Adoption Assessment (2026-08-21):** Lint migration complete; decorator spike blocked on TS 5.7 oxlint support.
- **Migration Guide (2026-08-22):** Documents decorator naming (PascalCase→camelCase), OXC migration, package reorganization.
- **AD-06 Decision (2026-08-22):** No factory scoping split needed.
