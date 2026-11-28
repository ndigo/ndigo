/**
 * STOMP server broker — endpoint state machine + destination fan-out
 * (second wave D7–D11).
 *
 * A `STOMPBroker` instance owns a destination namespace: `handleSocket`
 * runs the STOMP 1.2 endpoint protocol over one `SocketSession` (CONNECT
 * negotiation, SUBSCRIBE/UNSUBSCRIBE, SEND, ACK/NACK, transactions,
 * receipts, ERROR + close on violations), `publish`/`sendToUser` fan out
 * from anywhere (scheduler → broker, HTTP → broker — the
 * reachability pattern), and `closeAll` terminates every tracked
 * connection.
 *
 * Semantics:
 * - Destinations are broker state, not rooms — MESSAGE frames carry the
 *   subscriber's own `subscription` id, so two subscriptions to one
 *   destination on the same session stay distinct.
 * - SEND to a destination publishes to its subscribers, including the
 *   sender when subscribed (room-echo parity). An `onMessage` hook may
 *   intercept (return `false` to suppress the default fan-out).
 * - **Transactions**: BEGIN/COMMIT/ABORT with per-session buffers;
 *   SEND/ACK/NACK inside a transaction apply at COMMIT, receipts held
 *   until then, ABORT discards.
 * - **Ack tracking + redelivery**: `client`/`client-individual`
 *   modes track delivered-but-unacked messages (`maxUnacked`, plus the
 *   `maxUnackedBytes`/`maxUnackedSessionBytes` byte bounds — oldest-first
 *   eviction). `client` ACKs cumulatively (everything through the named
 *   message); `client-individual` removes exactly the named message and
 *   keeps the earlier obligations outstanding. NACK redelivers only the
 *   named message with `redelivered: true`.
 * - **MESSAGE `ack` header **: non-`auto` subscriptions carry
 *   `ack: <message-id>`, and ACK/NACK may name the message with the `id`
 *   header alone — the per-session delivery index resolves the owning
 *   subscription(s) (one id can be outstanding under several). A
 *   `subscription` header, when present, must name the sender's own
 *   subscription.
 * - **`/user` destinations**: principal-scoped subscriptions via
 *   `resolveUser`; `sendToUser` fans out to one user's scope; a client
 *   SEND to `/user/*` reaches only the sender's own scope.
 * - **`/queue` destinations**: bounded store-and-forward — a new
 *   subscriber is registered first, buffers live traffic while the backlog
 *   replay is in flight, then replays the backlog, flushes the buffered
 *   frames the replay did not already carry (deduped by `message-id`), and
 *   only then receives live traffic directly (`queueBacklog`).
 * - Heart-beat is negotiated off (`0,0`) — the registry ping/pong
 *   already owns liveness at the WS layer. Ping frames (bare newlines)
 *   are tolerated on inbound.
 * - The broker is isomorphic: it touches `SocketSession` contracts only,
 * never the transport. All protocol failures are fail-closed:
 *   ERROR frame (carrying `receipt-id` when the offending frame asked for
 *   one), then close — `1002` on per-frame violations (including an
 *   over-long identifier), `1008` on policy denials (missing `/user`
 *   identity, `authorize`/`verifyCredentials` rejection, exhausted replay
 *   budget), `1013` when the replay budget is exhausted, and `1011` when
 *   the `/queue` store faults on a SEND or a subscribe replay (STOMP 1.2
 *   §1.5: the server MUST close right after an ERROR frame).
 * - **Policy seams **: `authorize` gates SUBSCRIBE and SEND
 *   (fail-closed `1008`), `verifyCredentials` validates CONNECT
 *   `login`/`passcode` (fail-closed `1008`, and CONNECT credentials are
 *   rejected outright while no verifier is configured), and
 *   `maxIdentifierLength` caps every identifier-valued header.
 */
import type { SocketFanout } from './socket-fanout.js';
import type { SocketSession } from './socket-session.js';
import type { STOMPBody } from './stomp-frame.js';
import type { QueueMessageStore } from './message-store.js';

