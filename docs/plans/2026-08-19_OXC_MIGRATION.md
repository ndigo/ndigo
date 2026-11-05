# OXC Migration Plan

**Date:** 2026-08-19
**Status:** Proposed
**Scope:** Evaluate migration from the current lint/build/test stack (ESLint 9 + oxlint, TypeScript 5.9, Vitest 3.2) to OXC tooling, and define a phased migration for the parts that make sense.

---

## 1. Executive Summary

OXC (oxc.rs) is a Rust-based JavaScript/TypeScript toolchain. It is **not a single product** — it is a family of tools sharing one Rust parser (`oxc_parser`) and one AST (`oxc_ast`):

| OXC Tool                                    | Role                                                                    | Status (mid-2026)                                                  |
| :------------------------------------------ | :---------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `oxc_parser`                                | TS/JS/JSX/TSX parsing (Rust)                                            | Stable, used in production by multiple tools                       |
| `oxc_ast` / `oxc_span`                      | Common AST + span types                                                 | Stable                                                             |
| `oxc_linter` (CLI: `oxlint`)                | Linter (Rust, no plugins, no `eslint.config.js`)                        | **Stable, already in our stack**                                   |
| `oxc_transformer`                           | TS→JS transformation (types, enum, namespace, decorators, class fields) | Beta (`@oxc-transform` npm wrapper)                                |
| `@oxc-project/transform` / `@oxc-transform` | Node API + CLI wrapper for the transformer                              | Beta — usable for type-stripping, not yet a full `tsc` replacement |
| `oxc_resolver`                              | Fast module resolution (Rust)                                           | Stable, used internally by Rolldown/oxc                            |
| `oxlint` + `@ndigo/eslint-plugin`           | —                                                                       | We already use `oxlint` for linting; our custom rules run there    |

**Bottom line recommendation:**

1. **Lint:** Already on OXC (oxlint). No action beyond continued adoption. ✅
2. **Build (type checking + emit):** **Migrate the _type-stripping/emit_ path to `@oxc-transform`, keep `tsc` for type checking.** This is the high-value win: emit is the slow part of `tsc -b`, and OXC transform is 10–30× faster. Type checking remains a `tsc` (or `tsgo`) job — OXC does not type-check.
3. **Tests (Vitest):** **No migration.** Vitest 3.x already uses oxc-transform internally for its in-browser/SSR transforms where configured, and there is no credible OXC-native test runner. Moving tests would be churn for zero perf gain.
4. **Module resolution (oxc_resolver):** **Adopt opportunistically** if we ever add a custom bundler/runner (e.g., an esbuild→rolldown switch). Not a standalone win today since Nx/Vitest handle resolution.

**Net effect:** lower build time, modernized stack, no loss of safety. Estimated build time improvement for a full `pnpm build`: **~40–70% wall-clock reduction** (emit phase dominates; type-check phase unchanged).

---

## 2. Current Toolchain Baseline

| Concern           | Current Tool                                            | Version    | Notes                                                                                                                                                         |
| :---------------- | :------------------------------------------------------ | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lint              | `oxlint` (Rust) + `@ndigo/eslint-plugin` custom rules   | oxlint 1.x | Already OXC. Config in root `.oxlintrc.json`. Custom plugin provides `no-direct-integration-imports`, `no-internal-file-imports`, `no-internal-file-exports`. |
| Type check + emit | `tsc -b` (TypeScript 5.9)                               | TS 5.9     | Nx `tsc` executor, per-package `tsconfig.build.json` extending root. Outputs ESM to `lib/`.                                                                   |
| Tests             | Vitest 3.2                                              | Vitest 3.x | `pnpm test` runs all; per-package `nx run @ndigo/<pkg>:test`.                                                                                                 |
| Task runner       | Nx 21 + pnpm 10 workspaces                              | Nx 21      | `pnpm build` → `nx run-many -t build:lib`.                                                                                                                    |
| Formatting        | Prettier 3.8                                            | —          | No OXC equivalent exists; keep Prettier.                                                                                                                      |
| Module system     | ESM only, TS target ES2022, `moduleResolution: bundler` | —          | OXC is ESM-friendly; no conflict.                                                                                                                             |
| Decorators        | TC39 Stage 3 (standard), `@tsmetadata/polyfill`         | —          | **Critical constraint** — see §4.2.                                                                                                                           |

