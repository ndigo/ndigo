# @ndigo/rate-limit

> Fixed-window rate limiting for Node.js.

A route declares a budget with `@rateLimit({ limit, windowMs })` (the
decorator lives in `@ndigo/platform-node` beside the enforcing
`RateLimitInterceptor`); the **limiter holds the counters**. This package
owns the backend contract — `RateLimiter` — and the in-process reference
implementation. The shared-store driver is optional and owned by the
integration package: `@ndigo/redis` (`@ndigo/redis/rate-limit` —
`RedisRateLimiter`, AD-79).

## Installation

```bash
pnpm add @ndigo/rate-limit
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

Single node (default, zero config — `NodeAutoConfiguration` registers a
`FixedWindowRateLimiter` bean automatically):

```ts
import { FixedWindowRateLimiter } from '@ndigo/rate-limit';

const limiter = new FixedWindowRateLimiter();
const policy = { limit: 5, windowMs: 60_000 };
const result = await limiter.consume('203.0.113.7', policy);

if (result.allowed) {
    // …serve the request…
} else {
    // 429 + Retry-After (result.retryAfterMs) — see guide 11 §5
}
```

The SPI is **async** (AD-39): the in-process limiter resolves immediately,
a shared backend resolves over its network hop. All implementations share
one contract — the interceptor awaits it.

Multi node: register a `RedisRateLimiter` bean (see
[guide 16](../../docs/guides/16-persistence-and-distributed-backends.md));
every process counts against the **same** budgets.

## Usage

- `@rateLimit({ limit, windowMs })` — passive class/method metadata
  (method wins), enforced by `RateLimitInterceptor` (default-on in
  `NodeAutoConfiguration.handlerMapping`) as **429 + `Retry-After`**
  problem documents. Routes without metadata are untouched.
- The limiter key is the real client address: `NodeRequest.remoteAddress`,
  resolved through the trusted-proxy walk (AD-37) — the interceptor owns
  the key, the limiter owns the counters.

## API

The full API is at [`api/`](api/README.md). Primary exports:

- `RateLimiter` / `RateLimitPolicy` / `RateLimitResult` — the contract
  (`consume` accounts one request; `retryAfterMs` is the `Retry-After`
  basis).
- `FixedWindowRateLimiter` — the process-local default; bounded memory
  with deterministic oldest-bucket eviction (SEC-2).
- `validateRateLimitPolicy` — shared decoration/call-time validation.
- `likeRateLimiter` — structural guard for beans and options.
- `RATE_LIMITER` — the context token for bean resolution
  (`NodeAutoConfiguration.rateLimiter()` registers under it).

## Driver parity notes (AD-79)

- **One budget per (window, key)**, every backend. The window is part of
  the counter key, so two routes with different windows on the same client
  never share a budget — and `retryAfterMs` is the same exact window-reset
  value everywhere (Redis derives it from the key's TTL).
- **Fail-closed by default.** `RedisRateLimiter` rejects when the store is
  unreachable (the request fails with a platform error rather than passing
  unthrottled or looking like a 429); `onError: 'fail-open'` is the
  documented availability escape hatch and logs every allowance.
- **Per-process default = one bean.** `FixedWindowRateLimiter` state is
  per instance; the platform's single default mapping exports one bean, so
  one process shares one budget. More than one process — or multiple
  mappings with separate limiters — needs the Redis driver.

## Development

```bash
pnpm --filter @ndigo/rate-limit test    # vitest lane
pnpm --filter @ndigo/rate-limit build:lib
```

## Contributing

Follow the repository's [contributing guide](../../CONTRIBUTING.md); lint
checks run with `--deny-warnings` (the `!` non-null assertion is banned).

## License

ISC — see the repository license.
