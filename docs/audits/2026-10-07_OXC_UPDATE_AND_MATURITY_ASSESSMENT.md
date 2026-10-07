# OXC Update & Maturity Assessment

**Date:** 2026-10-07
**Status:** Complete
**Scope:** Update the OXC tooling the monorepo already depends on (oxlint,
`@oxlint/plugins`, `oxfmt`, `oxlint-tsgolint`) to the current releases, and
re-assess the OXC tools deliberately _not_ adopted by [AD-58](../decisions/2026-08-19_AD58_OXC_TOOLCHAIN_MIGRATION.md)
(`oxc-transform`, `oxc-parser`, `oxc-minify`, `oxc-resolver`) against their
current maturity.

---

## 1. Executive Summary

**Updated** the four OXC tools already in the toolchain — oxlint 1.85.0 →
**1.87.0**, `@oxlint/plugins` 1.85.0 → **1.87.0**, oxfmt 0.70.0 → **0.72.0**
(`oxlint-tsgolint` 7.0.2003 was already current). Lint, format, build and the
full test suite are green after the bump; oxfmt 0.72's native Markdown
formatter (an upstream **breaking** change) reformatted 31 tracked Markdown
files in the same commit — whitespace/continuation-indent only, no prose or
structure change.

**Re-assessed** the tools AD-58 left unadopted. The headline revisit trigger —
"OXC adds production-standard support for TC39 decorators + `Symbol.metadata`"
— is **still unmet** at oxc-transform 0.153.0: the transformer passes standard
decorators through under every option shape, and its only lowering mode
(`decorator.legacy`) invokes decorators with the legacy `(target, key,
descriptor)` convention, which breaks the repo's TC39 decorators at runtime
(measured `TypeError`). `tsc -b` therefore remains the build and declaration
authority, and `scripts/vite-plugin-lower-decorators.mjs` (esbuild) remains
required for app client bundles.

| Tool             | Verdict                                          | Basis                                                                                          |
| :--------------- | :----------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| oxlint / plugins | **Updated** to 1.87.0                            | adopted; lint clean, 206 plugin-rule tests pass                                                |
| oxfmt            | **Updated** to 0.72.0                            | adopted; one-time Markdown reformat (upstream breaking change)                                 |
| oxc-transform    | **Not adopted** — trigger unmet                  | standard decorators still pass through (0.151 ≡ 0.153); `legacy` mode mis-invokes them         |
| oxc-parser       | **Mature, on the shelf**                         | 1,449 repo files / 0 parse failures / 159 ms (~45 MiB/s); no tool needs ASTs today             |
| oxc-minify       | **No consumer**                                  | correct on compiled output; emits invalid JS on unlowered decorators; apps pin `minify: false` |
| oxc-resolver     | **No consumer**                                  | resolution is owned by tsc/tsgo and rolldown                                                   |
| `tsgo` (TS 7)    | **Adopted already** — second revisit trigger met | `typescript ~7.0.2` native compiler; build = 40 tasks in 9.3 s                                 |

---

## 2. Toolchain Update

Registry (`registry.npmjs.org`, checked 2026-10-07) vs. repo pins:

| Package           | Before     | After      | Published  | Where pinned                             |
| :---------------- | :--------- | :--------- | :--------- | :--------------------------------------- |
| `oxlint`          | `1.85.0`   | `1.87.0`   | 2026-10-05 | catalog (`pnpm-workspace.yaml`)          |
| `@oxlint/plugins` | `1.85.0`   | `1.87.0`   | 2026-10-05 | catalog                                  |
| `oxfmt`           | `0.70.0`   | `0.72.0`   | 2026-10-05 | root `devDependencies` (uncataloged)     |
| `oxlint-tsgolint` | `7.0.2003` | `7.0.2003` | 2026-09-24 | root `devDependencies` — already current |

Both oxlint release notes (1.86.0, 1.87.0) contain rule additions and
suggestion improvements only — no removals or default-set changes affecting the
repo's `.oxlintrc.json`.

