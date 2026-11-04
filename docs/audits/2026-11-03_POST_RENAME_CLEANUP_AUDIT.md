# Post-rename cleanup audit (2026-11-03)

**Issue:** [#81](https://github.com/ndigo/ndigo/issues/81) — post-rename cleanup audit (dead code, deps, apps).
**Tooling added:** `knip` in report mode — `pnpm audit:dead` (config: root `knip.json`).

## Context

Pre-1.0 is the cheapest window to shrink surface (precedent: AD-84 pruned
`@ndigo/util`). The rename (#79) made this the first fresh pass over the
`ndigo` tree. No dead-code tooling existed before this audit.

## Method

1. Raw `knip` run over the monorepo (report mode).
2. Manual verification of every file-level finding with reference greps
   (importers, index re-exports, dynamic loads, HTML/config references).
3. Classification into **verified findings** vs **false-positive classes**
   (below), since knip's monorepo heuristics miss several repo conventions.

Raw counts → after the cuts and config below:

| Section               | Raw | Tuned |
| --------------------- | --: | ----: |
| Unused files          |  20 |    10 |
| Unused dependencies   |   1 |     1 |
| Unused devDeps        |  79 |    77 |
| Unused exports        | 108 |    99 |
| Unused exported types |  35 |    34 |
| Duplicate exports     |   5 |     5 |

## Verified findings — pruned in this PR

Every file below had **zero importers** (grepped across `packages/`, `apps/`,
`scripts/`, including dynamic `import()` forms), was **not re-exported** from
its package index, and `pnpm build` + the full test suite stayed green after
removal:

| File                                                                | Evidence                                                                                                                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/ndigo-core/src/quality-factor.ts`                         | Parallel q-value implementation; `media-type.ts` carries its own comparator + parsing; only reference left was an external-symbol-links placeholder entry (also removed) |
| `packages/ndigo-core/src/validator.ts`                              | `Validator` interface unreferenced; superseded by the zod path (AD-07)                                                                                                   |
| `packages/ndigo-dispatcher/src/strategies/http-strategy.ts`         | Not among the strategies `dispatcher.ts` wires (5 live ones are imported directly)                                                                                       |
| `packages/ndigo-dispatcher/src/strategies/service-strategy.ts`      | Same                                                                                                                                                                     |
| `packages/ndigo-dispatcher/src/strategies/view-mapping-strategy.ts` | Same                                                                                                                                                                     |
| `packages/ndigo-factory/src/entry.ts`                               | `export default class Entry` — factory's index exports `aware`/`context-tokens`/`entry-processor`/`factory`/`lifecycle`/`registry`, never `entry`                        |
| `packages/ndigo-platform-node/src/node-file-reader.ts`              | `nodeFileReader` has no importers; boot's config loader provides its own reader                                                                                          |
| `packages/ndigo-context/benchmark/emitting.js`                      | Stray benchmark script with no script entry; the `benchmark` devDep (its only consumer) removed too                                                                      |

Also: `scripts/external-symbol-links.json` — dropped the placeholder entry for
the removed `QualityFactorComparator`.

## Deferred — tracked as issues

| Issue                                           | Content                                                                                                                                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#90](https://github.com/ndigo/ndigo/issues/90) | Unused exports + dual named/default exports (response-error, cookies, random-hex/token, event-emitter; `_event-emitter-helpers` batch; `PROMETHEUS_TEXT_CONTENT_TYPE`; `renderCreateTable`; `ndigo.ts` default) |
| [#91](https://github.com/ndigo/ndigo/issues/91) | `@ndigo/util` subpath surfaces (`./string`, `./types`) have zero consumers — prune or declare supported before 1.0                                                                                              |
| [#92](https://github.com/ndigo/ndigo/issues/92) | Tune `knip.json` (the false-positive classes below) and decide CI gating                                                                                                                                        |

## False-positive classes (for #92's config work)

1. **Apps' entries** — knip misses Vite `index.html` entries; verified false
   positives include `@ndigo/context|dispatcher|platform-web` in app01 and
   `@ndigo/log` in ~10 apps (all genuinely imported).
2. **Published subpath entries with no in-repo consumer** —
   `@ndigo/flags-openfeature/web`, `@ndigo/util/string|types` — entries, not
   dead files.
3. **Config-string/dir-scan loads** — `apps/04/db/migrations/*.ts`
   (migrator directory scan), scripts loaded by other scripts.
4. **Static assets** — `todomvc-app-css` (wired via `<link>` in
   `apps/03/index.html`).
5. **Root tooling deps used indirectly** — `typedoc`, `typedoc-plugin-markdown`,
   `@nx/devkit`, `@tsmetadata/polyfill` attribution.
6. **Re-export chains** — `packages/ndigo-http/src/interceptors/index.ts`
   (re-exported by `http/src/index.ts`) still listed as unused by knip.

Not found (clean): no unlisted dependencies, no unresolved imports, no unused
binaries beyond environment tools (`graft`, `openssl`).

## Example apps inventory (19 apps + README)

| Group          | Apps                                                 | Note                                |
| -------------- | ---------------------------------------------------- | ----------------------------------- |
| Hello/smoke    | 01 hello, 02 hello-node                              | minimal boot proofs; cheap          |
| Flagship demos | 03 todo, 04 api                                      | full-stack showcases (e2e covered)  |
| Micro-frontend | 05 host, 06 island, 07 views                         | composition trio                    |
| HTTP semantics | 08 httpbin, 09 todobackend                           | protocol-level sandboxes            |
| RealWorld      | 10 conduit-api, 11 conduit-web                       | spec-exact reference                |
| Verticals      | 12 petclinic, 13 chat, 14 kanban                     | server-rendered, sockets, conflicts |
| Ops labs       | 15 resilience-lab, 16 redis-fanout, 17 telemetry-lab | infra behaviors                     |
| Auth           | 18 auth-playground                                   | cookie/JWT/OIDC matrix              |
| Caching        | 19 hn                                                | reader with cache/offline           |

**Recommendation:** keep all — each maps to a capability and they are the
integration proving ground; no overlap justifies consolidation today. Watch CI
cost as the suite grows (e2e lanes already scoped to apps 03/06).