/** STOMP ack modes (STOMP 1.2 §1.3.1). */
export type STOMPAckMode = 'auto' | 'client' | 'client-individual';

/**
 * STOMPBrokerOptions.
 *
 * @example
 * ```ts
 * const value = {} as STOMPBrokerOptions;
 * ```
 */
export interface STOMPBrokerOptions {
    /** Optional application-owned live transport; only `/topic/*` crosses nodes. */
    fanout?: SocketFanout;
    /**
     * Application routing seam for SEND frames. Invoked with the frame's
     * destination/body/headers and the sending session. Return `false` to
     * suppress the default fan-out to the destination's subscribers.
     */
    onMessage?: (
        destination: string,
        body: STOMPBody,
        headers: Record<string, string>,
        session: SocketSession
    ) => unknown;
    /**
     * Message-id factory (tests); default `crypto.randomUUID()`.
     */
    nextMessageId?: () => string;
    /**
     * Principal resolution for `/user` destinations. Default reads
     * `session.attributes.user` (a string); the adapter's `authenticate`
     * hook populates attributes. A session that resolves to
     * `null` cannot bind `/user/*` subscriptions (ERROR + close 1008) and
     * its SEND to `/user/*` is rejected.
     */
    resolveUser?: (session: SocketSession) => string | null;
    /**
     * Bound on tracked unacked messages per subscription. FIFO
     * eviction past the bound (the in-memory bound that keeps NACK
     * honest without a store). Default `1000`; `0` disables tracking
     * (acks become accepted no-ops).
     */
    maxUnacked?: number;
    /**
     * Per-subscription bound on tracked unacked **body octets** —
     * the byte counterpart of `maxUnacked`, so a slow reader cannot pin
     * `maxUnacked` × body-size memory on one binding. Oldest-first
     * eviction past the bound. Default `1048576` (1 MiB); `0` disables.
     */
    maxUnackedBytes?: number;
    /**
     * Per-session bound on tracked unacked body octets across every
     * subscription of one connection — `maxSubscriptionsPerSession`
     * × `maxUnackedBytes` would otherwise be retainable from a single
     * peer. Exceeding it evicts the session's globally oldest tracked
     * delivery (monotonic delivery tags make the oldest knowable), exactly
     * like the count guard. Default `16777216` (16 MiB); `0` disables.
     */
    maxUnackedSessionBytes?: number;
    /**
     * Per-session budget for `/queue` backlog replay **and** the live
     * deliveries buffered while a replay is in flight. The
     * budget is cumulative per connection: re-subscribing re-materializes
     * the retained window, so without it one peer can force unbounded
     * replay work from its own traffic. Charged in body octets; exhausting
     * it fails closed (ERROR + close `1013`).
     * Default `16777216` (16 MiB); `0` disables.
     */
    maxReplayBytesPerSession?: number;
    /**
     * Cap on the length of identifier-valued headers (`destination`, `id`,
     * `subscription`, `transaction`, `receipt`) on every non-ping frame
     * — the transport payload cap is megabytes, far beyond any
     * legitimate identifier, and these values are retained as map keys.
     * A longer value fails closed (ERROR + close `1002`).
     * Default `1024` characters; `0` disables.
     */
    maxIdentifierLength?: number;
    /**
     * Cap on a frame's serialized header octets — names, values
     * and their separators/EOLs, on every non-ping inbound frame and on
     * programmatic `publish`/`sendToUser` headers. The header counterpart
     * of the body byte budgets: without it a peer could attach up to the
     * transport payload cap of headers per message. Exceeding it fails
     * closed (ERROR + close `1002`); a programmatic call throws a
     * `STOMPProtocolError`. Default `16384` (16 KiB); `0` disables.
     */
    maxHeaderBytes?: number;
    /**
     * Credential verifier for CONNECT `login`/`passcode`. Invoked
     * with the two header values (empty string when absent) and the
     * connecting session; a falsy result (or a rejected promise) fails the
     * handshake closed — ERROR + close `1008`. While no verifier is
     * configured, a CONNECT that carries credentials is rejected the same
     * way: the broker never pretends to have checked them.
     */
    verifyCredentials?: (login: string, passcode: string, session: SocketSession) => unknown;
    /**
     * Destination policy seam — the fail-closed counterpart of the
     * `onMessage` routing seam. Consulted on SUBSCRIBE before any replay or
     * registration and on SEND before `onMessage`, for the live and the
     * transactional form alike (a transactional SEND is checked when it is
     * received, before it is buffered). Returning `false` fails closed:
     * ERROR + close `1008`, no receipt, no fan-out.
     *
     * The two seams differ in contract: `onMessage` is *application
     * routing* — returning `false` suppresses the default fan-out, the SEND
     * still gets its RECEIPT, and the session stays open (the app owns
     * delivery); `authorize` is a *policy gate* — returning `false` denies
     * the frame outright and the connection closes.
     */
    authorize?: (destination: string, action: 'subscribe' | 'send', session: SocketSession) => unknown;
    /**
     * Bound on the stored backlog per `/queue/<name>` destination.
     * New subscribers replay the backlog. Default `1000`; `0` disables
     * storage (then `/queue` behaves like `/topic`).
     */
    queueBacklog?: number;
    /**
     * Cap on subscriptions per session. A client could otherwise register
     * unbounded (sub-id, destination) bindings, each a live map entry.
     * Default `1000`; SUBSCRIBE past the cap fails closed (ERROR + close).
     */
    maxSubscriptionsPerSession?: number;
    /**
     * Cap on concurrent open transactions per session (D7 memory bound):
     * each holds buffered ops with full bodies until COMMIT/ABORT.
     * Default `8`; BEGIN past the cap fails closed.
     */
    maxTransactionsPerSession?: number;
    /**
     * Cap on buffered ops per transaction. Default `1000`.
     */
    maxTransactionOps?: number;
    /**
     * Cap on cumulative buffered body bytes per transaction (the real
     * memory cost — ops are body-sized, up to the transport's payload
     * cap). Default `16777216` (16 MiB). SEND past the cap fails closed.
     */
    maxTransactionBytes?: number;
    /**
     * Cap on distinct stored `/queue/*` destinations. The backlog retains
     * `queueBacklog` bodies per destination, so an unbounded destination
     * set is an unbounded memory sink. Default `1000`; the oldest
     * destination (and its backlog) is evicted when the map is full.
     * `0` disables the destination cap (not recommended — byte budget
     * below remains the backstop).
     */
    maxBacklogDestinations?: number;
    /**
     * Global bound on retained backlog bytes across all `/queue/*`
     * destinations — the hard memory backstop regardless of destination
     * count or body size. Default `67108864` (64 MiB); oldest messages
     * (FIFO) are dropped past the cap. `0` disables.
     */
    maxBacklogBytes?: number;
    /**
     * The persistence layer for `/queue` backlogs — the swap-in seam for
     * durable queues. Defaults to an `InMemoryQueueMessageStore` built from
     * the backlog caps above (`queueBacklog`, `maxBacklogDestinations`,
     * `maxBacklogBytes`); every `/queue` append is written through the
     * store, so a libsql (or Redis, post-1.0) implementation can replace
     * it without broker changes. `null` disables the persistence layer
     * (live delivery and replay continue off the in-memory structure).
     * Receipts still mean "broker accepted" — "persisted" waits for the
     * store-read phase (the receipt decision).
     */
    queueStore?: QueueMessageStore | null;
    /**
     * `/queue` history window (the message-history feature): retained
     * `ttlMs`-old messages are pruned, and `maxMessages` bounds both the
     * durable retention AND the subscribe-replay window (newest `N`).
     * Enforced through the store (`prune` on append and before replay) —
     * backend-agnostic. Defaults: keep messages per `queueBacklog`, no
     * TTL. `0` disables a dimension.
     */
    retention?: { ttlMs?: number; maxMessages?: number };
}
