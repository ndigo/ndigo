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
 *   modes track delivered-but-unacked messages (`maxUnacked`, bounded);
 *   ACK removes cumulatively (`client`) or singly; NACK redelivers with
 *   `redelivered: true`.
 * - **`/user` destinations (D10)**: principal-scoped subscriptions via
 *   `resolveUser`; `sendToUser` fans out to one user's scope; a client
 *   SEND to `/user/*` reaches only the sender's own scope.
 * - **`/queue` destinations (D11)**: bounded store-and-forward — new
 *   subscribers replay the backlog before live traffic (`queueBacklog`).
 * - Heart-beat is negotiated off (`0,0`) — the AD-21 registry ping/pong
 *   already owns liveness at the WS layer. Ping frames (bare newlines)
 *   are tolerated on inbound.
 * - The broker is isomorphic: it touches `SocketSession` contracts only,
 *   never the transport (AD-23 D1). All protocol failures are fail-closed:
 *   ERROR frame (carrying `receipt-id` when the offending frame asked for
 *   one), then close `1002` (missing user identity on a `/user` bind
 *   closes `1008` — policy).
 * * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
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

/** A live subscription: one (session, sub-id) → destination binding. */
interface Subscription {
    session: SocketSession;
    subId: string;
    destination: string;
    ack: StompAckMode;
    /** Delivered-but-unacked messages (D9, ack ≠ auto). */
    unacked: StoredMessage[];
}

/** A retained message (queue backlog / unacked tracking). */
interface StoredMessage {
    messageId: string;
    destination: string;
    body: StompBody;
    /** Extra headers (e.g. `content-type`); `subscription` added per send. */
    headers: Record<string, string>;
}

