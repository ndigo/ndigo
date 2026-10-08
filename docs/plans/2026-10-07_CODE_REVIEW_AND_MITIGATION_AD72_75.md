# Code Review and Mitigation — 2026-10-07 (delta sweep at `6a4979d4`)

**Date:** 2026-10-07
**Scope:** The post-baseline delta since `76d28575` — 19 commits, ~62 800 insertions:
the Wave-1..5 remediation of the prior plan, the deferred sweep (`ca50b249`), and the
Wave-6 dependency cluster **AD-72** (durable jobs + transactional outbox), **AD-73**
(distributed locks), **AD-74** (cluster supervisor), **AD-75** (framework CLI), plus the
example-app portfolio 08–19 (`24e5a14b`). Whole-repo gates re-run at HEAD.
**Method:** the integrator re-ran the full gate set at HEAD, force-ran the six
new/reworked package lanes without nx cache, probed the AD-74 crash-loop path with a
throwaway process-level probe, and confirmed every headline claim against source; seven
read-only parallel review slices (jobs core, job/outbox stores, locks/scheduler,
cluster/serve, CLI surface, deferred-sweep verification, docs drift + portfolio) each
returned file:line evidence.
**Relation to prior sweeps:** the 2026-10-07 and 2026-10-06 plans cover everything up to
`76d28575`; nothing below re-reports their findings. The deferred-sweep closure claims
(REU-9 metadata relocation, TEL-08 byte seam, TST-A spec lane, SEC-B tooling lane) were
independently verified **all true** — §6.

---

## 0. Gate baseline (run at `6a4979d4`, clean tree)

| Gate                 | Result | Evidence                                                                                                                                                                                            |
| :------------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build`         | ✅     | 44/44 nx tasks (43 cached)                                                                                                                                                                          |
| `pnpm test`          | ✅     | 103/103 nx tasks (102 cached)                                                                                                                                                                       |
| Force-run (no cache) | ✅     | locks, cluster, cli, jobs, scheduler, platform-node, redis — 5/5 package lanes green; platform-node 503 tests; redis live lanes env-gated (skipped locally)                                         |
| `pnpm lint`          | ✅     | 0 diagnostics                                                                                                                                                                                       |
| `pnpm format:check`  | ✅     |                                                                                                                                                                                                     |
| `pnpm typecheck`     | ✅     | build config + spec lane                                                                                                                                                                            |
| Redis live lane      | ⚠️     | runs only under `BLUE_REDIS_TEST_URL` (CI sets it: `ci.yml:64-65`) — the Redis **driver** races below are therefore only exercised in CI, and only by deterministic specs, not by concurrent stress |

Process note: the green board hides the defects below because (a) the crash-loop spec
only uses `size: 1` (ClusterRunner's other slots are never torn down in any test),
(b) the CLI integration lane exercises `serve` with `--cluster` never set `> 1`, (c)
`blue generate` is only integration-tested for kinds whose schema requires only `name`,
and (d) the Redis job driver's check-then-act races are time-window races no spec
triggers — they need a Lua rewrite and/or a concurrent probe to fail.

---

## 1. Block findings (3)

### BLK-1 `[exec]` The crash-loop guard fails **open**: a tripped slot hangs every sibling and the whole cluster

- **Where:** `packages/blue-cluster/src/cluster-runner.ts:431-436` — the guard path sets
  `#aborted = true; #reason = 'crash-loop'` and returns from `#supervise` **without
  signaling or killing the other slots' children**; `run()` blocks on
  `Promise.all(this.#slots.map(s => s.loop))` (`:288`) forever.
- **Evidence:** `[exec]` throwaway probe (`.scratch/cluster-probe.mts`, deleted after):
  size 2, slot 0 dies 3× (trips the guard), slot 1's child stays healthy → after 650 ms
  `Promise.race([running, timeout])` resolves `"hang"` and the slot-1 child is never
  killed. The spec at `cluster-runner.spec.ts:181-203` covers only `size: 1`, masking it.
- **Impact:** any multi-slot cluster where one slot crash-loops **never stops**: the
  supervisor process stays alive with healthy children still serving, `run()` never
  returns, the second-signal abort is the only way out. The documented contract — "trips
  fail-closed past the per-slot crash-loop window" (AD-74 D-3, guide 24:16-19, README) —
  is the opposite of what happens.
