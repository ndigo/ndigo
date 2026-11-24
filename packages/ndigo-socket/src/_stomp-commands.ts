/**
 * STOMP command handlers: SUBSCRIBE/UNSUBSCRIBE, SEND, and the SEND-side
 * authorization, header filtering, store receipt, and queue replay.
 */
import { RingBuffer } from '@ndigo/core';
import { materialOctets, type QueueMessageStore, type StoredQueueMessage } from './message-store';
import type { STOMPBody, STOMPFrame } from './stomp-frame';
import type { SocketSession } from './socket-session';
import type { StoredMessage, Subscription } from './_stomp-broker-types';
import type { STOMPAckMode } from './stomp-broker';
import type { STOMPDelivery } from './_stomp-delivery';
import type { STOMPLimits } from './_stomp-limits';
import type { STOMPSubscriptionRegistry } from './_stomp-subscriptions';
import type { STOMPTransactionManager } from './_stomp-transactions';
import { fail, receipt } from './_stomp-replies';

/** SEND headers that are framing rather than user payload (COR-7, STOMP 1.2 §2.1). */
const SEND_FRAMING_HEADERS: Record<string, true> = {
    destination: true,
    transaction: true,
    receipt: true,
    'content-length': true,
};

/**
 * The broker-owned seams the command handlers need.
 */
export interface STOMPCommandHost {
    readonly maxSubscriptionsPerSession: number;
    readonly maxUnacked: number;
    readonly queueBacklog: number;
    readonly retention: { ttlMs?: number; maxMessages?: number } | null;
    readonly queueStore: QueueMessageStore | null;
    readonly onMessage:
        | ((destination: string, body: STOMPBody, headers: Record<string, string>, session: SocketSession) => unknown)
        | null;
    readonly authorize: ((destination: string, action: 'subscribe' | 'send', session: SocketSession) => unknown) | null;
    readonly resolveUser: (session: SocketSession) => string | null;
    readonly limits: STOMPLimits;
    readonly registry: STOMPSubscriptionRegistry;
    readonly transactions: STOMPTransactionManager;
    readonly delivery: STOMPDelivery;
    publish(
        destination: string,
        body: STOMPBody,
        headers: Record<string, string>
    ): Promise<StoredQueueMessage | undefined>;
}

/**
 * Handles the STOMP commands that mutate broker state.
 */
export class STOMPCommands {
    readonly #host: STOMPCommandHost;

