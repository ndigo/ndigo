# Guide 25 — The `ndigo` CLI

One `ndigo` entry replaces the bespoke per-app start scripts and fronts the
framework surface: serve (with the AD-74 cluster lifecycle), dev, generate,
db, inspect, and doctor (AD-75). Built on `@stricli/core` as an embedded
library — commands, typed flags, `--help`, exit codes.

## Commands

### Application lifecycle

| Command           | Runs the app's…                                         | Example                                                   |
| :---------------- | :------------------------------------------------------ | :-------------------------------------------------------- |
| `ndigo serve`     | `scripts.start` under the supervisor                    | `ndigo serve ./apps/05-ndigo-api --port 3000 --cluster 4` |
| `ndigo dev`       | `scripts.dev` (vite) or `scripts.start`                 | `ndigo dev ./apps/15-ndigo-resilience-lab --port 3200`    |
| `ndigo build`     | `scripts.build` (one-shot)                              | `ndigo build ./apps/05-ndigo-api`                         |
| `ndigo test`      | `scripts.test`                                          | `ndigo test`                                              |
| `ndigo lint`      | `scripts.lint`                                          | `ndigo lint`                                              |
| `ndigo format`    | `scripts.format`                                        | `ndigo format`                                            |
| `ndigo typecheck` | `scripts.typecheck`                                     | `ndigo typecheck`                                         |
| `ndigo clean`     | (CLI-owned: `dist`/`lib`/`.nx`/`coverage`; `--dry-run`) | `ndigo clean --dry-run`                                   |
| `ndigo inspect`   | `scripts.inspect` (the AD-70 printer)                   | `ndigo inspect ./apps/05-ndigo-api`                       |
| `ndigo routes`    | `scripts.inspect` (route-table view)                    | `ndigo routes ./apps/05-ndigo-api`                        |
| `ndigo logs`      | (CLI-owned: tails `logs/app.log`; `--follow`)           | `ndigo logs --follow`                                     |

### Scaffolding

| Command                 | Runs…                                                        | Example                                            |
| :---------------------- | :----------------------------------------------------------- | :------------------------------------------------- |
| `ndigo new <name>`      | the `app` generator (a new app under `apps/NN-ndigo-<name>`) | `ndigo new todo-widget --preset api`               |
| `ndigo generate <kind>` | `@ndigo/generators` via Nx                                   | `ndigo generate entity --name note --package demo` |
| `ndigo add <package>`   | `pnpm add` + the capability's setup generator                | `ndigo add @ndigo/redis ./apps/05-ndigo-api`       |

### Database

These front either the app's `db:*` scripts or the app's registered
`NdigoDatabaseAdapter` (see `@ndigo/orm`); `--db <name>` picks among multiple
registered adapters, and `ndigo db list` prints them.

| Command                 | Runs the app's…                                                     | Example                                               |
| :---------------------- | :------------------------------------------------------------------ | :---------------------------------------------------- |
| `ndigo db list`         | (adapter registry readback)                                         | `ndigo db list`                                       |
| `ndigo db new [slug]`   | scaffolds the next versioned migration                              | `ndigo db new ./apps/05-ndigo-api add-title-column`   |
| `ndigo db generate`     | `scripts.db:generate` (AD-78: entities → next migration + snapshot) | `ndigo db generate ./apps/05-ndigo-api`               |
| `ndigo db migrate`      | `scripts.db:migrate`                                                | `ndigo db migrate ./apps/05-ndigo-api --db analytics` |
| `ndigo db status`       | `scripts.db:status` (journal readback)                              | `ndigo db status ./apps/05-ndigo-api`                 |
| `ndigo db push`/`pull`  | `scripts.db:push` / `scripts.db:pull` (adapter-optional)            | `ndigo db push`                                       |
| `ndigo db studio`       | `scripts.db:studio` (adapter-optional)                              | `ndigo db studio`                                     |
| `ndigo db seed`         | `scripts.db:seed` (adapter-optional)                                | `ndigo db seed`                                       |
| `ndigo db rollback [n]` | `scripts.db:rollback` (adapter-optional)                            | `ndigo db rollback 1`                                 |

### Maintenance

| Command            | Runs…                                                        | Example                                           |
| :----------------- | :----------------------------------------------------------- | :------------------------------------------------ |
| `ndigo doctor`     | (self-diagnostics: versions, workspace, git, checks)         | `ndigo doctor`                                    |
| `ndigo info`       | `doctor` + installed `@ndigo/*` packages                     | `ndigo info`                                      |
| `ndigo update`     | `pnpm install` after applying a version manifest (`--check`) | `ndigo update --check`                            |
| `ndigo config`     | `.ndigorc.json` get/set/list                                 | `ndigo config set db.primary analytics`           |
| `ndigo env`        | validates env vars against `.env.example`                    | `ndigo env --file .env.example`                   |
| `ndigo openapi`    | `scripts.openapi` (`--out`, `--format json                   | yaml`)                                            | `ndigo openapi --out openapi.json` |
| `ndigo completion` | prints a bash completion script                              | `ndigo completion > /etc/bash_completion.d/ndigo` |

