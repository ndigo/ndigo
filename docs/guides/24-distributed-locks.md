# Guide 24 — Distributed Locks

Fencing-token locks make a `@scheduled` task a **single-executor** across
nodes: exactly one node runs the fire, others skip. They are the shared
primitive behind multi-node scheduling (this guide, ) and the future
cluster spine (GAP-2).

**Audience:** Node application developers and operators · **Prerequisites:** [Guide 23](23-scheduling.md) · **Reference package:** `packages/ndigo-locks`

## What you'll learn

- Model a lock as a lease with a fencing token.
- Use the in-process driver on a single node.
- Move to the Redis driver across nodes.
- Make a scheduled task single-executor.
- Handle expired leases and stale holders.

## The model: leases, not booleans

A lock is a **lease**: acquiring sets a TTL, and the holder must finish (or
extend) inside it. Every acquisition receives a fresh monotonic **fencing
token**; only the handle holding the current token can renew or release — a
stale holder (its lease expired, another node acquired) can never touch a
successor's lease. Expired leases are simply expired: no sweeper, no leader,
no coordinator.

## Single node: nothing to configure

The default driver is in-process with a **process-wide lease table** — every
`InProcessLockDriver` in the process coordinates, so two scheduler beans can
never double-run a locked task:

```ts
import { InProcessLockDriver } from '@ndigo/locks';

const locks = new InProcessLockDriver();
const lease = await locks.acquire('payroll-window', { ttlMs: 30_000 });
if (lease === null) {
    // Another holder owns it — skip or wait (the contract is non-blocking).
} else {
    try {
        // …only one holder reaches this point…
    } finally {
        await lease.release(); // never leak the lease on a throw
    }
}
```

## Multi node: one Redis connection

Register a durable driver under the `lockDriver` bean to replace the default
(which is in-process — correct on one node, meaningless across nodes):

```ts
import { LOCK_DRIVER } from '@ndigo/locks';
import { RedisConnection } from '@ndigo/redis';
import { RedisLockDriver } from '@ndigo/redis/locks';

const connection = new RedisConnection({ url: 'redis://…' });
await connection.connect();

@configuration
class LocksConfiguration {
    @entry(LOCK_DRIVER)
    lockDriver() {
        return new RedisLockDriver({ connection, namespace: 'prod' });
    }
}
```

One namespace per environment isolates lock spaces sharing one Redis; the
driver never connects or closes the borrowed connection (manage it like the
jobs driver's). The Lua scripts are the only atomicity the fencing needs
(`SET NX PX` + compare-and-delete).

## `@scheduled({ lock })`

Locked tasks are the primary consumer. The runner acquires the lock before
the run and releases it in a `finally`, so a throwing run can never wedge a
scheduled slot:

```ts
class PayrollController {
    @scheduled({ cron: '0 2 * * *', lock: 'payroll-window' })
    async closeBooks() {
        /* … */
    }
}
```

Options (both spec forms, decoration-time validated):

| Option         | Default  | Meaning                                                                                                        |
| :------------- | :------- | :------------------------------------------------------------------------------------------------------------- |
| `lock`         | —        | The lock key; run only while the lease is held.                                                                |
| `lockWait`     | skip     | Wait budget for a contended lock before skipping the fire (`'5s'`, `500`).                                     |
| `lockWaitStep` | `100 ms` | Poll interval while waiting.                                                                                   |
| `lockTtl`      | `60 s`   | Lease duration. Must cover the whole run — a lapsed lease lets another node take over (at-least-once posture). |

- Same-tick fires run concurrently: two tasks sharing a lock on the same
  node resolve by registration order, the loser skips — that is the
  contract, not a race.
- A fire that skipped on contention is logged (`lock 'x' is held`) and the
  schedule continues; nothing is queued.
- A locked task with **no** lock driver fails loud at run time — an
  unguarded run would defeat the feature's purpose.

## See also

-: `docs/decisions/2026-10-07_AD73_DISTRIBUTED_LOCKS.md`

- [Guide 38 — Deployment & Production Readiness](38-deployment-and-production-readiness.md) — clustered operation and the production checklist
- The scheduler guide (05) for single-flight and `maxRunTime` semantics —
  the lock is the cross-process half of the same wrapper.
- The jobs guide (22) — leases, at-least-once, and `NodeAutoConfiguration`
  bean wiring share the same spine.
