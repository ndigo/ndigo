# @blue/redis-fanout — Blue Redis Fanout

> Two nodes, one cache, one board. Run the same app twice: the cache values are
> shared and the board's messages cross nodes over Redis — until you unset
> `BLUE_REDIS_URL`, at which point the identical code serves from memory and
> delivers to its own sockets only.

One small app that is honest about its backend. `GET /cache/:key` reads a value
held by [`@blue/redis/cache`](../../packages/blue-redis/README.md) — the entry
carries the instance id that produced it and a hit counter, so the same read on
the _other_ instance shows whose value it is and how many times both of you have
touched it. `WS /ws/board` is a broadcast board whose republished messages travel
through `RedisSocketFanout`, so a message sent to instance A arrives at the
sockets connected to instance B. `POST /board` publishes without a socket at all,
for scripted demos.

Nothing in the controllers branches on the mode: they use the `CacheManager`
contract and the socket registry. Only the backend composition root does — and
when `BLUE_REDIS_URL` is absent it builds the in-memory equivalents instead, with
the same object graph, the same routes, and the same payloads.

## Run

### Single node (no Redis)

```bash
cd apps/16-blue-redis-fanout && pnpm start
# listening on http://127.0.0.1:3160
```

The app reports `backend memory` and serves everything locally: the cache is this
process's memory, the board reaches this process's sockets. `GET /health` says so
in its `redis-fanout-backend` component.

### Two nodes + Redis

Start a disposable standalone Redis 7 (any of these):

```bash
redis-server --port 6379
# or
docker run --rm -p 6379:6379 redis:7-alpine
```

Then run the app twice, in two terminals, with the same `BLUE_REDIS_URL`:

```bash
# terminal 1
PORT=3160 BLUE_REDIS_URL=redis://127.0.0.1:6379 pnpm start
# terminal 2
PORT=3161 BLUE_REDIS_URL=redis://127.0.0.1:6379 pnpm start
```

Both report `backend redis (namespace blue-redis-fanout.local)`; the instance id
is `<host>:<port>` unless you set `BLUE_INSTANCE_ID`. The two nodes must agree on
`BLUE_REDIS_NAMESPACE` (default `blue-redis-fanout.local`) — that is the cache
namespace _and_ the fan-out channel namespace.

A message posted on one node reaches the sockets of the other; the commands
below are the whole demonstration.

## Endpoints

```text
GET  /health       backend status: { status, components["redis-fanout-backend"] } —
                   mode (redis|memory), connected, instanceId, namespace (the boot probe)
GET  /cache/:key   the shared entry: { key, value, hits, producer, servedBy, mode, … }
                   ?value=<text> seeds the value on the first write only
POST /board        {"text":"…"} (or ?text=…) → 202 { posted, localClients, instanceId, mode }
WS   /ws/board     the broadcast board: send text, receive { event, text, from, at }
```

`GET /cache/:key` returns `200` with the entry; `producer` is the instance that
created it, `servedBy` is the instance answering this read, and `hits` counts
every read of the entry (whichever instance served it) — the shared-state proof.
The read-modify-write is deliberately not atomic: it is a demo counter, not a
distributed one.

`POST /board` answers `202` with the published message and `localClients` — how
many sockets are attached to the instance that _accepted_ the request. With Redis
configured the fan-out is why a `0` here still means delivery. Bodies that are
empty or longer than 4096 characters are rejected with a `400` problem document;
the socket endpoint refuses the same messages to the sender alone (`board-error`)
and never publishes them.

## Demonstrate it with curl

Redis mode, two nodes running (`3160` and `3161`):

```bash
A=http://127.0.0.1:3160
B=http://127.0.0.1:3161

# both nodes see the same backend
curl -s $A/health | jq -c '.components["redis-fanout-backend"].details'
curl -s $B/health | jq -c '.components["redis-fanout-backend"].details'

# the shared cache: A writes, B reads back A's entry and bumps the counter
curl -s "$A/cache/first-write?value=written-by-a" | jq -c '{value, hits, producer, servedBy, mode}'
curl -s "$B/cache/first-write" | jq -c '{value, hits, producer, servedBy, mode}'

# cross-node fan-out: listen on B, post on A — the message arrives at B
# (in a third terminal)
node --input-type=module -e '
  const socket = new WebSocket("ws://127.0.0.1:3161/ws/board");
  socket.onmessage = (event) => { console.log(event.data); socket.close(); };
'
# then, in the first terminal:
curl -s -X POST $A/board -H 'content-type: application/json' \
  -d '{"text":"hello from node A"}' | jq -c '{posted, localClients}'
```