**Key observations from the codebase survey:**

- We are _already_ on the OXC side of the linting debate — `oxlint` is our primary linter and our custom rules are oxlint plugin rules. There is no ESLint in the pipeline.
- The only non-OXC heavyweights are **TypeScript (tsc -b)** and **Vitest**.
- Packages are pure libraries (no bundling step, no `esbuild`/`rollup` in the repo). Emit is plain `tsc` per package.
- We use **TC39 Stage 3 decorators** with `Symbol.metadata` — this is a differentiating requirement that constrains transformer choices (see §4.2).

---

## 3. OXC Tool Evaluation

### 3.1 What OXC Is Good At (and Where)

| Tool                                                          | Performance vs Current                  | Maturity           | Fit for ndigo                                                            |
| :------------------------------------------------------------ | :-------------------------------------- | :----------------- | :----------------------------------------------------------------------- |
| `oxlint`                                                      | 10–30× faster than ESLint               | **Stable**         | ✅ Already adopted                                                       |
| `oxc_parser`                                                  | 5–10× faster than SWC/TS parsing        | **Stable**         | ✅ Transitive (via oxlint, and available for tooling)                    |
| `@oxc-transform` (oxc_transformer)                            | 10–30× faster than `tsc` emit           | **Beta**           | ✅ Good — type stripping + TS feature transform is exactly our emit need |
| `oxc_resolver`                                                | ~5× faster than `enhanced-resolve`/Node | **Stable**         | ⚠️ No immediate consumer; adopt with a custom runner/bundler             |
| OXC test runner                                               | —                                       | **Does not exist** | ❌ Keep Vitest                                                           |
| OXC bundler (Rolldown is separate; oxc bundler not a product) | —                                       | N/A                | N/A — we don't bundle                                                    |

### 3.2 What OXC Cannot Do (Constraints)

1. **No type checking.** `oxc_transformer` erases types; it does not type-check. `tsc` (or the upcoming native `tsgo`) must remain in the loop for type safety. This is by design — OXC explicitly positions the transformer as a _fast emit_ tool, not a compiler.
2. **No plugin system in `oxlint`** comparable to ESLint's, and our custom rules are _oxlint plugin_ rules (which is fine — they already work there). But we cannot migrate any _ESLint-only_ semantics; there are none in our stack.
3. **Decorator support in the transformer is the riskiest area** — see §4.2.
4. **No formatter.** Prettier stays.
5. **No test runner.** Vitest stays.

### 3.3 Compatibility Checks Performed

- **Parser:** `oxc_parser` handles TS 5.x syntax including `satisfies`, `const` type params, decorators, and JSX/TSX. ✅ (verified via oxlint already parsing all our TS successfully)
- **`verbatimModuleSyntax`-style imports:** Our code uses ESM named imports; `@oxc-transform` preserves import/export structure (it does not do CJS interop rewriting by default). ✅
- **TC39 decorators:** `@injectable`, `@routeMapping` etc. — requires verification (see §4.2 risk).
- **Nx integration:** Nx supports arbitrary executors/commands; no Nx-specific OXC executor needed. We can swap the `build:lib` target's command from `tsc -b` to a script that runs `@oxc-transform` + a separate `tsc --noEmit` type-check. ✅

---

## 4. Migration Plan

### Guiding Principle

**Split the TypeScript build into two concerns and migrate only the one OXC is good at:**

| Concern                          | Tool                       | Migrates?                    |
| :------------------------------- | :------------------------- | :--------------------------- |
| **Type checking** (safety)       | `tsc --noEmit` (keep)      | ❌ No — OXC can't type-check |
| **Emit / transform** (TS→ESM JS) | `@oxc-transform` (migrate) | ✅ Yes                       |
| **Lint**                         | `oxlint` (keep)            | ✅ Already OXC               |
| **Test**                         | Vitest (keep)              | ❌ No                        |
| **Format**                       | Prettier (keep)            | ❌ No                        |

This gives us OXC's speed where it matters (emit) with zero loss of type safety.

