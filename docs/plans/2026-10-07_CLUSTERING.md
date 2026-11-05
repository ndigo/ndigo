# 2026-10-07 Clustering / worker offload — `@ndigo/cluster`

**Date:** 2026-10-07
**Status:** Executed (see §8)
**Decision:** [AD-74](../decisions/2026-10-07_AD74_CLUSTERING.md)
**Scope:** GAP-2 of the 2026-10-07 delta sweep
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6): replicate an
application across N worker processes with signal relay into the existing
graceful shutdown, bounded-backoff restarts, and a fail-closed crash-loop
guard — the full-supervisor scope, per the ADR.

---

## 1. Problem

Single-executor work is solved (job leases AD-72; `@scheduled({ lock })`
AD-73) — but nothing runs N application processes. Multi-core deployments
hand-start process managers externally, and no framework contract exists for
"the signal goes to every worker, every worker drains, crashed workers come
back without churning".

## 2. Current state (verified 2026-10-07)

| Seam           | What exists                                                                             | What is missing             |
| :------------- | :-------------------------------------------------------------------------------------- | :-------------------------- |
| Graceful close | `gracefulShutdown()` (`@ndigo/platform-node`): signals → context close, drain, deadline | a process that relays to N  |
| Coordination   | job leases + `@scheduled({lock})` make replicated slots single-executor                 | — (nothing, by design)      |
| Spawning       | `node:child_process` (stdlib)                                                           | a supervisor + slot env     |
| CLI            | — (GAP-6)                                                                               | `ndigo serve --cluster <n>` |

## 3. Change

1. **`@ndigo/cluster`** (new, layer 6): `ClusterRunner` — spawn `size` children
   with `NDIGO_CLUSTER_SLOT`/`NDIGO_CLUSTER_SIZE` (+ `PORT = basePort + slot`
   derivation or pinned `ports`), relay `SIGINT`/`SIGTERM` into each child's
   own graceful shutdown (shared deadline → `SIGKILL` stragglers), respawn
   crashed slots with exponential backoff (base × 2ⁿ, clamped, jittered),
   trip fail-closed after `maxRestartsPerWindow` per slot per window, abort
   on a second signal. `runCluster()` run-to-completion wrapper.
2. Injectable `spawner`/`signalHost`/`clock`/`log` seams make the lifecycle
   unit-testable; the default spawner is `node:child_process` with inherited
   stdio and the default signal host is `process`.

## 4. Deliberately out of scope

- Leader election, discovery, IPC/RPC — the leases/locks arbitrate (AD-72/73);
  reverse proxies keep routing explicit.
- Worker-offload specialization (headless slots) — a documented future
  `mode` knob.
- The `ndigo serve` CLI — rides GAP-6.

## 5. Lifecycle contract

- First signal (or `stop()`) → `SIGTERM` to every child; children run their
  OWN `gracefulShutdown()`; cluster exits with the worst child code (0 by
  default). Never respawns on a deliberate stop.
- Any non-relayed exit → unexpected → respawn with backoff.
- Second signal (or `abort()`) → immediate `SIGKILL` all, exit 1.
- A child that exits 0 on its own is still an unexpected exit (respawn): the
  only deliberate end is the relay/`stop()`/`abort()`.

## 6. Verification

- Unit lane (8, injected seams): spawn count + env/port derivation, relay
  (no respawn after), exit-code observation, backoff respawn, crash-loop
  guard trip (exit 1), stuck-child force-kill, second-signal abort, option
  validation.
- Real-process lane (3): real children record slot env + PORT; SIGTERM relay
  drains through their own handlers (clean and failing exits decide the
  cluster code); validation without spawning.
- Full gate set (§9 of the review plan) incl. the spec-typecheck lane.

## 7. Docs

AD-74; guide 24 + guides index; companion plan + plans index; package
README; ARCHITECTURE package map/roadmap; CHANGELOG; generated API docs.

## 8. Execution log (2026-10-07)

All changes landed in one pass with the verification above green:
`@ndigo/cluster` 11/11 (8 unit + 3 real-process) · `pnpm --filter @ndigo/cluster`
lint clean · spec-typecheck lane green · full gate set green. Two test-design
notes: the crash-loop guard counts the window budget BEFORE the push, so a
`maxRestartsPerWindow: N` slot respawns N times and trips on death N+1 —
the spec asserts exactly that; and the abort/kill paths pin their own exit
code (child kill codes never override an explicit outcome).
