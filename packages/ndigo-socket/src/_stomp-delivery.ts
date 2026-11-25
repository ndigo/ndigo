/**
 * STOMP delivery: subscription fan-out, ACK/NACK resolution, user-scoped
 * routing, queue replay, and the delivery side of buffered transactions.
 */
import { materialOctets, type QueueMessageStore, type StoredQueueMessage } from './message-store';
import { serializeStompFrame, type STOMPBody, type STOMPFrame } from './stomp-frame';
import type { SocketSession } from './socket-session';
import type { QueueReplay, StoredMessage, Subscription, TransactionOp } from './_stomp-broker-types';
import type { STOMPLimits } from './_stomp-limits';
import type { STOMPSubscriptionRegistry } from './_stomp-subscriptions';
import { fail } from './_stomp-replies';

/**
 * The broker-owned seams delivery needs.
 */
export interface STOMPDeliveryHost {
    readonly registry: STOMPSubscriptionRegistry;
    readonly limits: STOMPLimits;
    readonly queueStore: QueueMessageStore | null;
    readonly retention: { ttlMs?: number; maxMessages?: number } | null;
    readonly onMessage:
        | ((destination: string, body: STOMPBody, headers: Record<string, string>, session: SocketSession) => unknown)
        | null;
    readonly resolveUser: (session: SocketSession) => string | null;
    readonly nextMessageId: () => string;
    publish(
        destination: string,
        body: STOMPBody,
        headers: Record<string, string>
    ): Promise<StoredQueueMessage | undefined>;
}

/**
 * Delivers MESSAGE frames to subscriptions and resolves their acknowledgements.
 */
export class STOMPDelivery {
    readonly #host: STOMPDeliveryHost;

    /**
     * @param host - The broker's registry, bounds, and routing seams.
     */
    constructor(host: STOMPDeliveryHost) {
        this.#host = host;
    }

    /**
     * Deliver one MESSAGE to a subscription: per-subscription framing
     * (including the `ack` header on non-`auto` subscriptions),
     * ack tracking (D9), redelivery flag. While a `/queue` replay is in
     * flight the delivery is buffered instead of sent.
     *
     * @param subscription - The target subscription.
     * @param messageId - The message id (shared per logical message).
     * @param destination - The destination header (e.g. `/topic/chat`).
     * @param body - The body.
     * @param headers - Pass-through headers (merged under the frame's own).
     * @param redelivered - `true` for NACK redelivery (D9).
     */
    deliver(
        subscription: Subscription,
        messageId: string,
        destination: string,
        body: STOMPBody,
        headers: Record<string, string>,
        redelivered: boolean
    ): void {
        if (subscription.replaying) {
            if (!this.#host.limits.chargeReplay(subscription.session, materialOctets(body))) {
                // The live buffer shares the replay budget (SEC-6): a peer
                // that publishes at itself while its own replay runs cannot
                // pin memory through the buffer.
                fail(subscription.session, null, 'replay budget exhausted', 1013);
                return;
            }
            subscription.buffered.push({ messageId, destination, body, headers, redelivered });
            return;
        }
        this.deliverNow(subscription, messageId, destination, body, headers, redelivered);
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
    deliverNow(
        subscription: Subscription,
        messageId: string,
        destination: string,
        body: STOMPBody,
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
        this.#host.registry.track(subscription, messageId, destination, body, headers);
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
    resolveAck(subscription: Subscription, messageId: string, nack: boolean): void {
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
        const removed = this.#host.registry.extractUnacked(subscription, (entry) =>
            ack === 'client' ? entry.deliverySeq <= boundary : entry.messageId === messageId
        );
        if (!nack) {
            return;
        }
        const target = removed.find((entry) => entry.messageId === messageId) ?? named;
        // Redelivery: same message-id, `redelivered: true` (§1.4.2), and the
        // message stays outstanding — `deliver` re-tracks it through the
        // same bounded path, so a repeated NACK never grows the tracking set.
        this.deliver(subscription, target.messageId, target.destination, target.body, target.headers, true);
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
    sendToUserScope(
        session: SocketSession,
        frame: STOMPFrame,
        destination: string,
        body: STOMPBody,
        headers: Record<string, string>
    ): boolean {
        const user = this.#host.resolveUser(session);
        if (user === null) {
            return fail(session, frame, 'SEND to /user requires a resolved user', 1008);
        }
        const suffix = destination.slice('/user/'.length);
        const scope = this.#host.registry.byUser(user, suffix);
        if (scope !== undefined) {
            const messageId = this.#host.nextMessageId();
            // Snapshot: a delivery may synchronously close one of the
            // sessions in the scope.
            for (const subscription of Array.from(scope)) {
                if (subscription.session.isClosed) {
                    continue;
                }
                this.deliver(subscription, messageId, destination, body, headers, false);
            }
        }
        return true;
    }

    /**
     * Applies one buffered SEND at COMMIT: honors `onMessage` suppression,
     * routes `/user/` through the same principal-scope seam as a live SEND,
     * and requires a durable append for store-managed `/queue/` destinations.
     *
     * @param session - The owning session.
     * @param frame - The COMMIT frame (failure attribution).
     * @param op - The buffered SEND.
     * @returns `true` when applied; `false` after a fail-closed reply.
     */
    async applyBufferedSend(
        session: SocketSession,
        frame: STOMPFrame,
        op: Extract<TransactionOp, { kind: 'send' }>
    ): Promise<boolean> {
        const suppress = this.#host.onMessage?.(op.destination, op.body, op.headers, session);
        if (suppress === false) {
            return true;
        }
        if (op.destination.startsWith('/user/')) {
            // A transaction-buffered SEND must ride the same principal-scope
            // routing and policy check as a live SEND — `publish` only serves
            // /topic-style destinations.
            return this.sendToUserScope(session, frame, op.destination, op.body, op.headers);
        }
        const storeManaged = op.destination.startsWith('/queue/') && this.#host.queueStore !== null;
        let stored: StoredQueueMessage | undefined;
        try {
            stored = await this.#host.publish(op.destination, op.body, op.headers);
        } catch {
            return fail(session, frame, 'topic fanout unavailable', 1011);
        }
        if (storeManaged && stored === undefined) {
            // Same posture as the live SEND path (COR-8): the append did not
            // persist, so the transaction cannot be reported committed.
            return fail(session, frame, 'queue store unavailable', 1011);
        }
        return true;
    }

    /**
     * Applies one buffered ACK/NACK at COMMIT.
     *
     * @param session - The owning session.
     * @param op - The buffered ACK/NACK.
     */
    applyBufferedAck(session: SocketSession, op: Extract<TransactionOp, { kind: 'ack' }>): void {
        const subscription = this.#host.registry.get(session, op.subId);
        if (subscription !== undefined) {
            this.resolveAck(subscription, op.messageId, op.nack);
        }
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
    async replayQueue(destination: string, options: { afterSeq?: number; limit?: number } = {}): Promise<QueueReplay> {
        const store = this.#host.queueStore;
        if (store === null) {
            return { ok: true, messages: [] };
        }
        try {
            if (this.#host.retention?.ttlMs !== undefined) {
                await store.prune(destination, { ttlMs: this.#host.retention.ttlMs });
            }
            return { ok: true, messages: await store.replay(destination, options) };
        } catch {
            return { ok: false };
        }
    }
}