- **Fix:** reuse the `#abort()` teardown (kill every slot's current child, then settle)
  when the guard trips; keep the `crash-loop` reason and exit code. Set `#aborted`
  **and** run the kill sweep.
- **Regression test:** size-2 spec — slot 0 trips the guard, slot 1's child receives
  `SIGKILL` and `run()` resolves `{ reason: 'crash-loop', exitCode: 1 }`; a real-process
  lane asserting no child survives the trip.

### BLK-2 `[exec]` `blue serve --cluster N --port P` gives every slot the **same** PORT — the derivation is never wired

- **Where:** `packages/blue-cli/src/helpers/app-scripts.ts:113-121` —
  `runAppSupervised` sets `env.PORT = String(options.port)` and calls `runCluster`
  **without `basePort`**; `ClusterRunner.#spawnSlot` (`cluster-runner.ts:485-492`)
  derives `PORT = basePort + slot` only when `basePort`/`ports` is set. Result: each
  child inherits the flat `PORT=3000`; slots 1..3 collide (`EADDRINUSE`), crash-loop
  the guard, cluster exits 1.
- **Evidence:** source-read (both files above); the JSDoc on `runAppSupervised`
  (`:103`) says "port (base for PORT-derivation)" — the intent was always `basePort`.
  Guide 25:42-46, guide 24 table, README and `serve.ts:24,38-39` all teach
  `PORT = --port + slot`; CHANGELOG:170 claims "`--port` derivation". The integration
  spec (`cli.integration.spec.ts:143-173`) only exercises size 1.
- **Fix:** pass `basePort: options.port` through to `runCluster` (drop the flat
  `env.PORT`), so slot 0 = `--port` and slot N = `--port + N` exactly as documented.
- **Regression test:** extend `cli.integration.spec.ts` — `serve --cluster 2 --port X`
  over the real supervisor: assert child A `PORT == X`, child B `PORT == X+1`
  (via the documented `BLUE_CLUSTER_*`/`PORT` markers), and both stay up.

### BLK-3 `[exec]` `blue generate component` and `blue generate header` cannot run — required generator flags are not exposed

- **Where:** `packages/blue-cli/src/commands/generate.ts:53-63` forwards only `--name`;
  `packages/blue-generators/src/generators/component/schema.json:32` requires
  `["name", "package"]`, `header/schema.json:32` requires `["file"]` (no `name` field
  at all). `blue generate component --name widget` fails on the missing `--package`;
  `blue generate header --name foo` fails on the missing `--file`. Interactive Nx
  prompts rescue a TTY user but fail in non-TTY contexts, and the CLI's own
  `--name` example for header (`generate.ts:17`) is invalid.
- **Evidence:** `[exec]` schema reads; the CLI flag surface is exactly
  `{ name: Flags.string }`.
- **Fix:** widen the flag set to the four generators' schemas (`--package`, `--file`,
  `--force`, plus passthrough), or restrict the command surface to the kinds the CLI
  can actually drive and document the rest. Align the examples with the implemented
  surface.
- **Regression test:** real-bin integration lane invoking all four kinds with the
  required flags (non-TTY), asserting exit code and generated artifact.

---

## 2. High findings (8)

