# @ndigo/jobs

> Durable job queues, worker execution, and the transactional outbox for Node.js.

Job queues with at-least-once delivery, lease-based claims, retries, and a
transactional outbox that commits side effects with your data. The contract is
framework-owned; the backends are adapters — an in-process reference driver for
development and tests, a durable libSQL store, and a Redis driver for multi-node
deployments.

## Installation

```bash
pnpm add @ndigo/jobs
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

Durable backends are optional and owned by their integration packages:
`@ndigo/orm-drizzle` (`LibSQLJobStore`, `LibSQLOutboxStore`) and `@ndigo/redis`
(`@ndigo/redis/jobs` — `RedisJobDriver`).

## Getting Started

Register a handler on any bean, enqueue a job, and start a runner:

```ts
import { jobHandler, JobRunner, JOB_QUEUE, JOB_RUNNER } from '@ndigo/jobs';
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
    worker() {
        return new EmailWorker();
    }
}

// After boot:
const context = await app.run();
context.getValue(JOB_RUNNER).start(); // workers start explicitly
await context.getValue(JOB_QUEUE).enqueue({
    type: 'email.send',
    payload: { to: 'a@b.c' },
    delayMs: 5_000,
});
```

`NodeAutoConfiguration` provides `jobDriver` (in-process), `jobQueue`,
`jobHandlerRegistry`, and `jobRunner`; the registry discovers `@jobHandler`
methods on every registered bean at refresh.

## Usage

### The transactional outbox

`OutboxStore.append()` inside a `@transactional` method joins the caller's
transaction when the store shares the application's database client — commit
publishes, rollback discards. Wire the libSQL store to the data source and a
relay to the queue:

```ts
import { LibSQLOutboxStore } from '@ndigo/orm-drizzle';
import { JobOutboxPublisher, OutboxRelay, JOB_QUEUE } from '@ndigo/jobs';

const outbox = new LibSQLOutboxStore({ client: dataSource.client });
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
        // throw ⇒ neither the order nor the outbox entry survives
    }
}
```

Delivery is at-least-once end to end (crashed leases and failed publishes
re-surface after their lease expires), so handlers must be idempotent.

### Drivers and the driver SPI

| Driver               | Package              | Notes                                                          |
| -------------------- | -------------------- | -------------------------------------------------------------- |
| `InProcessJobDriver` | `@ndigo/jobs`        | Reference semantics, not durable — the dev/test default.       |
| `LibSQLJobStore`     | `@ndigo/orm-drizzle` | Durable; single-statement atomic claim; own client per worker. |
| `RedisJobDriver`     | `@ndigo/redis/jobs`  | Durable multi-node; atomic claim via one Lua script.           |

Implement `JobDriver` (enqueue / claim / complete / retry / fail / heartbeat /
size / close) and register it under the `jobDriver` bean to plug in a backend;
`resolveJobRequest`, `serializeJobPayload`, and `parseJobPayload` are the
driver-authoring helpers.

### Execution semantics

- `claim` leases jobs for `leaseMs`; the runner heartbeats at `leaseMs / 2`.
  Attempts increment at claim, so a crashed delivery consumes an attempt and
  the next `claim` reclaims the job (never silently lost).
- Failures retry with exponential backoff (1 s doubling, capped at 30 s) until
  `maxAttempts` (default 3), then fail terminally; handler options override
  request values. Every execution records a `jobs.job.<type>` span; retry and
  terminal outcomes log through `@ndigo/log`.
- `timeoutMs` aborts the handler's `AbortSignal` and settles the attempt as
  failed even when the handler ignores it.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

## Development

```bash
pnpm --filter @ndigo/jobs build:lib
pnpm --filter @ndigo/jobs test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
