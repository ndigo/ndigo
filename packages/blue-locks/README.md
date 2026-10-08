# @blue/locks

> Distributed locks with fencing tokens for Node.js.

A lock is a **lease**: acquiring sets a TTL, and the holder must finish (or
extend via `renew`) inside it. Every acquisition gets a fresh monotonic
**fencing token**, and only the handle holding the current token can renew or
release the lease — a stale holder (its lease expired, another node acquired)
can never interfere with a successor. That is the exact protection
`@scheduled({ lock })` needs across processes (AD-73).

## Installation

```bash
pnpm add @blue/locks
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

The durable backend is optional and owned by the integration package:
`@blue/redis` (`@blue/redis/locks` — `RedisLockDriver`).

## Getting Started

Single node (default, zero config):

```ts
import { InProcessLockDriver } from '@blue/locks';

const locks = new InProcessLockDriver();
const lease = await locks.acquire('payroll-window', { ttlMs: 30_000 });

if (lease === null) {
    // Another holder owns the lease — skip or wait (non-blocking contract).
} else {
    try {
        // …only one holder ever reaches this point…
    } finally {
        await lease.release(); // never leak the lease on a throw
    }
}
```

Multi node: register a `RedisLockDriver` bean (see [guide 23](../../docs/guides/23-distributed-locks.md)); the same code coordinates across processes.

## Usage

- `@scheduled({ lock: 'key' })` — the primary consumer: the runner acquires
  the named lock before each fire and releases it in the `finally`, so one
  node executes the schedule while others skip (contended fires are logged).
  Tune with `lockWait` / `lockWaitStep` / `lockTtl`.
- `NodeAutoConfiguration` registers a `lockDriver` bean automatically
  (in-process default; replace with the Redis driver for multi-node).

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports:

- `LockDriver` / `LockHandle` / `LockAcquireOptions` — the contract
  (`acquire` is non-blocking; `renew`/`release` are token-checked).
- `InProcessLockDriver` — the process-wide default.
- `likeLockDriver` — structural guard for beans and options.
- `LOCK_DRIVER` — the context token for bean resolution.

## Development

```bash
pnpm --filter @blue/locks test    # vitest lane
pnpm --filter @blue/locks build:lib
```

## Contributing

Follow the repository's [contributing guide](../../CONTRIBUTING.md); lint
checks run with `--deny-warnings` (the `!` non-null assertion is banned).

## License

ISC — see the repository license.
