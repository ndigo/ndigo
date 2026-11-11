# Guide 22 — Jobs & the Transactional Outbox

How background work is delivered in Ndigo: `@ndigo/jobs` — the `JobDriver`
contract, worker execution, and the transactional outbox that ties side
effects to database commits. Jobs are **Node-only**.

The design: one framework-owned driver SPI with at-least-once, lease-based
claims; the in-process reference driver for development, a durable libSQL
store, and a Redis driver for multi-node deployments. The outbox closes the
last gap — "send the email only if the order actually committed."

**Audience:** Node application developers · **Prerequisites:** Guides [20](20-orm-and-migrations.md) and [21](21-persistence-and-shared-stores.md) · **Reference package:** `packages/ndigo-jobs`

## What you'll learn

- Implement or choose a `JobDriver`.
- Discover `@jobHandler` workers.
- Apply retries, timeouts, and spans.
- Use the durable libSQL and Redis drivers.
- Commit side effects with the transactional outbox.

## 1. Quickstart

Add a `@jobHandler` method to any registered bean, enqueue a job, and start a
runner:

```ts
import { jobHandler, JOB_QUEUE, JOB_RUNNER } from '@ndigo/jobs';
import { configuration, entry } from '@ndigo/context';

class EmailWorker {
    @jobHandler('email.send', { maxAttempts: 5, timeoutMs: 30_000 })
    async send(payload: unknown) {
        // payload is the JSON value enqueued with the job
    }
}

@configuration
class AppConfiguration {
    @entry()
    emailWorker() {
        return new EmailWorker();
    }
}

// After boot:
const context = await new ApplicationBuilder([NodeAutoConfiguration, AppConfiguration]).run();
context.getValue(JOB_RUNNER).start(); // workers start explicitly
await context.getValue(JOB_QUEUE).enqueue({
    type: 'email.send',
    payload: { to: 'a@b.c' },
    delayMs: 5_000,
});
```

`NodeAutoConfiguration` provides four beans:

- `jobDriver` — the default `InProcessJobDriver` (reference semantics,
 **not durable**: jobs vanish with the process),
- `jobQueue` — the producer facade (resolves the driver bean through the
 context),
- `jobHandlerRegistry` — discovers `@jobHandler` methods on every registered
 bean at refresh (SmartLifecycle phase 0),
- `jobRunner` — the worker engine (phase 10, explicitly started).

The runner starts explicitly because a pending poll timer keeps the process
alive — the same reason `HTTPServer` does not self-start. Worker processes
call `start`; API-only processes leave it stopped. `autoStart: true` opts
into refresh-driven start.

## 2. Delivery semantics

- **At-least-once.** `claim` leases jobs for `leaseMs` and increments
 `attempts`; a crashed or timed-out delivery consumes an attempt, and the
 next `claim` reclaims the job when the lease expires (no sweeper, no leader
 election). A reclaimed job may execute once more even at `maxAttempts` —
 handlers must be idempotent.
- **Failures retry** with exponential backoff (1 s doubling, capped at 30 s)
 until `maxAttempts` (default 3), then fail terminally. Handler options
 (`@jobHandler(type, { maxAttempts, timeoutMs })`) override per-request
 values.
- **`timeoutMs`** aborts the handler's `AbortSignal` and settles the attempt
 as failed; a handler that ignores the signal is still settled by the runner.
- **Payloads are JSON.** Enqueue fails loud on functions, symbols, bigints,
 circulars, and **`undefined` members** (use `null`); only a payload that
 _is_ `undefined` is normalized to `null`. Queue rows are plaintext — never
 enqueue secrets.
- **Handlers are cooperative.** `close` drains in-flight executions: a
 handler without `timeoutMs` that never resolves blocks shutdown — every
 handler with potentially-stalling work should set one.
- **Heartbeats settle before the terminal transition.** The runner awaits its
 last lease heartbeat before `complete`/`retry`/`fail`, and drivers treat a
 beat for a missing job as a no-op — the check and the extend are one atomic
 unit in the Redis driver .

Every execution records one INTERNAL span `jobs.job.<type>` (`job.id`,
`job.type`, `job.attempt`, `job.outcome`, `job.duration_ms`); retries log a
warning and terminal failures an error through `@ndigo/log`.

