# Environment Phase 2 — Standard Sources: Config Files, .env, Browser, Precedence

**Date:** 2026-09-08
**Status:** Draft — awaiting review (Q1–Q9)
**Roadmap:** Phase 2 of the Environment roadmap, building on P0 (sources/registry, `f79d5dc3`) + P1 (placeholders/typed/CLI, `b403310b`). This is the phase where the **documented source-precedence doctrine** (parked at the roadmap research) becomes a concrete, tested ordering.

## 1 · Objective

Phase 1 wired the first built-in source (`commandLine`). Phase 2 makes the environment sources _representative_: config files, environment files, and a real browser experience — plus the **documented precedence chain** that pins their relative order.

User stories:

1. As a Node app, I get `process.env`, `.env`, `application.json`, and `application-{profile}.json` as first-class named sources — in a documented, deterministic order.
2. As a browser app, I get a real `BrowserEnvironment` — `import.meta.env` + bootstrap JSON, with an **allow-list** so secrets never reach the client.
3. As a deployer, the precedence doctrine is documented and enforced: **CLI > env > files > builder > defaults** — anything that breaks it is a failing spec.

Non-goals (explicit): origin tracking (P5), customizers (`EnvironmentPostProcessor`, P5), validation (P6), `application.properties` YAML (keep it boring — JSON).

## 2 · Current state (evidence)

| Area                    | Today                                                                                                      | Gap                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Node sources**        | `NodeEnvironment` = `process.env` snapshot (`systemEnvironment`) + constructor sources                     | No config files, no `.env`                                                   |
| **Boot**                | `run(...args)` → `_configureEnvironment` → `_configurePropertySources` (CLI `addFirst`, builder `addLast`) | No file-loading step; precedence chain partial (CLI vs builder only)         |
| **Browser**             | `BrowserEnvironment extends StandardEnvironment` — **zero sources**                                        | No `import.meta.env`, no bootstrap JSON, no allow-list                       |
| **Config files**        | `ApplicationBuilder.fromConfig(url)` — fetch JSON, top-level `sources`/`profiles`/`properties` keys        | Single-shot URL; no `application.json` convention, no profile-specific files |
| **Precedence doctrine** | Roadmap research: CLI > env > files > builder > defaults (Spring/12-factor)                                | Undocumented, untested, partially implemented                                |

## 3 · Decisions (proposed — review Q1–Q9)

### D1 — Node standard sources + **documented, tested precedence chain**

`NodeEnvironment` wires, in **lowest→highest** precedence:

```
defaults          (constructor `defaultProperties`, Q8)
application.json  (profile-less base file)
application-{profile}.json  (each active profile, later profiles higher)
.env              (dotenv-style; non-overriding — never clobbers existing sources, Q5)
process.env       (snapshot, `systemEnvironment` — the live env wins over files)
boot              (builder `properties(...)`)
commandLine       (CLI args — always highest)
```

Each is a **named source** (`application`, `application-{profile}`, `dotenv`, `systemEnvironment`, `boot`, `commandLine`) — replaceable/reorderable per P0 semantics. **File-loading placement (Q1)**: in `@blue/boot`'s `_prepareEnvironment`, orchestrated **after profiles are applied** (profile-aware stacking is impossible at `NodeEnvironment` construction — activeProfiles is empty until `_configureProfiles`) and **before** CLI/builder wiring (CLI > boot > files > env > defaults). Boot stays isomorphic: the loader reads through an injected `readFile(path) → Promise<string|null>` seam; `blue-platform-node` supplies an `fs`-backed reader; browsers/specs pass none (files skipped / fake reader). `NodeEnvironment` stays resolver-only (P1 posture).

### D2 — Config file discovery

`StandardConfigFileLoader` (in `@blue/boot`, constructed with an injected `readFile` seam per Q1):

