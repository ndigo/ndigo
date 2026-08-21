# 2026-08-19 OXC Evaluation & Migration Plan

**Status:** Proposed
**Scope:** Evaluate the [OXC](https://oxc.rs/) ecosystem for the BlueJS monorepo and lay out a phased migration for the parts that make sense.

---

## 1. Executive Summary (TL;DR)

OXC is a Rust-based suite of JavaScript/TypeScript tools (parser, transformer, linter, minifier, resolver, coverage). It is now mature enough to adopt **partially, behind existing tooling**, but it is **not** yet a drop-in replacement for everything in our stack.

**Recommendation: adopt OXC in four incremental slices, in this order:**

| # | Slice | Tool | Benefit | Risk |
|---|-------|------|---------|------|
| 1 | Enforce `erasableSyntaxOnly` in `tsconfig` | TypeScript 5.9 (we're already on 5.9.3) | Unlocks safe OXC transform later; aligns with TS 7 direction; catches legacy syntax now | **Low** (mechanical) |
| 2 | Enable built-in + type-aware oxlint rules | `oxlint` (already in devDependencies) | We already lint with oxlint — this is pure capability gain (security, correctness, perf rules) with zero new tooling | **Low–Medium** |
| 3 | OXC transform in Vitest (if supported on installed version) | `vitest` 3.2.x / Vite 7 | Faster test-file transformation for ~3,700 spec files | **Low** (config-only, spike-gated) |
| 4 | Replace `tsc` *emission* with `oxc-transform` in the build | `oxc-transform` CLI/API | Build speedup on the emit path; single Rust-based transform for build + test | **Medium-High** (decorator + `Symbol.metadata` spike required) |

**Do NOT migrate (yet):**

- ❌ **Type checking** — `tsc` stays. No production OXC type checker exists; TS 7 (the native compiler) is still pre-GA.
- ❌ **Vitest itself** — there is no OXC-based test runner to move to.
- ❌ **`@tsmetadata/polyfill`** — it is a *runtime* dependency (standard TC39 decorators + `Symbol.metadata`), orthogonal to any build tool.
- ❌ **api-extractor** — no OXC equivalent for API reporting.
- ❌ **Prettier / Oxlint formatting split** — optional; see §6.4.

**Honest performance expectations:** the biggest *measurable* wins are (a) oxlint adding real lint coverage cheaply, and (b) a modest build/test speedup if the transform spike passes. This is primarily a **modernization + simplification** move (fewer moving parts in the JS toolchain, one language for parse/transform/lint) rather than a 10× rewrite. The one 10× candidate — `oxc-resolver` — has no clear hot path in our current stack (see §6.5).

---

## 2. Current Stack Baseline

| Concern | Today | Version |
|---|---|---|
| Language | TypeScript (ESM-only, ES2022 target, `Bundler` resolution) | 5.9.3 |
| Build | `tsc -b` via Nx, 29 packages, project references, output to `lib/` | via `typescript` |
| Type checking | `tsc` (same pass as build) | — |
| Linting | **oxlint** + 3 custom rules from `@blue/eslint-plugin` (`no-direct-integration-imports`, `no-internal-file-imports`, `no-internal-file-exports`) | oxlint (devDep), config in root `.oxlintrc.json` |
| Formatting | Prettier (4-space, single quotes, semicolons, width 120, ES5 trailing commas) | — |
| Tests | Vitest, ~3,700 spec files, jsdom + node environments, per-package `vitest.config.ts` | 3.2.4 |
| Decorators | **Standard TC39 Stage 3** + `@tsmetadata/polyfill` (explicitly NOT `experimentalDecorators`, NOT `reflect-metadata`) | — |
| API extraction | api-extractor (`etc/` baseline files) | — |
| Task runner | Nx + pnpm workspaces | — |
| Key constraint | Custom lint rules are **file-level import-shape checks** (see §4.2) — any linter replacement must reproduce them | — |

**Why this matters:** two unusual properties of this repo shape the whole evaluation:

1. **We already use oxlint.** "Migrating to OXC for linting" is really "turn on more of the tool we already have."
2. **Standard decorators + `Symbol.metadata`** are the highest-risk compatibility item for any transform tool, because most toolchains (and most blog posts) assume legacy `experimentalDecorators`.

---

## 3. OXC Ecosystem Assessment

### 3.1 What OXC actually is

A suite of Rust tools sharing one parser/AST:

- **OXC Parser** — ~50–100× faster than TypeScript's parser; claims to parse 580,000+ npm packages with a >99.9% pass rate (vendor claim; verify on our code in Phase 0).
- **OXC Transformer (`oxc-transform`)** — TS→JS, JSX, modern syntax downleveling. Explicitly supports `erasableSyntaxOnly`-compatible input and, per docs, standard decorators. **Must verify decorator + `Symbol.metadata` behavior on our exact code (Phase 0 spike).**
- **Oxlint** — linter; already in our stack. Recent versions add **type-aware linting** (reads TS types for a subset of rules). Built-in rules cover the `eslint:recommended`-class rules plus security/performance families.
- **OXC Minifier (`oxc-minify`)** — production minification. We don't do app-level minification (we're a library), so **out of scope**.
- **`oxc-resolver`** — Rust `enhanced-resolve`/`tsconfig-paths` replacement; 30–88× faster on resolution workloads (vendor benchmark). See §6.5 for where it does/doesn't help us.
- **OXC Coverage** — Rust V8 coverage processor; relevant if/when Vitest's OXC coverage provider is available on our version.

### 3.2 Maturity notes (as of this writing — verify in Phase 0)

- OXC tools iterate fast; config surfaces for Vite/Vitest integration (e.g., how a Vitest version enables OXC transform/coverage) **change between minor versions**. Every phase below is gated on a spike against the *installed* version, not against OXC's latest.
- The repo pins TypeScript 5.9.3, which is exactly the version that stabilized `erasableSyntaxOnly` — a deliberate enabler for this plan.

---

## 4. Key Findings

### 4.1 `erasableSyntaxOnly` is our on-ramp

TypeScript 5.9 stabilized `erasableSyntaxOnly`, which forbids syntax that requires *semantic* transformation: `enum`, `namespace`, `parameter properties` (`constructor(private x)`), and import-elision-dependent code.

- **BlueJS is already ~99% erasable-compatible** (we use class-based "type-safe enums" per STYLE_GUIDE §3.15, no `namespace`, and a quick scan shows no `enum` in `src/` — Phase 0 will confirm exhaustively).
- Enforcing it now:
  - Makes `oxc-transform` (pure syntactic transform) safe on our code *today*, with no TS version upgrade needed.
  - Aligns us with the TS 7 (native compiler) direction, which will require erasable-only syntax.
  - Is a pure win even if we never touch OXC: it pushes the codebase toward simpler, more portable syntax.
- **This is the only change in this plan that is unconditionally recommended.**

### 4.2 Our custom lint rules are file-level, not type-aware

The three `@blue/eslint-plugin` rules inspect **import statements and file paths** (`@blue/<pkg>/_*` patterns, integration-layer package list). They do not need type information.

- Oxlint **cannot** run our custom JS rules (no ESLint-compatible plugin runtime for them).
- **However:** the rules can be **rewritten in Rust** as oxlint plugin rules (OXC supports custom plugins) *or*, more pragmatically, **re-implemented as a small standalone checker** that parses the same files oxlint already visits. Since they are path-shape checks, a ~100-line checker script run in the same lint job is a viable interim; the Rust plugin is the end-state.
- **Decision:** keep `@blue/eslint-plugin` as the source of truth for rule *definitions* (shared constants in `_constants.ts`), and port the *implementation* to an oxlint-compatible form in Phase 2. No rule behavior changes — only the execution engine.

### 4.3 Standard decorators are the spike-gate for transform

- Our decorators are standard TC39 Stage 3; `Symbol.metadata` is provided at **runtime** by `@tsmetadata/polyfill` (a dependency, not a compile flag).
- `oxc-transform` documents standard-decorator support, but we have **zero third-party evidence on the `Symbol.metadata` metadata-collection path** specifically (e.g., whether `Symbol.metadata` property assignments on classes survive transformation, whether metadata keys are preserved).
- **Phase 0 spike is mandatory and blocking** for the build migration (Slice 4). If the spike fails, we keep `tsc` for build emission indefinitely — the rest of the plan still stands.

### 4.4 Vitest 3.2 / Vite 7 and OXC

Vitest 3.2.x builds on Vite 7, whose transformation pipeline can use OXC in recent releases. The **exact config key and defaults differ between Vite/Vitest minors**, so:

- Phase 0 spike: run one representative spec (e.g., `packages/blue-core/test/decorators.spec.ts` — decorator-heavy) with OXC transform enabled and compare pass/fail + timing vs. baseline.
- If unsupported or flaky on our pinned versions, this slice is **dropped silently** — it is purely opportunistic.

### 4.5 Where `oxc-resolver` does and doesn't help

| Consumer | Uses resolution? | Can use oxc-resolver? |
|---|---|---|
| `tsc -b` (type check + build) | Yes, heavily | **No** — tsc does its own resolution internally |
| Vitest / Vite (test) | Yes — module graph across ~3,700 spec files + workspace aliases | **Possibly** — via Vite's `resolve` customization or a Vite plugin; verify integration path in Phase 0 |
| Our custom import lint rules | Yes — cross-package `@blue/*` resolution | Trivial either way (path string checks) |
| api-extractor | Yes | **No** — no supported swap |

Conclusion: `oxc-resolver` is the classic OXC headline win, but our resolution hot paths (tsc, api-extractor) are closed. It is a **candidate optimization inside the Vitest slice only**, not a standalone phase.

---

## 5. What We Are NOT Migrating (and why)

| Tool | Verdict | Reason |
|---|---|---|
| TypeScript type checking / `tsc` build | **Keep** | No production OXC type checker. TS 7 native preview is not a dependency we should build a migration on. |
| Vitest as test runner | **Keep** | No OXC-based runner exists to move to. We optimize *under* Vitest, not replace it. |
| `@tsmetadata/polyfill` | **Keep** | Runtime polyfill for standard decorator metadata. Independent of build tool. |
| api-extractor | **Keep** | No OXC API-reporting equivalent; `etc/` baselines are load-bearing for semver checks. |
| Prettier | **Keep (for now)** | Oxlint has a formatter, but our `.prettierrc`-defined house style (4-space, width 120) is well-served, and switching formatters is churn without payoff. Revisit only if Prettier becomes a bottleneck (it isn't — it's not in the build path). |
| Nx / pnpm | **Keep** | Orthogonal to OXC. |

---

## 6. Migration Plan

### Phase 0 — Measurement & Spike (½–1 day)

**Goal: baseline + kill criteria, before any change lands.**

1. Record baselines (save to `docs/audits/` as `2026-08-19_OXC_BASELINE.md`):
   - `pnpm build` wall time (cold and warm)
   - `pnpm test` wall time, and per-package transform-heavy packages (e.g., blue-core)
   - `pnpm lint` wall time
   - Node version (`node --version`), pnpm version, exact oxlint/vitest versions
2. **Decorator spike (blocking for Slice 4):**
   - Create throwaway `spike/oxc-transform/` (do not commit; or commit under a scratch branch).
   - Run `oxc-transform` over `packages/blue-core/src/decorator.ts` + 3–5 other decorator-using files (decorators, context tokens, DI containers).
   - Assert: (a) output compiles under `node --experimental-transform-types`-equivalent semantics, i.e., `node` can execute it; (b) a metadata consumer (a test that reads `Symbol.metadata` of a decorated class) returns identical data vs. the tsc-built output.
   - **Kill criterion:** any metadata mismatch or decorator emit failure → Slice 4 cancelled; document in this file and move on.
3. **`erasableSyntaxOnly` dry run:** `tsc -b --erasableSyntaxOnly` (or per-project) to enumerate every violation. Expect ~0; if >0, file them as a prerequisite task list.
4. **Vitest OXC spike (non-blocking):** enable the OXC transform path for one package's vitest run on the installed 3.2.x; record if supported, and timing delta.
5. **Parser sanity:** run `oxc-parser` (via `oxlint` with a debug pass, or the standalone binary) over the whole `src/` tree; record parse failures (expected: none).

**Exit criteria:** baseline doc committed; decorator spike verdict recorded; erasable violations enumerated.

---

### Phase 1 — `erasableSyntaxOnly` enforcement (½–1 day)

**Goal: make the codebase transform-safe and future-proof. No OXC code involved yet.**

Tasks:

1. Add `"erasableSyntaxOnly": true` to the shared/base `tsconfig` (verify how the 29 packages inherit config — likely a root `tsconfig.base.json`).
2. Fix any violations surfaced in Phase 0 (mechanical: `enum` → class-based enum per STYLE_GUIDE §3.15, parameter properties → explicit fields, `namespace` → module patterns).
3. Add a guard so it can't be silently removed: a test (or lint assertion) that reads the effective tsconfig and asserts the flag is on. *(Cheap: a `tsconfig`-reading unit test in a meta-package.)*
4. Update `STYLE_GUIDE.md` §3.15 / TypeScript section: "BlueJS uses erasable-only TypeScript syntax" with the allowed/disallowed list.
5. Update `AGENTS.md` critical-read list with a one-liner.

Verification: `pnpm build && pnpm test && pnpm lint` green. Commit.

**Risk: Low.** Worst case is a few mechanical rewrites. This phase is valuable even if all later phases fail their spikes.

---

### Phase 2 — Oxlint: enable built-in + type-aware rules (1–3 days)

**Goal: turn our existing oxlint from "custom rules only" into a real linter, at oxlint's Rust speed.**

Tasks:

1. In root `.oxlintrc.json`, enable the built-in rule categories aligned to our house style — start with:
   - `correctness` (all) — bugs
   - `suspicious` (most) — with review of exceptions
   - `perf` — matches the monorepo's performance ethos
   - `security` — supply-chain-aware import checks complement our integration-layer rules
   - **Do not** bulk-enable `style` — it will fight Prettier/house conventions; pick a small curated set (or none).
2. **Type-aware linting:** enable for the subset of rules that benefit (e.g., type-aware `no-unsafe`-class checks). Verify the installed oxlint version supports it and measure the cost (type-aware linting runs a TS type pass — expect a time increase; measure against the `pnpm lint` baseline; if it doubles lint time, keep it **off by default, on via a `pnpm lint:types` script**).
3. **Port the three custom rules** (decision from §4.2):
   - Interim: standalone checker (TS script, ~100–200 lines) reusing the constants from `@blue/eslint-plugin/src/_constants.ts`, run from the same `lint` script. Zero behavior change, no Rust required.
   - End-state (optional, later): implement as an OXC Rust plugin. Track as a follow-up, not a blocker.
4. Triage the resulting findings: fix real bugs; codify the rest as `// oxlint-disable-next-line` with justification or config exceptions.
5. Update `AGENTS.md` enforcement table (the three `@blue/*` rule entries now say "executed by oxlint + checker" instead of "eslint-plugin").

Verification: `pnpm lint` green with the new rule set; `pnpm build && pnpm test` unaffected. Commit (consider splitting "enable rules" and "fix findings" into two commits).

**Risk: Low–Medium.** The risk is rule-noise churn, not breakage. Mitigated by starting with `correctness` only and expanding deliberately. Type-aware cost is measured, not guessed.

---

### Phase 3 — Vitest OXC transform (½–1 day, spike-gated)

**Goal: faster test transformation, if the installed Vitest/Vite supports it cleanly.**

Tasks:

1. If Phase 0 spike was positive: enable the OXC transform in the shared Vitest config pattern (the repo uses per-package `vitest.config.ts` — verify whether there's a shared preset to change once, or whether it's 29 small edits).
2. Re-run full `pnpm test`; compare against baseline. Record in the baseline doc.
3. *(Optional, same phase:)* if `oxc-resolver` integration with our Vite version is clean, try it for alias resolution of `@blue/*` and measure. Drop if integration is awkward — not worth a plugin we must maintain.
4. If the spike was negative: close this phase with a note, no code change.

Verification: full test suite green, timing recorded.

**Risk: Low** (config-only, revertible in one commit).

---

### Phase 4 — `oxc-transform` for build emission (2–5 days, spike-gated)

**Goal: replace `tsc` *emit* with `oxc-transform`, keeping `tsc` for *type checking* only.** This is the largest structural change; it is entirely optional and gated on Phase 0's decorator spike passing.

Architecture (if pursued):

```
pnpm build  (Nx orchestrates per package)
  ├─ tsc -b --emitDeclarationOnly false --noEmit   ← type check only (still full tsc)
  └─ oxc-transform src/ → lib/                      ← JS emit (fast, Rust)
```

Tasks:

1. Add `oxc-transform` (CLI or Node API) as a devDependency.
2. Build a per-package emit script (Nx target `build:emit`) that:
   - transforms `src/**/*.ts` → `lib/**/*.js` with target ES2022, modules ESM,
   - copies `src/**/*.d.ts`? **No** — declaration files must still come from tsc (oxc-transform does not emit d.ts). So the split is: `tsc -b` with `noEmit: true` + a declaration-only pass (`emitDeclarationOnly: true`), or keep tsc emitting d.ts alongside and let oxc overwrite the `.js`. **Spike this split in Phase 0 addendum** — it affects the shape of `lib/` output and api-extractor's inputs.
   - handles non-TS asset copies identically to today's tsc behavior.
3. Prove `lib/` output **byte-identical (or semantically identical) and green**: run `pnpm test` against the oxc-built `lib/` of 2–3 packages first (blue-core, then blue-context, blue-router — the decorator/DI-heavy ones), then all 29.
4. api-extractor: run against oxc-built output; `etc/` baselines must not change (they consume d.ts, which still comes from tsc — verify).
5. Wire into Nx: `build:lib` = typecheck → transform → (existing post-steps). Keep the old tsc-emit path available via a flag/branch for one release cycle as rollback.
6. Measure against baseline; document real numbers in `docs/audits/`.

Verification: `pnpm build && pnpm test && pnpm lint` green; api-extractor clean; timing recorded.

**Risk: Medium-High.** Specifics:
- *d.ts/JS split* changes build graph (mitigation: Phase 0 addendum spike; keep tsc-emit rollback path).
- *Subtle emit differences* (source maps, `import.meta` handling, helper functions) (mitigation: test-against-output for DI-heavy packages first).
- *Maintenance burden* of a custom build script (mitigation: it's ~1 script; if it becomes a burden, the rollback path is one flag).

**If the Phase 0 decorator spike fails: this phase is cancelled. Everything else stands.**

---

### Phase 5 — Housekeeping (ongoing)

1. Update `ARCHITECTURE.md` "Dependency Management Strategy" / tooling sections and `AGENTS.md` quick-start if any phase landed.
2. Revisit OXC quarterly (fast-moving ecosystem): oxc-resolver for test resolution, OXC coverage provider, TS 7 GA.
3. Track follow-ups: Rust port of the 3 custom lint rules (Phase 2 end-state); formatter revisit.

---

## 7. Risks & Mitigations (summary)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `oxc-transform` mishandles standard decorators / `Symbol.metadata` | Medium | Slice 4 fails | Phase 0 blocking spike with metadata round-trip assertion; kill criterion documented |
| OXC config surface changes between minors (Vite/Vitest integration) | High (ecosystem-wide) | Slips / rework | Every phase pins to *installed* versions; spikes verify, docs don't assume |
| oxlint rule noise overwhelms review | Medium | Churn, disabled rules | Start with `correctness` only; curate; measure type-aware cost before defaulting it on |
| Custom lint rule port changes behavior | Low | Silent policy drift | Keep rule definitions/constants in `@blue/eslint-plugin`; checker reuses them; same lint job; no rule added/removed |
| Build split (d.ts from tsc, JS from oxc) breaks api-extractor or consumers | Medium | Broken publish pipeline | Phase 0 addendum spike; test DI-heavy packages first; one-flag rollback path |
| Performance gains don't materialize | Medium | "Wasted effort" | Phase 0 baselines make the real numbers a go/no-go input, not a surprise; capability wins (lint coverage, erasable syntax, toolchain unification) stand independently of speed |

---

## 8. Success Criteria

- **Phase 1:** `erasableSyntaxOnly: true` in the base tsconfig; guard test exists; full `pnpm build/test/lint` green.
- **Phase 2:** `pnpm lint` runs built-in `correctness` + curated rules; the 3 BlueJS rules enforced with identical semantics; type-aware mode available (default on/off by measured cost).
- **Phase 3 (if supported):** full test suite green with OXC transform; timing recorded vs. baseline.
- **Phase 4 (if spike passed):** `pnpm build` green with oxc emission; `etc/` baselines unchanged; test suite green; measured build-time delta recorded.
- **Docs:** `AGENTS.md`, `STYLE_GUIDE.md`, `ARCHITECTURE.md` updated wherever tooling changed; this plan marked Completed with actual numbers.

---

## 9. Suggested Task Breakdown (for the `plan` agent / backlog)

1. `[spike]` OXC baseline measurements → `docs/audits/2026-08-19_OXC_BASELINE.md`
2. `[spike]` oxc-transform decorator/`Symbol.metadata` round-trip (blocking for #8)
3. `[spike]` `erasableSyntaxOnly` dry run; enumerate violations
4. `[spike]` Vitest 3.2.x OXC transform support check (1 package)
5. `tsconfig` — enable `erasableSyntaxOnly` + fix violations + guard test
6. `docs` — STYLE_GUIDE/AGENTS erasable-syntax note
7. `oxlint` — enable built-in rule set (correctness first), triage findings
8. `lint` — port 3 custom rules to checker (interim) / track Rust plugin (end-state)
9. `vitest` — enable OXC transform if spike #4 passed
10. `build` — oxc-transform emit pipeline (only if spike #2 passed)
11. `docs` — final doc sync + mark plan complete with numbers

Sequencing: 1–4 in parallel → 5,6 → 7,8 → 9 → 10 → 11.