oxfmt 0.72.0 carries a breaking change: `parser:markdown` files are now
formatted by `oxc_formatter_markdown` ("[**BREAKING**] Format `parser:markdown`
files by `oxc_formatter_markdown`", oxfmt v0.72.0 release notes). It rewrites
soft-wrapped prose continuation lines to the enclosing list/block indent. 31
tracked Markdown files (ADRs, guides, plans, `ARCHITECTURE.md`,
`CONTRIBUTING.md`, one README) were reformatted; the diff is indentation-only
in every file (largest: 22 changed lines).

### 2.1 Verification

| Gate                                         | Result                                                         |
| :------------------------------------------- | :------------------------------------------------------------- |
| `pnpm lint` (`--type-aware --deny-warnings`) | exit 0, zero findings                                          |
| `pnpm format:check`                          | green after the Markdown reformat (1,959 files, 32 threads)    |
| `@blue/oxlint-plugin` tests                  | 15 files / **206 tests pass** against `@oxlint/plugins` 1.87.0 |
| `pnpm build`                                 | 40 tasks successful, 0/40 cache hits, 9.3 s                    |
| `pnpm test`                                  | 96 tasks (59 projects + 37 dependencies) successful            |
| `pnpm manifest:check` / `pnpm docs:links`    | pass                                                           |

No source (`.ts`/`.js`), JSON, YAML or lockfile-external file changed beyond
the three manifests and `pnpm-lock.yaml`.

---

## 3. Maturity Re-Assessment

Environment: oxc crates **0.153.0** (2026-10-05) installed side-by-side with
**0.151.0** (the version verified in the 2026-10-06 decorator work) in a
throwaway directory, run against a standard-decorator fixture and the repo's
own `packages/blue-service/src/service-decorators.ts`.

### 3.1 oxc-transform — TC39 decorators (the AD-58 revisit trigger)

| Options (target `es2022` unless noted) | 0.151.0                                                                                                                                                                                    | 0.153.0 |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| default (`esnext`)                     | decorators **pass through** (unparseable JS)                                                                                                                                               | same    |
| `target: 'es2022'`                     | pass through                                                                                                                                                                               | same    |
| `decorator: { legacy: false }`         | pass through                                                                                                                                                                               | same    |
| `decorator: { legacy: true }`          | lowered via `_decorate(...)` helper, **legacy calling convention** — decorator receives `ctx === undefined` → `TypeError: Cannot read properties of undefined (reading 'kind')` at runtime | same    |

Findings:

- **No behavior change between 0.151 and 0.153.** The `DecoratorOptions` type
  still exposes only `legacy` and `emitDecoratorMetadata`; there is no
  standard-decorator lowering mode.
- `legacy: true` is not a workaround: it lowers with the pre-TC39 convention,
  so the repo's `context.kind` / `context.metadata` decorators throw on first
  use (reproduced by executing the transformed output).
- The 0.152/0.153 release notes contain no decorator-lowering work (transform
  work is `using`/explicit-resource-management); oxc's tracker has no
  standard-decorator lowering item (the only decorator issues, #20133/#20348,
  are closed legacy-`accessor` items).
- Vite 8.2.2 transforms through rolldown 1.2.7's embedded oxc — the same
  transformer behavior — so no Vite version or config lowers them.
  `scripts/vite-plugin-lower-decorators.mjs` stays (re-verified 2026-10-07).

**Verdict:** AD-58 D-4 stands. `tsc -b` remains the build; the custom esbuild
decorator pre-transform remains the app-bundle fix.

### 3.2 oxc-transform — declarations (`isolatedDeclaration`)

`isolatedDeclarationSync` runs, but the repo is not `isolatedDeclarations`-clean
today — over 178 `src`/`client` TypeScript files: **136 clean, 42 with 144
diagnostics** (TS9008 ×50 explicit return type, TS9016 ×50 explicit type on
variable, TS9017 ×15, TS9021 ×13 extends-clause expression, TS9010 ×9, TS9011
×3, TS9009 ×2, TS9007 ×2). Where diagnostics exist the emitted `.d.ts` is
incomplete relative to tsc's (e.g. `service-decorators.d.ts`: 3,735 B vs
4,642 B). api-extractor consumes the tsc baselines.

**Verdict:** not a candidate for replacing `tsc` declaration emit; the gap is a
repo-wide annotation sweep (42 files) with no consumer-visible payoff.

### 3.3 Second AD-58 trigger — `tsgo` GA

