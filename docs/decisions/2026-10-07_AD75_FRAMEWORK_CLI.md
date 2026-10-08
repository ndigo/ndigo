# AD-75: The framework CLI — `@blue/cli`

**Date:** 2026-10-07
**Status:** Accepted
**Deciders:** Framework owner (GAP-6 of `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6; foundation selected on the CLI research, 2026-10-07)

---

## Context

The 2026-10-07 review lists GAP-6: **first-class CLI / dev loop** — absent
(no `bin` anywhere in the workspace), 1.0-severity high; recommended shape
"`@blue/cli` (`dev`, `generate`, `db`, `inspect`)". Two ADRs already wait on
it: AD-74's `blue serve --cluster <n>` (the `ClusterRunner` exists;
`runCluster()` is the entry it would invoke) and the inspect demo
(`apps/04-blue-api`'s `inspect` script, AD-70). Wave 6 is ADR-gated; this
record is the gate.

What the repository already provides, and what is missing:

- **The seams exist; the surface doesn't.** Every Node app runs a bespoke
  `tsx src/index.ts` start script; every browser app runs raw `vite`; root
  tooling is a pile of ad-hoc `pnpm` scripts (`apps:smoke`, `doc:api`,
  `manifest:check`, …). `@blue/generators` owns working Nx generators
  (`package`, `component`, `readme`, `header`). `@blue/inspect` owns the
  manifest/introspection logic behind an app-local demo script. None of
  this is reachable as **`blue <command>`**.
- **Serving is solved.** `NodeAutoConfiguration` + `HTTPServer`, the
  documented `PORT` env override, `gracefulShutdown`, and now
  `ClusterRunner` (AD-74) cover everything a `blue serve` would wrap.
- **No foundation exists.** GAP-6's "first-class CLI" needs a command
  framework (parsing, topics, help, exit codes, prompts) — that is the
  decision this ADR makes.

## Evidence

Research (2026-10-07, web: framework docs + oclif primary sources — the
full report is in the session transcript `CliResearch-2`):

- **Command taxonomy is near-universal**: `create/new` (Rails,
  https://guides.rubyonrails.org/command_line.html; Nest, nestjs.com/cli;
  Quarkus, quarkus.io/guides/cli-tooling; Next, create-next-app),
  `generate/scaffold` (Rails generators guide; `nest generate`; Laravel
  Artisan; AdonisJS `make:*`), `dev/serve` (all watch/refresh), `db/*`
  (Rails/Artisan/AdonisJS), `build/test`, **doctor/inspect** (`nest info`,
  `artisan about`, `rails about` — every serious framework ships
  environment diagnostics), and **upgrade with codemods** (`rails
  app:update`, `nx migrate`, `quarkus update` recipes — generated code
  couples to the framework version, so migration paths are a first-class
  command).
- **DX expectations**: interactive prompts for anything not passed as a
  flag (`nest new`); `--help`/`--version` everywhere; dry-run previews
  (`nx --dry-run`, `rails --pretend`); a documented exit-code contract
  (oclif Config configurable exit codes, oclif.io/docs).
- **Generator model**: generators are framework-owned packages, not CLI
  plugins (Nest schematics, Nx devkit generators as functions, Artisan
  stubs).
- **oclif status (late 2026)**: alive and institutional — Salesforce-owned,
  "powers Salesforce CLI and the Heroku CLI for millions of users a day"
  (oclif.io/docs/how_we_work); 727 releases at ~4d7h cadence, latest
  2026-08-31; the original author still publishes (Salesforce engineering
  blog 2026); single-corporate-maintainer is the one governance risk.
  **`@oclif/core` 5.0.0 (2026-08-31) `feat!: require Node >= 22`** — exactly
  the BlueJS baseline — with 4.11.x patch flow continuing
  (github.com/oclif/core CHANGELOG).
- **Embedded-library precedent**: oclif is a library the binary imports —
  Salesforce `sf` and Heroku CLI target it (developer.salesforce.com CLI
  plugin guide; devcenter.heroku.com), Shopify CLI ships on it
  (@shopify/cli, 2 400+ releases); AdonisJS `node ace` is the same shape
  in miniature (embedded command framework, not a global binary).
- **Alternatives assessed**: commander (zero deps, no structure/topics/
  help conventions); unjs citty + c12 (ESM-first, current, but young and
  without institutional backing); `node:util` `parseArgs` (stable, zero-dep,
  but flag parsing only — no help/prompts/topics); pastel (Ink-based);
  Nx's CLI is product-internal, not a reusable base.

## Decision

### D-1 — `@blue/cli` on `@oclif/core` v5, embedded as a library

A new Node-platform package (`@blue/cli`, layer 6, bin `blue`) built on
**`@oclif/core ^5` as an embedded library only**: file-per-command with
topics, typed flags/args, generated `--help`, hooks, prompts, configured
exit codes, and `@oclif/test` — **not** the plugin machinery and **not** the
oclif authoring/building dev chain (commands are plain classes in
`@blue/cli`, built by the existing `tsc` pipeline). Precedents: Salesforce
`sf`, Heroku, Shopify. The major version is **pinned** (`^5`); the ADR
records oclif's v3→v4→v5 churn as accepted, with the version pinned and the
integration confined behind the package's own command registry.

### D-2 — The v1 surface (the BlueJS taxonomy)

| `blue …`               | Wraps                                                                                                      | Seam                                                                                                                         |
| :--------------------- | :--------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `serve [dir]`          | boot the app (Node or browser) on the documented `PORT`                                                    | `NodeAutoConfiguration`/`HTTPServer`; vite for browser apps                                                                  |
| `serve --cluster <n>`  | N replicated worker slots (AD-74)                                                                          | `@blue/cluster` `runCluster` — the missing CLI from AD-74's D-5                                                              |
| `dev`                  | serve + watch/hot-reload                                                                                   | vite for browser apps; server watch deferred to v1.1 (documented)                                                            |
| `generate \| g <kind>` | the framework-owned generators                                                                             | `@blue/generators` (package/component/readme/header) — the CLI is a thin front, generators stay in their package             |
| `db:*`                 | the journaled migration runner (`new`, `migrate`)                                                          | `@blue/orm-drizzle` runner — the platform GAP-7's `generate` will extend                                                     |
| `inspect [dir]`        | the app manifest/introspection                                                                             | `@blue/inspect` (the AD-70 demo becomes the real command)                                                                    |
| `doctor \| info`       | environment/self-diagnostics (`nest info`/`artisan about` precedent): framework/Node versions, gate checks | new, inside `@blue/cli`                                                                                                      |
| `upgrade`              | versioned codemods (`nx migrate`/`quarkus update` precedent)                                               | **deferred in the ADR** — ship `doctor` + `--version` first; codemods land with the first generated-artifact-breaking change |
| `build`/`test`/`lint`  | —                                                                                                          | **out of scope**: pnpm/nx already own these in a monorepo; the CLI fronts application concerns                               |

- Every command exits with the documented oclif exit-code contract (`0` ok,
  `2` usage, `1` runtime); `--help`/`--version` everywhere; prompts only for
  options not passed as flags (`blue generate package --name …` skips the
  prompt).
- `bin` packaging: the `blue` executable ships in `@blue/cli`; apps invoke
  it through the workspace (`pnpm blue serve` / direct `bin` resolution) —
  no global install story in v1.

### D-3 — Framework-owned features stay in their packages

The research's hard rule applies regardless of base: generators
(`@blue/generators`), inspection (`@blue/inspect`), and future codemods
belong to framework packages; `@blue/cli` binds commands to them and owns
only the command surface, help, prompts, and diagnostics. oclif hooks are
used where they map onto framework lifecycle (e.g. a doctor data provider
seam), never as a plugin API for third parties in v1.

## Alternatives considered

- **Zero-dependency in-house** (`node:util` `parseArgs` + own help/prompt/
  topics): maximal control, no cold-start or churn dependencies — but
  rebuilds the conventions every framework CLI already converged on
  (help/errors/prompts/dry-run), and loses the institutional validation.
  Rejected for v1; the command registry in `@blue/cli` is designed so the
  parsing base could swap if oclif ever stalls.
- **commander / citty + c12**: lighter (commander: zero deps; citty: unjs,
  ESM-first) — commander lacks structure/help conventions; citty is young
  with no institutional backing. Retained as the fallback triggers if
  oclif's single-maintainer risk materializes or a <100 ms cold start
  becomes a hard requirement (researched cold-start overhead ~200–500 ms /
  ~100 kB+ for oclif).
- **oclif as the full stack (plugins + dev chain)**: rejected — third-party
  plugin machinery is a marketplace BlueJS does not need at 1.0, and the
  authoring chain would fight the workspace's own `tsc`-first pipeline.

## Consequences

- One `blue` entry replaces the bespoke `tsx src/index.ts` / `vite` / ad-hoc
  scripts surface; `serve --cluster` finally ships AD-74's D-5 default.
- `doctor` gives every issue report a canonical starting point — the
  `nest info` precedent the support story has been missing.
- Acceptable costs: `@oclif/core` in `@blue/cli`'s closure (pinned ^5);
  oclif's version churn handled by pinning + the command-registry seam;
  cold start ~200–500 ms for CLI invocations (irrelevant for long-running
  `serve`, mildly worse for `inspect`/`doctor` — acceptable).

## References

- The research report (session `CliResearch-2`, 2026-10-07): framework CLI
  expectations + oclif assessment with per-claim URLs.
- `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 GAP-6 row and the
  Wave-6 DX track.
- AD-74 D-5 (the `serve --cluster` entry this ships), AD-70 (`@blue/inspect`
  demo → the real `inspect` command), AD-72/73 (the coordination the CLI
  fronts).
