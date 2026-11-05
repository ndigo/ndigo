# AD-13: Environment standard sources — config files, .env, browser, precedence (Phase 2)

**Date:** 2026-09-08
**Status:** Accepted — decisions D1–D6 + Q1–Q9 closed; implementation tracked in `docs/plans/2026-09-08_ENVIRONMENT_PHASE2.md`. **D3 not shipped — see Update (2026-10-06).**

## Background

Phases 0/1 (AD-11, AD-12) delivered the named-source registry, lookup
strategies, placeholders, typed reads, and CLI args. What the environment
still lacked: **standard sources** — config files, `.env`, and a real browser
experience — plus the **documented precedence doctrine** (deferred from the
roadmap research) pinning their relative order. Boot's environment seam
(`_prepareEnvironment` → `_configureEnvironment` → `_configurePropertySources`)
partially wired CLI vs builder; the rest of the chain was unimplemented.

## Decision

**D1 — Node standard sources + documented, tested precedence chain.**
`NodeEnvironment` gains, in **lowest→highest** order:
`defaults` → `application.json` → `application-{profile}.json` →
`dotenv` → `systemEnvironment` → `boot` → `commandLine`. All named sources,
replaceable/reorderable per P0 semantics. **File-loading placement (Q1)**:
orchestrated in `@blue/boot`'s `_prepareEnvironment` — **after profiles are
applied** (profile-aware stacking is impossible at `NodeEnvironment`
construction: `activeProfiles` is empty until `_configureProfiles`), **before**
CLI/builder wiring. Boot stays isomorphic via an injected
`readFile(path) → Promise<string|null>` seam; `blue-platform-node` supplies the
`fs`-backed reader; browsers/specs pass none. `NodeEnvironment` stays
resolver-only.

**D2 — `StandardConfigFileLoader`.** Locations `./config/`, `./` (default;
`BLUE_CONFIG_LOCATION` overrides, comma-separated, `optional:` prefix as in the
reference framework). **First-present-wins per file name, no cross-location merge (Q4)**.
Names: `application.json` (base) + `application-{profile}.json` per active
profile (later profiles higher). JSON only. **Deep-merge: objects merge,
scalars override, arrays replace (Q3)** — an override that replaces a list is
total; append would silently retain stale base entries. Missing → skip
(`optional:` default); `required:` throws. `BLUE_CONFIG_IMPORT`
(comma-separated) for extra files.

**D3 — `.env` via the `dotenv` npm package (Q2).** Ecosystem-standard,
battle-tested, `override: false` default matches our posture; the one new
runtime dependency (boundaries updated). Registered as a `dotenv` named source
**below `systemEnvironment` (Q5, non-overriding)** — a set env var wins over a
`.env` value (12-factor: env vars are the externalized channel, files the
fallback; CI-injected values must not be clobbered by a checked-in file).

**D4 — `BrowserEnvironment` real sources + allow-list.** `importMetaEnv`
source: `VITE_`-prefixed keys only (the Vite contract — the allow-list IS the
security boundary). **Feature-detected (Q9)**: `'env' in import.meta &&
typeof import.meta.env === 'object'` at construction; absent (non-Vite build)
→ no `importMetaEnv` source — always-registering would break non-Vite builds
at eval/parse. Filter exposed as a testable pure function. `bootstrap` source
slot: host app registers server-injected JSON via `addLast('bootstrap', …)`
(no new API). **Secret boundary (Q6)**: docs-only, stated normatively —
anything in `bootstrap`/`importMetaEnv` is client-visible by definition; a
mechanical gate would be self-referential (its config lives in the same
sources).

**D5 — `fromConfig` converges.** `ApplicationBuilder.fromConfig(url)` reuses
the loader's merge semantics; the URL becomes a valid `BLUE_CONFIG_LOCATION`
value. No new API.

**D6 — Precedence doctrine as a spec artifact.** **`PrecedenceDoc` (Q7)** — a
canonical ordered source-name constant in `@blue/boot` — is the single source
of truth: the doc table references it and the integration test programmatically
asserts the wired registry order equals it, so the documented chain and the
tested chain cannot drift. **`defaults` always present (Q8)**, empty when
unused (structural uniformity; no conditional in the Q7 assertion).

## Consequences

- New in `@blue/boot`: `config-file-loader.ts` (`StandardConfigFileLoader`,
  `readFile` seam), `precedence.ts` (`PrecedenceDoc`); the boot environment
  sequence becomes create → profiles → **files** → CLI/builder.
- New in `blue-platform-node`: `node-file-reader.ts` (`fs`-backed seam).
- New dep: `dotenv` (blue-context).
- `BrowserEnvironment` gains `importMetaEnv` (VITE_-filtered, Vite-only) +
  `bootstrap` slot; filter is a tested pure function.
- Behavior changes (pre-1.0, accepted): boot now reads `./config`/`./`
  JSON files + `.env` when present (opt-in via the loader wiring); browser
  environments expose `importMetaEnv`/`bootstrap`.
- Precedence is now a documented, tested contract — a violation is a failing
  spec, not a surprise.

## Update (2026-10-06)

**D3 (`.env` via the `dotenv` npm package) is not shipped.** No `.env` source
exists in the codebase: `@blue/context` never reads a `.env` file, no
workspace package depends on `dotenv` (the lockfile copy is a transitive
tooling dependency), and nothing registers a `dotenv` source at boot. The
`dotenv` name remains in `PRECEDENCE` (D1/D6) as a **reserved
slot** — a stack that never registers it simply skips it, and the real-boot
order spec asserts order over the sources actually present.

Guide 03 §1 previously claimed `.env` was auto-loaded and omitted the shipped
`configServer` slot; it now lists `configServer` (AD-29 Wave 3) in the chain
and marks `dotenv` as reserved/user-supplied. Landing D3 is deferred; the
settled decisions above are otherwise unchanged.

## Revisit Trigger

Revisit if: (a) YAML support is wanted (add a loader backend — the seam
abstracts format); (b) location merging across dirs becomes a real need
(import is the current layering mechanism); (c) a non-Vite browser build
defines its own `import.meta.env` contract (extend the feature-detect, not the
contract); or (d) the browser secret boundary needs teeth (a bootstrap
allow-list proposal should show a concrete non-self-referential design).