| ID      | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Fix                                                                                                                                                                                                                | Evidence |
| :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| AD72-H1 | `RedisJobDriver.heartbeat` is a non-atomic `zScore` → `zAdd` pair (`redis-job-driver.ts:255-265`): between the two round-trips `CLAIM_SCRIPT` can reclaim the expired lease (ZREM leases → ZADD ready → ZADD leases + HINCRBY) and the stale `zAdd` re-extends the lease **after** the job was handed to a second worker — concurrent double-execution while the first still runs. In-process is safe (no await between check/mutation); LibSQL is safe (single `UPDATE … WHERE state='running'`, `libsql-job-store.ts:202-209`). The Redis driver is the odd one out. | Fold heartbeat into one Lua script that verifies the lease still belongs to this claim (compare current attempts/lease score before extending).                                                                    | `[code]` |
| AD72-H2 | `RedisJobDriver.retry` is `hGet` → `multi().hSet…` (`redis-job-driver.ts:220-239`): a concurrent `complete()`/`fail()` (`#discard`) between the two resurrects a **terminal** job as a zombie that executes again — violating the documented terminal-state contract. LibSQL's `UPDATE … WHERE id = ?` is a no-op on a deleted row; Redis re-creates it.                                                                                                                                                                                                               | Lua `RETRY_SCRIPT` guarded by `HEXISTS records` inside the atomic unit (or `HSETNX` semantics).                                                                                                                    | `[code]` |
| AD72-H3 | `serializeJobPayload` rejects functions/symbols/bigint but silently **drops `undefined` members** (`request.ts:85-95`) — AD-72 D-2 requires "fails loud on non-serializable payloads (… undefined members …)". Producers lose data without an error.                                                                                                                                                                                                                                                                                                                   | Reject `undefined` in the replacer (alongside the JSON-`null` convention).                                                                                                                                         | `[code]` |
| AD74-H1 | A throwing spawner (e.g. ENOENT binary) propagates out of `#supervise` (`cluster-runner.ts:413-420`): `Promise.all` rejects, `run()` rejects, and surviving siblings are **never killed** — orphaned children after a config error.                                                                                                                                                                                                                                                                                                                                    | Catch per-slot spawn failure, log, and run the same fail-closed teardown (or fail fast with a clean sibling sweep).                                                                                                | `[code]` |
| AD75-H1 | `doctor` prints a version dump, not diagnostics: zero gate checks, always exits 0 (`doctor.ts:73-88`); it labels `pnpm root` output as `workspace`, but `pnpm root` returns the **node_modules directory**, not the workspace root (`doctor.ts:79-82`) — contradicting its own description. AD-75 D-2's `doctor` role ("environment diagnostics", `nest info` precedent) is unfulfilled.                                                                                                                                                                               | Resolve the workspace root by walking up to `pnpm-workspace.yaml`; add at least 3 real checks (dependency presence, gate status, git state) with a non-zero exit on findings; document the check list in guide 25. | `[code]` |
| AD75-H2 | `runAppOnce`/`runWorkspaceOnce` register `SIGINT`/`SIGTERM` handlers **after** `spawn` (`app-scripts.ts:144-159`): a signal in that window is not relayed, the CLI exits and the child becomes an orphan. Also `capture` (`doctor.ts:23-28`) swallows spawn failures as `'n/a'`, hiding a missing tool.                                                                                                                                                                                                                                                                | Register handlers before spawn; distinguish "command not found" from "no output" in `capture`.                                                                                                                     | `[code]` |
| DOC-H1  | `apps/README.md:241-242` tells users `cd apps/18-blue-auth-playground && pnpm dev` then `GET http://127.0.0.1:3110/health` — but `dev` is `vite` (client on :3440) and **nothing listens on :3110** unless `pnpm start` (tsx) runs; the app's own README documents the two-terminal flow. The portfolio index teaches a broken probe.                                                                                                                                                                                                                                  | Reword to `pnpm start` (+ `pnpm dev`) per the app README.                                                                                                                                                          | `[exec]` |
| SWP-H1  | `tsconfig.spec.json` paths **do not** mirror `vitest.aliases.ts` for the three newest packages: `@blue/locks`, `@blue/cluster`, `@blue/cli` have no paths entry (`tsconfig.spec.json:20-52`), so the spec lane typechecks consumers against **built `lib/`** rather than live `src/` — a src-only regression in those packages is masked until a rebuild; the commit claims "paths mirror vitest.aliases.ts … (subpaths first)".                                                                                                                                       | Add the three missing path families (`@blue/locks`, `@blue/locks/*`, …), subpath-before-root.                                                                                                                      | `[code]` |

---

## 3. Medium findings (13)

