# Guide 24 — Clustering

Replicate a Node application across N worker processes with one supervisor:
every slot runs the same application, the existing contracts arbitrate
single-executor work, and a signal drains every slot through its own
graceful shutdown (AD-74).

## The model

`@blue/cluster` is a **supervisor, not a coordinator**. There is no leader,
no discovery, no state sync: job leases (`@blue/jobs`, AD-72) and
`@scheduled({ lock })` (`@blue/locks`, AD-73) already make replicated slots
single-executor. The package owns only the process shell:

- **Spawn** `size` children running the same command;
- **Relay** `SIGINT`/`SIGTERM` to every child — each child performs its own
  `gracefulShutdown()` (server drain first, context close, deadline);
- **Respawn** crashed slots with exponential backoff, fail-closed behind a
  crash-loop window;
- **Abort** on a second signal (immediate `SIGKILL`, exit 1).

## Using it

```ts
import { ClusterRunner } from '@blue/cluster';

const start = new ClusterRunner({
    size: 4,
    command: ['node', 'dist/main.js'],
    basePort: 3000, // each child gets PORT = 3000 + slot
}).run(); // signal handlers installed — nothing else to do
```

Each child sees `BLUE_CLUSTER_SLOT` (0-based) and `BLUE_CLUSTER_SIZE`; with
`basePort` (or pinned `ports`), `PORT = base + slot`. Base environments pass
through `env`.

## Contract details

| Event                     | Behavior                                                                                                                                                                                                                                                                                                                                                              |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First signal / `stop()`   | `SIGTERM` to every child; children drain themselves; cluster exits with the worst child code (0 by default). Never respawns.                                                                                                                                                                                                                                          |
| Child exits unexpectedly  | Respawn with backoff (`base × 2ⁿ`, clamped, jittered).                                                                                                                                                                                                                                                                                                                |
| Crash-loop guard          | `maxRestartsPerWindow` respawns per slot per window (default 5 / 60 s) — the next death **tears down the whole cluster**: the sick slot never respawns again, every sibling is force-killed, and `run()` settles with `reason: 'crash-loop'` (exit `1`, or the worst sibling code seen before the trip, whichever is higher). Fail-closed: nothing outlives the trip. |
| Child ignores the signal  | Force-killed after `shutdownTimeoutMs` (default 10 s).                                                                                                                                                                                                                                                                                                                |
| Second signal / `abort()` | Immediate `SIGKILL` of every child, exit 1. A `stop()` after an abort is a no-op — the abort outcome stands.                                                                                                                                                                                                                                                          |
| Spawn failure             | A slot that cannot spawn (e.g. a missing binary) aborts the cluster fail-closed: siblings are killed, `run()` settles with `reason: 'aborted'`, exit 1 — no child is orphaned.                                                                                                                                                                                        |
| Child exits 0 on its own  | Still an unexpected exit — respawned. Deliberate ends only come through the relay, `stop()`, or `abort()`.                                                                                                                                                                                                                                                            |

## What single-executor needs AFTER clustering

The cluster gives you N copies; the guarantees come from the beans you
already have:

- `@scheduled({ lock: '…' })` runs a schedule once per fire cluster-wide.
- `@jobHandler` work claims atomically (AD-72) — workers may all poll, only
  one leases.
- Sessions/caches/rates with shared-store drivers keep their cross-node
  semantics (guide 16).

## See also

- AD-74: `docs/decisions/2026-10-07_AD74_CLUSTERING.md`
- `gracefulShutdown()` (`@blue/platform-node`) — what each child runs on the
  relayed signal.
- The jobs (22) and locks (23) guides — the coordination the cluster relies
  on.
