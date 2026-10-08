# Guide 25 — The `blue` CLI

One `blue` entry replaces the bespoke per-app start scripts and fronts the
framework surface: serve (with the AD-74 cluster lifecycle), dev, generate,
db, inspect, and doctor (AD-75). Built on `@oclif/core` as an embedded
library — commands, typed flags, `--help`, exit codes.

## Commands

| Command                | Runs the app's…                         | Example                                                          |
| :--------------------- | :-------------------------------------- | :--------------------------------------------------------------- |
| `blue serve`           | `scripts.start` under the supervisor    | `blue serve ./apps/04-blue-api --port 3000 --cluster 4`          |
| `blue dev`             | `scripts.dev` (vite) or `scripts.start` | `blue dev ./apps/15-blue-resilience-lab --port 3200`             |
| `blue generate <kind>` | `@blue/generators` via Nx               | `blue generate package --name my-app`                            |
| `blue db:migrate`      | `scripts.db:migrate`                    | `blue db:migrate ./apps/04-blue-api`                             |
| `blue inspect`         | `scripts.inspect` (the AD-70 printer)   | `blue inspect ./apps/04-blue-api`                                |
| `blue doctor`          | (self-diagnostics)                      | `blue doctor` — versions, workspace, git, and environment checks |

Every command follows the oclif contract: `--help`, `--version`, exit `0`
ok / `2` usage / `1` runtime. `blue doctor` exits `1` when a check fails
(an unsupported Node, a missing pnpm/git, or no workspace above the cwd).

## `blue dev` and server watch

`blue dev` runs `scripts.dev` (vite for browser apps) or `scripts.start`
under the same supervisor as `serve`. **Server-side watch/hot-reload is
deferred to v1.1** (AD-75 D-2) — for Node apps `blue dev` is a supervised
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

`blue generate <kind>` fronts `@blue/generators` (package, component,
readme, header):

```bash
blue generate package --name my-app --description "A demo package" --jobs
blue generate component --name widget --package blue-demo
blue generate header --file packages/blue-demo/src/index.ts --force
```

Each kind forwards exactly the flags its generator declares (`--name`,
`--package`; `--file`; `--force`; …), so the required fields reach Nx; the
generators' own prompts fill anything omitted.

## Serve and the cluster

`blue serve --cluster <n>` runs the app across N worker slots:

```bash
blue serve ./apps/04-blue-api --port 3000 --cluster 4
```

Each slot gets `BLUE_CLUSTER_SLOT`/`SIZE` and `PORT = 3000 + slot` (guide
24); single-executor work self-arbitrates through the job leases and locks
(guides 22/23). `blue serve` alone is the same supervisor with one slot —
signals relay, crashes reap.

## Adding the conventions

`db:migrate` and `inspect` look for the app's declared scripts — add them
when the CLI reports them missing (the AD-70 `inspect` entry builds the
manifest without binding a port; apps choose their own controllers/config
classes, exactly as `apps/04-blue-api/src/inspect.ts` does).

## See also

- AD-75: `docs/decisions/2026-10-07_AD75_FRAMEWORK_CLI.md`
- The cluster guide (24) — what `serve --cluster` runs
- The jobs (22) and locks (23) guides — the coordination the CLI fronts
- `apps/04-blue-api/src/inspect.ts` — the inspect-entry template (AD-70)