    /**
     * @param host - The broker's registry, policy, and delivery seams.
     */
    constructor(host: STOMPCommandHost) {
        this.#host = host;
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
    async subscribe(session: SocketSession, frame: STOMPFrame): Promise<boolean> {
        const destination = frame.headers['destination'];
        const subId = frame.headers['id'];
        if (destination === undefined) {
            return fail(session, frame, 'SUBSCRIBE requires a destination header');
        }
        if (subId === undefined) {
            return fail(session, frame, 'SUBSCRIBE requires an id header');
        }
        const ack = (frame.headers['ack'] ?? 'auto') as STOMPAckMode;
        if (ack !== 'auto' && ack !== 'client' && ack !== 'client-individual') {
            return fail(session, frame, `invalid ack mode: ${ack}`);
        }
        // SEC-4: policy first — no registration, no replay for a denied
        // destination (the replay would otherwise disclose the backlog).
        if (!(await this.#authorizeDestination(session, frame, destination, 'subscribe'))) {
            return false;
        }
        if (this.#host.registry.has(session, subId)) {
            return fail(session, frame, `subscription id already in use: ${subId}`);
        }
        if (this.#host.registry.countForSession(session) >= this.#host.maxSubscriptionsPerSession) {
            return fail(session, frame, `subscription limit reached (max ${this.#host.maxSubscriptionsPerSession})`);
        }

        const userScoped = destination.startsWith('/user/');
        if (userScoped) {
            // Principal-scoped routing (D10): the subscribe attaches to the
            // session's resolved identity — no anonymous `/user` binds.
            const user = this.#host.resolveUser(session);
            if (user === null) {
                return fail(session, frame, 'cannot bind a /user destination without a resolved user', 1008);
            }
            const subscription: Subscription = {
                session,
                subId,
                destination,
                user,
                ack,
                unacked: new RingBuffer<StoredMessage>(this.#host.maxUnacked + 1),
                unackedBytes: 0,
                replaying: false,
                buffered: [],
            };
            this.#host.registry.add(subscription);
            return receipt(session, frame);
        }

        const subscription: Subscription = {
            session,
            subId,
            destination,
            user: null,
            ack,
            unacked: new RingBuffer<StoredMessage>(this.#host.maxUnacked + 1),
            unackedBytes: 0,
            replaying: false,
            buffered: [],
        };
        this.#host.registry.add(subscription);
        // `/queue` backward replay (D11 + history + COR-2): the
        // subscription is live in the fan-out index before the replay
        // starts, so nothing published meanwhile is lost — those frames
        // buffer (`#deliver`) and flush after the retained window has gone
        // out, minus the ones the replay already carried. The subscriber
        // therefore never observes `live, old, live`.
        if (destination.startsWith('/queue/') && this.#host.queueBacklog > 0) {
            subscription.replaying = true;
            const limit = this.#host.retention?.maxMessages ?? this.#host.queueBacklog;
            const replay = await this.#host.delivery.replayQueue(destination, { limit });
            if (session.isClosed) {
                return false; // closed under us (transport or budget) — nothing to send
            }
            if (!replay.ok) {
                // COR-8: a store that cannot hand over its history must not
                // read as "empty queue" — ERROR + close, same posture as the
                // failing SEND append.
                return fail(session, frame, 'queue store unavailable', 1011);
            }
            const replayOctets = replay.messages.reduce((total, stored) => total + materialOctets(stored.body), 0);
            if (!this.#host.limits.chargeReplay(session, replayOctets)) {
                // SEC-6: re-subscribing re-materializes the window; the
                // per-session budget bounds how often a peer can force it.
                return fail(session, frame, 'replay budget exhausted', 1013);
            }
            const replayedIds = new Set(replay.messages.map((stored) => stored.messageId));
            subscription.replaying = false;
            for (const stored of replay.messages) {
                this.#host.delivery.deliverNow(
                    subscription,
                    stored.messageId,
                    destination,
                    stored.body,
                    stored.headers,
                    false
                );
            }
            const held = subscription.buffered;
            subscription.buffered = [];
            for (const delivery of held) {
                if (replayedIds.has(delivery.messageId)) {
                    continue; // the replay already carried it — no duplicate
                }
                this.#host.delivery.deliverNow(
                    subscription,
                    delivery.messageId,
                    delivery.destination,
                    delivery.body,
                    delivery.headers,
                    delivery.redelivered
                );
            }
        }
        return receipt(session, frame);
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
        frame: STOMPFrame,
        destination: string,
        action: 'subscribe' | 'send'
    ): Promise<boolean> {
        if (this.#host.authorize === null) {
            return true;
        }
        const allowed = await this.#host.authorize(destination, action, session);
        if (allowed === false) {
            return fail(session, frame, `${action} denied: ${destination}`, 1008);
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
    unsubscribe(session: SocketSession, frame: STOMPFrame): boolean {
        const subId = frame.headers['id'];
        if (subId === undefined) {
            return fail(session, frame, 'UNSUBSCRIBE requires an id header');
        }
        const subscription = this.#host.registry.get(session, subId);
        if (subscription === undefined) {
            return fail(session, frame, `unknown subscription id: ${subId}`);
        }
        this.#host.registry.remove(session, subscription);
        return receipt(session, frame);
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
    async send(session: SocketSession, frame: STOMPFrame): Promise<boolean> {
        const destination = frame.headers['destination'];
        if (destination === undefined) {
            return fail(session, frame, 'SEND requires a destination header');
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
            const octets = materialOctets(frame.body);
            const result = this.#host.transactions.append(
                session,
                txId,
                {
                    kind: 'send',
                    destination,
                    body: frame.body,
                    headers,
                    receipt: frame.headers['receipt'] ?? null,
                },
                octets
            );
            if (result === 'unknown') {
                return fail(session, frame, `unknown transaction id: ${txId}`);
            }
            if (result === 'limit') {
                return fail(session, frame, 'transaction buffer limit reached');
            }
            return true;
        }
        // The routing seam sees every SEND — the same order the transactional
        // path applies at COMMIT (authorize → onMessage → route), so an
        // application's interception no longer depends on how the client
        // framed the send (SEC-4/COR-7).
        const suppress = this.#host.onMessage?.(destination, frame.body, headers, session);
        if (suppress === false) {
            return receipt(session, frame);
        }
        // User-scoped SEND (D10): only the sender's own principal scope —
        // shares routing with transaction COMMIT (#applyOp).
        if (destination.startsWith('/user/')) {
            if (!this.#host.delivery.sendToUserScope(session, frame, destination, frame.body, headers)) {
                return false;
            }
            return receipt(session, frame);
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
        frame: STOMPFrame,
        destination: string,
        headers: Record<string, string>
    ): Promise<boolean> {
        let stored: StoredQueueMessage | undefined;
        try {
            stored = await this.#host.publish(destination, frame.body, headers);
        } catch {
            return fail(session, frame, 'topic fanout unavailable', 1011);
        }
        const storeManaged = destination.startsWith('/queue/') && this.#host.queueStore !== null;
        if (storeManaged && stored === undefined) {
            return fail(session, frame, 'queue store unavailable', 1011);
        }
        return receipt(session, frame);
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
    #sendHeaders(frame: STOMPFrame): Record<string, string> {
        const headers: Record<string, string> = {};
        for (const [name, value] of Object.entries(frame.headers)) {
            if (SEND_FRAMING_HEADERS[name] !== true) {
                headers[name] = value;
            }
        }
        return headers;
    }
}
