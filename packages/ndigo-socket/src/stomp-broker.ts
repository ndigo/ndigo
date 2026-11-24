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
 * - **Transactions (D7)**: BEGIN/COMMIT/ABORT with per-session buffers;
 *   SEND/ACK/NACK inside a transaction apply at COMMIT, receipts held
 *   until then, ABORT discards.
 * - **Ack tracking + redelivery (D9)**: `client`/`client-individual`
 *   modes track delivered-but-unacked messages (`maxUnacked`, plus the
 *   `maxUnackedBytes`/`maxUnackedSessionBytes` byte bounds — oldest-first
 *   eviction). `client` ACKs cumulatively (everything through the named
 *   message); `client-individual` removes exactly the named message and
 *   keeps the earlier obligations outstanding. NACK redelivers only the
 *   named message with `redelivered: true`.
 * - **MESSAGE `ack` header (COR-4)**: non-`auto` subscriptions carry
 *   `ack: <message-id>`, and ACK/NACK may name the message with the `id`
 *   header alone — the per-session delivery index resolves the owning
 *   subscription(s) (one id can be outstanding under several). A
 *   `subscription` header, when present, must name the sender's own
 *   subscription.
 * - **`/user` destinations (D10)**: principal-scoped subscriptions via
 *   `resolveUser`; `sendToUser` fans out to one user's scope; a client
 *   SEND to `/user/*` reaches only the sender's own scope.
 * - **`/queue` destinations (D11)**: bounded store-and-forward — a new
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
 * - **Policy seams (SEC-4/SEC-7)**: `authorize` gates SUBSCRIBE and SEND
 *   (fail-closed `1008`), `verifyCredentials` validates CONNECT
 *   `login`/`passcode` (fail-closed `1008`, and CONNECT credentials are
 *   rejected outright while no verifier is configured), and
 *   `maxIdentifierLength` caps every identifier-valued header.
 */
import { InMemoryQueueMessageStore, type QueueMessageStore, type StoredQueueMessage } from './message-store';
import type { STOMPBody } from './stomp-frame';
import type { SocketSession } from './socket-session';
import type { SocketFanout } from './socket-fanout';
import { STOMPFanout } from './_stomp-fanout';
import { STOMPLimits } from './_stomp-limits';
import { STOMPTransactionManager } from './_stomp-transactions';
import { STOMPSubscriptionRegistry } from './_stomp-subscriptions';
import { STOMPEndpoint } from './_stomp-endpoint';
import { STOMPDelivery } from './_stomp-delivery';
import { controlSend, fail, receipt } from './_stomp-replies';

/** STOMP ack modes (STOMP 1.2 §1.3.1). */

/** Default bound on unacked-message tracking per subscription (D9). */
const DEFAULT_MAX_UNACKED = 1000;
/** Default per-destination `/queue` backlog bound (D11). */
const DEFAULT_QUEUE_BACKLOG = 1000;
/** Default cap on subscriptions per session (client-driven fan-out bound). */
const DEFAULT_MAX_SUBSCRIPTIONS_PER_SESSION = 1000;
/** Default cap on open transactions per session (D7 memory bound). */
const DEFAULT_MAX_TRANSACTIONS_PER_SESSION = 8;
/** Default cap on buffered ops per transaction (D7 memory bound). */
const DEFAULT_MAX_TRANSACTION_OPS = 1000;
/** Default cap on buffered body bytes per transaction (D7 memory bound). */
const DEFAULT_MAX_TRANSACTION_BYTES = 16 * 1024 * 1024;
/** Default cap on distinct stored `/queue/*` destinations (D11 memory bound). */
const DEFAULT_MAX_BACKLOG_DESTINATIONS = 1000;
/** Default global bound on stored backlog bytes across all `/queue/*` destinations. */
const DEFAULT_MAX_BACKLOG_BYTES = 64 * 1024 * 1024;
/** Default cap on a protocol identifier's length in characters (SEC-2). */
const DEFAULT_MAX_IDENTIFIER_LENGTH = 1024;
/**
 * Default cap on a frame's serialized header octets (REV-002) — the header
 * counterpart of the body byte budgets. The transport payload cap is
 * megabytes, so without this a frame could carry ~1 MiB of headers per
 * body octet. Default `16384` (16 KiB); `0` disables.
 */
