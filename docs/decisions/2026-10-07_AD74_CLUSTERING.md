# AD-74: Clustering / worker offload — `@blue/cluster`

**Date:** 2026-10-07
**Status:** Accepted
**Deciders:** Framework owner (GAP-2 of `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6; scope selected 2026-10-07)

---

## Context

The 2026-10-07 review lists GAP-2: **clustering / worker offload** — absent,
1.0-severity high; recommended shape "`blue serve --cluster <n>` fanning
SIGTERM into existing graceful shutdown". Wave 6 is ADR-gated; this record is
the gate. The Wave-6 dependency cluster was GAP-3 → GAP-1 → GAP-2; both
predecessors have landed — GAP-1 as AD-72 (`d950ad5c`) and GAP-3 as AD-73
(`158edf57`) — so the coordination primitives a cluster needs already exist.

What the repository already provides, and what is missing:

- **Single-executor is solved.** Jobs claim atomically per lease (AD-72);
  `@scheduled({ lock })` runs one node per fire (AD-73); rate
  limiting/session stores have shared-store drivers. A cluster therefore
  needs **no leader election, no coordinator, no distributed consensus** —
  it needs processes that run the same application and let the existing
  contracts arbitrate.
- **Graceful shutdown is solved.** `@blue/platform-node/gracefulShutdown()`
  wires OS signals to `context.close()` plus application resources
  (HTTPServer first, others in order), awaits the drain, force-exits after a
  deadline, and aborts on a second signal. GAP-2's "fan SIGTERM into the
  existing graceful shutdown" is a precise, already-built target.
- **What is missing is the supervisor.** Nothing spawns N application
  processes, forwards signals to them, or restarts a slot that died — and
  there is still no CLI (GAP-6, deferred): there is no `blue serve` to hang
  `--cluster` on.

## Evidence

- `graceful-shutdown.ts` options (signals/resources/timeoutMs/exitCode/
  abortExitCode) verified 2026-10-07 — the relay's contract for child
  teardown.
- Backoff pattern precedent: AD-72's `JobRunner` and `ReconnectPolicy`
  (`baseMs × 2^n`, jitter, clamped cap) — the crash-restart policy mirrors
  it. Graceful-shutdown's `timeoutMs` (10 000 ms default) is the stuck-child
  deadline precedent.
- Process-spawning seam precedent: `node:child_process` is stdlib facing;
  tests will inject a spawner so the restart policy is unit-testable without
  real processes, plus one real-process boot spec (the `apps:smoke` gate
  proves SIGTERM handling end to end today).
- Peer comparison: process-per-core replication with a small supervisor and
  graceful drains is the Node consensus (pm2 and systemd do the restart
  policy externally; the framework's job here is the SIGNAL FAN-OUT and the
  slot lifecycle, not a process manager). Leader-based clustering exists in
  peer frameworks but requires the coordinator this stack deliberately
  avoided at AD-41 and AD-73 — rejected on the same evidence.

## Decision

### D-1 — `@blue/cluster`: a supervisor, not a coordinator

A new Node-platform package (`@blue/cluster`, layer 6 beside
`@blue/platform-node`) owns a `ClusterRunner`: it spawns **N identical child
processes** running the same application in worker mode. Every child bootstraps
and serves the full application (HTTP + `@scheduled` + jobs when started) —
horizontal replication. Single-executor work self-arbitrates through the
existing lease/lock contracts; **no leader, no discovery, no state sync**.
Worker-offload specialization (some slots headless) is a documented future
`mode` knob, not a v1 concern.

### D-2 — Signal relay: the children shut THEMSELVES down

The runner forwards the first `SIGINT`/`SIGTERM` to every child; each child's
**own** `gracefulShutdown()` wiring (the app's existing resources + context
close) drains it. The runner awaits all children, then exits with the
children's combined code. A child that does not exit within
`shutdownTimeoutMs` (default 10 000 — the graceful-shutdown precedent) is
`SIGKILL`ed; a second signal aborts with the abort code. The runner is
deliberately not in the graceful-shutdown path: children own their drains.

### D-3 — Slot restart policy: bounded backoff, fail-closed

A slot that dies **unexpectedly** (crash, not a relayed shutdown) is
respawned with exponential backoff (`baseMs × 2^attempt`, clamped,
jittered — the AD-72 pattern). A crash-loop guard fails the whole cluster
after `maxRestartsPerWindow` restarts per window (default 5 / 60 s): the
cluster exits non-zero rather than churning. Deliberate shutdowns (signal
or `stop()`) never respawn. A stuck slot is killed, not respawned, once the
shutdown deadline passes.

### D-4 — Slot identity: env-derived, port auto-bump

Each child gets `BLUE_CLUSTER_SLOT` (0-based), `BLUE_CLUSTER_SIZE`, and —
when the caller provides `basePort` — a per-slot `PORT` (`base + slot`,
the apps' documented `PORT` env override, `apps/README.md`), unless the
caller pins `ports`. The child applies the existing
`NodeAutoConfiguration` contract unchanged; the runner is a thin process
shell, not a second application model.

### D-5 — No CLI yet

`blue serve --cluster <n>` lands with GAP-6's `@blue/cli`; this ADR records
the CLI as the eventual entry point, and `ClusterRunner` is the surface it
invokes. A `bin` in `@blue/cluster` is deferred with GAP-6.

## Alternatives considered

- **Leader-election cluster** — a designated scheduler node coordinates
  task assignment. Rejected: it reintroduces the global coordinator deferred
  at AD-41/AD-73 and duplicates what leases + locks already arbitrate.
- **Thread-per-slot in one process** — cheaper to spawn, but shares failure
  domains (one OOM/crash loop kills every slot) and complicates signal
  delivery; the process boundary is Node's only hard isolation.
- **Defer to an external manager (pm2/systemd)** — legitimate for ops, but
  it still requires the signal-fan-out contract to be defined somewhere; a
  framework-owned runner makes the contract testable and portable.

## Consequences

- Multi-core deployments gain with one line: `ClusterRunner` (size, spawn
  env) — each slot drains gracefully on SIGTERM, crashed slots come back
  with backoff, and lock/job leases keep the work single-executor across
  them.
- Ops story stays boring: reverse proxies and/or the port auto-bump keep
  routing explicit; no discovery protocol to secure.
- Cost: a supervisor adds process accounting (exit codes, stuck children,
  crash loops) — bounded by the restart policy and covered by tests with an
  injected spawner.

## References

- `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 GAP-2 row and the
  Wave-6 cluster note (GAP-3 → GAP-1 → GAP-2: both landed).
- AD-72 (leases/claims — why no coordinator is needed) and AD-73
  (`@scheduled({lock})` — why replicated slots stay single-executor).
- `packages/blue-platform-node/src/graceful-shutdown.ts` (the child-drain
  contract this relays into).
- AD-41 (distributed scheduling deferred — unchanged).
