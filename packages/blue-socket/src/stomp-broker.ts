/**
 * STOMP server broker — endpoint state machine + destination fan-out
 * (AD-23 D1/D2/D5, second wave D7–D11).
 *
 * A `StompBroker` instance owns a destination namespace: `handleSocket`
 * runs the STOMP 1.2 endpoint protocol over one `SocketSession` (CONNECT
 * negotiation, SUBSCRIBE/UNSUBSCRIBE, SEND, ACK/NACK, transactions,
 * receipts, ERROR + close on violations), `publish`/`sendToUser` fan out
 * from anywhere (scheduler → broker, HTTP → broker — the AD-20/AD-21
 * reachability pattern), and `closeAll` terminates every tracked
 * connection.
 *
 * Semantics (AD-23):
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
 *   subscription. A `subscription` header, when present, must name the
 *   sender's own subscription.
 * - **`/user` destinations (D10)**: principal-scoped subscriptions via
 *   `resolveUser`; `sendToUser` fans out to one user's scope; a client
 *   SEND to `/user/*` reaches only the sender's own scope.
 * - **`/queue` destinations (D11)**: bounded store-and-forward — a new
 *   subscriber is registered first, buffers live traffic while the backlog
 *   replay is in flight, then replays the backlog, flushes the buffered
 *   frames the replay did not already carry (deduped by `message-id`), and
 *   only then receives live traffic directly (`queueBacklog`).
 * - Heart-beat is negotiated off (`0,0`) — the AD-21 registry ping/pong
 *   already owns liveness at the WS layer. Ping frames (bare newlines)
 *   are tolerated on inbound.
 * - The broker is isomorphic: it touches `SocketSession` contracts only,
 *   never the transport (AD-23 D1). All protocol failures are fail-closed:
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
 * * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RingBuffer } from '@blue/core';
import {
    InMemoryQueueMessageStore,
    materialOctets,
    type QueueMessageStore,
    type StoredQueueMessage,
} from './message-store';
import {
    parseStompFrame,
    serializeStompFrame,
    StompProtocolError,
    type StompFrame,
    type StompBody,
} from './stomp-frame';
import type { SocketSession } from './socket-session';

/** STOMP ack modes (STOMP 1.2 §1.3.1). */
export type StompAckMode = 'auto' | 'client' | 'client-individual';

/** Version negotiation set — we speak 1.2 semantics, accept 1.0–1.2. */
const SUPPORTED_VERSIONS: readonly string[] = ['1.2', '1.1', '1.0'];

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
/** Default per-subscription bound on tracked unacked body octets (SEC-5). */
const DEFAULT_MAX_UNACKED_BYTES = 1024 * 1024;
/** Default per-session bound on tracked unacked body octets (SEC-5). */
const DEFAULT_MAX_UNACKED_SESSION_BYTES = 16 * 1024 * 1024;
/** Default per-session budget for backlog replay + replay-time live buffering (SEC-6). */
const DEFAULT_MAX_REPLAY_BYTES_PER_SESSION = 16 * 1024 * 1024;

/** Headers whose value is a protocol identifier — capped by `maxIdentifierLength`. */
const IDENTIFIER_HEADERS: readonly string[] = ['destination', 'id', 'subscription', 'transaction', 'receipt'];

/**
 * SEND headers that are framing rather than user payload (COR-7, STOMP 1.2
 * §2.1): they are consumed by the broker and never forwarded into MESSAGE
 * frames or the `onMessage` seam.
 */
const SEND_FRAMING_HEADERS: Record<string, true> = {
    destination: true,
    transaction: true,
    receipt: true,
    'content-length': true,
};

/** A live subscription: one (session, sub-id) → destination binding. */
interface Subscription {
    session: SocketSession;
    subId: string;
    destination: string;
    ack: StompAckMode;
    /** Delivered-but-unacked messages (D9, ack ≠ auto) — head-indexed
     * ring: FIFO eviction at the `maxUnacked` bound is O(1). Created with
     * capacity `maxUnacked + 1` so a full ring never overwrites silently:
     * the count guard evicts at `length > maxUnacked`, and every departure
     * must run through `#untrack` to keep the byte totals and the ack
     * index honest. */
    unacked: RingBuffer<StoredMessage>;
    /** Body octets currently tracked in `unacked` (SEC-5 per-subscription bound). */
    unackedBytes: number;
    /** `true` while a `/queue` backlog replay is in flight (COR-2): live
     * deliveries buffer instead of going out. */
    replaying: boolean;
    /** Live deliveries held during that replay — flushed (deduped against
     * the replay) once it completes. */
    buffered: BufferedDelivery[];
}

/** A live delivery held back while a `/queue` replay is in flight (COR-2). */
interface BufferedDelivery {
    messageId: string;
    destination: string;
    body: StompBody;
    headers: Record<string, string>;
    redelivered: boolean;
}

/** A retained message (queue backlog / unacked tracking). */
interface StoredMessage {
    messageId: string;
    destination: string;
    body: StompBody;
    /** Extra headers (e.g. `content-type`); `subscription` added per send. */
    headers: Record<string, string>;
    /** Body octets, cached for the byte budgets (SEC-5). */
    bytes: number;
    /** Broker-issued monotonic tag — the oldest delivery is knowable (SEC-6). */
    deliverySeq: number;
}

/** Per-session delivery accounting: the ack index + the byte budgets. */
interface SessionState {
    /** Delivery `message-id` → owning subscription (COR-4 id-only acks). */
    messageIds: Map<string, Subscription>;
    /** Tracked unacked body octets across the session's subscriptions (SEC-5). */
    unackedBytes: number;
    /** Replay + replay-buffer octets consumed by this session (SEC-6). */
    replayBytes: number;
}

/** Outcome of a store-backed `/queue` replay: a store fault is
 * distinguishable from an empty window (COR-8/RT-3). */
type QueueReplay = { ok: true; messages: StoredQueueMessage[] } | { ok: false };

/** A buffered transactional operation (D7). */
type TransactionOp =
    | { kind: 'send'; destination: string; body: StompBody; headers: Record<string, string>; receipt: string | null }
    | { kind: 'ack'; nack: boolean; messageId: string; subId: string; receipt: string | null };

/** One session's transaction buffer: ordered ops + running body-byte total. */
interface TransactionBuffer {
    ops: TransactionOp[];
    bytes: number;
}