/** A buffered transactional operation (D7). */
type TransactionOp =
    | { kind: 'send'; destination: string; body: StompBody; headers: Record<string, string>; receipt: string | null }
    | { kind: 'ack'; nack: boolean; messageId: string; subId: string; receipt: string | null };

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
     * Bound on the stored backlog per `/queue/<name>` destination (D11).
     * New subscribers replay the backlog. Default `1000`; `0` disables
     * storage (then `/queue` behaves like `/topic`).
     */
    queueBacklog?: number;
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
 *     @parameters({ session: socketSession('session') })
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
    readonly #queueBacklog: number;
    /** Per-session subscription map: session → subId → subscription. */
    readonly #subscriptions = new Map<SocketSession, Map<string, Subscription>>();
    /** Fan-out index: destination → subscriptions (user scopes excluded). */
    readonly #byDestination = new Map<string, Subscription[]>();
    /** User scopes (D10): user → destination-suffix → subscriptions. */
    readonly #byUser = new Map<string, Map<string, Subscription[]>>();
    /** `/queue` backlogs (D11): class-name → retained messages. */
    readonly #backlog = new Map<string, StoredMessage[]>();
    /** Per-session transaction buffers (D7): session → txId → ops. */
    readonly #transactions = new Map<SocketSession, Map<string, TransactionOp[]>>();
    /** Every session under protocol control (for `closeAll`). */
    readonly #sessions = new Set<SocketSession>();

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
        this.#queueBacklog = options.queueBacklog ?? DEFAULT_QUEUE_BACKLOG;
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
                if (!this.#process(session, state, message)) {
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
     * safe and redelivery keeps the id). `/queue` destinations also
     * append to their backlog (D11). No subscribers → backlog only.
     *
     * @param destination - The destination (e.g. `/topic/chat`).
     * @param body - The message body (text or bytes — D8).
     * @param headers - Extra headers on the MESSAGE frames (e.g. `content-type`).
     */
    publish(destination: string, body: StompBody, headers: Record<string, string> = {}): void {
        const messageId = this.#nextMessageId();
        if (destination.startsWith('/queue/') && this.#queueBacklog > 0) {
            this.#appendBacklog(destination, { messageId, destination, body, headers: { ...headers } });
        }
        const subscribers = this.#byDestination.get(destination);
        if (!subscribers) {
            return;
        }
        // Snapshot before iterating: send() may synchronously close a
        // subscriber, which mutates the index while we walk it.
        for (const subscription of subscribers) {
            if (subscription.session.isClosed) {
                continue;
            }
            this.#deliver(subscription, messageId, destination, body, headers, false);
        }
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
    ): boolean {
        if (typeof message !== 'string' && !(message instanceof Uint8Array) && !(message instanceof ArrayBuffer)) {
            return this.#fail(session, null, 'STOMP frames must be text or binary');
        }
        let frame: StompFrame;
        try {
            frame = parseStompFrame(message as string);
        } catch (error) {
            return this.#fail(session, null, error instanceof StompProtocolError ? error.message : 'malformed frame');
        }
        // Heart-beat pings (bare newlines) — nothing to do.
        if (frame.command === '') {
            return true;
        }
        if (!state.connected) {
            if (frame.command === 'CONNECT' || frame.command === 'STOMP') {
                return this.#connect(session, state, frame);
            }
            return this.#fail(session, frame, 'CONNECT must be the first frame');
        }
        switch (frame.command) {
            case 'SUBSCRIBE':
                return this.#subscribe(session, frame);
            case 'UNSUBSCRIBE':
                return this.#unsubscribe(session, frame);
            case 'SEND':
                return this.#send(session, frame);
            case 'ACK':
            case 'NACK':
                return this.#ack(session, frame);
            case 'DISCONNECT':
                return this.#disconnect(session, frame);
            case 'BEGIN':
                return this.#begin(session, frame);
            case 'COMMIT':
                return this.#commit(session, frame);
            case 'ABORT':
                return this.#abort(session, frame);
            default:
                return this.#fail(session, frame, `unknown command: ${frame.command}`);
        }
    }

    /**
     * The CONNECT handshake: version negotiation + CONNECTED reply.
     *
     * @param session - The connecting session.
     * @param state - Per-connection protocol state (mutated on success).
     * @param frame - The CONNECT/STOMP frame.
     * @returns Always `true` (a failed handshake closes the session).
     */
    #connect(
        session: SocketSession,
        state: { connected: boolean; version: string | null; sessionId: string | null },
        frame: StompFrame
    ): boolean {
        const offered = (frame.headers['accept-version'] ?? '').split(',').map((v) => v.trim());
        const mutual = SUPPORTED_VERSIONS.find((version) => offered.includes(version)) ?? null;
        if (mutual === null) {
            return this.#fail(session, frame, `no supported version in accept-version: ${offered.join(', ')}`);
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
     * @param session - The subscribing session.
     * @param frame - The SUBSCRIBE frame.
     * @returns `false` on duplicate id / missing headers (ERROR + close).
     */
    #subscribe(session: SocketSession, frame: StompFrame): boolean {
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
        let bySubId = this.#subscriptions.get(session);
        if (bySubId === undefined) {
            bySubId = new Map();
            this.#subscriptions.set(session, bySubId);
        }
        if (bySubId.has(subId)) {
            return this.#fail(session, frame, `subscription id already in use: ${subId}`);
        }

        const userScoped = destination.startsWith('/user/');
        if (userScoped) {
            // Principal-scoped routing (D10): the subscribe attaches to the
            // session's resolved identity — no anonymous `/user` binds.
            const user = this.#resolveUser(session);
            if (user === null) {
                return this.#fail(session, frame, 'cannot bind a /user destination without a resolved user', 1008);
            }
            const subscription: Subscription = { session, subId, destination, ack, unacked: [] };
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

        const subscription: Subscription = { session, subId, destination, ack, unacked: [] };
        bySubId.set(subId, subscription);
        const subscribers = this.#byDestination.get(destination);
        if (subscribers === undefined) {
            this.#byDestination.set(destination, [subscription]);
        } else {
            subscribers.push(subscription);
        }
        // `/queue` backward replay (D11): a new subscriber receives the
        // backlog (newest last) before any live traffic.
        if (destination.startsWith('/queue/') && this.#queueBacklog > 0) {
            const backlog = this.#backlog.get(destination);
            if (backlog !== undefined) {
                for (const stored of backlog) {
                    this.#deliver(subscription, stored.messageId, destination, stored.body, stored.headers, false);
                }
            }
        }
        return this.#receipt(session, frame);
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
     * @param session - The sending session.
     * @param frame - The SEND frame.
     */
    #send(session: SocketSession, frame: StompFrame): boolean {
        const destination = frame.headers['destination'];
        if (destination === undefined) {
            return this.#fail(session, frame, 'SEND requires a destination header');
        }
        const txId = frame.headers['transaction'];
        if (txId !== undefined) {
            const buffer = this.#transactions.get(session)?.get(txId);
            if (buffer === undefined) {
                return this.#fail(session, frame, `unknown transaction id: ${txId}`);
            }
            buffer.push({
                kind: 'send',
                destination,
                body: frame.body,
                headers: this.#sendHeaders(frame),
                receipt: frame.headers['receipt'] ?? null,
            });
            return true;
        }
        // User-scoped SEND (D10): only the sender's own principal scope.
        if (destination.startsWith('/user/')) {
            const user = this.#resolveUser(session);
            if (user === null) {
                return this.#fail(session, frame, 'SEND to /user requires a resolved user', 1008);
            }
            const suffix = destination.slice('/user/'.length);
            const scope = this.#byUser.get(user)?.get(suffix);
            if (scope === undefined) {
                return this.#receipt(session, frame);
            }
            const messageId = this.#nextMessageId();
            for (const subscription of scope) {
                if (subscription.session.isClosed) {
                    continue;
                }
                this.#deliver(subscription, messageId, destination, frame.body, this.#sendHeaders(frame), false);
            }
            return this.#receipt(session, frame);
        }
        const suppress = this.#onMessage?.(destination, frame.body, frame.headers, session);
        if (suppress === false) {
            return this.#receipt(session, frame);
        }
        this.publish(destination, frame.body, this.#sendHeaders(frame));
        return this.#receipt(session, frame);
    }

    /**
     * Extra headers carried from a SEND's `content-type` into MESSAGEs.
     *
     * @param frame - The SEND frame.
     * @returns The outbound extra headers.
     */
    #sendHeaders(frame: StompFrame): Record<string, string> {
        const headers: Record<string, string> = {};
        if (frame.headers['content-type'] !== undefined) {
            headers['content-type'] = frame.headers['content-type'] as string;
        }
        return headers;
    }

    /**
     * ACK/NACK (STOMP 1.2 §1.4, D9): ack modes `client`/`client-individual`
     * track delivered messages; ACK removes cumulatively or singly, NACK
     * removes the same way **and redelivers** with `redelivered: true`.
     * Both headers are required; the subscription must belong to the
     * session (ERROR + close otherwise). Unknown message ids (already
     * acked or evicted past `maxUnacked`) are tolerated no-ops.
     * Allowed inside transactions too (D7): buffered, applied at COMMIT.
     *
     * @param session - The acking session.
     * @param frame - The ACK/NACK frame.
     * @returns `false` when the frame violates the contract.
     */
    #ack(session: SocketSession, frame: StompFrame): boolean {
        const messageId = frame.headers['id'];
        const subId = frame.headers['subscription'];
        if (messageId === undefined) {
            return this.#fail(session, frame, 'ACK/NACK requires an id header');
        }
        if (subId === undefined) {
            return this.#fail(session, frame, 'ACK/NACK requires a subscription header');
        }
        const bySubId = this.#subscriptions.get(session);
        const subscription = bySubId?.get(subId);
        if (subscription === undefined) {
            return this.#fail(session, frame, `unknown subscription: ${subId}`);
        }
        const txId = frame.headers['transaction'];
        if (txId !== undefined) {
            const buffer = this.#transactions.get(session)?.get(txId);
            if (buffer === undefined) {
                return this.#fail(session, frame, `unknown transaction id: ${txId}`);
            }
            buffer.push({
                kind: 'ack',
                nack: frame.command === 'NACK',
                messageId,
                subId,
                receipt: frame.headers['receipt'] ?? null,
            });
            return true;
        }
        this.#resolveAck(subscription, messageId, frame.command === 'NACK');
        return this.#receipt(session, frame);
    }

    /**
     * Apply an ack/nack to one subscription's tracking (D9).
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
        const index = unacked.findIndex((message) => message.messageId === messageId);
        if (index < 0) {
            return; // already acked or evicted — tolerated no-op
        }
        // `client` mode acks cumulatively: everything up to and including
        // the named message (STOMP 1.2 §1.4.1); `client-individual` the
        // named one only.
        const removed = unacked.splice(0, index + 1);
        if (nack) {
            const target = removed.at(-1);
            if (target !== undefined) {
                // Redelivery: same message-id, `redelivered: true`
                // (§1.4.2), and the message stays outstanding.
                this.#deliver(subscription, target.messageId, target.destination, target.body, target.headers, true);
                subscription.unacked.push(target);
            }
        }
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
        byTx.set(txId, []);
        return this.#receipt(session, frame);
    }

    /**
     * COMMIT — apply the buffered operations in order (D7). Receipts
     * requested by buffered frames are held and emitted here, then the
     * COMMIT's own receipt.
     *
     * @param session - The session.
     * @param frame - The COMMIT frame.
     * @returns `false` on an unknown transaction id.
     */
    #commit(session: SocketSession, frame: StompFrame): boolean {
        const txId = frame.headers['transaction'];
        if (txId === undefined) {
            return this.#fail(session, frame, 'COMMIT requires a transaction header');
        }
        const buffer = this.#transactions.get(session)?.get(txId);
        if (buffer === undefined) {
            return this.#fail(session, frame, `unknown transaction id: ${txId}`);
        }
        for (const op of buffer) {
            this.#applyOp(session, op);
        }
        this.#transactions.get(session)?.delete(txId);
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
     * frames are emitted here, after the op's effect.
     *
     * @param session - The owning session.
     * @param op - The op to apply.
     */
    #applyOp(session: SocketSession, op: TransactionOp): void {
        const receipt = op.receipt ?? null;
        if (op.kind === 'send') {
            const suppress = this.#onMessage?.(op.destination, op.body, op.headers, session);
            if (suppress !== false) {
                this.publish(op.destination, op.body, op.headers);
            }
        } else {
            const subscription = this.#subscriptions.get(session)?.get(op.subId);
            if (subscription !== undefined) {
                this.#resolveAck(subscription, op.messageId, op.nack);
            }
        }
        if (receipt !== null) {
            session.send(serializeStompFrame({ command: 'RECEIPT', headers: { 'receipt-id': receipt }, body: '' }));
        }
    }

    /**
     * Deliver one MESSAGE to a subscription: per-subscription framing,
     * ack tracking (D9), redelivery flag.
     *
     * @param subscription - The target subscription.
     * @param messageId - The message id (shared per logical message).
     * @param destination - The destination header (e.g. `/topic/chat`).
     * @param body - The body.
     * @param headers - Extra headers (merged under the frame's own).
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
        const { session, subId, ack } = subscription;
        const frameHeaders: Record<string, string> = {
            ...headers,
            destination,
            subscription: subId,
            'message-id': messageId,
        };
        if (redelivered) {
            frameHeaders['redelivered'] = 'true';
        }
        session.send(serializeStompFrame({ command: 'MESSAGE', headers: frameHeaders, body }));
        if (ack !== 'auto') {
            const stored: StoredMessage = { messageId, destination, body, headers: { ...headers } };
            if (this.#maxUnacked > 0) {
                subscription.unacked.push(stored);
                if (subscription.unacked.length > this.#maxUnacked) {
                    subscription.unacked.shift();
                }
            }
        }
    }

    /**
     * Append a message to a `/queue` backlog (D11), evicting oldest past
     * the bound.
     *
     * @param destination - The queue class-name (e.g. `/queue/jobs`).
     * @param message - The retained message.
     */
    #appendBacklog(destination: string, message: StoredMessage): void {
        let backlog = this.#backlog.get(destination);
        if (backlog === undefined) {
            backlog = [];
            this.#backlog.set(destination, backlog);
        }
        backlog.push(message);
        if (backlog.length > this.#queueBacklog) {
            backlog.shift();
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
     * asked for one), then close (`1002` protocol; `1008` policy — missing
     * user identity on a `/user` bind/SEND, D10). The caller's frame has
     * already been rejected — no further frames are processed.
     *
     * @param session - The session.
     * @param frame - The offending frame, or `null` when unparseable.
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
     * scope) and the session's map.
     *
     * @param session - The owning session.
     * @param bySubId - The session's subscription map (mutated).
     * @param subscription - The subscription to remove.
     */
    #removeSubscription(session: SocketSession, bySubId: Map<string, Subscription>, subscription: Subscription): void {
        bySubId.delete(subscription.subId);
        if (subscription.destination.startsWith('/user/')) {
            const user = this.#resolveUser(session);
            if (user !== null) {
                const scope = this.#byUser.get(user)?.get(subscription.destination.slice('/user/'.length));
                if (scope !== undefined) {
                    const index = scope.indexOf(subscription);
                    if (index >= 0) {
                        scope.splice(index, 1);
                    }
                    if (scope.length === 0) {
                        this.#byUser.get(user)?.delete(subscription.destination.slice('/user/'.length));
                    }
                }
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
     * Remove every subscription, transaction buffer, and the session
     * itself on stream end.
     *
     * @param session - The ended session.
     */
    #dropSession(session: SocketSession): void {
        const bySubId = this.#subscriptions.get(session);
        if (bySubId !== undefined) {
            for (const subscription of bySubId.values()) {
                if (subscription.destination.startsWith('/user/')) {
                    const user = this.#resolveUser(session);
                    if (user !== null) {
                        const scope = this.#byUser.get(user)?.get(subscription.destination.slice('/user/'.length));
                        if (scope !== undefined) {
                            const index = scope.indexOf(subscription);
                            if (index >= 0) {
                                scope.splice(index, 1);
                            }
                        }
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
            }
            this.#subscriptions.delete(session);
        }
        this.#transactions.delete(session);
        this.#sessions.delete(session);
    }
}