const DEFAULT_MAX_HEADER_BYTES = 16 * 1024;
/** Default per-subscription bound on tracked unacked body octets (SEC-5). */
const DEFAULT_MAX_UNACKED_BYTES = 1024 * 1024;
/** Default per-session bound on tracked unacked body octets (SEC-5). */
const DEFAULT_MAX_UNACKED_SESSION_BYTES = 16 * 1024 * 1024;
/** Default per-session budget for backlog replay + replay-time live buffering (SEC-6). */
const DEFAULT_MAX_REPLAY_BYTES_PER_SESSION = 16 * 1024 * 1024;

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
     * Principal resolution for `/user` destinations (D10). Default reads
     * `session.attributes.user` (a string); the adapter's `authenticate`
     * hook populates attributes. A session that resolves to
     * `null` cannot bind `/user/*` subscriptions (ERROR + close 1008) and
     * its SEND to `/user/*` is rejected.
     */
    resolveUser?: (session: SocketSession) => string | null;
    /**
     * Bound on tracked unacked messages per subscription (D9). FIFO
     * eviction past the bound (the in-memory bound that keeps NACK
     * honest without a store). Default `1000`; `0` disables tracking
     * (acks become accepted no-ops).
     */
    maxUnacked?: number;
    /**
     * Per-subscription bound on tracked unacked **body octets** (SEC-5) —
     * the byte counterpart of `maxUnacked`, so a slow reader cannot pin
     * `maxUnacked` × body-size memory on one binding. Oldest-first
     * eviction past the bound. Default `1048576` (1 MiB); `0` disables.
     */
    maxUnackedBytes?: number;
    /**
     * Per-session bound on tracked unacked body octets across every
     * subscription of one connection (SEC-5) — `maxSubscriptionsPerSession`
     * × `maxUnackedBytes` would otherwise be retainable from a single
     * peer. Exceeding it evicts the session's globally oldest tracked
     * delivery (monotonic delivery tags make the oldest knowable), exactly
     * like the count guard. Default `16777216` (16 MiB); `0` disables.
     */
    maxUnackedSessionBytes?: number;
    /**
     * Per-session budget for `/queue` backlog replay **and** the live
     * deliveries buffered while a replay is in flight (COR-2/SEC-6). The
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
     * (SEC-2) — the transport payload cap is megabytes, far beyond any
     * legitimate identifier, and these values are retained as map keys.
     * A longer value fails closed (ERROR + close `1002`).
     * Default `1024` characters; `0` disables.
     */
    maxIdentifierLength?: number;
    /**
     * Cap on a frame's serialized header octets (REV-002) — names, values
     * and their separators/EOLs, on every non-ping inbound frame and on
     * programmatic `publish`/`sendToUser` headers. The header counterpart
     * of the body byte budgets: without it a peer could attach up to the
     * transport payload cap of headers per message. Exceeding it fails
     * closed (ERROR + close `1002`); a programmatic call throws a
     * `STOMPProtocolError`. Default `16384` (16 KiB); `0` disables.
     */
    maxHeaderBytes?: number;
    /**
     * Credential verifier for CONNECT `login`/`passcode` (SEC-7). Invoked
     * with the two header values (empty string when absent) and the
     * connecting session; a falsy result (or a rejected promise) fails the
     * handshake closed — ERROR + close `1008`. While no verifier is
     * configured, a CONNECT that carries credentials is rejected the same
     * way: the broker never pretends to have checked them.
     */
    verifyCredentials?: (login: string, passcode: string, session: SocketSession) => unknown;
    /**
     * Destination policy seam (SEC-4) — the fail-closed counterpart of the
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
     * Bound on the stored backlog per `/queue/<name>` destination (D11).
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

/**
 * STOMP 1.2 broker — transport-agnostic, one instance per destination
 * namespace (app-scoped entry).
 *
 * @example
 * ```ts
 * const broker = new STOMPBroker();
 * @requestMapping('/stomp')
 * class ChatController {
 *     @stompMapping('/chat')
 *     @parameters({ session: socketSessionValue('session') })
 *     async chat(session: SocketSession) {
 *         await broker.handleSocket(session);
 *     }
 *     @scheduled('0/3 * * * * *')
 *     tick() { broker.publish('/topic/chat', JSON.stringify({ at: Date.now() })); }
 * }
 * ```
 */