/** Options for {@link StompBroker}. */
export interface StompBrokerOptions {
    /**
     * Application routing seam for SEND frames. Invoked with the frame's
     * destination/body/headers and the sending session. Return `false` to
     * suppress the default fan-out to the destination's subscribers.
     */
    onMessage?: (
        destination: string,
        body: StompBody,
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
     * hook populates attributes (AD-21). A session that resolves to
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
     * store-read phase (AD-24 receipt decision).
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
 * namespace (app-scoped bean, AD-23 D1).
 *
 * @example
 * ```ts
 * const broker = new StompBroker();
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
export class StompBroker {
    readonly #onMessage: StompBrokerOptions['onMessage'] | null;
    readonly #nextMessageId: () => string;
    readonly #resolveUser: NonNullable<StompBrokerOptions['resolveUser']>;
    readonly #maxUnacked: number;
    readonly #maxUnackedBytes: number;
    readonly #maxUnackedSessionBytes: number;
    readonly #maxReplayBytesPerSession: number;
    readonly #maxIdentifierLength: number;
    readonly #verifyCredentials: NonNullable<StompBrokerOptions['verifyCredentials']> | null;
    readonly #authorize: NonNullable<StompBrokerOptions['authorize']> | null;
    readonly #queueBacklog: number;
    readonly #maxSubscriptionsPerSession: number;
    readonly #maxTransactionsPerSession: number;
    readonly #maxTransactionOps: number;
    readonly #maxTransactionBytes: number;
    /** `/queue` history window (ttl + count) — enforced via the store. */
    readonly #retention: { ttlMs?: number; maxMessages?: number } | null;
    /** `/queue` persistence layer — the durable-queue seam. */
    readonly #queueStore: QueueMessageStore | null;
    /** Per-session subscription map: session → subId → subscription. */
    readonly #subscriptions = new Map<SocketSession, Map<string, Subscription>>();
    /** Fan-out index: destination → subscriptions (user scopes excluded). */
    readonly #byDestination = new Map<string, Subscription[]>();
    /** User scopes (D10): user → destination-suffix → subscriptions. */
    readonly #byUser = new Map<string, Map<string, Subscription[]>>();
    /** Per-session transaction buffers (D7): session → txId → ops + bytes. */
    readonly #transactions = new Map<SocketSession, Map<string, TransactionBuffer>>();
    /** Every session under protocol control (for `closeAll`). */
    readonly #sessions = new Set<SocketSession>();
    /** Per-session delivery accounting: ack index + the byte budgets. */
    readonly #sessionState = new Map<SocketSession, SessionState>();
    /** Monotonic delivery tag — makes the oldest tracked delivery knowable. */
    #deliverySeq = 0;

    /**
     * @param options - Routing seam and test hooks.
     */
    constructor(options: StompBrokerOptions = {}) {
        this.#onMessage = options.onMessage ?? null;
        this.#nextMessageId = options.nextMessageId ?? ((): string => crypto.randomUUID());
        this.#resolveUser =
            options.resolveUser ??
            ((session: SocketSession): string | null => {
                const user = session.attributes['user'];
                return typeof user === 'string' ? user : null;
            });
        this.#maxUnacked = options.maxUnacked ?? DEFAULT_MAX_UNACKED;
        this.#maxUnackedBytes = options.maxUnackedBytes ?? DEFAULT_MAX_UNACKED_BYTES;
        this.#maxUnackedSessionBytes = options.maxUnackedSessionBytes ?? DEFAULT_MAX_UNACKED_SESSION_BYTES;
        this.#maxReplayBytesPerSession = options.maxReplayBytesPerSession ?? DEFAULT_MAX_REPLAY_BYTES_PER_SESSION;
        this.#maxIdentifierLength = options.maxIdentifierLength ?? DEFAULT_MAX_IDENTIFIER_LENGTH;
        this.#verifyCredentials = options.verifyCredentials ?? null;
        this.#authorize = options.authorize ?? null;
        this.#queueBacklog = options.queueBacklog ?? DEFAULT_QUEUE_BACKLOG;
        this.#maxSubscriptionsPerSession = options.maxSubscriptionsPerSession ?? DEFAULT_MAX_SUBSCRIPTIONS_PER_SESSION;
        this.#maxTransactionsPerSession = options.maxTransactionsPerSession ?? DEFAULT_MAX_TRANSACTIONS_PER_SESSION;
        this.#maxTransactionOps = options.maxTransactionOps ?? DEFAULT_MAX_TRANSACTION_OPS;
        this.#maxTransactionBytes = options.maxTransactionBytes ?? DEFAULT_MAX_TRANSACTION_BYTES;
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
    }

    /** Total subscription count across all sessions (observability). */
    get subscriptions(): number {
        let count = 0;
        for (const bySubId of this.#subscriptions.values()) {
            count += bySubId.size;
        }
        return count;
    }

    /**
     * Total delivered-but-unacked messages across all subscriptions (D9
     * observability, ack ≠ auto) — the broker-side outstanding-delivery
     * gauge.
     */
    get unackedMessages(): number {
        let total = 0;
        for (const bySubId of this.#subscriptions.values()) {
            for (const subscription of bySubId.values()) {
                total += subscription.unacked.length;
            }
        }
        return total;
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
        const replay = await this.#replayQueue(destination, options);
        // The read-only history query keeps its documented fail-open: a
        // store fault reads as "no history" (SUBSCRIBE, which must hand a
        // client an honest answer, fails closed instead — COR-8).
        return replay.ok ? replay.messages : [];
    }

    /**
     * Store-backed `/queue` replay: prune expired messages per the
     * retention TTL, then read the ordered window. The fault is reported,
     * never swallowed: SUBSCRIBE fails closed on `ok: false` while
     * `history()` maps it to its documented empty read.
     *
     * @param destination - The `/queue/<name>` destination.
     * @param options - The replay window (`limit` = newest `N`).
     * @returns The stored messages (append-ordered), or the fault.
     */
    async #replayQueue(destination: string, options: { afterSeq?: number; limit?: number } = {}): Promise<QueueReplay> {
        const store = this.#queueStore;
        if (store === null) {
            return { ok: true, messages: [] };
        }
        try {
            if (this.#retention?.ttlMs !== undefined) {
                await store.prune(destination, { ttlMs: this.#retention.ttlMs });
            }
            return { ok: true, messages: await store.replay(destination, options) };
        } catch {
            return { ok: false };
        }
    }

    /** Per-session delivery accounting, created on first use. */
    #stateFor(session: SocketSession): SessionState {
        let state = this.#sessionState.get(session);
        if (state === undefined) {
            state = { messageIds: new Map(), unackedBytes: 0, replayBytes: 0 };
            this.#sessionState.set(session, state);
        }
        return state;
    }

    /**
     * Charge one session's replay budget (SEC-6) — backlog replay and the
     * live deliveries buffered during it share the one cumulative bound.
     *
     * @param session - The session consuming the budget.
     * @param octets - The body octets to charge.
     * @returns `false` when the budget is exhausted (the caller fails closed).
     */
    #chargeReplay(session: SocketSession, octets: number): boolean {
        const budget = this.#maxReplayBytesPerSession;
        if (budget <= 0) {
            return true;
        }
        const state = this.#stateFor(session);
        if (state.replayBytes + octets > budget) {
            return false;
        }
        state.replayBytes += octets;
        return true;
    }

    /**
     * Run the STOMP endpoint protocol for one connection.
     *
     * Consumes `session.messages` until the connection closes: parses each
     * frame, answers CONNECT with CONNECTED, maintains the session's
     * subscriptions, fans out SEND frames, validates ACK/NACK, emits
     * receipts, and fails closed on protocol violations. Session
     * subscriptions are dropped when the stream ends.
     *
     * @param session - The socket session (any transport).
     */
    async handleSocket(session: SocketSession): Promise<void> {
        const state: { connected: boolean; version: string | null; sessionId: string | null } = {
            connected: false,
            version: null,
            sessionId: null,
        };
        try {
            this.#sessions.add(session);
            for await (const message of session.messages) {
                if (!(await this.#process(session, state, message))) {
                    return;
                }
            }
        } finally {
            this.#dropSession(session);
        }
    }

    /**
     * Server-initiated fan-out: send a `MESSAGE` frame to every
     * subscription of `destination`, each carrying the subscriber's own
     * `subscription` id and the same fresh `message-id` (one id per
     * logical message — acks are scoped by subscription, so sharing is
     * safe and redelivery keeps the id). `/queue` destinations persist
     * through the store (the durable-queue seam) before fan-out; the
     * returned value is the stored message — `undefined` for non-`/queue`
     * destinations, disabled storage, or a store failure (the caller
     * decides the failure signal; live fan-out happens either way).
     *
     * @param destination - The destination (e.g. `/topic/chat`).
     * @param body - The message body (text or bytes — D8).
     * @param headers - Extra headers on the MESSAGE frames (e.g. `content-type`).
     * @returns The stored message for a persisted `/queue` append, else `undefined`.
     */
    async publish(
        destination: string,
        body: StompBody,
        headers: Record<string, string> = {}
    ): Promise<StoredQueueMessage | undefined> {
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
        const subscribers = this.#byDestination.get(destination);
        if (subscribers) {
            // Snapshot before iterating: a send may synchronously close a
            // subscriber, whose close path removes it from the index while
            // we walk it (Array.from, not the live array).
            for (const subscription of Array.from(subscribers)) {
                if (subscription.session.isClosed) {
                    continue;
                }
                this.#deliver(subscription, messageId, destination, body, headers, false);
            }
        }
        return stored;
    }

    /**
     * Principal-scoped fan-out (D10): deliver to the `resolveUser`-scoped
     * subscriptions of `user` — those bound to `/user/<destination>`
     * (Spring convention: subscribe `/user/queue/errors`, then
     * `sendToUser(user, '/queue/errors', …)`). MESSAGE frames carry the
     * `/user/...` destination the client subscribed with.
     *
     * @param user - The target principal.
     * @param destination - The destination suffix (e.g. `/queue/errors`).
     * @param body - The message body (text or bytes — D8).
     * @param headers - Extra headers on the MESSAGE frames.
     */
    sendToUser(user: string, destination: string, body: StompBody, headers: Record<string, string> = {}): void {
        const suffix = destination.replace(/^\/+/, '');
        const scope = this.#byUser.get(user)?.get(suffix);
        if (!scope) {
            return;
        }
        const messageId = this.#nextMessageId();
        const userDestination = `/user/${suffix}`;
        for (const subscription of scope) {
            if (subscription.session.isClosed) {
                continue;
            }
            this.#deliver(subscription, messageId, userDestination, body, headers, false);
        }
    }

    /**
     * Close every connected session tracked by the broker (graceful
     * shutdown integration; the transport's `closeAll` path remains the
     * AD-21 registry's job — this closes the STOMP side).
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

    /**
     * Process one inbound message for a session.
     *
     * @param session - The owning session.
     * @param state - Per-connection protocol state.
     * @param message - The raw inbound message (text or binary frame).
     * @returns `false` when the connection should end (protocol error or
     *   DISCONNECT); `true` to keep reading.
     */
    #process(
        session: SocketSession,
        state: { connected: boolean; version: string | null; sessionId: string | null },
        message: unknown
    ): Promise<boolean> {
        if (typeof message !== 'string' && !(message instanceof Uint8Array) && !(message instanceof ArrayBuffer)) {
            return Promise.resolve(this.#fail(session, null, 'STOMP frames must be text or binary'));
        }
        let frame: StompFrame;
        try {
            frame = parseStompFrame(message as string);
        } catch (error) {
            return Promise.resolve(
                this.#fail(session, null, error instanceof StompProtocolError ? error.message : 'malformed frame')
            );
        }
        // Heart-beat pings (bare newlines) — nothing to do.
        if (frame.command === '') {
            return Promise.resolve(true);
        }
        // SEC-2: every identifier-valued header is bounded on every
        // non-ping frame (including CONNECT — `login`/`passcode` are
        // credentials, capped by their own verifier).
        if (!this.#assertIdentifiers(session, frame)) {
            return Promise.resolve(false);
        }
        if (!state.connected) {
            if (frame.command === 'CONNECT' || frame.command === 'STOMP') {
                return this.#connect(session, state, frame);
            }
            return Promise.resolve(this.#fail(session, frame, 'CONNECT must be the first frame'));
        }
        switch (frame.command) {
            case 'SUBSCRIBE':
                return this.#subscribe(session, frame);
            case 'UNSUBSCRIBE':
                return Promise.resolve(this.#unsubscribe(session, frame));
            case 'SEND':
                return this.#send(session, frame);
            case 'ACK':
            case 'NACK':
                return Promise.resolve(this.#ack(session, frame));
            case 'DISCONNECT':
                return Promise.resolve(this.#disconnect(session, frame));
            case 'BEGIN':
                return Promise.resolve(this.#begin(session, frame));
            case 'COMMIT':
                return this.#commit(session, frame);
            case 'ABORT':
                return Promise.resolve(this.#abort(session, frame));
            default:
                return Promise.resolve(this.#fail(session, frame, `unknown command: ${frame.command}`));
        }
    }

    /**
     * The CONNECT handshake: version negotiation, optional credential
     * verification, CONNECTED reply.
     *
     * @param session - The connecting session.
     * @param state - Per-connection protocol state (mutated on success).
     * @param frame - The CONNECT/STOMP frame.
     * @returns Always `true` (a failed handshake closes the session).
     */
    async #connect(
        session: SocketSession,
        state: { connected: boolean; version: string | null; sessionId: string | null },
        frame: StompFrame
    ): Promise<boolean> {
        // STOMP 1.2 §1.1: "If the accept-version header is missing, it
        // means that the client only supports version 1.0 of the protocol."
        const acceptVersion = frame.headers['accept-version'];
        const offered = (acceptVersion ?? '1.0').split(',').map((v) => v.trim());
        const mutual = SUPPORTED_VERSIONS.find((version) => offered.includes(version)) ?? null;
        if (mutual === null) {
            return this.#fail(session, frame, `no supported version in accept-version: ${offered.join(', ')}`);
        }
        // SEC-7: credentials are verified or refused — never ignored.
        const login = frame.headers['login'];
        const passcode = frame.headers['passcode'];
        if (login !== undefined || passcode !== undefined) {
            const verify = this.#verifyCredentials;
            if (verify === null) {
                return this.#fail(
                    session,
                    frame,
                    'CONNECT credentials rejected: no credential verifier is configured',
                    1008
                );
            }
            const verified = await verify(login ?? '', passcode ?? '', session);
            if (!verified) {
                return this.#fail(session, frame, 'invalid credentials', 1008);
            }
        }
        // STOMP 1.1+ requires `host` (the virtual host). A 1.0-only client
        // has none — accept it (we still negotiate the frame we got).
        if (mutual !== '1.0' && frame.headers['host'] === undefined) {
            return this.#fail(session, frame, 'CONNECT requires a host header (STOMP 1.1+)');
        }
        state.connected = true;
        state.version = mutual;
        state.sessionId = this.#nextMessageId();
        session.send(
            serializeStompFrame({
                command: 'CONNECTED',
                headers: {
                    version: mutual,
                    session: state.sessionId,
                    server: 'BlueJS',
                    // Liveness is the WS layer's job (AD-21 D6); negotiate
                    // STOMP heartbeats off (AD-23 D3).
                    'heart-beat': '0,0',
                },
                body: '',
            })
        );
        return true;
    }

    /**
     * Register a subscription for the session.
     *
     * A `/queue` SUBSCRIBE registers first, replays the retained window
     * with live deliveries buffered (nothing is lost, ordering holds, the
     * buffered frames the replay already carried are dropped by
     * `message-id`), and only then starts receiving live traffic directly.
     *
     * @param session - The subscribing session.
     * @param frame - The SUBSCRIBE frame.
     * @returns `false` on duplicate id / missing headers / denied
     *   destination / store or replay-budget failure (ERROR + close).
     */
    async #subscribe(session: SocketSession, frame: StompFrame): Promise<boolean> {
        const destination = frame.headers['destination'];
        const subId = frame.headers['id'];
        if (destination === undefined) {
            return this.#fail(session, frame, 'SUBSCRIBE requires a destination header');
        }
        if (subId === undefined) {
            return this.#fail(session, frame, 'SUBSCRIBE requires an id header');
        }
        const ack = (frame.headers['ack'] ?? 'auto') as StompAckMode;
        if (ack !== 'auto' && ack !== 'client' && ack !== 'client-individual') {
            return this.#fail(session, frame, `invalid ack mode: ${ack}`);
        }
        // SEC-4: policy first — no registration, no replay for a denied
        // destination (the replay would otherwise disclose the backlog).
        if (!(await this.#authorizeDestination(session, frame, destination, 'subscribe'))) {
            return false;
        }
        let bySubId = this.#subscriptions.get(session);
        if (bySubId === undefined) {
            bySubId = new Map();
            this.#subscriptions.set(session, bySubId);
        }
        if (bySubId.has(subId)) {
            return this.#fail(session, frame, `subscription id already in use: ${subId}`);
        }
        if (bySubId.size >= this.#maxSubscriptionsPerSession) {
            return this.#fail(session, frame, `subscription limit reached (max ${this.#maxSubscriptionsPerSession})`);
        }

        const userScoped = destination.startsWith('/user/');
        if (userScoped) {
            // Principal-scoped routing (D10): the subscribe attaches to the
            // session's resolved identity — no anonymous `/user` binds.
            const user = this.#resolveUser(session);
            if (user === null) {
                return this.#fail(session, frame, 'cannot bind a /user destination without a resolved user', 1008);
            }
            const subscription: Subscription = {
                session,
                subId,
                destination,
                ack,
                unacked: new RingBuffer<StoredMessage>(this.#maxUnacked + 1),
                unackedBytes: 0,
                replaying: false,
                buffered: [],
            };
            bySubId.set(subId, subscription);
            const suffix = destination.slice('/user/'.length);
            let scope = this.#byUser.get(user);
            if (scope === undefined) {
                scope = new Map();
                this.#byUser.set(user, scope);
            }
            let listeners = scope.get(suffix);
            if (listeners === undefined) {
                listeners = [];
                scope.set(suffix, listeners);
            }
            listeners.push(subscription);
            return this.#receipt(session, frame);
        }

        const subscription: Subscription = {
            session,
            subId,
            destination,
            ack,
            unacked: new RingBuffer<StoredMessage>(this.#maxUnacked + 1),
            unackedBytes: 0,
            replaying: false,
            buffered: [],
        };
        bySubId.set(subId, subscription);
        const subscribers = this.#byDestination.get(destination);
        if (subscribers === undefined) {
            this.#byDestination.set(destination, [subscription]);
        } else {
            subscribers.push(subscription);
        }
        // `/queue` backward replay (D11 + history + COR-2): the
        // subscription is live in the fan-out index before the replay
        // starts, so nothing published meanwhile is lost — those frames
        // buffer (`#deliver`) and flush after the retained window has gone
        // out, minus the ones the replay already carried. The subscriber
        // therefore never observes `live, old, live`.
        if (destination.startsWith('/queue/') && this.#queueBacklog > 0) {
            subscription.replaying = true;
            const limit = this.#retention?.maxMessages ?? this.#queueBacklog;
            const replay = await this.#replayQueue(destination, { limit });
            if (session.isClosed) {
                return false; // closed under us (transport or budget) — nothing to send
            }
            if (!replay.ok) {
                // COR-8: a store that cannot hand over its history must not
                // read as "empty queue" — ERROR + close, same posture as the
                // failing SEND append.
                return this.#fail(session, frame, 'queue store unavailable', 1011);
            }
            const replayOctets = replay.messages.reduce((total, stored) => total + materialOctets(stored.body), 0);
            if (!this.#chargeReplay(session, replayOctets)) {
                // SEC-6: re-subscribing re-materializes the window; the
                // per-session budget bounds how often a peer can force it.
                return this.#fail(session, frame, 'replay budget exhausted', 1013);
            }
            const replayedIds = new Set(replay.messages.map((stored) => stored.messageId));
            subscription.replaying = false;
            for (const stored of replay.messages) {
                this.#deliverNow(subscription, stored.messageId, destination, stored.body, stored.headers, false);
            }
            const held = subscription.buffered;
            subscription.buffered = [];
            for (const delivery of held) {
                if (replayedIds.has(delivery.messageId)) {
                    continue; // the replay already carried it — no duplicate
                }
                this.#deliverNow(
                    subscription,
                    delivery.messageId,
                    delivery.destination,
                    delivery.body,
                    delivery.headers,
                    delivery.redelivered
                );
            }
        }
        return this.#receipt(session, frame);
    }

    /**
     * Consult the `authorize` policy seam (SEC-4) and fail closed on a
     * denial — before any replay, registration, buffering or fan-out.
     *
     * @param session - The session requesting the action.
     * @param frame - The offending frame (failure attribution).
     * @param destination - The destination being subscribed or sent to.
     * @param action - The action being authorized.
     * @returns `true` when allowed, `false` after the fail-closed reply.
     */
    async #authorizeDestination(
        session: SocketSession,
        frame: StompFrame,
        destination: string,
        action: 'subscribe' | 'send'
    ): Promise<boolean> {
        if (this.#authorize === null) {
            return true;
        }
        const allowed = await this.#authorize(destination, action, session);
        if (allowed === false) {
            return this.#fail(session, frame, `${action} denied: ${destination}`, 1008);
        }
        return true;
    }

    /**
     * Enforce `maxIdentifierLength` (SEC-2) on every identifier-valued
     * header of a frame.
     *
     * @param session - The sending session.
     * @param frame - The frame to check.
     * @returns `true` when within bounds, `false` after the fail-closed reply.
     */
    #assertIdentifiers(session: SocketSession, frame: StompFrame): boolean {
        const max = this.#maxIdentifierLength;
        if (max <= 0) {
            return true;
        }
        for (const name of IDENTIFIER_HEADERS) {
            const value = frame.headers[name];
            if (value !== undefined && value.length > max) {
                return this.#fail(session, frame, `${name} header exceeds ${max} characters`);
            }
        }
        return true;
    }