- **Locations** `./config/`, `./` (default; env-overridable via `BLUE_CONFIG_LOCATION`, comma-separated, `optional:` prefix like Spring). **First-present-wins per file name, no cross-location merge** (Q4 — merging would reintroduce the Q3 surprise: which dir's scalar wins, stale base-dir keys survive; Spring uses location-groups first-match; layering is the explicit job of profiles + `BLUE_CONFIG_IMPORT`).
- **Names**: `application.json` (base) + `application-{profile}.json` per active profile (later profiles higher precedence). **Implementation note (divergence from draft)**: all files deep-merge into **one `application` source** — the chain's whole-subtree first-wins would shadow a profile's nested overrides behind the base subtree; merging into one source gives correct per-key profile precedence (objects merge, scalars override, arrays replace). The name `application` is then single; profile-specificity is internal to the merged value.
- **JSON only** (boring, structured, no YAML dep). Deep-merged per source: nested objects merge, scalars override, **arrays replace** (Q3 — an override that replaces a list is total and predictable; append would silently leave stale base entries active; extending a base list means copying its entries explicitly).
- **Profile-aware**: loader reads `activeProfiles` from the environment; per-profile files stack above the base.
- Missing file → skip silently (optional by default; `required:` prefix throws). `BLUE_CONFIG_IMPORT` (comma-separated, like Spring's `spring.config.import`) for extra files.

### D3 — `.env` (dotenv package, non-overriding)

- Use the **`dotenv` npm package** (Q2 — ecosystem-standard, battle-tested, `override: false` default matches our non-overriding posture; hand-rolling a parser the community already standardizes is weightless reinvention); `dotenv.config()` `parsed` result registered as a `dotenv` named source. Parser format pins (comments, quotes, `export`, CRLF) come from dotenv's own tests — we don't re-pin them.
- **Non-overriding**: registered **below** `systemEnvironment` (process.env wins over .env — dotenv's _own_ documented behavior, [dotenv npm](https://www.npmjs.com/package/dotenv)); also below `application*.json`.

### D4 — BrowserEnvironment: real sources + **allow-list**

`BrowserEnvironment` (blue-platform-web) gains:

- **`import.meta.env`** registered as `importMetaEnv` source (`VITE_`-prefixed keys only — the Vite contract, [Vite docs via reintech/dev.to/TanStack](https://vitejs.dev/guide/env-and-mode)); **only** keys matching `VITE_` (or a configurable prefix) are included — the allow-list IS the security boundary (never ship secrets).
- **Bootstrap JSON**: optional `bootstrap` named source, populated by the host app (typically injected from the server into a `<script type="application/json">` or a `window.__BLUE_BOOTSTRAP__`-style convention); the app registers it via `environment.getPropertySources().addLast('bootstrap', data)` — no new API, P0 semantics.
- **`hasProperty`/`getProperty` on non-allow-listed keys**: structure supports an explicit block — an allow-listed key absent from `importMetaEnv` but present elsewhere still resolves (allow-list filters the _source_, not the _environment_). **Normative boundary (Q6)**: anything registered into `bootstrap` or `importMetaEnv` is **client-visible by definition**; secrets belong in server-only sources (env, files, `systemEnvironment`) and are never registered on browser environments — app responsibility, documented as such (no mechanical gate; a self-referential allow-list would add ceremony without safety).

### D5 — `fromConfig` converges

`ApplicationBuilder.fromConfig(url)` reuses the loader's merge semantics for its `properties`/`profiles`; the URL is a valid `BLUE_CONFIG_LOCATION` value; file loading is enabled via the existing `builder.configFiles(new StandardConfigFileLoader({ reader }))` — no new API needed (connected at the builder surface, verified in implementation).

### D6 — Precedence doctrine is a **spec artifact**

The chain in D1 is encoded as: (a) a **doc table** in the plan + a _public docs_ section; (b) **integration specs** asserting final resolution (CLI > env > files > builder > defaults) at `@blue/boot` level; (c) **`PrecedenceDoc`** (Q7) — a canonical ordered source-name constant in blue-boot that the docs reference and the integration test asserts _against_ (wired registry order must equal it) — so the documented chain and the tested chain cannot drift.

## 4 · Project structure

```
packages/blue-boot/src/
  config-file-loader.ts      NEW  — StandardConfigFileLoader (readFile seam, JSON discovery, profiles, merge, optional/required, BLUE_CONFIG_LOCATION, BLUE_CONFIG_IMPORT)
  precedence.ts              NEW  — PrecedenceDoc: canonical ordered source-name list (Q7)
packages/blue-platform-node/src/
  node-file-reader.ts        NEW  — fs-backed readFile for the loader seam
packages/blue-context/src/
  (dotenv handled by the `dotenv` npm dependency — no local parser)
packages/blue-platform-web/src/
  browser-environment.ts     EDIT — importMetaEnv source (VITE_ filter) + bootstrap slot
packages/blue-boot/test/
  config-file-loader.spec.ts NEW  — discovery, profile stacking, merge, optional/required, BLUE_CONFIG_LOCATION/IMPORT
  precedence.spec.ts         NEW  — final resolution order (CLI > env > files > builder > defaults)
packages/blue-context/test/
  dotenv.spec.ts             NEW  — format pins (comments, quotes, export, CRLF, override=false)
packages/blue-platform-web/test/
  browser-environment.spec.ts EDIT — importMetaEnv filtering, bootstrap registration, allow-list
```

## 5 · Code style

Matches P0/P1 (tsdoc, `#private`, no `any`, narrowed `unknown`, no eval). The dotenv parser is a script-shaped pure function with exhaustive format pins. Config merge is a small deep-merge with array-replace semantics (arrays replace, objects merge — Q3).

## 6 · Testing strategy

- **dotenv parser**: comments, `#` inline, single/double quotes, `export` prefix, CRLF, Missing-Value, empty lines, whitespace; non-override (file value yields when process.env absent, process.env wins when present).
- **Loader**: location precedence, profile stacking (`application-prod.json` > `application.json`), deep merge (scalars override, objects merge, arrays replace), missing → skip, `required:` throws, `BLUE_CONFIG_LOCATION` overrides defaults, `BLUE_CONFIG_IMPORT` adds.
- **Precedence**: full-chain integration — CLI arg, env var, .env file, application file, builder prop, default; assert the winner at each level; `PrecedenceDoc` list matches the wired order (`commandLine` first … `defaults` last).
- **Browser**: `importMetaEnv` filters to `VITE_`; non-prefixed keys absent; bootstrap registered after (`addLast`) resolves; docs note secrets-in-bootstrap responsibility.

## 7 · Boundaries

- **Always:** full suite + `pnpm lint` + `prettier --check`; existing P0/P1 specs stay green; the **one** new runtime dependency is `dotenv` (Q2-boundary) — no others; no YAML.
- **Ask first:** additional new runtime dependencies beyond `dotenv`; YAML support; changing the documented precedence order after D1; exposing non-`VITE_` keys by default in browser.
- **Never:** load secrets into the browser allow-list by default; mutate `process.env` from `.env` loading (non-overriding, snapshot-only); per-lookup allocations in hot paths; eval-family anywhere.

## 8 · Success criteria (testable)

1. `application.json` + `application-{profile}.json` resolve in a Node boot with profile stacking; merge is deep; arrays replace.
2. `.env` values appear as a `dotenv` source below `systemEnvironment`; `process.env` wins over `.env`; a `.env` value for a set env var does not override it.
3. Full-chain precedence verified by integration spec: CLI > env > files > builder > defaults; `defaults` lowest.
4. `BrowserEnvironment` exposes only `VITE_`-prefixed `import.meta.env` keys; `bootstrap` registered by the app resolves; docs state the secret boundary.
5. `BLUE_CONFIG_LOCATION`/`BLUE_CONFIG_IMPORT`/`optional:`/`required:` operate per D2.
6. Full monorepo suite green; lint/format clean; `graft build` refreshed.

## 9 · Rollout

1. `dotenv.ts` + spec (pure parser, zero deps).
2. `config-file-loader.ts` + spec (locations, profiles, merge, optional/required, env overrides).
3. Boot wiring: `_prepareEnvironment` loads files between environment creation and CLI/builder wiring.
4. `precedence.ts` (per Q7) + precedence integration spec.
5. `BrowserEnvironment` sources + allow-list + spec.
6. Precedence doc table; full suite; ADR (AD-13).

## 10 · Open questions

- **Q1 — File-loading placement (resolved → boot-orchestrated + readFile seam)**: loader in `@blue/boot`, orchestrated after profiles (constructor-loading can't see profiles → profile stacking impossible) and before CLI/builder. Injected `readFile` seam keeps boot isomorphic; `blue-platform-node` supplies the `fs` reader; specs inject fakes. `NodeEnvironment` stays resolver-only. Cost: `.configFiles({ reader })` surface on the builder.
- **Q2 — dotenv dependency (resolved → `dotenv` npm package)**: ecosystem-standard, battle-tested, `override: false` default matches the non-overriding posture; no hand-rolled parser. New runtime dep for blue-context (Q2-boundary: the one allowed adding to the "no new deps" rule).
- **Q3 — Deep-merge semantics (resolved → arrays replace)**: objects merge, scalars override, **arrays replace** — an override that replaces a list is total and predictable; append would silently leave the base's stale entries active. Extending a base list = copying its entries explicitly.
- **Q4 — Location precedence (resolved → first-present-wins, no cross-location merge)**: `./config/application.json` beats `./application.json` (given `./config/,./`); merging would reintroduce the Q3 surprise (which dir's scalar wins, stale base-dir keys); Spring's location-groups are first-match; layering = profiles + `BLUE_CONFIG_IMPORT`.
- **Q5 — `.env` non-overriding (resolved → stays)**: `.env` (`dotenv`) registers **below** `systemEnvironment` — a set env var wins over `.env`; dotenv's own `override: false` default; 12-factor (env vars are the externalized channel, files the fallback); a `.env` silently clobbering a CI-injected value is a footgun.
- **Q6 — Bootstrap secret gating (resolved → docs-only)**: no mechanical gate — an allow-list would be self-referential (its config lives in the same sources); the real boundary is "don't put secrets in client-visible code". Doc states it normatively: anything in `bootstrap`/`importMetaEnv` is client-visible by definition; secrets belong in server-only sources and are never registered on browser environments. The `VITE_` filter still covers accidental exposure of importMetaEnv.
- **Q7 — `PrecedenceDoc` constant (resolved → ship it)**: canonical ordered source-name list (`commandLine > boot > systemEnvironment > dotenv > application-{profile} > application > defaults`) as a single source of truth; integration test programmatically asserts "wired registry order equals documented order" — the one place doc/code drift has a real cost (a new source forgotten from the doc, a silent reorder that outcome-tests still pass). ~3 lines, not an abstraction layer.
- **Q8 — Defaults source (resolved → always present, empty when unused)**: keeps the chain structurally uniform (every run has exactly the documented sources, some empty); simplifies the Q7 PrecedenceDoc assertion (no conditional case); cost is an empty object. Possible future home for P1 placeholder-defaults / P4 binding-defaults inspectability.
- **Q9 — Browser import.meta.env availability (resolved → feature-detect, register only when Vite)**: `import.meta.env` is a build-time injection — always-registering writes it unconditionally and breaks non-Vite builds at eval/parse; a non-Vite `importMetaEnv` source would carry garbage with Vite-specific semantics. Guard `'env' in import.meta && typeof import.meta.env === 'object'` at construction; absent → no `importMetaEnv` source (browser chain still has `bootstrap` + `defaults`; `?` on `importMetaEnv` documented in the browser chain table). Filter exposed as a testable pure function.