| ID      | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Fix                                                                                                                                              |
| :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| AD72-M1 | `JobRunner.drain()` waits for `#inflight` with **no deadline** (`job-runner.ts:180-185`): a handler without `timeoutMs` that never settles blocks `close()`/container shutdown forever, undoing the cluster's own second-signal escape.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Document the cooperative-handler assumption, or default every job to `timeoutMs`.                                                                |
| AD72-M2 | Crash-mid-job recovery (lease expiry → reclaim → re-execute, attempts already incremented) has **no runner-level test**; only driver-level reclaim and handler-failure retry are pinned. The core at-least-once path is unverified end-to-end.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Runner spec: lease-expire mid-run → next tick re-executes; at maxAttempts it terminates.                                                         |
| AD72-M3 | The runner's heartbeat is fire-and-forget (`void driver.heartbeat(...)`, `job-runner.ts:245-270`) and can land **after** `complete()`/`retry()` in durable drivers; the SPI never warns driver authors about ordering.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Flip the heartbeat to awaited within the run's lifecycle; document the ordering contract on `JobDriver.heartbeat`.                               |
| AD72-M4 | Redis `attempts`/`errors` hash entries are only removed by `#discard` (`redis-job-driver.ts:44-67`): any path that deletes the record without `#discard` (or a partial failure) leaks hash fields **forever** — unbounded growth.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Clean companion hashes inside `CLAIM_SCRIPT` for record-less ids (the script already checks `HEXISTS records`).                                  |
| AD72-M5 | LibSQL claim's expired-lease branch scans **every running row** (`libsql-job-store.ts:42-46`): `lease_expires_at` is unindexed; only `(state, run_at)` exists.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Add an index on `(state, lease_expires_at)` (or fold timed reclaim into one composite).                                                          |
| AD73-M1 | `RedisLockDriver.close()` only seals the handle — it does **not** release the leases it acquired, violating the `LockDriver` SPI's close contract that `InProcessLockDriver` honors (`redis-lock-driver.ts:215-222` vs `in-process-lock-driver.ts:135-166`). Latent (scheduler never calls close) but a contract divergence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Track acquired keys per instance; release token-checked on close (parity with in-process).                                                       |
| AD73-M2 | Token counters advance on **failed** acquires in Redis (`INCR` runs before `SET NX` fails) but not in-process — a parity divergence the ADR claims drivers share ("monotonic fencing tokens starting at 1"): sequences differ between backends. Cosmetic (equality checks, not ordering) but doc/contract drift.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Decide and pin one behavior; align `ACQUIRE_SCRIPT` (INCR only on success is impossible in one script — document the gap or accept and spec it). |
| AD73-M3 | `expiresAt` is client-clock based while Redis TTL is server-clock based (`redis-lock-driver.ts:185-200`) — skew makes the diagnostic field wrong; README never mentions the caveat the AD-73 expects documented.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Document clock-skew semantics in the README; consider server-returned TTL.                                                                       |
| AD74-M2 | Crash-loop unconditionally pins `exitCode = 1`, **overwriting** a sibling's earlier higher code (e.g. 7) — `run()`'s max-aggregation runs only for `reason === 'stopped'` (`cluster-runner.ts:428-436,291-296`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Preserve the max code across reasons (keep 1 as the floor for crash-loop).                                                                       |
| AD74-M3 | `stop()`'s sequential drain and `abort()`'s kill sweep can run concurrently (`cluster-runner.ts:309-388`): it works today only because abort's kills unblock the drain; the dual-drain ownership is fragile and undocumented.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Short-circuit `stop()` when `#aborted`; document the stop/abort interaction.                                                                     |
| AD75-M1 | `generate` exposes only `--name`; the four generators accept `--package/--file/--force/--className/--summary/--author/--description/--path` — the CLI surface is a subset with no passthrough (component/header are broken at BLK-3; even `package` cannot `--force`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Expose the schemas' flags (or a `--` passthrough) + dry-run parity with nx.                                                                      |
| SWP-M1  | Spec lane exclusions overstate the claim: `**/e2e/**` drops the two Playwright specs (never typechecked anywhere), and `**/lib/**` collaterally excludes real sources at `apps/11-blue-conduit-web/src/lib/` (currently only typechecked via imports).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Anchor exclusions to build outputs (`packages/*/lib/**`, `apps/*/dist/**`); decide the e2e typecheck policy.                                     |
| DOC-M1  | Drift register (repo indexes): ARCHITECTURE `platform-node` hub count 15 ≠ 16 deps (`ARCHITECTURE.md:1142`), `@blue/cli` row lists a `core` dep it does not declare (`:1144`), Redis README says "four entry points" but ships five (`/locks` omitted, `blue-redis/README.md:24-38`), AD-73 D-2 names `waitMs/waitStepMs` that never shipped (real names `lockWait/lockWaitStep`, `AD73:105`), `blue-platform-node/README.md:145-161` omits the `lockDriver` bean, guide 25 omits the `blue dev` server-watch deferral (`25:13`) and its own `blue dev ./apps/06-blue-island` example runs `npm run start:full` — an npm wrapper, exactly the signal-swallowing class the guide's "How scripts run" section (25:27-31) warns about (`[exec]` verified `apps/06-blue-island/package.json:9`). | Fix each; add the guide-25 example to the shell-free policy and a walk-up workspace-root rule.                                                   |

---

## 4. Low / nit findings (9)

| ID      | Finding                                                                                                                                                                                                                    | Evidence                                                                                                           |
| :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| AD72-L1 | LibSQL stores default to `crypto.randomUUID` via the **global**, no `node:crypto` import and no `engines` constraint in either package (unlike the rest of the monorepo's Node ≥22 posture).                               | `[code]`                                                                                                           |
| AD72-L2 | The package generator template ships empty `dependencies`, so a fresh `blue generate package` cannot use jobs/outbox without manual edits — contrast platform-node, which declares `@blue/jobs` (guidance gap, not a bug). | `[code]`                                                                                                           |
| AD72-L3 | `JobQueue`'s comment claims queue-level `delayMs ⇄ runAt` validation; the work happens in `resolveJobRequest` at driver level — AD-72 D-3 text/code drift.                                                                 | `[code]`                                                                                                           |
| AD72-L4 | `JobHandlerRegistry` is validated with an inline structural check while every sibling contract uses a `like*` guard (`job-runner.ts:345-358`).                                                                             | `[code]`                                                                                                           |
| AD73-L1 | `resolveLockFields` (lock names, duration parsing, positivity) has no isolated unit tests — only integration specs with valid names.                                                                                       | `[code]`                                                                                                           |
| AD74-L1 | `serve`/`dev` accept `--port 0`, which means "random ephemeral port" to the OS yet is presented as a concrete port.                                                                                                        | `[code]`                                                                                                           |
| AD75-L1 | The shell-operator guard `/[                                                                                                                                                                                               | &;<>()]/u`misses`$`and backticks —`$(…)`/`\`…\`` scripts pass the guard and then fail confusingly as literal argv. | `[code]` |
| SWP-L1  | The spec-lane claim "typechecks every package/app src AND test file" is overstated for the Playwright `e2e/` dirs (SWP-M1) and the commit message's "exactly mirrors" overstates the paths table (SWP-H1).                 | `[code]`                                                                                                           |

---

## 5. Feature-gap refresh (industry comparison, 2026-10)

### Durable jobs (`@blue/jobs`, AD-72) vs BullMQ / pg-boss / Temporal

| Gap                                                                                                                                                                                                                                                                                          | Note                                                                                                 |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| Job **priorities / rate limiting / job filters**                                                                                                                                                                                                                                             | BullMQ-native; absent here — document as out of scope for 1.0.                                       |
| **Stall detection beyond lease**: BullMQ marks stalls with a separate "stalled" state + a recovery sweep with move-to-dead; this design reclaims expired leases in `claim` — simpler, but a stalled job is re-delivered with **no visibility** and attempts counts can hide repeated stalls. | Acceptable v1, but expose the reclaim as a metric.                                                   |
| **Dead-letter queue / retention**                                                                                                                                                                                                                                                            | Terminal jobs are deleted (`#discard`); no DLQ to inspect failures.                                  |
| Fencing at the driver level (claim token)                                                                                                                                                                                                                                                    | Redis driver has **no claim token** (AD72-H1/H2 are the symptom); BullMQ sets an owner id per claim. |
| At-least-once re-delivery categories (recoverable vs manual vs dead)                                                                                                                                                                                                                         | Not modeled; all retries share one exhausted → delete path.                                          |

### Distributed locks (`@blue/locks`, AD-73) vs Redlock / Redisson / BullMQ locks

| Gap                                               | Note                                                                                                                          |
| :------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------- |
| **Fencing via monotonic tokens**                  | **Stronger than stock Redlock** (random instance uuid). Already superior; keep and advertise.                                 |
| Blocking acquire + auto-renew watchdog            | Not provided; the scheduler renews per-run, direct users must renew manually. Redlock reference impl auto-extends a watchdog. |
| Lock introspection (owner, remaining TTL via API) | `expiresAt` is client-clock only (AD73-M3).                                                                                   |
| Multiple-lock / semaphore acquisition atomically  | Absent; PG advisory locks documented-deferred in the ADR.                                                                     |

### Cluster supervisor (`@blue/cluster`, AD-74) vs PM2 / s6 / supervisord

| Gap                                                | Note                                                                                            |
| :------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Readiness gating** (PM2 port-wait, s6 run-again) | Slots start simultaneously with no health check; `serve --cluster` cannot wait for "app is up". |
| Log capture / rotation (all peers)                 | `stdio: 'inherit'` only — children share the console, no per-slot logs.                         |
| Rolling restarts / versioned deploys               | Respawn is same-command only; no rolling replacement.                                           |
| Per-slot metrics (restart counters, exit codes)    | Snapshots exist; no telemetry emission — cheap win on the OTel substrate.                       |

### Framework CLI (`@blue/cli`, AD-75) vs Rails / nest / artisan / adonis

| Gap                                                                                        | Note                                                                           |
| :----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **`--dry-run` / `--pretend`** (Rails, Nx, Artisan)                                         | Not exposed, though nx supports it — one flag on `generate`.                   |
| **`-y` / `--yes`** non-interactive confirmations                                           | Prompts rely on nx's interactive machinery; CI/non-TTY automation needs flags. |
| `db:new` / migration generation (AD-75 D-2 lists `new`, `migrate`; only `migrate` shipped) | Surface gap vs the ADR's own table (GAP-7 remainder).                          |
| JSON output flag for tooling (`--json`)                                                    | Absent; `inspect` prints human text only.                                      |
| Shell completion scripts                                                                   | Absent (oclif can generate them — cheap).                                      |
| `upgrade` codemods                                                                         | Deferred in ADR — correct call.                                                |

---

## 6. Deferred-sweep closure verification (`ca50b249`)

All four claims independently verified **true** at HEAD:

| Claim      | Verdict | Evidence                                                                                                                                                                                                                                                                                                                                                                      |
| :--------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REU-9      | ✅      | Moved bodies byte-identical (`toLookupKey` gained `export` only); boot re-exports both public functions unchanged; boot exports pre/post identical; `@blue/inspect` runtime imports context only, boot in devDependencies; no context→boot src import (no cycle); boot specs still import via the boot barrel so the re-export seam is exercised; ARCHITECTURE row corrected. |
| TEL-08     | ✅      | `onSend` seam consumed; countSocketClientBytes wired; spec pins buffered-while-connecting flush.                                                                                                                                                                                                                                                                              |
| TST-A      | ✅      | `tsconfig.spec.json` lane real (strict, ES2024+DOM, types array, red-on-error verified) — with the caveats in SWP-H1/SWP-M1/SWP-L1 (three newest packages resolve built `lib/`, e2e excluded, `src/lib` collateral).                                                                                                                                                          |
| SEC-B/WC-I | ✅      | `scripts/test-lower-decorators.mjs` under `pnpm test:tooling` (5/5), wired into the quality CI job.                                                                                                                                                                                                                                                                           |

---

## 7. Mitigation plan

### Wave 1 — AD-74 cluster teardown correctness (blocks)

| Items   | Change                                                                                                                      | Regression test                                                                             |
| :------ | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| BLK-1   | Guard trip runs the abort teardown: kill every slot's current child, settle all loops, keep `reason: 'crash-loop'`, exit 1. | size-2 trip spec (fail-before: probe in §1) + real-process lane asserting no survivor.      |
| BLK-2   | `runAppSupervised` forwards `basePort` (drop the flat `env.PORT`); `serve.ts` help text unchanged (now true).               | Real-bin `serve --cluster 2 --port X` asserting `PORT == X` and `X+1` via slot env markers. |
| AD74-H1 | Per-slot spawn-failure handling: log + fail-closed teardown (no orphaned siblings).                                         | Spawner-throws spec: all children killed, `run()` settles with an error result.             |
| AD74-M2 | Exit-code aggregation across reasons (max code; crash-loop floor 1).                                                        | Size-2 spec: sibling exits 7, other slot trips → result code 7, reason crash-loop.          |
| AD74-M3 | `stop()` no-ops once `#aborted`; document stop/abort interaction in guide 24.                                               | Concurrent stop+abort spec.                                                                 |

### Wave 2 — AD-72 Redis driver atomicity (highs)

| Items   | Change                                                                                                                                              | Regression test                                                                                                     |
| :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| AD72-H1 | Lua `HEARTBEAT_SCRIPT`: extend only when this claim still owns the lease (compare stored attempts/lease marker).                                    | Concurrent claim/heartbeat probe (two drivers, same namespace): stale heartbeat never re-extends a reclaimed lease. |
| AD72-H2 | Lua `RETRY_SCRIPT` with `HEXISTS records` guard inside the atomic unit.                                                                             | complete/retry race fixture: retry after terminal removal is a no-op (Redis parity with libsql).                    |
| AD72-M4 | `CLAIM_SCRIPT` sweeps companion hash fields for record-less ids.                                                                                    | Namespace-size spec after N complete/claim cycles (no growth).                                                      |
| AD72-M5 | LibSQL index on `(state, lease_expires_at)` + claim `EXPLAIN` assertion.                                                                            | Migration adds the index; spec re-runs claim.                                                                       |
| AD72-M1 | Document the cooperative-handler contract on `JobRunner` (+ default `timeoutMs` recommendation in AD-72/guide); optionally a drain deadline option. | Doc + option spec.                                                                                                  |
| AD72-M2 | Runner-level crash-mid-job spec (lease expiry mid-run → re-execution; maxAttempts boundary).                                                        | The spec itself.                                                                                                    |
| AD72-H3 | `undefined` rejected by `serializeJobPayload`.                                                                                                      | Enqueue `{ a: 1, b: undefined }` throws.                                                                            |
| AD72-M3 | Await heartbeat completion before settle; SPI contract note on `heartbeat` ordering vs `complete`.                                                  | Old-hearbeat-after-complete fixture over the redis driver.                                                          |

### Wave 3 — AD-73 lock parity + AD-75 CLI surface fidelity

| Items      | Change                                                                                                                                                                     | Regression test                                                                         |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| AD73-M1    | `RedisLockDriver` tracks acquired keys; `close()` releases token-checked (in-process parity).                                                                              | Close-then-check spec: leases released, successor untouched.                            |
| AD73-M2    | Decide + pin the counter-on-failed-acquire behavior (doc or align); README note.                                                                                           | Spec pins the chosen semantics for both drivers.                                        |
| AD73-M3    | Clock-skew caveat in the README (+ optional server-TTL `expiresAt`).                                                                                                       | Doc + `expiresAt` spec.                                                                 |
| BLK-3      | `generate` forwards the four generators' flags (or restricts surface) + `--dry-run` parity with nx; fix examples in `generate.ts`/guide 25.                                | Real-bin non-TTY lane for all four kinds.                                               |
| AD75-H1    | `doctor`: workspace root walked from `pnpm-workspace.yaml`; ≥3 real checks; non-zero exit on findings; guide 25 check list.                                                | Doctor spec with a broken fixture → exit ≠ 0; workspace-root output.                    |
| AD75-H2    | Signal handlers registered before spawn; `capture` distinguishes ENOENT.                                                                                                   | Spec with a pre-registered-handler probe; capture-side `n/a` ↔ missing-tool separation. |
| DOC-H1/.M1 | apps/README auth-playground, ARCHITECTURE counts/edges, redis README five entry points, AD-73 names, platform-node README bean list, guide 25 dev caveat + island example. | Re-run `pnpm docs:links` + the index gates; guide-25 example now shell-free-valid.      |
| SWP-H1/.M1 | `tsconfig.spec.json` gains the three path families; exclusions anchored to build outputs; e2e typecheck policy recorded.                                                   | `pnpm typecheck` red on a src-only change in `@blue/locks`; e2e specs verdict recorded. |

### Wave 4 — nits, telemetry and docs close-out

| Items           | Change                                                                                                                             | Regression test                               |
| :-------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
| AD74-L1         | `--port` min 1 (or document ephemeral semantics).                                                                                  | Usage error on `--port 0`.                    |
| AD75-L1         | Extend the shell-operator guard to `$` and backticks.                                                                              | Guard spec with `$(…)` and backtick fixtures. |
| AD72-L1         | `node:crypto` imports + `engines` in both store packages.                                                                          | Typecheck/lint.                               |
| AD72-L2/.L3/.L4 | Generator template dependency note; JobQueue comment; `likeJobHandlerRegistry`.                                                    | Spec updates.                                 |
| AD73-L1         | Unit specs for `resolveLockFields`.                                                                                                | The specs.                                    |
| Docs            | Register this plan in `docs/plans/README.md` (Completed Reviews), CHANGELOG entry on landing, regenerated API docs, `graft build`. | `pnpm doc` freshness + gates.                 |

### Wave 5 — Verification

Per-wave fail-before/pass-after tests; then the full gate set of §0 **plus** the new
regressions: the size-2 crash-loop trip (BLK-1), the real-bin clustered serve with
distinct ports (BLK-2), the non-TTY generate lane (BLK-3), the concurrent Redis
claim/heartbeat probe (AD72-H1) and the retry-resurrection fixture (AD72-H2), the
spec-lane src-only probe for all three new packages (SWP-H1), and the doctor
broken-fixture exit (AD75-H1). Close with a clean `git status`, `pnpm doc`, and
`graft build`.

---

## 8. Verification protocol

```bash
# Full gate set (all must pass)
pnpm build && pnpm test && pnpm test:tooling && pnpm lint && pnpm format:check && pnpm docs:links \
  && pnpm audit --prod && pnpm manifest:check && pnpm agents:check \
  && pnpm typecheck && pnpm doc && git diff --exit-code -- packages doc

# Wave-specific probes (throwaway; never committed)
#  AD74: size-2 crash-loop trip -> run() resolves, sibling killed (probe exists: .scratch/cluster-probe.mts deleted after)
#  AD75: blue serve --cluster 2 --port X -> children report PORT X and X+1
#  AD75: blue generate component --package P --name N (non-TTY) -> exit 0, artifact created
#  AD72: two RedisJobDrivers, same namespace; claim on A then stale heartbeat on B -> lease not re-extended
#  AD72: complete(id) racing retry(id) -> retry is a no-op
#  AD73: driver.close() releases only its own leases
#  AD75: doctor against a broken fixture -> exit != 0
```

Acceptance for closure: every block/high item has a fail-before/pass-after test; every
medium item is fixed or explicitly deferred here with a reason; the gate set is green
with the new regressions; `graft build` refreshed.

---

## 9. Finding counts

| Class                 | Count                                          |
| :-------------------- | :--------------------------------------------- |
| Block                 | 3                                              |
| High                  | 8                                              |
| Medium                | 13                                             |
| Low/nit               | 9 (SWP-_/AD_-L rows; drift rows inside DOC-M1) |
| Sweep claims verified | 4/4 true                                       |

**Headline risks:** (1) AD-74's supervisor can hang and linger — the feature's core
"fail-closed" contract is inverted in the multi-slot case; (2) AD-75's headline
`serve --cluster` demo and 2 of 4 generate kinds do not work as documented, so the
CLI's v1 promise is partially false at the exact surfaces the ADR advertises; (3) the
Redis job driver's check-then-act mutation pattern (heartbeat/retry) is the one durable
backend with a window to double-execute or resurrect jobs — it needs the Lua-atomic
treatment the lock driver already has.

---

## 10. Execution log (2026-10-08)

Waves 1–5 executed by the integrator after the review above; every item carries its
regression test, and each lane below was run at the post-fix HEAD.

### Landed

- **Wave 1 — AD-74 cluster teardown correctness.** BLK-1: `ClusterRunner.#teardown`
  (shared fail-closed path) kills every slot's current child on a crash-loop trip, a
  spawn failure, and the operator abort — the size-2 unit spec, the real-process
  survivor lane (pid liveness probe), and the test suite's existing specs are green.
  BLK-2: `runAppSupervised` forwards `basePort`, so `serve --cluster 2 --port X`
  delivers `PORT = X` and `X+1` (new real-bin integration spec with per-slot markers).
  AD74-H1: spawn failures are caught, logged, and fail-closed (spawner-throws spec).
  AD74-M2: the crash-loop result preserves the worst sibling code (floor 1) — spec
  with a sibling exiting 7. AD74-M3: `stop()` after `abort()` is a no-op (spec);
  guide 24's contract table documents all four behaviors.
- **Wave 2 — AD-72 Redis atomicity.** AD72-H1: `HEARTBEAT_SCRIPT` (one Lua unit:
  extend only while still leased — a stale holder can never re-add a lease a
  successor reclaimed); AD72-H2: `RETRY_SCRIPT` (one Lua unit: `HEXISTS`-guarded
  requeue + `runAt` patch — a completed job stays terminal); AD72-M4: the claim
  script sweeps `attempts`/`errors` for phantom records (no unbounded growth);
  live-lane regression specs for all three, run against real Redis 7 in a container.
  AD72-M5: `blue_jobs_lease (state, lease_expires_at)` index + DDL-assert spec.
  AD72-H3: `serializeJobPayload` rejects `undefined` members (spec) —
  `undefined` payloads still normalize to `null`. AD72-M1: drain's
  cooperative-handler contract documented on the runner + in guide 22. AD72-M2:
  runner-level crash-mid-run spec (lease expiry → reclaim → re-execute →
  maxAttempts termination). AD72-M3: the runner awaits its last in-flight heartbeat
  before the terminal transition; job-driver SPI documents the ordering contract.
- **Wave 3 — AD-73 lock parity + AD-75 CLI fidelity.** AD73-M1:
  `RedisLockDriver.close` releases this driver's own leases (token-checked, tracking
  acquisitions; parity with in-process) — live spec. AD73-M2: the acquire script
  advances the token counter only on success (consecutive tokens, in-process parity)
  — live spec + README parity notes. AD73-M3: clock-skew caveat documented in the
  locks README. AD73-L1: `resolveLockFields` unit specs through `resolveScheduledSpec`
  (normalize + reject malformed lock/durations). BLK-3: `blue generate` exposes the
  four generators' declared flags with per-kind forwarding (`generateArgv` unit
  specs) — `component`/`header` runnable. AD75-H1: `doctor` walks up to
  `pnpm-workspace.yaml` for the workspace root, runs real checks (Node ≥ 22, pnpm
  present, git present, inside a workspace), and exits `1` on failures — three new
  integration specs. AD75-H2: one-shot commands register signal relays BEFORE the
  spawn (mutable-holder pattern); `capture` distinguishes a missing binary.
  SWP-H1/M1: `tsconfig.spec.json` gains the `@blue/locks`/`@blue/cluster`/`@blue/cli`
  (+ `/redis/locks`) path families, and exclusions are anchored to build outputs
  (`packages/*/lib/**`, `apps/*/dist/**`) so `apps/11-blue-conduit-web/src/lib` is
  covered; the Playwright-`e2e` carve-out is recorded.
- **Wave 4 — nits + docs.** AD74-L1: `--port` minimum 1 (serve + dev). AD75-L1:
  shell-operator guard covers `$()` and backticks (specs). AD72-L1: `node:crypto`
  `randomUUID` imports + `engines: >=22` in `@blue/jobs` and `@blue/orm-drizzle`.
  AD72-L2: `blue generate package --jobs` wires `@blue/jobs` (generator spec).
  AD72-L3: AD-72 D-3 reworded to the implemented driver-normalization contract.
  AD72-L4: `likeJobHandlerRegistry` guard replaces the inline check in the runner.
  DOC-H1: apps/README auth-playground flow (`pnpm start` for :3110 + client :3440)
  and the phantom 3430 removed from the ports registry. DOC-M1: ARCHITECTURE
  platform-node hub count (16) + cli dep cell, redis README five entry points +
  `/locks`, AD-73 D-2 option names (`lockWait`/`lockWaitStep`), platform-node README
  `lockDriver` bean, guide 25 dev watch deferral + a shell-free `blue dev` example.
  CHANGELOG entries added.

### Verification

`pnpm build` · `pnpm test` · `pnpm lint` · `pnpm format:check` · `pnpm typecheck`
(incl. the spec lane) · `pnpm docs:links` — all green at the post-fix HEAD; the
Redis live lanes (locks + jobs) were run in a disposable redis:7 container
(19 + 8 tests, all green, Lua scripts verified against real Redis); the new
regressions (crash-loop sibling teardown, clustered-serve ports, stale-heartbeat
singleton, terminal-retry no-op, companion sweep, counter parity, close-release,
doctor exits) are part of the green lanes. `graft build` refreshed.