    /**
     * Remove a subscription.
     *
     * @param session - The session.
     * @param frame - The UNSUBSCRIBE frame.
     * @returns `false` on unknown id (ERROR + close).
     */
    #unsubscribe(session: SocketSession, frame: StompFrame): boolean {
        const subId = frame.headers['id'];
        if (subId === undefined) {
            return this.#fail(session, frame, 'UNSUBSCRIBE requires an id header');
        }
        const bySubId = this.#subscriptions.get(session);
        const subscription = bySubId?.get(subId);
        if (subscription === undefined) {
            return this.#fail(session, frame, `unknown subscription id: ${subId}`);
        }
        this.#removeSubscription(session, bySubId as Map<string, Subscription>, subscription);
        return this.#receipt(session, frame);
    }

    /**
     * A SEND: fan out to the destination's subscribers (unless the
     * `onMessage` seam suppresses it). Transactions (D7): a SEND carrying
     * `transaction:` is buffered and applied at COMMIT.
     *
     * Both seams run in one order in both forms — `authorize` first (so a
     * denied SEND never reaches the buffer, the routing seam or the
     * fan-out), then `onMessage` — whether the client wrapped the SEND in a
     * transaction or not.
     *
     * @param session - The sending session.
     * @param frame - The SEND frame.
     */
    async #send(session: SocketSession, frame: StompFrame): Promise<boolean> {
        const destination = frame.headers['destination'];
        if (destination === undefined) {
            return this.#fail(session, frame, 'SEND requires a destination header');
        }
        // Before the buffer, the routing seam and the fan-out — so a denied
        // SEND behaves the same whether or not it was wrapped in a
        // transaction (no receipt, no delivery, ERROR + close 1008).
        if (!(await this.#authorizeDestination(session, frame, destination, 'send'))) {
            return false;
        }
        const headers = this.#sendHeaders(frame);
        const txId = frame.headers['transaction'];
        if (txId !== undefined) {
            const buffer = this.#transactions.get(session)?.get(txId);
            if (buffer === undefined) {
                return this.#fail(session, frame, `unknown transaction id: ${txId}`);
            }
            const octets = materialOctets(frame.body);
            if (buffer.ops.length >= this.#maxTransactionOps || buffer.bytes + octets > this.#maxTransactionBytes) {
                return this.#fail(session, frame, 'transaction buffer limit reached');
            }
            buffer.ops.push({
                kind: 'send',
                destination,
                body: frame.body,
                headers,
                receipt: frame.headers['receipt'] ?? null,
            });
            buffer.bytes += octets;
            return true;
        }
        // The routing seam sees every SEND — the same order the transactional
        // path applies at COMMIT (authorize → onMessage → route), so an
        // application's interception no longer depends on how the client
        // framed the send (SEC-4/COR-7).
        const suppress = this.#onMessage?.(destination, frame.body, headers, session);
        if (suppress === false) {
            return this.#receipt(session, frame);
        }
        // User-scoped SEND (D10): only the sender's own principal scope —
        // shares routing with transaction COMMIT (#applyOp).
        if (destination.startsWith('/user/')) {
            if (!this.#sendToUserScope(session, frame, destination, frame.body, headers)) {
                return false;
            }
            return this.#receipt(session, frame);
        }
        return this.#publishAndReceipt(session, frame, destination, headers);
    }

    /**
     * Fan a SEND out and receipt it — holding the `RECEIPT` until a
     * `/queue` append has actually persisted (receipt means "stored" for
     * durable destinations). A store failure fails closed: the receipt is
     * withheld (nothing was persisted), an ERROR frame reports it, and the
     * connection closes `1011` — STOMP 1.2 §1.5 requires the server to
     * close just after sending an ERROR frame (COR-8).
     *
     * @param session - The sending session.
     * @param frame - The SEND frame.
     * @param destination - The frame's destination.
     * @param headers - The pass-through headers for the MESSAGE frames.
     * @returns `false` after a store fault (the session closes).
     */
    async #publishAndReceipt(
        session: SocketSession,
        frame: StompFrame,
        destination: string,
        headers: Record<string, string>
    ): Promise<boolean> {
        const stored = await this.publish(destination, frame.body, headers);
        const storeManaged = destination.startsWith('/queue/') && this.#queueStore !== null;
        if (storeManaged && stored === undefined) {
            return this.#fail(session, frame, 'queue store unavailable', 1011);
        }
        return this.#receipt(session, frame);
    }

    /**
     * Deliver a SEND to the sender's own principal scope (D10) — the
     * shared path for live SENDs and transaction COMMITs. No scope bound
     * to the suffix → nothing to deliver; an unresolvable principal fails
     * closed (ERROR + close 1008). Receipts are the caller's: the live
     * path answers its own frame, COMMIT answers the buffered op.
     *
     * @param session - The sending session (identity source).
     * @param frame - The frame a failure is attributed to (the SEND frame
     *   live, the COMMIT frame when applied from a transaction).
     * @param destination - The `/user/...` destination.
     * @param body - The message body.
     * @param headers - The SEND pass-through headers (see `#sendHeaders`).
     * @returns `true` when the session survives, `false` after a failure.
     */
    #sendToUserScope(
        session: SocketSession,
        frame: StompFrame,
        destination: string,
        body: StompBody,
        headers: Record<string, string>
    ): boolean {
        const user = this.#resolveUser(session);
        if (user === null) {
            return this.#fail(session, frame, 'SEND to /user requires a resolved user', 1008);
        }
        const suffix = destination.slice('/user/'.length);
        const scope = this.#byUser.get(user)?.get(suffix);
        if (scope !== undefined) {
            const messageId = this.#nextMessageId();
            // Snapshot: a delivery may synchronously close one of the
            // sessions in the scope.
            for (const subscription of Array.from(scope)) {
                if (subscription.session.isClosed) {
                    continue;
                }
                this.#deliver(subscription, messageId, destination, body, headers, false);
            }
        }
        return true;
    }

    /**
     * The user-defined headers carried from a SEND into MESSAGE frames and
     * into the `onMessage` seam (COR-7) — STOMP 1.2 §2.1: "The user defined
     * headers MUST be passed through in the MESSAGE frame". Only the
     * framing headers stay behind: `destination` (supplied per
     * subscriber), `transaction`/`receipt` (consumed by the broker) and
     * `content-length` (recomputed by the serializer). Both SEND paths —
     * live and transactional — use this one set, so a buffered SEND
     * produces the identical MESSAGE headers as a direct one.
     *
     * @param frame - The SEND frame.
     * @returns The pass-through headers.
     */
    #sendHeaders(frame: StompFrame): Record<string, string> {
        const headers: Record<string, string> = {};
        for (const [name, value] of Object.entries(frame.headers)) {
            if (SEND_FRAMING_HEADERS[name] !== true) {
                headers[name] = value;
            }
        }
        return headers;
    }

    /**
     * ACK/NACK (STOMP 1.2 §1.4, D9): ack modes `client`/`client-individual`
     * track delivered messages; for `client` an ACK covers everything
     * through the named message, for `client-individual` exactly the named
     * one. NACK removes the same way **and redelivers only the named
     * message** with `redelivered: true`.
     *
     * The `id` header is required and sufficient (COR-4): without a
     * `subscription` header the per-session delivery index resolves the
     * owning subscription. When the `subscription` header *is* present it
     * must name one of the sender's own subscriptions, and an id the
     * subscription no longer tracks (already acked or evicted past the
     * bounds) is a tolerated no-op.
     *
     * A `client`/`client-individual` session whose bare `id` resolves to no
     * delivery this session ever made fails closed: the broker cannot know
     * which tracking set the frame settles, and silently discarding it
     * would leave the delivery outstanding forever.
     *
     * Allowed inside transactions too (D7): buffered under the same
     * op/byte caps as SEND, applied at COMMIT.
     *
     * @param session - The acking session.
     * @param frame - The ACK/NACK frame.
     * @returns `false` when the frame violates the contract.
     */
    #ack(session: SocketSession, frame: StompFrame): boolean {
        const messageId = frame.headers['id'];
        if (messageId === undefined) {
            return this.#fail(session, frame, 'ACK/NACK requires an id header');
        }
        const subId = frame.headers['subscription'];
        let subscription: Subscription | undefined;
        if (subId === undefined) {
            subscription = this.#sessionState.get(session)?.messageIds.get(messageId);
            if (subscription === undefined) {
                return this.#fail(session, frame, `unknown message id: ${messageId}`);
            }
        } else {
            subscription = this.#subscriptions.get(session)?.get(subId);
            if (subscription === undefined) {
                return this.#fail(session, frame, `unknown subscription: ${subId}`);
            }
        }
        const txId = frame.headers['transaction'];
        if (txId !== undefined) {
            const buffer = this.#transactions.get(session)?.get(txId);
            if (buffer === undefined) {
                return this.#fail(session, frame, `unknown transaction id: ${txId}`);
            }
            // COR-10: a buffered ack is as much buffered state as a SEND —
            // it obeys the same op count and byte budget (its identifiers
            // are retained too, so they count toward the bytes).
            const receipt = frame.headers['receipt'] ?? null;
            const octets =
                materialOctets(messageId) +
                materialOctets(subscription.subId) +
                (receipt === null ? 0 : materialOctets(receipt));
            if (buffer.ops.length >= this.#maxTransactionOps || buffer.bytes + octets > this.#maxTransactionBytes) {
                return this.#fail(session, frame, 'transaction buffer limit reached');
            }
            buffer.ops.push({
                kind: 'ack',
                nack: frame.command === 'NACK',
                messageId,
                subId: subscription.subId,
                receipt,
            });
            buffer.bytes += octets;
            return true;
        }
        this.#resolveAck(subscription, messageId, frame.command === 'NACK');
        return this.#receipt(session, frame);
    }

    /**
     * Apply an ack/nack to one subscription's tracking (D9).
     *
     * `client` drops the delivered prefix through the named message;
     * `client-individual` removes only the named entry and re-queues the
     * earlier ones, so their obligations survive (STOMP 1.2 §1.4.1: an
     * ACK/NACK for a subsequent message MUST NOT acknowledge a previous
     * one). Locating the entry is a scan of the ring — inherent for an
     * id-based lookup — and the removal is O(n) dequeues/puts rather than
     * an array splice.
     *
     * @param subscription - The target subscription.
     * @param messageId - The acknowledged message.
     * @param nack - `true` for NACK (removal + redelivery).
     */
    #resolveAck(subscription: Subscription, messageId: string, nack: boolean): void {
        const { unacked, ack } = subscription;
        if (ack === 'auto' || unacked.length === 0) {
            return;
        }
        let named: StoredMessage | undefined;
        for (const entry of unacked) {
            if (entry.messageId === messageId) {
                named = entry;
                break;
            }
        }
        if (named === undefined) {
            return; // already acked or evicted — tolerated no-op
        }
        // Delivery tags are issued monotonically, so the named entry's tag
        // is the exact cumulative boundary for `client`.
        const boundary = named.deliverySeq;
        const removed = this.#extractUnacked(subscription, (entry) =>
            ack === 'client' ? entry.deliverySeq <= boundary : entry.messageId === messageId
        );
        if (!nack) {
            return;
        }
        const target = removed.find((entry) => entry.messageId === messageId) ?? named;
        // Redelivery: same message-id, `redelivered: true` (§1.4.2), and the
        // message stays outstanding — `#deliver` re-tracks it through the
        // same bounded path, so a repeated NACK never grows the tracking set.
        this.#deliver(subscription, target.messageId, target.destination, target.body, target.headers, true);
    }

    /**
     * BEGIN — open a named transaction buffer (D7).
     *
     * @param session - The session.
     * @param frame - The BEGIN frame.
     * @returns `false` on a duplicate or missing transaction id.
     */
    #begin(session: SocketSession, frame: StompFrame): boolean {
        const txId = frame.headers['transaction'];
        if (txId === undefined) {
            return this.#fail(session, frame, 'BEGIN requires a transaction header');
        }
        let byTx = this.#transactions.get(session);
        if (byTx === undefined) {
            byTx = new Map();
            this.#transactions.set(session, byTx);
        }
        if (byTx.has(txId)) {
            return this.#fail(session, frame, `transaction already active: ${txId}`);
        }
        if (byTx.size >= this.#maxTransactionsPerSession) {
            return this.#fail(session, frame, `transaction limit reached (max ${this.#maxTransactionsPerSession})`);
        }
        byTx.set(txId, { ops: [], bytes: 0 });
        return this.#receipt(session, frame);
    }

    /**
     * COMMIT — apply the buffered operations in order (D7). Receipts
     * requested by buffered frames are held and emitted here, then the
     * COMMIT's own receipt — unless an op failed closed, in which case the
     * transaction is dropped, no further op is applied and no receipt is
     * emitted (COR-11: a partial transaction must never read as committed).
     *
     * @param session - The session.
     * @param frame - The COMMIT frame.
     * @returns `false` on an unknown transaction id or a failed op.
     */
    async #commit(session: SocketSession, frame: StompFrame): Promise<boolean> {
        const txId = frame.headers['transaction'];
        if (txId === undefined) {
            return this.#fail(session, frame, 'COMMIT requires a transaction header');
        }
        const buffer = this.#transactions.get(session)?.get(txId);
        if (buffer === undefined) {
            return this.#fail(session, frame, `unknown transaction id: ${txId}`);
        }
        const byTx = this.#transactions.get(session);
        // Ops apply in order, each send awaiting its durable append — the
        // COMMIT receipt follows, so "committed" implies "stored".
        for (const op of buffer.ops) {
            // oxlint-disable-next-line no-await-in-loop -- COMMIT applies buffered ops in order (STOMP 1.2 §1.7.1).
            if (!(await this.#applyOp(session, op, frame))) {
                byTx?.delete(txId);
                return false;
            }
        }
        byTx?.delete(txId);
        return this.#receipt(session, frame);
    }

    /**
     * ABORT — discard the buffered operations; their receipts are never
     * sent (the effects never happened, STOMP 1.2 §1.7.2).
     *
     * @param session - The session.
     * @param frame - The ABORT frame.
     * @returns `false` on an unknown transaction id.
     */
    #abort(session: SocketSession, frame: StompFrame): boolean {
        const txId = frame.headers['transaction'];
        if (txId === undefined) {
            return this.#fail(session, frame, 'ABORT requires a transaction header');
        }
        const buffer = this.#transactions.get(session)?.get(txId);
        if (buffer === undefined) {
            return this.#fail(session, frame, `unknown transaction id: ${txId}`);
        }
        this.#transactions.get(session)?.delete(txId);
        return this.#receipt(session, frame);
    }

    /**
     * Apply one buffered transaction op (D7). Receipts for buffered
     * frames are emitted here, after the op's effect — an op that fails
     * closed emits nothing (COR-11).
     *
     * @param session - The owning session.
     * @param op - The op to apply.
     * @param frame - The COMMIT frame (failure attribution: an ERROR from a
     *   buffered op echoes the COMMIT's `receipt`).
     * @returns `true` when the op applied (or was suppressed by
     *   `onMessage`); `false` after a fail-closed reply — the session is
     *   closing and COMMIT must stop.
     */
    async #applyOp(session: SocketSession, op: TransactionOp, frame: StompFrame): Promise<boolean> {
        const receipt = op.receipt ?? null;
        if (op.kind === 'send') {
            const suppress = this.#onMessage?.(op.destination, op.body, op.headers, session);
            if (suppress !== false) {
                if (op.destination.startsWith('/user/')) {
                    // A transaction-buffered SEND must ride the same
                    // principal-scope routing and policy check as a live
                    // SEND — `publish` only serves /topic-style
                    // destinations (previously a silent no-op).
                    if (!this.#sendToUserScope(session, frame, op.destination, op.body, op.headers)) {
                        return false;
                    }
                } else {
                    const storeManaged = op.destination.startsWith('/queue/') && this.#queueStore !== null;
                    const stored = await this.publish(op.destination, op.body, op.headers);
                    if (storeManaged && stored === undefined) {
                        // Same posture as the live SEND path (COR-8): the
                        // append did not persist, so the transaction cannot
                        // be reported committed.
                        return this.#fail(session, frame, 'queue store unavailable', 1011);
                    }
                }
            }
        } else {
            const subscription = this.#subscriptions.get(session)?.get(op.subId);
            if (subscription !== undefined) {
                this.#resolveAck(subscription, op.messageId, op.nack);
            }
        }
        if (receipt !== null) {
            try {
                session.send(serializeStompFrame({ command: 'RECEIPT', headers: { 'receipt-id': receipt }, body: '' }));
            } catch {
                // Session mid-close — the receipt is lost with the session
                // (the fail/close path is authoritative).
            }
        }
        return true;
    }

    /**
     * Deliver one MESSAGE to a subscription: per-subscription framing
     * (including the `ack` header on non-`auto` subscriptions — COR-4),
     * ack tracking (D9), redelivery flag. While a `/queue` replay is in
     * flight the delivery is buffered instead of sent (COR-2).
     *
     * @param subscription - The target subscription.
     * @param messageId - The message id (shared per logical message).
     * @param destination - The destination header (e.g. `/topic/chat`).
     * @param body - The body.
     * @param headers - Pass-through headers (merged under the frame's own).
     * @param redelivered - `true` for NACK redelivery (D9).
     */
    #deliver(
        subscription: Subscription,
        messageId: string,
        destination: string,
        body: StompBody,
        headers: Record<string, string>,
        redelivered: boolean
    ): void {
        if (subscription.replaying) {
            if (!this.#chargeReplay(subscription.session, materialOctets(body))) {
                // The live buffer shares the replay budget (SEC-6): a peer
                // that publishes at itself while its own replay runs cannot
                // pin memory through the buffer.
                this.#fail(subscription.session, null, 'replay budget exhausted', 1013);
                return;
            }
            subscription.buffered.push({ messageId, destination, body, headers, redelivered });
            return;
        }
        this.#deliverNow(subscription, messageId, destination, body, headers, redelivered);
    }

    /**
     * Send one MESSAGE and track it for ACK/NACK (the direct delivery path).
     *
     * @param subscription - The target subscription.
     * @param messageId - The message id.
     * @param destination - The `destination` header.
     * @param body - The body.
     * @param headers - Pass-through headers.
     * @param redelivered - `true` for NACK redelivery (D9).
     */
    #deliverNow(
        subscription: Subscription,
        messageId: string,
        destination: string,
        body: StompBody,
        headers: Record<string, string>,
        redelivered: boolean
    ): void {
        const { session, subId, ack } = subscription;
        const frameHeaders: Record<string, string> = {
            ...headers,
            destination,
            subscription: subId,
            'message-id': messageId,
        };
        // The broker owns these MESSAGE headers: a SEND cannot spoof them
        // (COR-7 passes user headers through, so they must be cleared when
        // the broker does not set them).
        if (redelivered) {
            frameHeaders['redelivered'] = 'true';
        } else {
            delete frameHeaders['redelivered'];
        }
        if (ack !== 'auto') {
            // STOMP 1.2 §1.4: the `ack` header relates the MESSAGE to the
            // later ACK/NACK — it carries the id those frames must name.
            frameHeaders['ack'] = messageId;
        } else {
            delete frameHeaders['ack'];
        }
        try {
            session.send(serializeStompFrame({ command: 'MESSAGE', headers: frameHeaders, body }));
        } catch {
            // A subscriber mid-close (the transport races to CLOSING while
            // this fan-out runs) must not abort the broadcast — the
            // registry's #safeSend tolerates the same raced close. The
            // failed delivery is not ack-tracked: no delivery, no NACK
            // obligation.
            return;
        }
        this.#track(subscription, messageId, destination, body, headers);
    }

    /**
     * Track a delivered message for `client`/`client-individual` (D9),
     * enforcing every bound oldest-first: the count (`maxUnacked`), the
     * per-subscription byte bound (`maxUnackedBytes`) and the per-session
     * byte bound (`maxUnackedSessionBytes`, whose victim is the session's
     * globally oldest delivery via the monotonic tags).
     *
     * @param subscription - The subscription the MESSAGE went to.
     * @param messageId - The delivered message id (the ack index key).
     * @param destination - The delivered destination.
     * @param body - The delivered body.
     * @param headers - The delivered pass-through headers.
     */
    #track(
        subscription: Subscription,
        messageId: string,
        destination: string,
        body: StompBody,
        headers: Record<string, string>
    ): void {
        if (subscription.ack === 'auto' || this.#maxUnacked <= 0) {
            return;
        }
        const bytes = materialOctets(body);
        this.#deliverySeq += 1;
        const stored: StoredMessage = {
            messageId,
            destination,
            body,
            headers: { ...headers },
            bytes,
            deliverySeq: this.#deliverySeq,
        };
        subscription.unacked.put(stored);
        subscription.unackedBytes += bytes;
        const state = this.#stateFor(subscription.session);
        state.messageIds.set(messageId, subscription);
        state.unackedBytes += bytes;

        while (subscription.unacked.length > this.#maxUnacked) {
            this.#evictOldest(subscription);
        }
        while (this.#maxUnackedBytes > 0 && subscription.unackedBytes > this.#maxUnackedBytes) {
            this.#evictOldest(subscription);
        }
        while (this.#maxUnackedSessionBytes > 0 && state.unackedBytes > this.#maxUnackedSessionBytes) {
            if (!this.#evictSessionOldest(subscription.session)) {
                break;
            }
        }
    }

    /**
     * Drop a subscription's oldest tracked delivery (the ring's head).
     *
     * @param subscription - The subscription to evict from.
     */
    #evictOldest(subscription: Subscription): void {
        const entry = subscription.unacked.get();
        if (entry !== undefined) {
            this.#untrack(subscription, entry);
        }
    }

    /**
     * Drop the session's oldest tracked delivery across all its
     * subscriptions — the per-session byte bound's victim (SEC-5).
     *
     * @param session - The owning session.
     * @returns `false` when the session tracks nothing (bound unreachable).
     */
    #evictSessionOldest(session: SocketSession): boolean {
        const bySubId = this.#subscriptions.get(session);
        if (bySubId === undefined) {
            return false;
        }
        let victim: { subscription: Subscription; deliverySeq: number } | undefined;
        for (const subscription of bySubId.values()) {
            for (const entry of subscription.unacked) {
                if (victim === undefined || entry.deliverySeq < victim.deliverySeq) {
                    victim = { subscription, deliverySeq: entry.deliverySeq };
                }
            }
        }
        if (victim === undefined) {
            return false;
        }
        const oldestSeq = victim.deliverySeq;
        this.#extractUnacked(victim.subscription, (entry) => entry.deliverySeq === oldestSeq);
        return true;
    }

    /**
     * Remove tracked entries from a subscription, keeping the rest in
     * order: the ring is drained, matching entries are untracked (bytes,
     * session total, ack index) and the others re-queued.
     *
     * @param subscription - The subscription to edit.
     * @param remove - Predicate selecting the entries to drop.
     * @returns The removed entries, in ring (oldest-first) order.
     */
    #extractUnacked(subscription: Subscription, remove: (entry: StoredMessage) => boolean): StoredMessage[] {
        const { unacked } = subscription;
        const kept: StoredMessage[] = [];
        const removed: StoredMessage[] = [];
        while (unacked.length > 0) {
            const entry = unacked.get() as StoredMessage;
            if (remove(entry)) {
                removed.push(entry);
                this.#untrack(subscription, entry);
            } else {
                kept.push(entry);
            }
        }
        for (const entry of kept) {
            unacked.put(entry);
        }
        return removed;
    }

    /**
     * Release one entry's accounting: byte totals, and the session's ack
     * index entry for its id (the ring removal itself is the caller's).
     *
     * @param subscription - The subscription that tracked the entry.
     * @param entry - The entry leaving the tracking set.
     */
    #untrack(subscription: Subscription, entry: StoredMessage): void {
        subscription.unackedBytes = Math.max(0, subscription.unackedBytes - entry.bytes);
        const state = this.#sessionState.get(subscription.session);
        if (state === undefined) {
            return;
        }
        state.unackedBytes = Math.max(0, state.unackedBytes - entry.bytes);
        if (state.messageIds.get(entry.messageId) === subscription) {
            state.messageIds.delete(entry.messageId);
        }
    }

    /**
     * Release every tracked delivery of a subscription (UNSUBSCRIBE and
     * session teardown): the ack index must not resolve ids to a
     * subscription that no longer exists — a NACK through it would deliver
     * a MESSAGE for an unsubscribed id.
     *
     * @param subscription - The departing subscription.
     */
    #untrackAll(subscription: Subscription): void {
        this.#extractUnacked(subscription, () => true);
    }

    /**
     * Drop a user's now-empty scope (and empty user entry) from the
     * principal index.
     *
     * @param user - The principal.
     * @param suffix - The `/user/` destination suffix.
     */
    #pruneUserScope(user: string, suffix: string): void {
        const scopes = this.#byUser.get(user);
        if (scopes === undefined) {
            return;
        }
        if (scopes.get(suffix)?.length === 0) {
            scopes.delete(suffix);
        }
        if (scopes.size === 0) {
            this.#byUser.delete(user);
        }
    }

    /**
     * DISCONNECT: reply RECEIPT when asked, then close the connection.
     *
     * @param session - The session.
     * @param frame - The DISCONNECT frame.
     * @returns Always `false` — the connection ends.
     */
    #disconnect(session: SocketSession, frame: StompFrame): boolean {
        if (frame.headers['receipt'] !== undefined) {
            this.#receipt(session, frame);
        }
        if (!session.isClosed) {
            session.close(1000, 'disconnect');
        }
        return false;
    }

    /**
     * Emit a RECEIPT frame when the processed frame asked for one
     * (`receipt:` header, STOMP 1.2 §1.6).
     *
     * @param session - The session to reply to.
     * @param frame - The requesting frame.
     * @returns Always `true` — the connection stays open.
     */
    #receipt(session: SocketSession, frame: StompFrame): boolean {
        if (frame.headers['receipt'] !== undefined) {
            session.send(
                serializeStompFrame({
                    command: 'RECEIPT',
                    headers: { 'receipt-id': frame.headers['receipt'] as string },
                    body: '',
                })
            );
        }
        return true;
    }

    /**
     * Fail closed: send an ERROR frame (with `receipt-id` when the frame
     * asked for one), then close — STOMP 1.2 §1.5 requires the close just
     * after the ERROR. Codes: `1002` protocol (default; includes an
     * over-long identifier), `1008` policy (missing user identity on a
     * `/user` bind/SEND, `authorize` or `verifyCredentials` denial),
     * `1011` `/queue` store fault, `1013` replay-budget exhaustion. The
     * caller's frame has already been rejected — no further frames are
     * processed.
     *
     * @param session - The session.
     * @param frame - The offending frame, or `null` when unparseable (or
     *   when the failure is not attributable to one frame).
     * @param message - Human-readable error detail.
     * @param code - Close status code (default `1002`).
     * @returns Always `false` — the connection ends.
     */
    #fail(session: SocketSession, frame: StompFrame | null, message: string, code: number = 1002): boolean {
        const headers: Record<string, string> = { message };
        if (frame !== null && frame.headers['receipt'] !== undefined) {
            headers['receipt-id'] = frame.headers['receipt'] as string;
        }
        if (!session.isClosed) {
            try {
                session.send(serializeStompFrame({ command: 'ERROR', headers, body: '' }));
            } catch {
                // Session may be mid-close (concurrent transport failure);
                // the close below is the authoritative action.
            }
            session.close(code, 'protocol error');
        }
        return false;
    }

    /**
     * Remove a subscription from its indexes (destination fan-out or user
     * scope), the session's map, and the session's delivery accounting
     * (its tracked entries must not stay resolvable by a later id-only
     * ACK/NACK — `#untrackAll`).
     *
     * @param session - The owning session.
     * @param bySubId - The session's subscription map (mutated).
     * @param subscription - The subscription to remove.
     */
    #removeSubscription(session: SocketSession, bySubId: Map<string, Subscription>, subscription: Subscription): void {
        bySubId.delete(subscription.subId);
        subscription.buffered = [];
        this.#untrackAll(subscription);
        if (subscription.destination.startsWith('/user/')) {
            const user = this.#resolveUser(session);
            if (user !== null) {
                const suffix = subscription.destination.slice('/user/'.length);
                const scope = this.#byUser.get(user)?.get(suffix);
                if (scope !== undefined) {
                    const index = scope.indexOf(subscription);
                    if (index >= 0) {
                        scope.splice(index, 1);
                    }
                }
                this.#pruneUserScope(user, suffix);
            }
        } else {
            const subscribers = this.#byDestination.get(subscription.destination);
            if (subscribers !== undefined) {
                const index = subscribers.indexOf(subscription);
                if (index >= 0) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    this.#byDestination.delete(subscription.destination);
                }
            }
        }
        if (bySubId.size === 0 && session.isClosed) {
            this.#subscriptions.delete(session);
        }
    }

    /**
     * Remove every subscription, transaction buffer, delivery-tracking
     * state and the session itself on stream end.
     *
     * @param session - The ended session.
     */
    #dropSession(session: SocketSession): void {
        const bySubId = this.#subscriptions.get(session);
        if (bySubId !== undefined) {
            // Snapshot: #removeSubscription mutates the map it walks.
            // oxlint-disable-next-line unicorn/no-useless-spread -- the spread is the snapshot; a live iterator would be invalidated by the removals.
            for (const subscription of [...bySubId.values()]) {
                this.#removeSubscription(session, bySubId, subscription);
            }
            this.#subscriptions.delete(session);
        }
        this.#sessionState.delete(session);
        this.#transactions.delete(session);
        this.#sessions.delete(session);
    }
}
