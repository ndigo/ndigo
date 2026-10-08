# @blue/cluster

> A process supervisor for Node.js applications — replicated worker slots
> with signal relay, graceful drains, and bounded-backoff restarts.

`@blue/cluster` is a **supervisor, not a coordinator** (AD-74): every slot
runs the same application process, and the existing contracts arbitrate
single-executor work — job leases (`@blue/jobs`, AD-72) and
`@scheduled({ lock })` (`@blue/locks`, AD-73). This package owns only the
process shell: spawn `size` children with slot identity env, forward
`SIGINT`/`SIGTERM` into each child's **own** graceful shutdown, and respawn
crashed slots with exponential backoff inside a fail-closed crash-loop
window.

## Installation

```bash
pnpm add @blue/cluster
```

Prerequisites: Node.js ≥22 and pnpm ≥11.

## Getting Started

Replicate an application across N worker processes:

```ts
import { ClusterRunner } from '@blue/cluster';

const start = new ClusterRunner({
    size: 4, // worker slots (one per CPU, say)
    command: ['node', 'dist/main.js'],
    basePort: 3000, // each child gets PORT = 3000 + slot
}).run(); // spawns immediately; the runner installs
// the signal handlers and relays them — there is nothing else to do. An
// application with its own loop keeps it here; `start` resolves on stop.
```

Each child runs the SAME application; `BLUE_CLUSTER_SLOT` (0-based),
`BLUE_CLUSTER_SIZE`, and (with `basePort`) `PORT = base + slot` are visible
in the child's environment. The child performs its own
`gracefulShutdown()` — the relayed signal drains it.

## Usage

- **Signals.** The runner installs `SIGINT`/`SIGTERM` handlers: the first
  relays to every child (which then runs their own graceful shutdown); a
  second signal aborts immediately with exit code 1. Children that do not
  exit within `shutdownTimeoutMs` (default 10 s) are force-killed.
- **Restarts.** A slot that exits unexpectedly is respawned with exponential
  backoff (`restartBaseMs` × 2ⁿ, clamped at `restartMaxMs`, jittered). The
  crash-loop guard fails the cluster after `maxRestartsPerWindow` respawns
  per slot per window — no churn.
- **Exit codes.** After a clean stop the cluster exits with the worst child
  exit code (0 by default); abort and crash-loop outcomes exit 1.
- **A child that exits 0 on its own** (it drained itself, no signal) counts
  as an unexpected exit and is respawned — deliberate shutdowns only happen
  through the relay, `stop()`, or `abort()`.
- `runCluster(options)` runs one to completion — for processes that have
  nothing after the cluster (the future `blue serve --cluster <n>` entry).

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports:

- `ClusterRunner` — the supervisor (`run()` / `stop()` / `abort()`).
- `runCluster` — run-to-completion entry.
- `ClusterChild` / `ClusterSpawner` / `ClusterSignalHost` — the injectable
  process and signal seams (tests and embeddings swap them).
- `ClusterSlotSnapshot` / `ClusterRunResult` / `ClusterStopReason` — the
  observability types.

## Development

```bash
pnpm --filter @blue/cluster test     # unit + real-process lanes
pnpm --filter @blue/cluster build:lib
```

## Contributing

Follow the repository's [contributing guide](../../CONTRIBUTING.md); lint
checks run with `--deny-warnings` (the `!` non-null assertion is banned).

## License

ISC — see the repository license.