## 3. Durable drivers

| Driver | Package | Claim mechanism |
| -------------------- | -------------------- | ----------------------------------------------------- |
| `InProcessJobDriver` | `@ndigo/jobs` | In-memory map + runAt ordering (not durable) |
| `LibSQLJobStore` | `@ndigo/orm-drizzle` | One `UPDATE … RETURNING` statement (SQLite) |
| `RedisJobDriver` | `@ndigo/redis/jobs` | One Lua script over ready/lease ZSETs + record hashes |

Register a durable driver under the `jobDriver` bean to replace the default:

```ts
import { JOB_DRIVER } from '@ndigo/jobs';
import { LibSQLJobStore } from '@ndigo/orm-drizzle';

@configuration
class JobsConfiguration {
    @entry(JOB_DRIVER)
    jobDriver() {
        return new LibSQLJobStore({ url: 'file:./jobs.db' });
    }
}
```

The libSQL store should own its connection (pass `url`) so the worker's claim
statements never share the application's transactional connection. The Redis
driver borrows a `RedisConnection` (the `RedisSocketFanout` pattern) and
isolates queues by `namespace`.

## 4. The transactional outbox

The failure mode every application hits: sending the message inside the
transaction risks announcing a rolled-back order; sending after commit risks
losing it on a crash. The outbox removes both: record the side effect in the
same transaction, publish it afterwards.

```ts
import { LibSQLOutboxStore } from '@ndigo/orm-drizzle';
import { JobOutboxPublisher, OutboxRelay, JOB_QUEUE } from '@ndigo/jobs';

const outbox = new LibSQLOutboxStore({ client: dataSource.client }); // same client!
const relay = new OutboxRelay({
    store: outbox,
    publisher: new JobOutboxPublisher(context.getValue(JOB_QUEUE)),
});
relay.start();

class OrderService {
    transactionManager: TransactionManager;

    @transactional()
    async placeOrder(order: Order): Promise<void> {
        await this.#repo.save(order);
        await outbox.append({ type: 'order.placed', payload: { id: order.id } });
        // commit ⇒ the relay publishes; throw ⇒ neither survives
    }
}
```

**Construction is the wiring.** `LibSQLOutboxStore` joins the caller's
transaction because it writes through the _same_ libSQL client the
`DrizzleTransactionManager` brackets with an interactive transaction
(`client.transaction('write')`) — the client routes the statements of the
boundary's async context into it. Hand it anything else and the guarantee is
gone. A statement issued from _another_ async context (a different request, a
worker) stays out of the boundary rather than joining it.

The relay claims unpublished entries with a lease, publishes through an
`OutboxPublisher` (the shipped `JobOutboxPublisher` enqueues the entry as a
job — type → job type, payload → job payload), then marks the entry
published. A crashed relay or a failed publish leaves the entry claimable
after its lease expires: at-least-once, so consumers (the job handlers) must
be idempotent. Set `retainPublishedMs` to prune published history.

## 5. Lifecycle and shutdown

- `jobHandlerRegistry` scans on refresh; `jobRunner.start` arms the poll
 loop; `stop` stops claiming while in-flight executions continue;
 `close` drains — the container closes both beans on context close
 (register them as container values, or leave them to
 `NodeAutoConfiguration`).
- Drivers close only clients they own; borrowed clients stay open. Stop and
 drain the runner (and relay) before closing their stores.
- Graceful shutdown order: stop accepting requests → `JOB_RUNNER.close` →
 `OUTBOX_RELAY.close` → close drivers/stores → close the context.

## 6. What is deliberately not here

Dead-letter inspection (`fail` is terminal; the error lives in the span and
log), distributed locks / leader election (`@scheduled` and jobs coordinate
through the driver's atomic claim only; keeps distributed scheduling
deferred), cron-persistent schedules, and a CLI. Each needs its own decision
record — see 's consequences.

## See also

- [Guide 23 — Scheduling](23-scheduling.md): the trigger side — `@scheduled`
 for time-based work, jobs for delivered work.
- [Guide 21 — Persistence & Shared Stores](21-persistence-and-shared-stores.md):
 the memory-first doctrine and the durable-store family the job stores join.
-: the decision
 record behind this surface.
