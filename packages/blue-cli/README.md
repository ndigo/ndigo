# @blue/cli

> The BlueJS framework CLI — serve, dev, generate, db, inspect, doctor (AD-75).

One `blue` entry absorbs the bespoke per-app start scripts, fronts the
framework-owned generators and introspection, and ships the AD-74
`--cluster` surface. Built on `@oclif/core ^5` as an embedded library —
commands/topics, typed flags, help, exit codes — with the framework
features (generators, introspection) staying in their packages.

## Installation

```bash
pnpm add @blue/cli
```

Prerequisites: Node.js ≥22 (the `@oclif/core` v5 baseline), pnpm ≥11.

## Getting Started

Run an application (its `package.json` `start` script) with the AD-74
process lifecycle — signals relay into the app's own graceful shutdown:

```bash
blue serve                       # current directory
blue serve ./apps/04-blue-api --port 3000
blue serve --cluster 4 --port 3000   # 4 replicated worker slots
```

## Usage

| Command                | What it does                                                           |
| :--------------------- | :--------------------------------------------------------------------- |
| `blue serve [dir]`     | Runs the app under the supervisor (`--cluster <n>`, `--port <base>`).  |
| `blue dev [dir]`       | Runs the app's `dev` script (vite) or `start` (Node apps).             |
| `blue generate <kind>` | Fronts `@blue/generators` (package, component, readme, header) via Nx. |
| `blue db new [slug]`   | Scaffolds the next versioned migration file (AD-78).                   |
| `blue db generate`     | Runs the app's `db:generate` script (AD-78: entities → migration).     |
| `blue db migrate`      | Runs the app's `db:migrate` script (the journaled runner).             |
| `blue db status`       | Runs the app's `db:status` script (journal readback).                  |
| `blue inspect [dir]`   | Runs the app's `inspect` entry (the AD-70 manifest printer).           |
| `blue doctor`          | Prints environment diagnostics — the issue-report starter.             |

Every command: `--help`/`-h`, `--version`/`-v`, exit `0` ok / `2` usage /
`1` runtime. Scripts run **shell-free** (single commands only) so OS
signals reach the actual application — package-manager `run` wrappers and
dash-style shells both swallow `SIGTERM` (verified 2026-10-07).

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary export: `runCli(args)` — the same
dispatcher the `blue` binary invokes, for embeddings.

## Development

```bash
pnpm --filter @blue/cli build:lib   # the bin runs from lib/commands
pnpm --filter @blue/cli test        # unit + real-bin integration lanes
```

## Contributing

Follow the repository's [contributing guide](../../CONTRIBUTING.md); lint
checks run with `--deny-warnings` (the `!` non-null assertion is banned).

## License

ISC — see the repository license.
