# Guide 42 — STOMP & Cross-Node Fan-Out

STOMP 1.2 is the interoperable broker protocol layered over Ndigo's socket
contracts: destinations, subscriptions, transactions, receipts, `/user` and
`/queue` semantics, and the optional Redis fan-out for multi-node deployments.
The socket guide covers the transport, sessions, rooms, and the client; this
guide covers the protocol and the cross-node path.

**Audience:** Node and browser application developers · **Prerequisites:** Guides 15 and 21 · **Reference app:** `apps/05-ndigo-api`, `apps/16-ndigo-redis-fanout`

## What you'll learn

- Run a STOMP broker over the socket session contract.
- Use destinations, subscriptions, receipts, transactions, and ack modes.
- Apply `/user` scoping and bounded `/queue` store-and-forward.
- Add Redis fan-out and shut the resources down in order.
- Know the protocol's resource caps and deliberate limits.

## 1. The protocol layer

The same sessions speak the industry-standard STOMP 1.2 broker protocol:
destinations, subscriptions, receipts — interop with reference STOMP clients
(`SimpMessagingTemplate`), RabbitMQ/Artemis STOMP, and @stomp/stompjs
clients. It is a protocol layer over the socket contracts, so it is
isomorphic (`@ndigo/socket`) and transport-agnostic:

```ts
// server: a broker owns the destination namespace; the handler runs the
// protocol for each connection
const broker = new StompBroker();   // app-scoped bean

@stompMapping('/chat')
@parameters({ session: socketSessionValue('session') })
async chat(session: SocketSession) {
    await broker.handleSocket(session);   // CONNECT/SUBSCRIBE/SEND/ACK/RECEIPT
}

// any service: scheduler → destination (SimpMessagingTemplate parity)
@scheduled('*/2 * * * * *')
async tick() {
    await broker.publish('/topic/chat', JSON.stringify({ at: Date.now() }));
}
```

```ts
// client: STOMP over the isomorphic WebSocketClient
const stomp = new StompClient(new WebSocketClient('ws://host/stomp/chat'));
const sub = stomp.subscribe('/topic/chat');
for await (const message of sub.messages) {
    applyMessage(message.json());
}
await stomp.send('/topic/chat', { text: 'hello' }); // resolves on RECEIPT
```

Semantics: destinations are broker state, not registry rooms (MESSAGE
frames carry the subscriber's own `subscription` id — two subscriptions to
one destination on a session stay distinct); SEND fans out to subscribers
including the sender when subscribed; receipts answer every frame that
asks; heart-beat is negotiated off (`0,0`) because the registry ping/pong
already owns liveness. The second wave rounds out the protocol:

- **Transactions** — BEGIN/COMMIT/ABORT with per-session buffers: SEND/
 ACK/NACK frames inside a transaction apply atomically on COMMIT, receipts
 are held until then, ABORT discards. A frame on an unknown transaction
 fails closed.
- **Ack tracking + NACK redelivery** — ack modes `client` /
 `client-individual` track delivered-but-unacked messages per subscription.
 `client` ACKs are cumulative (everything up to the named message);
 `client-individual` ACKs exactly the named message — earlier unacked
 deliveries stay tracked and NACK-able. NACK redelivers the named message
 with `redelivered: true`. MESSAGE frames for these modes carry an `ack`
 header, so a spec-conforming client can ack with `id` alone (the
 `subscription` header is accepted too). Tracking is bounded by count
 (`maxUnacked`, default 1000), by bytes per subscription (`maxUnackedBytes`,
 default 1 MiB) and by bytes per session (`maxUnackedSessionBytes`, default
 16 MiB) — oldest-first eviction on every bound, so a slow acker cannot pin
 memory.
- **Binary bodies** — the codec and transports are byte-exact:
 `Uint8Array`/`ArrayBuffer` bodies flow as binary frames (headers always
 text); `content-length` is emitted for binary bodies. Text frames stay
 strings (`SocketSession`/`SocketClient` JSDoc updated).
- **`/user` destinations** — principal-scoped routing: subscribe
 `/user/queue/events`, then `broker.sendToUser('alice', '/queue/events',
 …)` delivers to that user's scope (user-destination parity).
 `resolveUser(session)` (default: `session.attributes.user`) binds the
 scope; a client SEND to `/user/*` reaches only the sender's own scope,
 and sessions with no resolved user cannot bind `/user/*` (1008).