The same session, run for real on ports 3160/3161 (`Ferrix` is the host name the
instance ids derive from; the app's own `start` script serves both nodes):

```console
$ curl -s http://127.0.0.1:3160/health | jq -c '.components["redis-fanout-backend"]'
{"status":"UP","details":{"mode":"redis","connected":true,"instanceId":"Ferrix:3160","namespace":"blue-redis-fanout.local","cacheName":"fanout-values"}}

$ curl -s http://127.0.0.1:3161/health | jq -c '.components["redis-fanout-backend"].details'
{"mode":"redis","connected":true,"instanceId":"Ferrix:3161","namespace":"blue-redis-fanout.local","cacheName":"fanout-values"}

$ curl -s 'http://127.0.0.1:3160/cache/first-write?value=written-by-a' | jq -c '{value, hits, producer, servedBy, mode}'
{"value":"written-by-a","hits":1,"producer":"Ferrix:3160","servedBy":"Ferrix:3160","mode":"redis"}

$ curl -s http://127.0.0.1:3161/cache/first-write | jq -c '{value, hits, producer, servedBy, mode}'
{"value":"written-by-a","hits":2,"producer":"Ferrix:3160","servedBy":"Ferrix:3161","mode":"redis"}

$ curl -s -X POST http://127.0.0.1:3160/board -H 'content-type: application/json' \
    -d '{"text":"hello from node A"}' | jq -c '{posted, localClients, mode}'
{"posted":{"event":"board-message","text":"hello from node A","from":"Ferrix:3160","at":"2026-10-07T15:38:08.843Z"},"localClients":0,"mode":"redis"}

# ...and the client connected to node B (ws://127.0.0.1:3161/ws/board) printed:
[recv] {"event":"board-message","text":"hello from node A","from":"Ferrix:3160","at":"2026-10-07T15:38:08.843Z"}
[recv] {"event":"board-message","text":"socket hello from node A","from":"Ferrix:3160","at":"2026-10-07T15:38:09.278Z"}
```

Read that middle line closely: node A answered `localClients: 0` — nobody was
connected to A at all — and the message still arrived, because node B's sockets
are in the same room on the other side of Redis. The second frame is the socket
path: a client connected to A sent text, and B's client received it too.

### The fallback (no Redis)

```console
$ cd apps/16-blue-redis-fanout && pnpm start        # no BLUE_REDIS_URL
[INFO] [blue-redis-fanout] instance Ferrix:3160, backend memory (namespace blue-redis-fanout.local)
[INFO] [blue-redis-fanout] no BLUE_REDIS_URL: single-node mode — cache and board are local to this process

$ curl -s http://127.0.0.1:3160/health | jq -c '.components["redis-fanout-backend"]'
{"status":"UP","details":{"mode":"memory","connected":true,"instanceId":"Ferrix:3160","namespace":"blue-redis-fanout.local","cacheName":"fanout-values"}}

$ curl -s 'http://127.0.0.1:3160/cache/demo' | jq -c '{value, hits, producer, servedBy, mode}'
{"value":"value-for-demo-9ab1a1f5","hits":1,"producer":"Ferrix:3160","servedBy":"Ferrix:3160","mode":"memory"}

$ curl -s -X POST http://127.0.0.1:3160/board -H 'content-type: application/json' \
    -d '{"text":"local only"}' | jq -c '{posted, localClients, mode}'
{"posted":{"event":"board-message","text":"local only","from":"Ferrix:3160","at":"2026-10-07T15:35:35.498Z"},"localClients":1,"mode":"memory"}

# a client connected to that same node (ws://127.0.0.1:3160/ws/board) printed:
[recv] {"event":"board-message","text":"local only","from":"Ferrix:3160","at":"2026-10-07T15:35:35.498Z"}
```

Same routes, same payloads, `mode: "memory"` in the reports, and `localClients`
now counts the only clients that can possibly receive the message.

## Demonstrates

- **`@blue/redis`** — an explicit `RedisConnection` (the publisher), a
  `RedisSocketFanout` that borrows it and owns its own subscriber, and the
  connection-ownership rules that go with them: the fan-out never closes the
  borrowed publisher, the cache manager owns its own connection, and each is
  closed by the object that created it (`src/fanout-backend.ts`).
- **`@blue/socket` / `@blue/platform-node`** — the `SocketFanout` contract plugged
  into `NodeSocketSessionRegistry`, which `HTTPServer` resolves as its adapter's
  registry (the app overrides the `socketSessionRegistry` bean in
  `src/redis-fanout-configuration.ts`; last-write-wins is the documented seam).
  Room membership stays local; only serialized payloads cross Redis.
- **`@blue/cache`** — one `CacheManager` contract, two implementations
  (`RedisCacheManager` and `MemoryCacheManager`), so the cache route never
  branches on the mode. Cached values are plain objects, round-tripped by the
  adapter's codec.
- **Clean single-node degradation** — no Redis configured means an in-memory
  manager and a fan-out-less registry: the same code, local-only delivery, and a
  `/health` document that says which mode you are in.
- **Fail-loud startup** — a _configured_ but unreachable Redis rejects at
  `connect()` before the server starts. There is no retry and no silent
  fallback: a node that cannot reach its fan-out must not pretend to be
  single-node, because its peers would still be publishing into the shared room.

    ```console
    $ PORT=3160 BLUE_REDIS_URL=redis://127.0.0.1:6399 pnpm start
    [ERROR] [blue-redis-fanout] failed to start: connect ECONNREFUSED 127.0.0.1:6399 {}
    $ echo $?
    1
    ```

- **Shutdown ordering** — the server stops first, then the registry (unsubscribe),
  then the fan-out (owned subscriber), then the borrowed publisher, then the cache
  manager; `gracefulShutdown` runs that list in order before the synchronous
  `context.close()`.

The wiring in one place (`src/fanout-backend.ts`):

```ts
// connect(): publisher → subscriber → cache → registry subscriptions
await this.#connection?.connect();
await this.fanout?.connect();
await this.#redisCache?.connect();
await this.registry.connect(); // subscribes path + room; refuses to publish before this
```

## Tests

```bash
pnpm --filter @blue/redis-fanout test
```

Three lanes:

| Lane                        | Needs Redis | Covers                                                                      |
| --------------------------- | ----------- | --------------------------------------------------------------------------- |
| `test/http-surface.spec.ts` | no          | `/health`, the shared cache route, `POST /board` (body and `?text=`), 400s  |
| `test/socket-flow.spec.ts`  | no          | a real server, two clients, room echo, `POST /board` → sockets, refusals    |
| `test/live-redis.spec.ts`   | yes         | two nodes on one Redis: shared cache + cross-node fan-out (both directions) |

The two in-memory lanes are the contract: they must stay green with no Redis
configured (and in CI they run with `BLUE_REDIS_TEST_URL` set but
`BLUE_REDIS_URL` unset, so they exercise exactly that). The live lane is gated
the way the `@blue/redis` suites are:

```bash
docker run --rm --name blue-redis-fanout-proof -p 127.0.0.1:16379:6379 redis:7-alpine
# another terminal, from the repository root:
BLUE_REDIS_TEST_URL=redis://127.0.0.1:16379 pnpm exec vitest run apps/16-blue-redis-fanout/test/live-redis.spec.ts
docker stop blue-redis-fanout-proof
```

It is skipped, not passed, without `BLUE_REDIS_TEST_URL` — a skipped group is not
integration proof. The lane boots two full app stacks in one process (distinct
`BLUE_INSTANCE_ID`, ephemeral ports), uses a unique namespace per run, and leaves
nothing behind (entries carry the demo TTL).

## See Also

- [Guide 06 — WebSockets, Rooms, Broadcast, and STOMP](../../docs/guides/06-websockets.md) — the session registry, the fan-out seam
- [Guide 16 — Persistence & Distributed Backends](../../docs/guides/16-persistence-and-distributed-backends.md)
- [@blue/redis](../../packages/blue-redis/README.md) — the adapters this app composes
- [@blue/cache](../../packages/blue-cache/README.md), [@blue/socket](../../packages/blue-socket/README.md), [@blue/platform-node](../../packages/blue-platform-node/README.md)
- `apps/04-blue-api` — the same broadcast pattern single-node (`/ws/chat`)
- `apps/15-blue-resilience-lab` — the sibling single-process lab, and the health-indicator pattern this app reuses

## License

[ISC](../../LICENSE)
