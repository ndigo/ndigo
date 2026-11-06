# @ndigo/cli

> The Ndigo framework CLI — serve, build, db, generate, inspect, and the developer loop.

One `ndigo` entry absorbs the bespoke per-app scripts, fronts the
framework-owned generators and introspection, scaffolds new applications,
replicates apps across N worker slots (`--cluster`), and drives migrations
through an engine-agnostic database adapter. Built on `@stricli/core` as an
embedded library — route maps, typed flags, help, exit codes — with the
framework features (generators, introspection, ORM) staying in their packages.

## Installation

```bash
pnpm add @ndigo/cli
```

Prerequisites: Node.js ≥24 (the repository runtime baseline), pnpm ≥12.

## Getting Started

Run an application (its `package.json` `start` script) under the supervisor
lifecycle — signals relay into the app's own graceful shutdown:

```bash
ndigo serve                       # current directory
ndigo serve ./apps/05-ndigo-api --port 3000
ndigo serve --cluster 4 --port 3000   # 4 replicated worker slots
```

## Usage

### Application lifecycle

| Command                 | What it does                                                                     |
| :---------------------- | :------------------------------------------------------------------------------- |
| `ndigo serve [dir]`     | Runs the app under the supervisor (`--cluster <n>`, `--port <base>`).            |
| `ndigo dev [dir]`       | Runs the app's `dev` script (vite) or `start` (Node apps), `--port`.             |
| `ndigo build [dir]`     | Runs the app's `build` script (one-shot).                                        |
| `ndigo test [dir]`      | Runs the app's `test` script.                                                    |
| `ndigo lint [dir]`      | Runs the app's `lint` script.                                                    |
| `ndigo format [dir]`    | Runs the app's `format` script.                                                  |
| `ndigo typecheck [dir]` | Runs the app's `typecheck` script.                                               |
| `ndigo clean [dir]`     | Removes `dist`/`lib`/`.nx`/`coverage` (`--dryRun` previews; `--force` required). |
| `ndigo inspect [dir]`   | Runs the app's `inspect` entry (the manifest printer).                           |
| `ndigo routes [dir]`    | Alias of `inspect` (the route-table view).                                       |
| `ndigo logs [dir]`      | Tails `logs/app.log` (`--file`, `--lines`, `--follow`).                          |

### Scaffolding and generators

| Command                 | What it does                                                                                             |
| :---------------------- | :------------------------------------------------------------------------------------------------------- |
| `ndigo new <name>`      | Scaffolds an app into `apps/` (`--kind`, `--preset`, `--port`, `--number`, `--description`, `--dryRun`). |
| `ndigo generate <kind>` | Fronts `@ndigo/generators` via Nx (alias `ndigo g`; see below).                                          |
| `ndigo add <package>`   | Installs an `@ndigo/*` capability and runs its setup generator.                                          |

`generate` kinds: `package`, `component`, `readme`, `header`, `controller`,
`service`, `entity`, `middleware`, `config`, `migration`.

### Database (engine-agnostic)

The adapter-path `db` commands read the app's registered
`NdigoDatabaseAdapter`s (`@ndigo/orm`) — `--db <name>` selects among them
(`list`, `push`, `pull`, `studio`, `seed`, `rollback`). The remaining
commands front the app's declared `db:*` scripts.

| Command                  | What it does                                             |
| :----------------------- | :------------------------------------------------------- |
| `ndigo db list`          | Prints the registered adapters and the default.          |
| `ndigo db new [slug]`    | Scaffolds the next versioned migration file (CLI-owned). |
| `ndigo db generate`      | Runs the app's `db:generate` (entities → migration).     |
| `ndigo db migrate`       | Runs the app's `db:migrate` (the journaled runner).      |
| `ndigo db status`        | Reports applied/pending migrations.                      |
| `ndigo db push` / `pull` | Schema push/pull, when the adapter supports it.          |
| `ndigo db studio`        | Launches the engine's browser, when supported.           |
| `ndigo db seed`          | Runs the app's seed routine.                             |
| `ndigo db rollback [n]`  | Rolls back the last (or N) applied migrations.           |

### Maintenance and DX

| Command               | What it does                                                                              |
| :-------------------- | :---------------------------------------------------------------------------------------- |
| `ndigo doctor`        | Environment diagnostics — the issue-report starter.                                       |
| `ndigo info`          | `doctor` plus the installed `@ndigo/*` packages.                                          |
| `ndigo update [dir]`  | Bumps `@ndigo/*` from a version manifest (`--check` compares; apply pins exact versions). |
| `ndigo config`        | Gets/sets app-level keys in `.ndigorc.json`.                                              |
| `ndigo env [dir]`     | Validates required env vars against `.env.example`.                                       |
| `ndigo openapi [dir]` | Emits an OpenAPI document (`--out`, `--format json\|yaml`).                               |
| `ndigo completion`    | Prints a bash completion script (`--shell`).                                              |

Every command: `--help`/`-h`, `--version`/`-v`, exit `0` ok / `2` usage /
`1` runtime. Scripts run **shell-free** (single commands only) so OS
signals reach the actual application — package-manager `run` wrappers and
dash-style shells both swallow `SIGTERM`.

## API

The full API is at [`api/`](api/README.md). Primary exports: `runCli(args)` — the dispatcher
the `ndigo` binary invokes — and `buildCliApp()`, the Stricli application
for embeddings.

## Development

```bash
pnpm --filter @ndigo/cli build:lib   # the bin runs from lib/ (Stricli route maps)
pnpm --filter @ndigo/cli test        # unit + real-bin integration lanes
```

## Contributing

Follow the repository's [contributing guide](../../CONTRIBUTING.md); lint
checks run with `--deny-warnings` (the `!` non-null assertion is banned).

## License

ISC — see the repository license.
