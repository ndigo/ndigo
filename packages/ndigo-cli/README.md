# @ndigo/cli

> The Ndigo framework CLI — serve, dev, new, generate, db, inspect, doctor (AD-75).

One `ndigo` entry absorbs the bespoke per-app start scripts, fronts the
framework-owned generators and introspection, scaffolds new applications
(`ndigo new`), and ships the AD-74 `--cluster` surface. Built on
`@oclif/core ^5` as an embedded library — commands/topics, typed flags,
help, exit codes — with the framework features (generators, introspection)
staying in their packages.

## Installation

```bash
pnpm add @ndigo/cli
```

Prerequisites: Node.js ≥24 (the repository runtime baseline), pnpm ≥12.

## Getting Started

Run an application (its `package.json` `start` script) with the AD-74
process lifecycle — signals relay into the app's own graceful shutdown:

```bash
ndigo serve                       # current directory
ndigo serve ./apps/05-ndigo-api --port 3000
ndigo serve --cluster 4 --port 3000   # 4 replicated worker slots
```

## Usage

| Command                 | What it does                                                            |
| :---------------------- | :---------------------------------------------------------------------- |
| `ndigo serve [dir]`     | Runs the app under the supervisor (`--cluster <n>`, `--port <base>`).   |
| `ndigo dev [dir]`       | Runs the app's `dev` script (vite) or `start` (Node apps).              |
| `ndigo new <name>`      | Scaffolds an app into `apps/` (`--kind`, `--port`, `--dry-run`; AD-85). |
| `ndigo generate <kind>` | Fronts `@ndigo/generators` (package, component, readme, header) via Nx. |
| `ndigo db new [slug]`   | Scaffolds the next versioned migration file (AD-78).                    |
| `ndigo db generate`     | Runs the app's `db:generate` script (AD-78: entities → migration).      |
| `ndigo db migrate`      | Runs the app's `db:migrate` script (the journaled runner).              |
| `ndigo db status`       | Runs the app's `db:status` script (journal readback).                   |
| `ndigo inspect [dir]`   | Runs the app's `inspect` entry (the AD-70 manifest printer).            |
| `ndigo doctor`          | Prints environment diagnostics — the issue-report starter.              |

Every command: `--help`/`-h`, `--version`/`-v`, exit `0` ok / `2` usage /
`1` runtime. Scripts run **shell-free** (single commands only) so OS
signals reach the actual application — package-manager `run` wrappers and
dash-style shells both swallow `SIGTERM` (verified 2026-10-07).

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary export: `runCli(args)` — the same
dispatcher the `ndigo` binary invokes, for embeddings.

## Development

```bash
pnpm --filter @ndigo/cli build:lib   # the bin runs from lib/commands
pnpm --filter @ndigo/cli test        # unit + real-bin integration lanes
```

## Contributing

Follow the repository's [contributing guide](../../CONTRIBUTING.md); lint
checks run with `--deny-warnings` (the `!` non-null assertion is banned).

## License

ISC — see the repository license.