The revisit trigger's other half ("`tsgo` reaches GA for the kept `tsc`
type-check pass") **is met**: the catalog pins `typescript ~7.0.2` (native
compiler; the installed package ships a native `bin/tsc` and no JS
`createSourceFile` API), and the full build is 40 tasks in ~9 s. The
emit-speedup motive for an oxc-transform build split has largely been realized
by the native compiler; it now buys little and would carry the decorator
metadata risk above.

Corollary for tooling: any custom script needing an in-process TypeScript AST
can no longer reach for the `typescript` JS API — oxc-parser (below) is the
practical option if that need arises.

### 3.4 oxc-parser

Parsed every tracked JavaScript/TypeScript file in the repo (1,449 files,
7.2 MiB): **0 parse failures in 159 ms (~45 MiB/s, single-threaded)**.

**Verdict:** mature and fast. No current consumer: `scripts/import-scanner.mjs`
hand-tokenizes imports (deliberately also covering built `.js` and CJS
`require()`), oxlint runs its own parser in Rust, and TypeDoc owns API
extraction. Adoption is justified only when a tool genuinely needs ASTs
(e.g. replacing the import scanner's tokenizer) — not for its own sake.

### 3.5 oxc-minify

- Correct on compiled output: `packages/blue-core/lib/blue.js` 1,668 B → 281 B,
  `node --check` clean.
- Emits invalid JavaScript on **unlowered** standard decorators (`{@t …`) —
  usable only downstream of decorator lowering.
- Vite 8's default `build.minify` is already `oxc` (vite dist:
  `minify = "oxc"`), but every app here sets `minify: false` deliberately —
  `@blue/dispatcher` resolves parameters by parsing function signatures, which
  identifier mangling breaks (2026-10-04 e2e finding).

**Verdict:** already present transitively; nothing to adopt or change.

### 3.6 oxc-resolver

No consumer: module resolution is owned by tsc/tsgo (build) and rolldown
(bundling); api-extractor and the lint rules do not resolve modules. The
roadmap's §6.5 conclusion is unchanged.

### 3.7 Release cadence

OXC ships weekly (crates 0.151 → 0.153 in three weeks; oxlint 1.85 → 1.87;
oxfmt 0.70 → 0.72). Practical note for pins: oxfmt minor bumps can reformat
Markdown (0.72 is the first native-Markdown release), so expect a docs-only
reformat commit alongside formatter bumps until that formatter stabilizes;
oxlint minor bumps have been additive.

---

## 4. Actions Taken

1. Catalog pins: `oxlint` and `@oxlint/plugins` `^1.85.0` → `^1.87.0`
   (`pnpm-workspace.yaml`); `oxfmt` `^0.70.0` → `^0.72.0` (root `package.json`);
   lockfile regenerated.
2. `pnpm format` reformat of 31 Markdown files required by oxfmt 0.72's
   Markdown formatter switch.
3. Stale version references corrected: `scripts/check-manifests.mjs` (oxc 0.151
   → 0.153), `scripts/vite-plugin-lower-decorators.mjs` doc block (0.151 →
   0.153 re-verification), AD-58 evidence + revisit-trigger status.
4. This audit; `CHANGELOG.md` entry.

No tooling beyond the four adopted OXC packages was added.

## 5. Watch List

- **oxc-transform standard-decorator lowering** (with `Symbol.metadata`
  fidelity): re-run the 08-19 plan's Phase 0 decorator spike if the
  `decorator` options grow a standard mode.
- **`isolatedDeclarations`**: only revisit oxc declaration emit if the repo
  adopts the flag and sweeps the 42 non-compliant files.
- **oxfmt Markdown formatter**: re-check for reformat churn on each minor bump.

## 6. References

- [AD-58](../decisions/2026-08-19_AD58_OXC_TOOLCHAIN_MIGRATION.md) — toolchain
  migration decision (D-4 build-unchanged, revisit trigger).
- [2026-08-21 OXC Adoption Assessment](./2026-08-21_OXC_ADOPTION_ASSESSMENT.md)
  — prior adoption assessment.
- [2026-08-19 OXC Evaluation & Migration Plan](../plans/2026-08-19_OXC_EVALUATION_AND_MIGRATION_PLAN.md)
  — Phase 0 spike protocol and kill criteria.
- `scripts/vite-plugin-lower-decorators.mjs`,
  `scripts/check-manifests.mjs` — the live decorator-lowering and manifest
  guards updated here.
