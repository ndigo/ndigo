[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / StompBrokerOptions

# Interface: StompBrokerOptions

Options for [StompBroker](../classes/StompBroker.md).

## Properties

### authorize?

> `optional` **authorize?**: (`destination`, `action`, `session`) => `unknown`

Destination policy seam (SEC-4) — the fail-closed counterpart of the
`onMessage` routing seam. Consulted on SUBSCRIBE before any replay or
registration and on SEND before `onMessage`, for the live and the
transactional form alike (a transactional SEND is checked when it is
received, before it is buffered). Returning `false` fails closed:
ERROR + close `1008`, no receipt, no fan-out.

The two seams differ in contract: `onMessage` is *application
routing* — returning `false` suppresses the default fan-out, the SEND
still gets its RECEIPT, and the session stays open (the app owns
delivery); `authorize` is a *policy gate* — returning `false` denies
the frame outright and the connection closes.

#### Parameters

##### destination

`string`

##### action

`"subscribe"` \| `"send"`

##### session

[`SocketSession`](SocketSession.md)

#### Returns

`unknown`

***

### fanout?

> `optional` **fanout?**: [`SocketFanout`](SocketFanout.md)

Optional application-owned live transport; only `/topic/*` crosses nodes.

***

### maxBacklogBytes?

> `optional` **maxBacklogBytes?**: `number`

Global bound on retained backlog bytes across all `/queue/*`
destinations — the hard memory backstop regardless of destination
count or body size. Default `67108864` (64 MiB); oldest messages
(FIFO) are dropped past the cap. `0` disables.

***

### maxBacklogDestinations?

> `optional` **maxBacklogDestinations?**: `number`

Cap on distinct stored `/queue/*` destinations. The backlog retains
`queueBacklog` bodies per destination, so an unbounded destination
set is an unbounded memory sink. Default `1000`; the oldest
destination (and its backlog) is evicted when the map is full.
`0` disables the destination cap (not recommended — byte budget
below remains the backstop).

***

### maxHeaderBytes?

> `optional` **maxHeaderBytes?**: `number`

Cap on a frame's serialized header octets (REV-002) — names, values
and their separators/EOLs, on every non-ping inbound frame and on
programmatic `publish`/`sendToUser` headers. The header counterpart
of the body byte budgets: without it a peer could attach up to the
transport payload cap of headers per message. Exceeding it fails
closed (ERROR + close `1002`); a programmatic call throws a
`StompProtocolError`. Default `16384` (16 KiB); `0` disables.

***

### maxIdentifierLength?

> `optional` **maxIdentifierLength?**: `number`

Cap on the length of identifier-valued headers (`destination`, `id`,
`subscription`, `transaction`, `receipt`) on every non-ping frame
(SEC-2) — the transport payload cap is megabytes, far beyond any
legitimate identifier, and these values are retained as map keys.
A longer value fails closed (ERROR + close `1002`).
Default `1024` characters; `0` disables.

***

### maxReplayBytesPerSession?

> `optional` **maxReplayBytesPerSession?**: `number`

Per-session budget for `/queue` backlog replay **and** the live
deliveries buffered while a replay is in flight (COR-2/SEC-6). The
budget is cumulative per connection: re-subscribing re-materializes
the retained window, so without it one peer can force unbounded
replay work from its own traffic. Charged in body octets; exhausting
it fails closed (ERROR + close `1013`).
Default `16777216` (16 MiB); `0` disables.

***

### maxSubscriptionsPerSession?

> `optional` **maxSubscriptionsPerSession?**: `number`

Cap on subscriptions per session. A client could otherwise register
unbounded (sub-id, destination) bindings, each a live map entry.
Default `1000`; SUBSCRIBE past the cap fails closed (ERROR + close).

***

### maxTransactionBytes?

> `optional` **maxTransactionBytes?**: `number`

Cap on cumulative buffered body bytes per transaction (the real
memory cost — ops are body-sized, up to the transport's payload
cap). Default `16777216` (16 MiB). SEND past the cap fails closed.

***

### maxTransactionOps?

> `optional` **maxTransactionOps?**: `number`

Cap on buffered ops per transaction. Default `1000`.

***

### maxTransactionsPerSession?

> `optional` **maxTransactionsPerSession?**: `number`

Cap on concurrent open transactions per session (D7 memory bound):
each holds buffered ops with full bodies until COMMIT/ABORT.
Default `8`; BEGIN past the cap fails closed.

***

### maxUnacked?

> `optional` **maxUnacked?**: `number`

Bound on tracked unacked messages per subscription (D9). FIFO
eviction past the bound (the in-memory bound that keeps NACK
honest without a store). Default `1000`; `0` disables tracking
(acks become accepted no-ops).

***

### maxUnackedBytes?

> `optional` **maxUnackedBytes?**: `number`

Per-subscription bound on tracked unacked **body octets** (SEC-5) —
the byte counterpart of `maxUnacked`, so a slow reader cannot pin
`maxUnacked` × body-size memory on one binding. Oldest-first
eviction past the bound. Default `1048576` (1 MiB); `0` disables.

***

### maxUnackedSessionBytes?

> `optional` **maxUnackedSessionBytes?**: `number`

Per-session bound on tracked unacked body octets across every
subscription of one connection (SEC-5) — `maxSubscriptionsPerSession`
× `maxUnackedBytes` would otherwise be retainable from a single
peer. Exceeding it evicts the session's globally oldest tracked
delivery (monotonic delivery tags make the oldest knowable), exactly
like the count guard. Default `16777216` (16 MiB); `0` disables.

***

### nextMessageId?

> `optional` **nextMessageId?**: () => `string`

Message-id factory (tests); default `crypto.randomUUID()`.

#### Returns

`string`

***

### onMessage?

> `optional` **onMessage?**: (`destination`, `body`, `headers`, `session`) => `unknown`

Application routing seam for SEND frames. Invoked with the frame's
destination/body/headers and the sending session. Return `false` to
suppress the default fan-out to the destination's subscribers.

#### Parameters

##### destination

`string`

##### body

[`StompBody`](../type-aliases/StompBody.md)

##### headers

`Record`\<`string`, `string`\>

##### session

[`SocketSession`](SocketSession.md)

#### Returns

`unknown`

***

### queueBacklog?

> `optional` **queueBacklog?**: `number`

Bound on the stored backlog per `/queue/<name>` destination (D11).
New subscribers replay the backlog. Default `1000`; `0` disables
storage (then `/queue` behaves like `/topic`).

***

### queueStore?

> `optional` **queueStore?**: [`QueueMessageStore`](QueueMessageStore.md) \| `null`

The persistence layer for `/queue` backlogs — the swap-in seam for
durable queues. Defaults to an `InMemoryQueueMessageStore` built from
the backlog caps above (`queueBacklog`, `maxBacklogDestinations`,
`maxBacklogBytes`); every `/queue` append is written through the
store, so a libsql (or Redis, post-1.0) implementation can replace
it without broker changes. `null` disables the persistence layer
(live delivery and replay continue off the in-memory structure).
Receipts still mean "broker accepted" — "persisted" waits for the
store-read phase (AD-24 receipt decision).

***

### resolveUser?

> `optional` **resolveUser?**: (`session`) => `string` \| `null`

Principal resolution for `/user` destinations (D10). Default reads
`session.attributes.user` (a string); the adapter's `authenticate`
hook populates attributes (AD-21). A session that resolves to
`null` cannot bind `/user/*` subscriptions (ERROR + close 1008) and
its SEND to `/user/*` is rejected.

#### Parameters

##### session

[`SocketSession`](SocketSession.md)

#### Returns

`string` \| `null`

***

### retention?

> `optional` **retention?**: `object`

`/queue` history window (the message-history feature): retained
`ttlMs`-old messages are pruned, and `maxMessages` bounds both the
durable retention AND the subscribe-replay window (newest `N`).
Enforced through the store (`prune` on append and before replay) —
backend-agnostic. Defaults: keep messages per `queueBacklog`, no
TTL. `0` disables a dimension.

#### maxMessages?

> `optional` **maxMessages?**: `number`

#### ttlMs?

> `optional` **ttlMs?**: `number`

***

### verifyCredentials?

> `optional` **verifyCredentials?**: (`login`, `passcode`, `session`) => `unknown`

Credential verifier for CONNECT `login`/`passcode` (SEC-7). Invoked
with the two header values (empty string when absent) and the
connecting session; a falsy result (or a rejected promise) fails the
handshake closed — ERROR + close `1008`. While no verifier is
configured, a CONNECT that carries credentials is rejected the same
way: the broker never pretends to have checked them.

#### Parameters

##### login

`string`

##### passcode

`string`

##### session

[`SocketSession`](SocketSession.md)

#### Returns

`unknown`