- **`/queue` destinations** — bounded store-and-forward: every SEND/
 publish appends to the destination's backlog (`queueBacklog`, default
 1000, FIFO eviction), and a new subscriber replays the backlog before
 live traffic. `queueBacklog: 0` reduces the destination to live fan-out.
 Retention is further bounded globally: the number of distinct `/queue`
 destinations is capped (`maxBacklogDestinations`, default 1000 — the
 oldest destination is evicted whole, releasing its retained messages, its
 byte accounting **and its sequence entry**) and the retained bytes across
 all destinations are capped (`maxBacklogBytes`, default 64 MiB — oldest
 messages evicted first). Retained destination _keys_ are bounded by the
 same cap, so a client cannot grow the server's memory by SENDing to
 arbitrary `/queue/<name>` destinations; how much history one connection
 may pull back is bounded separately by `maxReplayBytesPerSession`
 (default 16 MiB, consumed by subscribe replays — exhaustion fails closed).
- **Durable-queue seam (store-read phase)** — the store is the single
 source of truth for `/queue`: every append persists through it and
 subscribe replay reads from it. The default is an
 `InMemoryQueueMessageStore` built from the backlog caps above;
 `LibSQLQueueMessageStore` from `@ndigo/orm-drizzle` provides durable storage
 through the broker's `queueStore` option. This is separate from live Redis
 fan-out, not a distributed queue — **a `RECEIPT` means
 "persisted"** for `/queue` destinations (the receipt follows the append; a
 store fault withholds it and fails closed with an `ERROR` frame followed
 by a `1011` close, per the STOMP rule that an ERROR is always followed by
 a close — the subscribe-replay path does the same).
- **Message history** — `broker.history('/queue/x', { limit, afterSeq })`
 reads the retained window (the same seam subscribe replay reads); the
 `retention: { ttlMs, maxMessages }` broker option bounds both durable
 retention and the subscribe-replay window (newest `N`, TTL-pruned before
 replay). Backend-agnostic: works identically on the in-memory store.
- **Resource caps** — the broker fails closed on client-driven growth:
 `maxSubscriptionsPerSession` (1000), `maxTransactionsPerSession` (8)
 with `maxTransactionOps` (1000) and `maxTransactionBytes` (16 MiB) per
 open transaction (SEND **and** ACK/NACK ops), `maxIdentifierLength`
 (1024 characters — destinations, subscription/transaction/receipt ids),
 the unacked byte bounds above, and `maxReplayBytesPerSession` (16 MiB).
 All caps fail closed per the protocol-error policy (ERROR + close on the
 violating frame). Transaction-buffered SENDs to `/user/*` ride the same
 principal-scope routing and policy check as live SENDs.
- **Policy seams** — `onMessage(destination, body, headers, session)` is the
 app-routing hook: return `false` to suppress the default fan-out (the
 frame still receipts — the app handled it). `authorize(destination,
 action, session)` is the _denial_ gate, consulted on SUBSCRIBE (before any
 replay) and on SEND in both the live and transactional paths; `false`
 fails closed with ERROR + close `1008`. `verifyCredentials(login,
 passcode, session)` validates CONNECT credentials — and a CONNECT that
 carries `login`/`passcode` with **no** verifier configured is rejected
 (fail closed) rather than silently trusting them.
- **Spec conformance** — the codec accepts `EOL = [CR] LF`, treats undefined
 header escapes as fatal, keeps the **first** of a repeated header, allows
 trailing EOLs after the terminating NUL, and rejects anything after them.
 A CONNECT without `accept-version` means STOMP 1.0 (negotiated as 1.0, not
 refused). User-defined SEND headers pass through to MESSAGE frames. An
 `ERROR` frame is always followed by a close (the stream is over when an
 ERROR arrives).

Still deferred: cross-node queue consumption/coordination and message history
beyond the configured retained window. Durable LibSQL `/queue` storage and
live Redis path/room/topic fan-out are implemented separately. `@stompMapping` paths negotiate the
`v12.stomp`/`v11.stomp`/`v10.stomp` WebSocket subprotocol on upgrade;
other socket paths keep the stock behavior. **STOMP over TCP is never** —
no consumer base (browsers and STOMP.js both use WebSocket), and
like SockJS it is a non-feature, not a gap.

## 2. Cross-node live fan-out (opt-in)

