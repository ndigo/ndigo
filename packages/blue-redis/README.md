# @blue/redis

> Node-only standalone Redis connections, namespaced shared cache adapters, and live WebSocket/STOMP fan-out for BlueJS.

Standalone Redis for BlueJS: an explicit connection foundation
(`RedisConnection`), cache adapters that share that connection (`RedisCache`,
`RedisCacheManager`), a cross-node socket transport (`RedisSocketFanout`),
and a durable job driver (`RedisJobDriver`) with atomic claims.
The default framework cache remains
`MemoryCacheManager`; installing this package never connects to Redis or
changes auto-configuration.

## Installation

```bash
pnpm add @blue/redis @blue/cache @blue/factory
# Socket fan-out additionally needs the capability contract:
pnpm add @blue/socket
# The job driver additionally needs the jobs contract:
pnpm add @blue/jobs
# The lock driver additionally needs the locks contract:
pnpm add @blue/locks
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11, plus a
standalone Redis server (integration tests run against 7.2). The package
ships five entry points:

| Entry point          | Exports                             | Optional peers                 |
| -------------------- | ----------------------------------- | ------------------------------ |
| `@blue/redis`        | `RedisConnection` (foundation only) | —                              |
| `@blue/redis/cache`  | `RedisCache`, `RedisCacheManager`   | `@blue/cache`, `@blue/factory` |
| `@blue/redis/pubsub` | `RedisSocketFanout`                 | `@blue/socket`                 |
| `@blue/redis/jobs`   | `RedisJobDriver`                    | `@blue/jobs`                   |
| `@blue/redis/locks`  | `RedisLockDriver`                   | `@blue/locks`                  |

The base dependency is pinned to `@redis/client` 6.3.0. No Redis modules,
cluster/sentinel topology or scheduler are provided. The root export loads
only the Redis foundation, not the capability contracts.

## Getting Started

```ts
import { RedisCacheManager } from '@blue/redis/cache';
import { CacheMiss } from '@blue/cache';

const manager = new RedisCacheManager({
    url: process.env.REDIS_URL!, // explicit redis:// or rediss://; never a localhost default
    namespace: 'my-app:production',
    defaults: { defaultTtl: 60_000 },
});
await manager.connect();
const users = manager.getCache<{ name: string }>('users'); // synchronous local lookup
await users.set('42', { name: 'Ada' }, 30_000);
const user = await users.get('42');
if (user !== CacheMiss.INSTANCE) console.log(user.name);
await users.delete('42');
await manager.close(); // stop producers first, then await drain and socket shutdown
```

Two managers with the same namespace/cache name observe the same backend
data. `getCache(ContextToken<Cache<V>>)` uses the token description as the
name, exactly as the string form does. `hasCache` only checks the local
acquired-handle registry; it does not inspect Redis. Neither manager lookup
performs I/O. All cache data operations return promises, including `size()`.

## Usage

### Shared cache

The manager is a local named-handle registry over shared Redis data.
`RedisCache` accepts a shared `RedisConnection` plus `{ namespace, cacheName,
defaultTtl? }`; it does not own or close the connection, and closing the
connection invalidates every handle using it. `RedisCacheManager.close()` is
idempotent (the same promise), immediately rejects new work, drains operations
accepted by this wrapper, and closes only internally created clients.

### Live WebSocket/STOMP fan-out

```ts
import { RedisConnection } from '@blue/redis';
import { RedisSocketFanout } from '@blue/redis/pubsub';
import { StompBroker } from '@blue/socket';
import { HTTPServer, NodeSocketSessionRegistry } from '@blue/platform-node';