Every command follows the Stricli contract: `--help`/`-h`, `--version`/`-v`,
exit `0` ok / `2` usage / `1` runtime. `ndigo doctor` exits `1` when a check
fails (an unsupported Node, a missing pnpm/git, or no workspace above the cwd).

## `ndigo dev` and server watch

`ndigo dev` runs `scripts.dev` (vite for browser apps) or `scripts.start`
under the same supervisor as `serve`. **Server-side watch/hot-reload is
deferred to v1.1** (AD-75 D-2) — for Node apps `ndigo dev` is a supervised
single start, not a watch loop.

## How scripts run — and why

The CLI resolves `package.json` scripts and runs them **shell-free**
(single commands; `tsx src/index.ts`, `vite`, `node app.mjs`):

- SIGTERM/SIGINT relayed by `serve` reach the **actual application
  process**, which runs its own `gracefulShutdown()` (guide 01). This is
  deliberate: both package-manager `run` wrappers (which kill children
  without granting a drain) and dash-style `/bin/sh` (which forks instead
  of execs) were verified to swallow the signal (2026-10-07).
- The app's local `.bin` goes on PATH, so `tsx`/`vite` resolve without a
  package manager.
- A script that uses shell operators (`&&`, `|`, …) fails with a hint —
  keep start/dev scripts single commands.

## Generate

`ndigo generate <kind>` fronts `@ndigo/generators` — the repo-local
collection in `tools/generators/` (AD-93). Kinds: `package`, `component`,
`readme`, `header`, `controller`, `service`, `entity`, `middleware`,
`config`, `migration`:

```bash
ndigo generate package --name my-app --description "A demo package" --jobs
ndigo generate component --name widget --package ndigo-demo
ndigo generate header --file packages/ndigo-demo/src/index.ts --force
ndigo generate entity --name note --package ndigo-demo
ndigo generate controller --name notes --package ndigo-demo
```

Each kind forwards exactly the flags its generator declares (`--name`,
`--package`; `--file`; `--force`; …), so the required fields reach Nx; the
generators' own prompts fill anything omitted.

## New apps

`ndigo new <name>` scaffolds an application into this repository's `apps/`
ladder (`apps/NN-ndigo-<name>`) through the framework-owned `app` generator
(AD-85):

```bash
ndigo new todo-widget --kind node
ndigo new todo-widget --kind browser --description "Widget demo"
ndigo new todo-widget --preset api              # node + sample entity + DB adapter
ndigo new todo-widget --kind node --port 3190 --dry-run
```

- **Kinds:** `node` (the `02-ndigo-hello-node` shape — server + smoke test)
  and `browser` (the `01-ndigo-hello` shape — Vite SPA + bundle guard).
- **Presets:** `minimal` (default), `browser`, and `api` (node plus a sample
  `@entity` and a `db.ts` adapter registry). `--preset` resolves the kind when
  `--kind` is omitted.
- **Numbering:** the reading-order number defaults to one past the highest
  existing app; `--number` overrides it (a taken number fails).
- **Ports:** the dev port defaults to the first free multiple-of-ten slot
  above 3000, scanned from the apps' own conventions (vite `server.port`,
  `PORT` defaults, `DEFAULT_PORT` constants); an explicit `--port` that
  collides fails and names the owning app.
- **Naming:** pick the slug from the app's domain; a paired front end and back
  end take `-web` / `-api` and sit next to each other in the ladder
  ([guide 29](29-application-conventions.md)).
- `--dry-run` previews the file plan without writing anything. After
  generating, add the app's row to `apps/README.md` and the root README
  table by hand — index tables are not generated.

`ndigo generate app` is deliberately not a kind: it fails with a pointer at
`ndigo new` so there is one canonical path per artifact.

## Serve and the cluster

`ndigo serve --cluster <n>` runs the app across N worker slots:

```bash
ndigo serve ./apps/05-ndigo-api --port 3000 --cluster 4
```

Each slot gets `NDIGO_CLUSTER_SLOT`/`SIZE` and `PORT = 3000 + slot` (guide
24); single-executor work self-arbitrates through the job leases and locks
(guides 22/23). `ndigo serve` alone is the same supervisor with one slot —
signals relay, crashes reap.

## Adding the conventions

`db:migrate`, `db:generate`, `db:status` and `inspect` look for the app's
declared scripts — add them when the CLI reports them missing (the AD-70
`inspect` entry builds the manifest without binding a port; apps choose
their own controllers/config classes, exactly as
`apps/05-ndigo-api/src/inspect.ts` does). The `db:*` lifecycle — versioned
migration files, generation from entity metadata, and run-on-boot — is
guide 27.

## See also

- AD-75: `docs/decisions/2026-10-07_AD75_FRAMEWORK_CLI.md`
- The cluster guide (24) — what `serve --cluster` runs
- The jobs (22) and locks (23) guides — the coordination the CLI fronts
- `apps/05-ndigo-api/src/inspect.ts` — the inspect-entry template (AD-70)