export class STOMPBroker {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "STOMPBroker".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object STOMPBroker]"
     */
    get [Symbol.toStringTag](): string {
        return 'STOMPBroker';
    }

    readonly #onMessage: STOMPBrokerOptions['onMessage'] | null;
    readonly #nextMessageId: () => string;
    readonly #resolveUser: NonNullable<STOMPBrokerOptions['resolveUser']>;
    readonly #maxUnacked: number;
    readonly #verifyCredentials: NonNullable<STOMPBrokerOptions['verifyCredentials']> | null;
    readonly #authorize: NonNullable<STOMPBrokerOptions['authorize']> | null;
    readonly #queueBacklog: number;
    readonly #maxSubscriptionsPerSession: number;
    /** `/queue` history window (ttl + count) — enforced via the store. */
    readonly #retention: { ttlMs?: number; maxMessages?: number } | null;
    /** `/queue` persistence layer — the durable-queue seam. */
    readonly #queueStore: QueueMessageStore | null;
    /** Subscription placement and delivery accounting. */
    readonly #registry: STOMPSubscriptionRegistry;
    /** Per-session transaction buffers (D7). */
    readonly #transactions: STOMPTransactionManager;
    /** Subscription fan-out, delivery tracking, and queue replay. */
    readonly #delivery: STOMPDelivery;
    readonly #endpoint: STOMPEndpoint;
    /** Every session under protocol control (for `closeAll`). */
    readonly #sessions = new Set<SocketSession>();
    readonly #fanout: STOMPFanout;
    readonly #limits: STOMPLimits;
    #closed = false;

    /**
     * Creates a broker with the given routing seams and hooks.
     *
     * @param options - Routing seam and test hooks.
     */
    constructor(options: STOMPBrokerOptions = {}) {
        this.#fanout = new STOMPFanout({
            fanout: options.fanout,
            isClosed: () => this.#closed,
            onLocal: (destination, body, headers) => this.#fanoutLocal(destination, body, headers),
        });
        this.#onMessage = options.onMessage ?? null;
        this.#nextMessageId = options.nextMessageId ?? ((): string => crypto.randomUUID());
        this.#resolveUser =
            options.resolveUser ??
            ((session: SocketSession): string | null => {
                const user = session.attributes['user'];
                return typeof user === 'string' ? user : null;
            });
        this.#maxUnacked = options.maxUnacked ?? DEFAULT_MAX_UNACKED;
        this.#registry = new STOMPSubscriptionRegistry({
            maxUnacked: this.#maxUnacked,
            maxUnackedBytes: options.maxUnackedBytes ?? DEFAULT_MAX_UNACKED_BYTES,
            maxUnackedSessionBytes: options.maxUnackedSessionBytes ?? DEFAULT_MAX_UNACKED_SESSION_BYTES,
        });
        this.#limits = new STOMPLimits({
            maxIdentifierLength: options.maxIdentifierLength ?? DEFAULT_MAX_IDENTIFIER_LENGTH,
            maxHeaderBytes: options.maxHeaderBytes ?? DEFAULT_MAX_HEADER_BYTES,
            maxReplayBytesPerSession: options.maxReplayBytesPerSession ?? DEFAULT_MAX_REPLAY_BYTES_PER_SESSION,
            fail,
            stateFor: (session) => this.#registry.stateFor(session),
        });
        this.#verifyCredentials = options.verifyCredentials ?? null;
        this.#authorize = options.authorize ?? null;
        this.#queueBacklog = options.queueBacklog ?? DEFAULT_QUEUE_BACKLOG;
        this.#maxSubscriptionsPerSession = options.maxSubscriptionsPerSession ?? DEFAULT_MAX_SUBSCRIPTIONS_PER_SESSION;
        this.#transactions = new STOMPTransactionManager(
            {
                fail,
                receipt,
                controlSend,
                applySend: (session, frame, op) => this.#delivery.applyBufferedSend(session, frame, op),
                applyAck: (session, op) => this.#delivery.applyBufferedAck(session, op),
            },
            {
                maxTransactionsPerSession: options.maxTransactionsPerSession ?? DEFAULT_MAX_TRANSACTIONS_PER_SESSION,
                maxTransactionOps: options.maxTransactionOps ?? DEFAULT_MAX_TRANSACTION_OPS,
                maxTransactionBytes: options.maxTransactionBytes ?? DEFAULT_MAX_TRANSACTION_BYTES,
            }
        );
        const retention = options.retention;
        if (retention !== undefined) {
            const clean: { ttlMs?: number; maxMessages?: number } = {};
            if (retention.ttlMs !== undefined) {
                if (typeof retention.ttlMs !== 'number' || !Number.isFinite(retention.ttlMs) || retention.ttlMs < 0) {
                    throw new RangeError(`retention.ttlMs must be a non-negative integer, received ${retention.ttlMs}`);
                }
                if (retention.ttlMs > 0) clean.ttlMs = Math.floor(retention.ttlMs);
            }
            if (retention.maxMessages !== undefined) {
                if (
                    typeof retention.maxMessages !== 'number' ||
                    !Number.isFinite(retention.maxMessages) ||
                    retention.maxMessages < 0
                ) {
                    throw new RangeError(
                        `retention.maxMessages must be a non-negative integer, received ${retention.maxMessages}`
                    );
                }
                if (retention.maxMessages > 0) clean.maxMessages = Math.floor(retention.maxMessages);
            }
            this.#retention = clean.ttlMs === undefined && clean.maxMessages === undefined ? null : clean;
        } else {
            this.#retention = null;
        }
        // The default persistence layer is an in-memory store built from
        // the legacy backlog caps, so the durable seam sees the same bounds
        // the old live backlog did. `queueBacklog: 0` disables storage (live
        // fan-out only — the documented D11 parity with /topic). The store
        // is the single source of truth for `/queue` retention and replay.
        this.#queueStore =
            options.queueStore === null || this.#queueBacklog === 0
                ? null
                : (options.queueStore ??
                  new InMemoryQueueMessageStore({
                      maxMessagesPerDestination: this.#queueBacklog,
                      maxDestinations: options.maxBacklogDestinations ?? DEFAULT_MAX_BACKLOG_DESTINATIONS,
                      maxBytes: options.maxBacklogBytes ?? DEFAULT_MAX_BACKLOG_BYTES,
                  }));
        this.#delivery = new STOMPDelivery({
            registry: this.#registry,
            limits: this.#limits,
            queueStore: this.#queueStore,
            retention: this.#retention,
            onMessage: this.#onMessage,
            resolveUser: this.#resolveUser,
            nextMessageId: this.#nextMessageId,
            publish: (destination, body, headers) => this.publish(destination, body, headers),
        });
        this.#endpoint = new STOMPEndpoint({
            maxSubscriptionsPerSession: this.#maxSubscriptionsPerSession,
            maxUnacked: this.#maxUnacked,
            queueBacklog: this.#queueBacklog,
            retention: this.#retention,
            queueStore: this.#queueStore,
            onMessage: this.#onMessage,
            verifyCredentials: this.#verifyCredentials,
            authorize: this.#authorize,
            resolveUser: this.#resolveUser,
            nextMessageId: this.#nextMessageId,
            limits: this.#limits,
            registry: this.#registry,
            transactions: this.#transactions,
            delivery: this.#delivery,
            sessions: this.#sessions,
            isReady: () => !this.#closed && this.#fanout.isReady,
            publish: (destination, body, headers) => this.publish(destination, body, headers),
        });
    }

    /**
     * Await live topic subscription readiness before accepting traffic.
     *
     * @returns A promise that resolves once the fan-out subscription is ready.
     */
    connect(): Promise<void> {
        if (this.#closed) return Promise.reject(new Error('STOMPBroker is closed'));
        return this.#fanout.connect();
    }

    /**
     * Close sessions and unsubscribe; the application owns transport shutdown.
     *
     * @returns A promise that resolves once the broker is closed.
     */
    close(): Promise<void> {
        if (this.#closed) return this.#fanout.close();
        this.#closed = true;
        this.closeAll();
        return this.#fanout.close();
    }

    /** Total subscription count across all sessions (observability). */
    get subscriptions(): number {
        return this.#registry.count;
    }

    /**
     * Total delivered-but-unacked messages across all subscriptions (D9
     * observability, ack ≠ auto) — the broker-side outstanding-delivery
     * gauge.
     */
    get unackedMessages(): number {
        return this.#registry.unackedMessages;
    }

    /**
     * The `/queue` persistence layer — the durable-queue seam (a libsql or
     * Redis implementation can be swapped in place of the default memory
     * store). The store is the single source of truth for `/queue`
     * retention and replay. `null` when storage is disabled
     * (`queueBacklog: 0` or an explicit `queueStore: null`) — then
     * `/queue` is live fan-out with no replay.
     */
    get queueStore(): QueueMessageStore | null {
        return this.#queueStore;
    }

    /**
     * Read the retained history of a `/queue` destination — the same seam
     * subscribe replay reads from. `limit` is the newest-window (default
     * `queueBacklog`), `afterSeq` resumes past a gap; messages expired by
     * the retention TTL are pruned first. Returns `[]` when storage is
     * disabled or the store is unavailable (the read fails open — a
     * history query must never break an app).
     *
     * @param destination - The `/queue/<name>` destination.
     * @param options - The history window.
     * @returns The stored messages, append-ordered.
     */
    async history(
        destination: string,
        options: { afterSeq?: number; limit?: number } = {}
    ): Promise<StoredQueueMessage[]> {
        if (!destination.startsWith('/queue/')) {
            return [];
        }
        const replay = await this.#delivery.replayQueue(destination, options);
        // The read-only history query keeps its documented fail-open: a
        // store fault reads as "no history" (SUBSCRIBE, which must hand a
        // client an honest answer, fails closed instead — COR-8).
        return replay.ok ? replay.messages : [];
    }

    /**
     * Run the STOMP endpoint protocol for one connection.
     *
     * @param session - The socket session (any transport).
     * @returns A promise that resolves when the session stream ends.
     */
    handleSocket(session: SocketSession): Promise<void> {
        return this.#endpoint.handleSocket(session);
    }

    /**
     * Server-initiated fan-out: send a `MESSAGE` frame to every
     * subscription of `destination`, each carrying the subscriber's own
     * `subscription` id and the same fresh `message-id` per receiving broker
     * (acks and redelivery remain local to that broker). `/queue` destinations persist
     * through the store (the durable-queue seam) before fan-out; the
     * returned value is the stored message — `undefined` for non-`/queue`
     * destinations, disabled storage, or a store failure (the caller
     * decides the failure signal; live fan-out happens either way).
     * Configured `/topic/*` fan-out awaits transport acceptance before local
     * delivery and rejects backend failures; it has no replay or peer acknowledgement.
     *
     * @param destination - The destination (e.g. `/topic/chat`).
     * @param body - The message body (text or bytes — D8).
     * @param headers - Extra headers on the MESSAGE frames (e.g. `content-type`).
     * @returns The stored message for a persisted `/queue` append, else `undefined`.
     */
    async publish(
        destination: string,
        body: STOMPBody,
        headers: Record<string, string> = {}
    ): Promise<StoredQueueMessage | undefined> {
        if (this.#closed) throw new Error('STOMPBroker is closed');
        this.#limits.assertDeliverable(destination, headers);
        await this.#fanout.publish(destination, body, headers);
        const messageId = this.#nextMessageId();
        let stored: StoredQueueMessage | undefined;
        if (destination.startsWith('/queue/') && this.#queueBacklog > 0) {
            const store = this.#queueStore;
            if (store !== null) {
                try {
                    stored = await store.append({
                        messageId,
                        destination,
                        body,
                        headers: { ...headers },
                    });
                    const retention = this.#retention;
                    if (retention !== null) {
                        // Keep the durable side within the history window:
                        // fire-and-forget (append success is what receipts
                        // wait on; retention is convergent).
                        void store.prune(destination, retention).catch(() => undefined);
                    }
                } catch {
                    stored = undefined; // store unavailable — see SEND's ERROR path
                }
            }
        }
        if (this.#closed) throw new Error('STOMPBroker is closed');
        this.#fanoutLocal(destination, body, headers, messageId);
        return stored;
    }

    #fanoutLocal(
        destination: string,
        body: STOMPBody,
        headers: Record<string, string>,
        messageId = this.#nextMessageId()
    ): void {
        // REV-006: validate before touching subscribers so a
        // peer/programmatic envelope that cannot be framed fails loudly
        // (throws to the caller) instead of being dropped per subscriber.
        this.#limits.assertDeliverable(destination, headers);
        const subscribers = this.#registry.byDestination(destination);
        if (subscribers) {
            for (const subscription of Array.from(subscribers)) {
                if (!subscription.session.isClosed) {
                    this.#delivery.deliver(subscription, messageId, destination, body, headers, false);
                }
            }
        }
    }

    /**
     * Principal-scoped fan-out (D10): deliver to the `resolveUser`-scoped
     * subscriptions of `user` — those bound to `/user/<destination>`
     * (the STOMP convention: subscribe `/user/queue/errors`, then
     * `sendToUser(user, '/queue/errors', …)`). MESSAGE frames carry the
     * `/user/...` destination the client subscribed with.
     *
     * @param user - The target principal.
     * @param destination - The destination suffix (e.g. `/queue/errors`).
     * @param body - The message body (text or bytes — D8).
     * @param headers - Extra headers on the MESSAGE frames.
     */
    sendToUser(user: string, destination: string, body: STOMPBody, headers: Record<string, string> = {}): void {
        const suffix = destination.replace(/^\/+/, '');
        // REV-006: surface an unframeable envelope here rather than letting
        // `deliverNow` swallow the serialization fault per subscriber.
        this.#limits.assertDeliverable(`/user/${suffix}`, headers);
        const scope = this.#registry.byUser(user, suffix);
        if (!scope) {
            return;
        }
        const messageId = this.#nextMessageId();
        const userDestination = `/user/${suffix}`;
        for (const subscription of scope) {
            if (subscription.session.isClosed) {
                continue;
            }
            this.#delivery.deliver(subscription, messageId, userDestination, body, headers, false);
        }
    }

    /**
     * Close every connected session tracked by the broker (graceful
     * shutdown integration; the transport's `closeAll` path remains the
     * registry's job — this closes the STOMP side).
     *
     * @param code - Close status code (default `1001` going away).
     * @param reason - Human-readable close reason.
     */
    closeAll(code: number = 1001, reason: string = 'broker shutdown'): void {
        for (const session of this.#sessions) {
            if (!session.isClosed) {
                session.close(code, reason);
            }
        }
    }
}