const url = process.env.REDIS_URL!;
const publisher = new RedisConnection({ url });
const fanout = new RedisSocketFanout({
    connection: publisher, // borrowed by fanout; owner closes it
    subscriberUrl: url, // separate owned subscriber, never the command socket
    namespace: 'my-app.production',
});
const registry = new NodeSocketSessionRegistry({ fanout });
const broker = new StompBroker({ fanout });
// dispatcher is your existing NodeDispatcher; endpoint handlers use this broker.
const server = new HTTPServer(dispatcher, { socketRegistry: registry });
await publisher.connect();
await fanout.connect();
await registry.connect();
await broker.connect();
await server.start();
await registry.broadcastTo('lobby', 'hello');
await broker.publish('/topic/chat', new Uint8Array([0, 1, 255]));
```

Stop producers and serving first, then await registry/broker `close()`
(consumer unsubscribe), `fanout.close()` (unsubscribe and owned subscriber
close), and `publisher.close()` in that order, before synchronous
`context.close()`. Use `try`/`finally` so a failure does not skip later
resource cleanup; startup failure also requires cleanup. Closing the fanout
never closes its borrowed publisher. There is no automatic bean registration
or Redis auto-configuration.

The transport-neutral `SocketFanout` contract has
`subscribe(scope, receive): Promise<() => Promise<void>>` and
`publish(scope, { key, body, headers? }): Promise<void>`, where scopes are
`path | room | topic`, body is `string | Uint8Array`, and headers are string
records. A transport allows one consumer per scope; one registry and one
broker can share it. Additional consumers of the same scope need separate
transports. The registry crosses paths/rooms, and the broker crosses only
`/topic/*`. Socket membership, `/queue/*`, `/user/*`, broker MESSAGE/ACK IDs
and queue-store persistence/replay remain local/separate.

Publish resolves on backend acceptance, not peer delivery. Random origins
suppress own Redis echo, followed by one local delivery by the consumer.
Redis Pub/Sub is live at-most-once: no replay, reconnect, offline buffering,
global ordering or exactly-once guarantee. Subscriber/publisher outages reject
before local delivery, never silently downgrade to local-only; inbound STOMP
SEND publish faults send ERROR then close `1011`. Construct/connect
replacement resources after failure. Malformed inbound envelopes are dropped
and observable through `lastDecodeError` (and through `lastError` when they are
the most recent failure); invalid outbound envelopes reject before Redis I/O.

Nodes must agree on namespace and version-1 envelope schema. Namespace is
1–128 ASCII characters matching `[A-Za-z0-9][A-Za-z0-9._-]*`; unlike cache
namespaces it cannot contain `:`. Channels are
`blue:socket:<namespace>:<scope>`. `maxMessageBytes` defaults to 1,048,576
bytes of the complete UTF-8 JSON envelope, including base64 expansion of
binary bodies and headers. Keys are 1–1024 characters; at most 128 headers,
each with a 1–1024-character name and a string value of at most 8192
characters. `connectTimeout` is the subscriber connection timeout (default 10
seconds). Use trusted Redis access, channel ACLs for
PUBLISH/SUBSCRIBE/UNSUBSCRIBE plus handshake commands, and `rediss://` for
remote TLS. Namespace isolation is not authorization.

Fan-out messages carry **no authenticity or integrity**: the `origin` marker
only excludes a node from re-delivering its own messages — any publisher that
can reach the namespace channels can inject arbitrary bodies consumers will
deliver. As with the cache, the authorization boundary is the Redis ACL, not
the payload.

### Connection ownership and shutdown

`RedisConnection({ url, connectTimeout? })` constructs but does not connect;
await `connect()` before operations. The timeout defaults to 10 seconds. Owned
clients use `disableOfflineQueue: true`, a 1,024-command queue cap and no
automatic reconnect. Startup failures reject `connect()`; the same connection
retains that rejection. After a socket outage, operations reject; explicitly
close the failed manager and construct/connect a new one. There is no retry or
memory fallback.

An application can pass `{ client }` instead of `{ url }`. The client must
already be ready, with default string replies, no client-side cache, no
`keyPrefix`, and standalone command semantics. The injected client is
**always borrowed**. Its owner controls connection/reconnect, credentials and
final shutdown. The wrapper observes `error` events, exposing the most recent
through `lastError` without logging them. New operations reject while the
borrowed client is not ready; already-issued commands retain its own
queue/reconnect policy. The application must not concurrently close a borrowed
client during adapter operations.

`close()` is idempotent (the same promise), immediately rejects new work,
drains operations accepted by this wrapper, and closes only internally created
clients. An existing borrowed client remains usable. `RedisCache` accepts a
shared `RedisConnection` plus `{ namespace, cacheName, defaultTtl? }`; it does
not own or close the connection. Closing the connection invalidates every
handle using it.

The synchronous application-context `close()` can initiate a close hook but
does **not** await async resource shutdown. Stop consumers and explicitly
`await manager.close()` **before** `context.close()`; no awaited container
drain is claimed. A hung command on a borrowed client follows that client's
policy and can prevent draining; its owner must set deadlines/abort or force
client shutdown.

Supply credentials through your application environment/secrets binding, not
source literals. Use `rediss://` for remote TLS deployments; neither URLs nor
passwords are logged by these adapters. Redis ACLs need GET, SET, DEL, EXISTS
and SCAN (plus node-redis connection-handshake commands). Namespace isolation
is not an authorization boundary: ACLs/network controls still belong to
deployment.

### Values, TTL, and namespace semantics

- Supported values: JSON null, booleans, strings, finite numbers other than
  negative zero, dense arrays and plain objects composed of these values;
  whole entry `undefined` has its own versioned tagged envelope. A miss is
  always `CacheMiss.INSTANCE`, never a decoded undefined.
- Nested undefined, bigint, functions, symbols/symbol properties, nonfinite
  numbers, negative zero, class instances (including Date/Map/Set), array
  subclasses, cycles, accessors, non-enumerable properties, sparse/extended
  arrays and structures deeper than 100 are rejected before a write. Shared
  non-cyclic references decode as independent JSON objects;
  prototypes/reference identity are not preserved. Arbitrary JS object
  round-tripping is not claimed.
- Invalid JSON, unknown envelope versions/tags, malformed envelope shapes and
  invalid decoded values reject `get` and `has`. Backend/type errors also
  reject; they are not misses. `size` counts live keys, not validated
  payloads, and `delete`/`clear` can remove corrupt entries.
- TTL is positive finite safe milliseconds. Fractions round **up** to the next
  millisecond. Omitted TTL uses the store default; with no default, an entry
  has no expiry. `0` is rejected. SET overwrites value and expiry atomically;
  overwriting through a handle with no default and no per-entry TTL removes
  the old expiry. Redis's server clock controls expiration, so expiry is
  shared across instances.
- Keys encode application/environment namespace, cache name and user key as
  independent UTF-16 hex components under `blue:cache:v1:`. Separators and
  Redis glob metacharacters cannot alias namespaces, even for lone surrogate
  strings. Use an explicit environment-qualified namespace and do not edit
  this keyspace with unrelated application code.
- `clear()` uses SCAN and DEL batches of at most 128 keys, never FLUSHDB or
  KEYS. `size()` deduplicates SCAN results and uses bounded EXISTS batches to
  exclude expired keys. SCAN COUNT is only a hint; Redis may return a larger
  page. Both operations scan the database, not an atomic snapshot. With no
  concurrent mutations, clear removes every key and size reports the live
  namespace count. Stop writers for stable bulk operations; keys added during
  scanning can remain, and values replaced during clear can be deleted.
  Single-key operations are atomic.
- There is **no per-cache maxSize/LRU/FIFO** option. Passing memory eviction
  configuration at runtime rejects. Bound user-controlled keyspaces through
  TTL and deployment capacity; Redis server maxmemory policy is global, not a
  cache contract. Eviction by the server naturally returns a miss afterward.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts) (`RedisConnection`); the `/cache` and `/pubsub`
entry points re-export the adapters listed above. See the [package
index](../../doc/README.md) for how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/redis build:lib
pnpm --filter @blue/redis test
```

### Live integration

The cache and pub/sub suites contain a live group that needs a disposable
standalone server. With Docker, for example:

```sh
docker run --rm --name blue-redis-proof -p 127.0.0.1:16387:6379 redis:7.2
# Another terminal, from the repository root:
BLUE_REDIS_TEST_URL=redis://127.0.0.1:16387 pnpm exec vitest run packages/blue-redis/test/cache.spec.ts
# After the run:
docker stop blue-redis-proof
```

Integration tests use unique namespaces, remove only their own data and close
every client. The live group is skipped when `BLUE_REDIS_TEST_URL` is absent;
a skipped group is **not** integration proof. The test ACL additionally needs
CLIENT ID/CLIENT KILL to exercise an actual socket outage. This package does
not launch, flush or own the server configured by the environment.

## See Also

- [Guide 16 — Persistence & Distributed Backends](../../docs/guides/16-persistence-and-distributed-backends.md)
- [@blue/cache](../blue-cache/README.md) — the cache contracts (`Cache`, `CacheMiss`, `CacheManager`) these adapters implement
- [@blue/socket](../blue-socket/README.md) — the `SocketFanout` contract and the STOMP broker/registry the fan-out plugs into

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