### Phase 0 — Reconnaissance & Risk De-risking (1–2 days)

**Goal:** Prove the two biggest unknowns before committing.

1. **Decorator emit spike (CRITICAL):**

    - Create a throwaway package (or a test dir) with a representative sample of our decorator usage: `@injectable`, `@routeMapping`, a class using `Symbol.metadata`, a param decorator if any.
    - Run `@oxc-transform` on it and diff the output against `tsc` output.
    - **Pass criteria:**
        - Decorator metadata is preserved (or the polyfill's expectations are met).
        - Class field semantics match (ES2022 `#private` fields, `static` blocks, class fields with initializers).
        - No silent dropping of decorator metadata.
    - **Fallback if it fails:** Keep `tsc` for emit; migration is still worth it for any future custom tooling, and we re-evaluate when `@oxc-transform` stabilizes. Document the blocker.

2. **`tsc --noEmit` baseline:**

    - Measure current `pnpm build` wall-clock and break it down: how much is type-check vs emit. (Use `tsc -b --listFilesOnly` timing or Nx task timing.)
    - This quantifies the expected win and sets the acceptance bar for Phase 2.

3. **Version pin & API check:**
    - Confirm the latest stable-ish `@oxc-transform` / `@oxc-project/transform` package name and Node API.
    - Confirm it supports: `--target es2022`, ESM output, `--out-dir`, and a programmatic API (needed for an Nx executor or build script).

**Deliverable:** `docs/plans/2026-08-19_OXC_MIGRATION_SPIKE_NOTES.md` with decorator diff + timing baseline.

### Phase 1 — Lint Hardening (Ongoing, Low Effort)

We're already on oxlint. Do **not** rip anything out. Instead:

1. **Expand oxlint rule coverage** to displace any residual ESLint-style checks we might be doing ad hoc. Enable more `correctness` and `suspicious` rule categories in `.oxlintrc.json` (start with `correctness` only; review `perf`/`suspicious` hits).
2. **Keep the `@ndigo/eslint-plugin` custom rules** as the enforcement mechanism for the Library Integration Layer + internal-file rules. (These are oxlint plugin rules already; no change.)
3. **Add a CI guard** (if not present): fail the build on any _new_ oxlint `error` (allow existing `warn` baseline). This makes lint regression-free as we grow rules.

**Effort:** ~0.5 day. **Risk:** Low.

### Phase 2 — Build Migration: `tsc -b` → `tsc --noEmit` + `@oxc-transform` (Core Win)

This is the main event. Split each package's build into:

```
build:lib  =  type-check (tsc --noEmit)  +  emit (@oxc-transform)
```

**2.1 Per-package build script change**

Current (per package):

```json
"build:lib": "tsc -b tsconfig.build.json"
```

Target:

```json
"build:lib": "node ../../scripts/build-lib.mjs"
```

Where `scripts/build-lib.mjs` (new, at repo root) does:

1. Runs `tsc -b tsconfig.build.json --noEmit` (or `tsc --noEmit -p tsconfig.build.json`) for **type checking only**.
2. On success, runs `@oxc-transform` to emit `src/**/*.ts` → `lib/**/*.js` (plus `.d.ts`? — see 2.3).

**2.2 Declaration files (`.d.ts`) — the one thing `@oxc-transform` does NOT do**

`@oxc-transform` strips types; it does **not** emit `.d.ts`. We have two options:

- **Option A (recommended): Keep `tsc` for declarations only.**
  Run `tsc -b` with `emitDeclarationOnly: true` for the declaration pass, and `@oxc-transform` for the JS emit pass.

    - Pro: Full `.d.ts` fidelity, zero risk to our public API surface.
    - Con: Two tsc passes (one `--noEmit` type-check, one `emitDeclarationOnly`). But declaration-only emit is much faster than full emit, and we still eliminate the slow full-JS-emit from `tsc`.
    - Net: we still remove the most expensive part (full JS transform + emit) from `tsc`.

- **Option B: Use `tsc` for both, keep OXC only for lint.** (i.e., abandon Phase 2.)
  Only if Phase 0 spike reveals a show-stopper.

**Decision:** Default to **Option A**. The type-check + declaration-only passes together are far cheaper than full `tsc -b`, and the JS emit (the bulk of the runtime code) moves to the 10–30× faster OXC transformer.

**2.3 Emit config mapping (tsc → @oxc-transform)**

| tsc setting                                | @oxc-transform equivalent                                               |
| :----------------------------------------- | :---------------------------------------------------------------------- |
| `target: ES2022`                           | `--target es2022`                                                       |
| `module: ESNext` / ESM                     | default (preserves ESM)                                                 |
| `outDir: lib/`                             | `--out-dir lib` (or programmatic `outDir`)                              |
| `rootDir: src/`                            | pass only `src/` files                                                  |
| `declaration: true`                        | **not supported** → handled by separate tsc declaration pass (Option A) |
| `strict`, `noUncheckedIndexedAccess`, etc. | N/A (type-check only, in tsc pass)                                      |
| `verbatimModuleSyntax` / import elision    | transformer elides type-only imports correctly                          |

**2.4 Nx wiring**

- Keep the Nx `build:lib` target but change its executor to a `nx:run-commands` (or keep `tsc` executor replaced by the script).
- Preserve Nx's **caching** and **dependency graph** so downstream packages still only rebuild when inputs change. The script must be deterministic and respect the package's `tsconfig.build.json` file list for cache key correctness.
- **Important:** Nx cache key should include the `@oxc-transform` version and the `tsconfig.build.json` content.

**2.5 Acceptance criteria (Phase 2)**

- [ ] `pnpm build` succeeds for all 10 packages.
- [ ] `lib/` output is **byte-compatible** (modulo formatting) with the prior `tsc` output — verify by diffing a sample package's `lib/` before/after. Specifically: import statements, decorator metadata, class fields, `#private` fields, `static` blocks all identical.
- [ ] `pnpm test` passes (Vitest consumes `lib/` or `src/` per its config — confirm which; if it consumes `lib/`, the new emit must satisfy it).
- [ ] `pnpm lint` clean.
- [ ] **Wall-clock `pnpm build` reduced by ≥ 40%** vs Phase 0 baseline.
- [ ] No change to any package's `package.json` `exports` / public API.

**Effort:** 2–4 days (script + Nx wiring + per-package verification + diffing).
**Risk:** Medium (mitigated by Phase 0 spike and Option A keeping tsc for declarations).

### Phase 3 — Optional / Opportunistic (Do Not Schedule Upfront)

These are "adopt when the trigger exists" items. **Do not do them speculatively** (per the repo's own AHA guidance).

1. **`oxc_resolver`:** Adopt only if we add a custom runner, bundler, or tool that needs fast module resolution (e.g., moving from esbuild to Rolldown, or writing a custom test preprocessor). No consumer today → skip.
2. **Vitest → OXC runner:** No OXC-native runner exists. Re-evaluate only if Vitest is ever replaced in our stack for independent reasons.
3. **`tsgo` (native TypeScript compiler):** When Microsoft's Go-based `tsc` replacement is stable, it can further speed up the _type-check_ pass (the part we kept). This is the natural next perf win and is independent of OXC. Track, don't adopt yet.
4. **Rolldown (Rust bundler, shares oxc_parser):** Only relevant if we start bundling. We don't. Skip.

### Phase 4 — Rollback Plan (If Phase 2 Regresses)

- The build script is the single point of change. Rollback = revert `build:lib` to `tsc -b tsconfig.build.json` in each `package.json`.
- Keep the old `tsconfig.build.json` files untouched (they still work for full `tsc -b`). Do **not** delete them during Phase 2 — only add the new script alongside. This makes rollback a one-line-per-package revert.
- If the decorator spike (Phase 0) fails, do **not** start Phase 2; file the blocker against `@oxc-transform` and re-evaluate at the next stable release.

---

## 5. What We Are Explicitly NOT Migrating

| Tool                      | Reason                                                                                          |
| :------------------------ | :---------------------------------------------------------------------------------------------- |
| **Vitest**                | No OXC test runner exists; Vitest 3.x is stable and already fast. Migration = churn, zero gain. |
| **Prettier**              | No OXC formatter. Keep.                                                                         |
| **Type-checking via tsc** | OXC cannot type-check. tsc (or future `tsgo`) stays for the safety pass.                        |
| **ESLint**                | Already gone — we run oxlint. Nothing to migrate.                                               |
| **Nx / pnpm**             | Unrelated to OXC; no replacement.                                                               |

---

## 6. Risks & Mitigations

| Risk                                                                               | Likelihood | Impact                                   | Mitigation                                                                                                       |
| :--------------------------------------------------------------------------------- | :--------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `@oxc-transform` mishandles TC39 decorator metadata                                | Medium     | High (silent runtime DI/router breakage) | Phase 0 spike with real decorator samples; Option A keeps tsc for `.d.ts`; rollback plan in Phase 4              |
| `@oxc-transform` is still beta; API churn                                          | Medium     | Medium (build breaks on upgrade)         | Pin exact version; wrap in `scripts/build-lib.mjs` so only one file changes; don't auto-upgrade the oxc packages |
| Output divergence between tsc and oxc emit (subtle class-field/import differences) | Medium     | Medium (tests pass but runtime differs)  | Byte-diff `lib/` before/after per package (Phase 2.5); run full `pnpm test`                                      |
| Nx cache invalidation issues with new script                                       | Low        | Low (slower CI, not incorrect)           | Ensure cache key includes script + tsconfig + oxc version                                                        |
| Team familiarity / debugging new emit errors                                       | Low        | Low                                      | Emit errors come from `tsc` (unchanged) for type issues; OXC emit errors are rare and clear                      |

---

## 7. Effort & Timeline Summary

| Phase                | Effort          | Dependency        | Outcome                                  |
| :------------------- | :-------------- | :---------------- | :--------------------------------------- |
| 0 — Spike + baseline | 1–2 days        | —                 | Go/no-go decision + timing baseline      |
| 1 — Lint hardening   | 0.5 day         | —                 | Regression-free lint growth              |
| 2 — Build migration  | 2–4 days        | Phase 0 go        | **~40–70% faster `pnpm build`**          |
| 3 — Opportunistic    | 0 (unscheduled) | External triggers | Resolver/runner adoption later if needed |

**Total to core win (Phases 0–2):** ~1 engineer-week.

---

## 8. Recommendation

**Proceed with Phases 0 → 1 → 2.** The case is strong because:

1. We're _already_ on OXC for linting — the ecosystem bet is already made.
2. The build's slow part (JS emit) is exactly what `@oxc-transform` does best, and it's a clean swap that keeps `tsc` for the safety-critical type-check + declarations.
3. The risky part (decorators) is de-risked _before_ any production change by the Phase 0 spike.
4. Rollback is trivial (one-line-per-package revert), and we keep the old `tsconfig.build.json` intact.
5. We explicitly avoid the traps: no test-runner migration, no formatter migration, no speculative resolver adoption.

**Decision gate:** After Phase 0, if the decorator emit spike passes and the timing baseline confirms emit dominates build time, proceed to Phase 2. If the spike fails, stop at Phase 1 (lint hardening) and re-evaluate at the next `@oxc-transform` stable release.

---

## Appendix A: Current Per-Package Build Targets (as surveyed)

All 10 packages (`ndigo-core`, `ndigo-context`, `ndigo-parser`, `ndigo-model`, `ndigo-router`, `ndigo-telemetry`, `ndigo-cli`, `ndigo-eslint-plugin`, and others) use the Nx `tsc` executor with per-package `tsconfig.build.json` extending the root tsconfig. `pnpm build` = `nx run-many -t build:lib`. No bundler, no esbuild/rollup in the repo.

## Appendix B: OXC Tool Reference

- **oxc_parser** — Rust TS/JS/JSX parser. Stable. (Transitively used by oxlint today.)
- **oxlint** — Rust linter. Stable. **In use.** Config: root `.oxlintrc.json`. Custom rules via `@ndigo/eslint-plugin`.
- **@oxc-transform / @oxc-project/transform** — Node wrapper over `oxc_transformer` for TS→JS (type stripping + feature transform). Beta. **Target of Phase 2.**
- **oxc_resolver** — Rust module resolver. Stable. **No current consumer.**
- **No OXC formatter, no OXC test runner.**