The memory/local default is unchanged. Compose external resources explicitly;
install `@ndigo/redis` and its `@ndigo/socket` capability peer. This example uses
an existing `NodeDispatcher` named `dispatcher` and an application context named
`context`; the endpoint controller must use this same `broker` for
`handleSocket(session)`, and room handlers use the server's shared registry:

```ts
import { RedisConnection } from '@ndigo/redis';
import { RedisSocketFanout } from '@ndigo/redis/pubsub';
import { StompBroker } from '@ndigo/socket';
import { HTTPServer, NodeSocketSessionRegistry } from '@ndigo/platform-node';

const url = process.env.REDIS_URL!; // explicit redis:// or rediss://
const publisher = new RedisConnection({ url });
const fanout = new RedisSocketFanout({
    connection: publisher,
    subscriberUrl: url, // adapter creates a separate owned subscriber
    namespace: 'my-app.production',
});
const registry = new NodeSocketSessionRegistry({ fanout });
const broker = new StompBroker({ fanout });
const server = new HTTPServer(dispatcher, { socketRegistry: registry });

await publisher.connect();
await fanout.connect();
await registry.connect(); // subscribes path + room
await broker.connect(); // subscribes topic
await server.start(); // serve only after subscriptions are ready

await registry.broadcast('/ws/chat', { event: 'notice' });
await registry.broadcastTo('lobby', new Uint8Array([0, 1, 255]));
await broker.publish('/topic/chat', 'hello', { kind: 'notice' });

// Stop scheduled/HTTP producers first; close all resources even if one fails.
try {
    await server.close();
} finally {
    try {
        await Promise.all([registry.close(), broker.close()]);
    } finally {
        try {
            await fanout.close();
        } finally {
            await publisher.close();
            context.close(); // synchronous: cannot await these resources for you
        }
    }
}
```

`HTTPServer`'s `socketRegistry` option passes this registry to its **default**
adapter; it does not register beans or discover the broker. Without that option,
the managed server resolves the `socketSessionRegistry` context bean. For a custom
adapter pass the registry to that adapter, not simultaneously to `HTTPServer`.
Startup failure also requires the same owner-managed cleanup before exiting.

One transport permits one consumer per scope: a registry owns `path`/`room`, a
broker owns `topic`. For additional registries/brokers on one node, compose
separate transports. Each node uses the same namespace and envelope schema.
Registry joins/counts and sockets stay local; only already-serialized text or
binary payloads cross Redis. Only STOMP `/topic/*` crosses nodes, including SEND
and transaction-applied topic SEND; `/queue/*` and `/user/*` remain local. Each
broker assigns its own MESSAGE/ACK IDs. Queue persistence/replay is independent.

Publishing resolves on Redis acceptance, **not** delivery to every client.
Random transport origins suppress the publisher's Redis echo; the consumer then
delivers locally once. Delivery is live at-most-once, with no reconnect, offline
queue, replay, global ordering or exactly-once guarantee. A closed/unready
publisher or subscriber rejects publication before local delivery; inbound
STOMP publish failure sends ERROR then closes `1011`. Replace and explicitly
connect failed resources rather than expecting retry or a local fallback.

Redis namespaces are 1–128 ASCII characters matching
`[A-Za-z0-9][A-Za-z0-9._-]*` (unlike cache namespaces, no colon). The default
`maxMessageBytes` is 1 MiB of the complete UTF-8 JSON envelope, including headers
and binary base64 overhead, not 1 MiB of raw body. Keys are 1–1024 characters;
headers have at most 128 entries, names 1–1024 characters and string values up
to 8192 characters. Malformed inbound envelopes are dropped and exposed through
`fanout.lastDecodeError` (and through `fanout.lastError` when they are the most
recent failure); invalid outbound envelopes reject before Redis I/O. Redis
access must be trusted: ACLs/network isolation (and `rediss://` remotely) protect
channels; a namespace is isolation convention, not authorization.

## See also

- [Guide 15 — WebSockets](15-websockets.md) — sessions, rooms, heartbeat, and the client
- [Guide 21 — Persistence & Shared Stores](21-persistence-and-shared-stores.md) — Redis ownership and shutdown
- [`@ndigo/socket`](../../packages/ndigo-socket/README.md) — broker, client, and STOMP surface
- [`@ndigo/redis`](../../packages/ndigo-redis/README.md) — the fan-out driver
- — the STOMP decision
